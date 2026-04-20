import type { GetEventDetailResponse } from "../types/event/event";

const toneMap: Record<string, string> = {
    professional: "formal, clear, and informative tone suitable for official announcements",
    genz: "casual, trendy Gen Z style with emojis, short sentences, and engaging hooks",
    viral: "highly engaging, attention-grabbing style with strong hooks, curiosity gaps, and FOMO",
    luxury: "elegant, premium wording with a sophisticated and high-end feeling",
    minimal: "concise, clean, and straight to the point",
    aggressive: "bold, provocative wording that challenges the reader and creates urgency",
};

export function buildContextPrompt(
    event: GetEventDetailResponse,
    tone?: string,
): string {
    const hashtags = event.hashtags?.map((h) => h.name).join(", ") || "";
    const categories = event.categories?.map((c) => c.name).join(", ") || "";
    const actors = event.actorImages?.map((a) => a.name).join(", ") || "";
    const sessions = event.sessions
        ?.map((s) => `${s.title} (${s.startTime} - ${s.endTime})`)
        .join("; ") || "";

    const eventContext = [
        `Event: ${event.title}`,
        event.location && `Location: ${event.location}`,
        hashtags && `Hashtags: ${hashtags}`,
        categories && `Categories: ${categories}`,
        actors && `Actors: ${actors}`,
        sessions && `Sessions: ${sessions}`,
    ].filter(Boolean).join(". ");

    const eventDetailUrl = `https://aipromo.online/event-detail/${event.urlPath}`;

    const ctaInstruction = event.id
        ? `The call-to-action button must link directly to: ${eventDetailUrl}. Do not use placeholder text.`
        : `Do not include any placeholder link like "[Link]". End with call-to-action text only, no href.`;

    const toneInstruction = tone && toneMap[tone]
        ? `Writing style: ${toneMap[tone]}.`
        : "";

    return [eventContext, ctaInstruction, toneInstruction, "Do not include any image block. The image will be injected separately after generation."]
        .filter(Boolean)
        .join("\n");
}