import { useEffect } from "react";

const FONT_HREF =
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap";

export function usePostFont() {
    useEffect(() => {
        const id = "post-block-fonts";
        if (document.getElementById(id)) return;
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        document.head.appendChild(link);

        return () => {
            document.getElementById(id)?.remove();
        };
    }, []);
}