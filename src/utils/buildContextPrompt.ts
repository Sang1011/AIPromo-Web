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
    imageUrl?: string,
): string {
    const hashtags = event.hashtags?.map((h) => h.name).join(", ") || "";
    const categories = event.categories?.map((c) => c.name).join(", ") || "";
    const actors = event.actorImages?.map((a) => a.name).join(", ") || "";
    const sessions = event.sessions
        ?.map((s) => `${s.title} (${s.startTime} - ${s.endTime})`)
        .join("; ") || "";

    const eventContext = [
        `Event: ${event.title}`,
        event.description && `Description: ${event.description}`,
        event.location && `Location: ${event.location}`,
        hashtags && `Hashtags: ${hashtags}`,
        categories && `Categories: ${categories}`,
        actors && `Actors: ${actors}`,
        sessions && `Sessions: ${sessions}`,
    ].filter(Boolean).join(". ");

    const eventDetailUrl = `${window.location.origin}/event-detail/${event.id}`;

    const ctaInstruction = event.id
        ? `The call-to-action button must link directly to: ${eventDetailUrl}. Do not use placeholder text.`
        : `Do not include any placeholder link like "[Link]". End with call-to-action text only, no href.`;

    const toneInstruction = tone && toneMap[tone]
        ? `Writing style: ${toneMap[tone]}.`
        : "";

    const imageInstruction = imageUrl
        ? `Include exactly one image block using this URL: ${imageUrl} — do not use any other image URL.`
        : `Do not include any image block.`;

    const schemaDescription = `
Return ONLY a valid JSON array of content blocks. No explanation, no markdown, no code fences.
Each block must follow this schema:
- { "type": "heading", "level": 1|2|3, "text": "..." }
- { "type": "paragraph", "text": "..." }
- { "type": "image", "src": "<url>", "alt": "..." }   ← only if image provided
- { "type": "button", "label": "...", "href": "..." }
- { "type": "list", "ordered": false, "items": ["...", "..."] }
- { "type": "divider" }
- { "type": "highlight", "content": "..." }

Rules:
- All text content must be in Vietnamese.
- image block src must be exactly the URL provided, never fabricate image URLs.
- button href must be the real CTA link, never a placeholder.
- Produce a complete, well-structured marketing post (heading → content → CTA).
`.trim();

    return [schemaDescription, eventContext, ctaInstruction, toneInstruction, imageInstruction]
        .filter(Boolean)
        .join("\n");
}