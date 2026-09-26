/**
 * Things clients say when they first reach out. Shown as rising "bubbles" in the Problem chapter.
 * `depth` (0 = near, 1 = far) controls size, blur and parallax speed.
 */
export const needs: { text: string; depth: number }[] = [
  { text: "I need a website.", depth: 0.1 },
  { text: "I need an app.", depth: 0.55 },
  { text: "I need to automate this.", depth: 0.3 },
  { text: "I need an AI assistant.", depth: 0.75 },
  { text: "I need a system for my business.", depth: 0.2 },
  { text: "I have an idea.", depth: 0.45 },
  { text: "We're still doing this by hand.", depth: 0.85 },
  { text: "Customers keep asking the same questions.", depth: 0.6 },
];
