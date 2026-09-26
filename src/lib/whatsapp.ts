import { site } from "@/content/site";
import type { Project } from "@/data/types";

export type NeedTopic = "website" | "app" | "ai" | "automation" | "software" | "unsure";

/** Options for the contact composer ("What do you need?"). */
export const needTopics: { id: NeedTopic; label: string; phrase: string }[] = [
  { id: "website", label: "Website", phrase: "a website" },
  { id: "app", label: "App", phrase: "a mobile or web app" },
  { id: "ai", label: "AI assistant", phrase: "an AI assistant or chatbot" },
  { id: "automation", label: "Automation", phrase: "automating part of our work" },
  { id: "software", label: "Software / system", phrase: "custom software or an internal system" },
  { id: "unsure", label: "Not sure yet", phrase: "" },
];

export function whatsappHref(message: string): string {
  return `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/** Default message used by the persistent "Let's build" button. */
export function introMessage(): string {
  return "Hi Boaive, I found you through your website and I'd like to talk about a project.";
}

export function topicMessage(topic: NeedTopic): string {
  const need = needTopics.find((t) => t.id === topic);
  if (!need || !need.phrase) {
    return "Hi Boaive, I found you through your website. I have an idea (or a problem) I'd like to talk through, but I'm not sure yet what needs to be built.";
  }
  return `Hi Boaive, I found you through your website. I'm looking for help with ${need.phrase}. A bit of context about my business:`;
}

export function similarProjectMessage(project: Pick<Project, "title">): string {
  return `Hi Boaive, I saw ${project.title} on your website and I'd like to build something similar for my business.`;
}
