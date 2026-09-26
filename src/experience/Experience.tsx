"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { setStory } from "@/story/store";
import { installDebugHooks } from "./debug";
import { detectQuality, probeWebGL } from "./quality";
import { setStageStatus } from "./status";

/** The WebGL stage is a separate chunk, fetched only after the page is interactive. */
const Stage = dynamic(() => import("./Stage"), { ssr: false });

/** `?debug`: a copyable report of the device's GPU, errors and frame rate (never loaded otherwise). */
const DebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

const noSubscription = () => () => {};
const debugRequested = () => new URLSearchParams(window.location.search).has("debug");

/** If the 3D chunk or renderer fails, fall back to the CSS story instead of a broken stage. */
class StageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("3D stage failed; showing the CSS fallback.", error);
    setStageStatus("unsupported");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Decides whether (and how) to run the 3D story:
 *   - no WebGL or ?3d=off      → designed CSS fallback (Backdrop), story still reads
 *   - otherwise                → lazy-load the stage at a device-appropriate quality
 */
export function Experience() {
  const [mount, setMount] = useState(false);
  // false on the server and during hydration, then the real value
  const debug = useSyncExternalStore(noSubscription, debugRequested, () => false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // before the stage mounts, so first-compile shader errors are captured
    if (params.has("debug")) installDebugHooks();
    if (params.get("3d") === "off") {
      setStageStatus("off");
      return;
    }
    const { ok, software } = probeWebGL();
    if (!ok) {
      setStageStatus("unsupported");
      return;
    }
    setStory({ quality: detectQuality(software) });
    setStageStatus("loading");

    // Let the page become interactive first, then bring in the 3D bundle.
    const start = () => setMount(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 900 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 200);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {mount ? (
        <StageBoundary>
          <Stage debug={debug} />
        </StageBoundary>
      ) : null}
      {debug ? <DebugPanel /> : null}
    </>
  );
}
