import { site } from "@/content/site";
import type { Project } from "@/data/types";

export type NeedTopic = "ai" | "automation" | "software" | "cloud" | "data" | "digital" | "marketing" | "idea";

/** Options for the contact composer ("What do you need?"): the service groups, plus an open door. */
export const needTopics: { id: NeedTopic; label: string; phrase: string }[] = [
  { id: "ai", label: "AI & Agentic Systems", phrase: "AI assistants or agentic systems" },
  { id: "automation", label: "Intelligent Automation", phrase: "automating part of our work" },
  { id: "software", label: "Custom Software & Platforms", phrase: "custom software or a business platform" },
  { id: "cloud", label: "Cloud & DevOps", phrase: "cloud and DevOps engineering" },
  { id: "data", label: "Data & Analytics", phrase: "data and analytics" },
  { id: "digital", label: "Websites & Apps", phrase: "a website, web app or mobile app" },
  { id: "marketing", label: "Digital Marketing", phrase: "digital marketing and campaigns" },
  { id: "idea", label: "I'm exploring an idea", phrase: "" },
];

export function whatsappHref(message: string): string {
  return `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/** Default message used by the persistent "Discuss a project" button. */
export function introMessage(): string {
  return "Hi Boaive, I found you through your website and I'd like to talk about a project.";
}

export function topicMessage(topic: NeedTopic, brief = ""): string {
  const need = needTopics.find((t) => t.id === topic);
  const text = brief.trim();
  if (!need || !need.phrase) {
    const base =
      "Hi Boaive, I found you through your website. I'm exploring an idea (or a problem) and I'm not sure yet what needs to be built.";
    return text ? `${base} What I'm trying to improve: ${text}` : base;
  }
  const base = `Hi Boaive, I found you through your website. I'm looking for help with ${need.phrase}.`;
  return text ? `${base} What I'm trying to improve: ${text}` : `${base} A bit of context about my business:`;
}

export function similarProjectMessage(project: Pick<Project, "title">): string {
  return `Hi Boaive, I saw ${project.title} on your website and I'd like to build something similar for my business.`;
}
