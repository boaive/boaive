/**
 * Injected before page scripts (page.evaluateOnNewDocument): catches the three.js renderer and scenes via the
 * __THREE_DEVTOOLS__ hook, counts WebGL draw calls, times main-thread rAF work per frame and the GPU time of
 * each render (EXT_disjoint_timer_query_webgl2). Results in window.__perf; `perf.repeat = n` renders each frame
 * n times inside the timer to lift small costs above timer noise.
 */
export function instrument() {
  const perf = (window.__perf = { renderer: null, scenes: [], frames: [], recording: false, hasTimer: false });
  const devtools = new EventTarget();
  devtools.addEventListener("observe", (e) => {
    const o = e.detail;
    if (o && o.isWebGLRenderer) perf.renderer = o;
    else if (o && o.isScene) perf.scenes.push(o);
  });
  window.__THREE_DEVTOOLS__ = devtools;

  let calls = 0;
  const proto = WebGL2RenderingContext.prototype;
  for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced", "drawRangeElements"]) {
    const orig = proto[name];
    proto[name] = function (...args) {
      calls++;
      return orig.apply(this, args);
    };
  }

  let gl = null;
  let ext = null;
  let active = null;
  const pending = [];
  const poll = () => {
    for (let i = pending.length - 1; i >= 0; i--) {
      const q = pending[i];
      if (!gl.getQueryParameter(q.query, gl.QUERY_RESULT_AVAILABLE)) continue;
      const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
      const ns = gl.getQueryParameter(q.query, gl.QUERY_RESULT);
      if (!disjoint) q.rec.gpu = (q.rec.gpu ?? 0) + ns / 1e6 / (perf.repeat || 1);
      gl.deleteQuery(q.query);
      pending.splice(i, 1);
    }
  };

  const raf = window.requestAnimationFrame.bind(window);
  let ts = -1;
  let rec = null;
  window.requestAnimationFrame = (cb) =>
    raf((t) => {
      if (t !== ts) {
        if (rec) {
          rec.calls = calls;
          if (perf.recording) perf.frames.push(rec);
        }
        if (gl && ext) poll();
        calls = 0;
        ts = t;
        rec = { t, cpu: 0, calls: 0, gpu: null };
        if (!gl && perf.renderer) {
          gl = perf.renderer.getContext();
          ext = gl.getExtension("EXT_disjoint_timer_query_webgl2");
          perf.hasTimer = !!ext;
          const renderer = perf.renderer;
          const render = renderer.render.bind(renderer);
          renderer.render = (scene, camera) => {
            if (!ext || active) return render(scene, camera);
            const query = gl.createQuery();
            gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
            active = { query, rec };
            try {
              // perf.repeat > 1 renders the frame several times inside the query: amplifies GPU cost over timer noise
              for (let i = 0; i < (perf.repeat || 1); i++) render(scene, camera);
            } finally {
              gl.endQuery(ext.TIME_ELAPSED_EXT);
              pending.push(active);
              active = null;
            }
          };
        }
      }
      const s = performance.now();
      try {
        cb(t);
      } finally {
        rec.cpu += performance.now() - s;
      }
    });
}
