import type { GetEventDetailResponse } from "../types/event/event";

const toneMap: Record<string, string> = {
    professional: "Use a formal, clear, and informative tone suitable for official announcements. Write the post in Vietnamese.",
    genz: "Use a casual, trendy Gen Z style with emojis, short sentences, and engaging hooks. Write the post in Vietnamese.",
    viral: "Use highly engaging, attention-grabbing style with strong hooks, curiosity gaps, and FOMO. Write the post in Vietnamese.",
    luxury: "Use elegant, premium wording with a sophisticated and high-end feeling. Write the post in Vietnamese.",
    minimal: "Keep it concise, clean, and straight to the point. Write the post in Vietnamese.",
    aggressive: "Use bold, provocative wording that challenges the reader and creates urgency. Write the post in Vietnamese.",
};

export function buildContextPrompt(
    event: GetEventDetailResponse,
    tone?: string
): string {
    const hashtags = event.hashtags?.map((h) => h.name).join(", ") || "";
    const categories = event.categories?.map((c) => c.name).join(", ") || "";
    const actors = event.actorImages?.map((a) => a.name).join(", ") || "";
    const sessions = event.sessions
        ?.map((s) => `${s.title} (${s.startTime} - ${s.endTime})`)
        .join("; ") || "";
    const hasImage = event.images.length > 0;

    let context = `Generate a marketing post draft in Vietnamese for Event: ${event.title}`;
    if (event.description) context += `, Description: ${event.description}`;
    if (event.location) context += `, Location: ${event.location}`;
    if (hashtags) context += `, Hashtags: ${hashtags}`;
    if (categories) context += `, Categories: ${categories}`;
    if (actors) context += `, Actors: ${actors}`;
    if (sessions) context += `, Sessions: ${sessions}`;
    context += hasImage
        ? `. Include ImageUrl.`
        : `. Exclude ImageUrl.`;
    context += event.bannerUrl
        ? `. Include BannerUrl.`
        : `. Exclude BannerUrl.`;

    if (event.urlPath) {
        context += ` The call-to-action must link directly to: ${event.urlPath}. Do not use placeholder text like "[Link]", "[Your Registration Link Here]" or any bracket placeholder.`;
    } else {
        context += ` If there is no registration link available, do not include any placeholder text like "[Link]" or "[Your Registration Link Here]". Simply end with the call-to-action text only.`;
    }

    context += ` The entire post content must be written in Vietnamese.`;

    if (tone && toneMap[tone]) {
        context += ` Writing style instruction: ${toneMap[tone]}`;
    }

    return context;
}