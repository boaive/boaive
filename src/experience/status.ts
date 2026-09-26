import { setStory, type StageStatus } from "@/story/store";

/** Publish the 3D stage status to the story store and to CSS (html[data-stage]). */
export function setStageStatus(status: StageStatus) {
  setStory({ stage: status });
  document.documentElement.dataset.stage = status;
}
