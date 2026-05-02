export default function extractPlainText(body: string): string {
    try {
        const blocks = JSON.parse(body);
        if (!Array.isArray(blocks)) return body;
        return blocks
            .map((b: any) => {
                if (b.type === "paragraph" || b.type === "heading") return b.text ?? "";
                if (b.type === "highlight") return b.content ?? "";
                if (b.type === "list") return (b.items ?? []).join(" ");
                return "";
            })
            .filter(Boolean)
            .join(" ");
    } catch {
        return body;
    }
}