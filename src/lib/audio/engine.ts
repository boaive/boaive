"use client";

import { chapters, type ChapterId } from "@/story/chapters";
import { moments } from "@/story/moments";
import { story } from "@/story/store";

/**
 * Opt-in ambient sound, synthesised with WebAudio (no files to download):
 *   surface  — surf: filtered noise swelling slowly
 *   deep     — the same water heard underwater (low-passed) + a quiet low drone
 *   splash   — one-shot when the laptop hits the water
 *   chimes   — soft tones when a new chapter begins in the digital world
 * The mix follows the story; nothing ever plays until the visitor turns sound on.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** 0 = at the surface, 1 = fully underwater / in the deep. */
function underwaterAmount(t: number): number {
  if (t < moments.surfaceSwap) return smooth(moments.splash, moments.submerged, t);
  return 1 - smooth(moments.surfaceBreak - 0.04, moments.surfaceBreak, t);
}

/** Pentatonic chime notes per chapter (Hz), quiet and low in the mix. */
const CHIMES: Partial<Record<ChapterId, number>> = {
  problem: 392,
  capabilities: 440,
  process: 523.25,
  work: 587.33,
  outcome: 659.25,
  studio: 523.25,
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private surface: GainNode | null = null;
  private deep: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private raf = 0;
  private lastTime = 0;
  private lastChapter: ChapterId = "float";
  enabled = false;

  async enable(): Promise<boolean> {
    try {
      if (!this.ctx) this.build();
      const ctx = this.ctx!;
      await ctx.resume();
      this.enabled = true;
      this.master!.gain.cancelScheduledValues(ctx.currentTime);
      this.master!.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6);
      this.lastChapter = story.active;
      this.lastTime = story.time;
      cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(this.loop);
      return true;
    } catch {
      return false;
    }
  }

  disable() {
    const ctx = this.ctx;
    this.enabled = false;
    cancelAnimationFrame(this.raf);
    if (!ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    window.setTimeout(() => {
      if (!this.enabled) void ctx.suspend();
    }, 700);
  }

  private build() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 6;
    limiter.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(limiter);
    this.master = master;

    this.noise = this.makeNoise(ctx, 6);

    // Surface: surf that swells and recedes.
    const surface = ctx.createGain();
    surface.gain.value = 0;
    surface.connect(master);
    this.surface = surface;

    const surfSrc = this.loopNoise(ctx);
    const surfBand = ctx.createBiquadFilter();
    surfBand.type = "lowpass";
    surfBand.frequency.value = 1400;
    surfBand.Q.value = 0.3;
    const swell = ctx.createGain();
    swell.gain.value = 0.32;
    surfSrc.connect(surfBand).connect(swell).connect(surface);
    this.lfo(ctx, 0.075, 0.2, swell.gain);
    this.lfo(ctx, 0.031, 380, surfBand.frequency);

    // Deep: the same water heard through the surface, plus a low fifth.
    const deep = ctx.createGain();
    deep.gain.value = 0;
    deep.connect(master);
    this.deep = deep;

    const deepSrc = this.loopNoise(ctx);
    const deepLow = ctx.createBiquadFilter();
    deepLow.type = "lowpass";
    deepLow.frequency.value = 280;
    const deepAmp = ctx.createGain();
    deepAmp.gain.value = 0.55;
    deepSrc.connect(deepLow).connect(deepAmp).connect(deep);
    this.lfo(ctx, 0.05, 0.18, deepAmp.gain);

    for (const [freq, level] of [
      [55, 0.05],
      [82.41, 0.032],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(deep);
      this.lfo(ctx, 0.04, 0.6, osc.detune);
      osc.start();
    }
  }

  private makeNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Pink-ish noise (Paul Kellet's economy filter)
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18;
    }
    return buffer;
  }

  private loopNoise(ctx: AudioContext): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.start(0, Math.random() * 4);
    return src;
  }

  private lfo(ctx: AudioContext, freq: number, depth: number, target: AudioParam) {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    osc.connect(amount).connect(target);
    osc.start();
  }

  private splash() {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.8;
    band.frequency.setValueAtTime(2600, t);
    band.frequency.exponentialRampToValueAtTime(380, t + 0.9);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(1.1, t + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    src.connect(band).connect(env).connect(this.master);
    src.start(t);
    src.stop(t + 1.2);
  }

  private chime(freq: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    for (const [mult, level] of [
      [1, 0.05],
      [2.01, 0.012],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(level, t + 0.04);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      osc.connect(env).connect(this.master);
      osc.start(t);
      osc.stop(t + 2.5);
    }
  }

  private loop = () => {
    const ctx = this.ctx;
    if (!ctx || !this.enabled) return;
    const t = story.time;
    const under = underwaterAmount(t);
    this.surface!.gain.setTargetAtTime((1 - under) * 0.7, ctx.currentTime, 0.25);
    this.deep!.gain.setTargetAtTime(under * 0.6, ctx.currentTime, 0.35);

    if (this.lastTime < moments.splash && t >= moments.splash) this.splash();
    this.lastTime = t;

    const active = story.active;
    if (active !== this.lastChapter) {
      const note = CHIMES[active];
      const forward = chapters.findIndex((c) => c.id === active) > chapters.findIndex((c) => c.id === this.lastChapter);
      if (note && forward) this.chime(note);
      this.lastChapter = active;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}

export const audio = new AudioEngine();
