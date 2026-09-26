export type CapabilityId = "web" | "ai" | "software" | "automation" | "mobile" | "custom";

export interface Capability {
  id: CapabilityId;
  name: string;
  /** One confident line. */
  headline: string;
  description: string;
  items: string[];
}

export type ProcessStepId = "understand" | "design" | "build" | "refine" | "launch";

export interface ProcessStep {
  id: ProcessStepId;
  name: string;
  description: string;
  /** What the client receives at this step. */
  deliverable: string;
}

/**
 * - client:     paid work for a real business
 * - experiment: self-initiated build exploring how we'd approach a type of business (content is illustrative)
 * - prototype:  internal R&D — a proof of concept, tool or technique we're trying out
 */
export type ProjectKind = "client" | "experiment" | "prototype";
export type ProjectStatus = "live" | "in-progress" | "archived";

export interface MediaImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface MediaVideo {
  src: string;
  poster: string;
  width: number;
  height: number;
  /** Accessible description of what the video shows. */
  description: string;
}

export interface ProjectMedia {
  /** Desktop first screen — used on the 3D screen, cards and share images. */
  poster: MediaImage;
  /** Smaller poster for low-tier devices / thumbnails. */
  posterSmall: MediaImage;
  gallery: MediaImage[];
  mobile: MediaImage[];
  video?: MediaVideo;
}

export interface Project {
  slug: string;
  title: string;
  kind: ProjectKind;
  /**
   * Shown as a screen in the home page's work chapter (the story scales its pacing to the count).
   * Keep it to 3–5 projects; everything is always listed on /work.
   */
  featured?: boolean;
  /** What kind of thing it is, in a few words. */
  type: string;
  industry: string;
  capabilities: CapabilityId[];
  year?: string;
  summary: string;
  problem: string;
  approach: string;
  built: string[];
  technologies: string[];
  /** Only real, verifiable outcomes. Leave undefined rather than guessing. */
  outcome?: string;
  url?: string;
  status: ProjectStatus;
  media: ProjectMedia;
  /** Signature colour of the project's own brand (frames/glows in 3D). */
  accent: string;
  /** Shown on experiments/prototypes so nobody mistakes illustrative content for real claims. */
  disclaimer?: string;
  /** Internal: copy that must be confirmed before launch. Never rendered. */
  reviewNote?: string;
}
