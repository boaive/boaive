/**
 * Per-frame state shared by every scene, written once per frame by <StoryClock/>.
 * Scenes read these values inside useFrame — never React state.
 */
export const frame = {
  /** Smoothed story time (chapter index + chapter progress). */
  t: 0,
  /** Seconds since the stage started (ambient motion; frozen under reduced motion). */
  elapsed: 0,
  dt: 0,
  /** 0..1 how "underwater" the camera currently is (fog, fx). */
  underwater: 0,
  /** Which world is on screen. */
  world: "ocean" as "ocean" | "digital",
  /** 0 = blue hour (opening), 1 = sunrise (closing). */
  timeOfDay: 0,
  /** Motion multiplier: 0 under reduced motion. */
  motion: 1,
  /** Smoothed pointer (-1..1). */
  pointer: { x: 0, y: 0 },
  /** Narrow portrait viewport (phones). */
  portrait: false,
  /** Increments when chapter lengths change, so time-based tracks can rebuild. */
  layoutVersion: 0,
};
