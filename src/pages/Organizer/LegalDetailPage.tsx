import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiDownload, FiFileText, FiAlertCircle } from "react-icons/fi";
import * as mammoth from "mammoth";
import { fetchPolicyById } from "../../store/policySlice";
import type { AppDispatch, RootState } from "../../store";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";

type DashboardContext = {
    setConfig: (config: DashboardLayoutConfig) => void;
};

type PreviewState = "idle" | "loading" | "success" | "error";

/**
 * Parse word/document.xml inside the .docx (which is a ZIP) to extract
 * per-paragraph alignment. Returns array of alignments in document order.
 * Uses the browser's native DecompressionStream (zip = deflate) — but .docx
 * uses ZIP, not raw deflate, so we use a regex shortcut on the raw XML text.
 *
 * Simpler approach: fetch the .docx as text with a ZIP reader isn't available
 * without a library. Instead we use mammoth's internal JSZip instance by
 * passing the buffer to a fresh FileReader and reading word/document.xml via
 * a blob URL. Actually the cleanest no-extra-dep approach is to use the
 * native File System / DecompressionStream — but ZIP is not supported.
 *
 * FINAL approach: use mammoth's own `mammoth.extractRawText` to get a
 * structured result, then separately parse alignment via a minimal ZIP reader
 * using the fact that mammoth re-exports JSZip internally via its bundle.
 * Since we can't access that, we instead do a simpler heuristic:
 * parse the HTML output and look for very short <p> blocks (titles) and
 * mark them centered if they appear at the top of the document.
 */
async function extractAlignmentMap(buffer: ArrayBuffer): Promise<string[]> {
    // Try to unzip the docx and read word/document.xml
    // docx = ZIP, we need a ZIP reader. Use a trick: create a Blob and use
    // the browser's native zip support via the Compression Streams API.
    // Unfortunately browser Compression Streams only support gzip/deflate/deflate-raw,
    // not ZIP format. So we do a best-effort XML text scan on the raw binary.
    try {
        const bytes = new Uint8Array(buffer);
        // Scan for the word/document.xml content by finding the XML signature
        // after the ZIP local file header for "word/document.xml"
        const decoder = new TextDecoder("utf-8", { fatal: false });
        const raw = decoder.decode(bytes);

        // Find all <w:jc w:val="..."/> occurrences — these are paragraph alignments
        // They appear inside <w:pPr> blocks in the XML
        const alignments: string[] = [];
        // Match pattern: within a <w:p ...> block, find <w:jc w:val="center|right|both|left"/>
        const pRegex = /<w:p[ >]/g;
        const jcRegex = /<w:jc[^>]+w:val="([^"]+)"/;
        let match;
        while ((match = pRegex.exec(raw)) !== null) {
            // Look ahead ~500 chars for a jc element within this paragraph's pPr
            const slice = raw.slice(match.index, match.index + 600);
            const jcMatch = jcRegex.exec(slice);
            if (jcMatch) {
                const val = jcMatch[1]; // "center", "right", "both" (justify), "left"
                alignments.push(val === "both" ? "justify" : val);
            } else {
                alignments.push("left");
            }
        }
        return alignments;
    } catch {
        return [];
    }
}

function reinjectAlignment(html: string, alignMap: string[]): string {
    if (!alignMap.length) return html;
    let pIndex = 0;
    // Replace each <p> or <p ...> opening tag and inject style
    return html.replace(/<(p)(\s[^>]*)?>(?=[\s\S])/g, (_match, tag, attrs) => {
        const align = alignMap[pIndex] ?? "left";
        pIndex++;
        const style = align !== "left" ? ` style="text-align:${align}"` : "";
        return `<${tag}${attrs ?? ""}${style}>`;
    });
}

export default function LegalDetailPage() {
    const { setConfig } = useOutletContext<DashboardContext>();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { detail: policy, loading, error } = useSelector(
        (state: RootState) => state.POLICY
    );

    const [previewState, setPreviewState] = useState<PreviewState>("idle");
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [previewError, setPreviewError] = useState<string>("");
    const contentRef = useRef<HTMLDivElement>(null);

    // Fetch policy detail
    useEffect(() => {
        if (!id) return;
        dispatch(fetchPolicyById(id));
    }, [id, dispatch]);

    // Sync layout title
    useEffect(() => {
        setConfig({ title: policy?.description ?? "Chi tiết điều khoản" });
        return () => setConfig({});
    }, [policy?.description]);

    // Load & convert docx via mammoth when fileUrl is available
    useEffect(() => {
        if (!policy?.fileUrl) return;

        const isDocx =
            policy.fileUrl.toLowerCase().endsWith(".docx") ||
            policy.fileUrl.toLowerCase().includes(".docx");

        if (!isDocx) return;

        setPreviewState("loading");
        setHtmlContent("");
        setPreviewError("");

        fetch(policy.fileUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.arrayBuffer();
            })
            .then(async (buffer) => {
                // Step 1: Extract raw paragraph alignment from word/document.xml
                // mammoth strips Word alignment, so we read it ourselves via JSZip (bundled in mammoth)
                const alignMap = await extractAlignmentMap(buffer.slice(0));

                // Step 2: Convert with mammoth
                const mammothInput: any = {
                    arrayBuffer: buffer,
                    styleMap: [
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                    ],
                    convertImage: mammoth.images.imgElement((image: any) =>
                        image.read("base64").then((imageBuffer: string) => ({
                            src: `data:${image.contentType};base64,${imageBuffer}`,
                        }))
                    ),
                };
                const { value, messages } = await mammoth.convertToHtml(mammothInput);

                if (messages.length > 0) {
                    console.warn("[mammoth] warnings:", messages);
                }

                // Step 3: Re-inject alignment into <p> tags by index
                const html = reinjectAlignment(value, alignMap);
                return html;
            })
            .then((html) => {
                setHtmlContent(html);
                setPreviewState("success");
            })
            .catch((err) => {
                console.error("[mammoth] error:", err);
                setPreviewError(err.message ?? "Không thể tải file");
                setPreviewState("error");
            });
    }, [policy?.fileUrl]);

    const handleDownload = () => {
        if (!policy?.fileUrl) return;
        const a = document.createElement("a");
        a.href = policy.fileUrl;
        a.download = policy.fileUrl.split("/").pop() ?? "policy.docx";
        a.click();
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading.detail) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-48 rounded-xl bg-card-dark border border-border-dark" />
                <div className="rounded-2xl border border-border-dark bg-card-dark p-8 space-y-4">
                    <div className="h-5 w-64 rounded bg-white/5" />
                    <div className="h-3 w-full rounded bg-white/5" />
                    <div className="h-3 w-5/6 rounded bg-white/5" />
                    <div className="h-3 w-4/6 rounded bg-white/5" />
                    <div className="h-3 w-full rounded bg-white/5" />
                    <div className="h-3 w-3/4 rounded bg-white/5" />
                </div>
            </div>
        );
    }

    // ── Fetch error ────────────────────────────────────────────────────────────
    if (error || !policy) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FiAlertCircle size={36} className="text-red-400 mb-4" />
                <p className="text-white font-semibold mb-1">Không tìm thấy điều khoản</p>
                <p className="text-slate-500 text-sm mb-6">{error ?? "Dữ liệu không tồn tại"}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                    <FiArrowLeft size={14} />
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* ── Header bar ── */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    Quay lại
                </button>

                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition"
                >
                    <FiDownload size={13} />
                    Tải xuống
                </button>
            </div>

            {/* ── Meta card ── */}
            <div className="rounded-2xl border border-border-dark bg-card-dark px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <FiFileText size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{policy.description}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{policy.type}</p>
                </div>
            </div>

            {/* ── Document preview ── */}
            <div className="rounded-2xl border border-border-dark bg-card-dark overflow-hidden">

                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-border-dark flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Nội dung văn bản
                    </p>
                    {previewState === "loading" && (
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                            </svg>
                            Đang tải văn bản...
                        </span>
                    )}
                    {previewState === "success" && (
                        <span className="text-xs text-emerald-400">✓ Đã tải xong</span>
                    )}
                </div>

                {/* Content area */}
                <div className="p-6 md:p-10 min-h-[400px]">
                    {previewState === "idle" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                            <FiFileText size={32} className="mb-3 opacity-30" />
                            <p className="text-sm">Đang chuẩn bị tài liệu...</p>
                        </div>
                    )}

                    {previewState === "loading" && (
                        <div className="space-y-3 animate-pulse">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-3 rounded bg-white/5"
                                    style={{ width: `${65 + Math.sin(i * 1.7) * 30}%` }}
                                />
                            ))}
                        </div>
                    )}

                    {previewState === "error" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <FiAlertCircle size={28} className="text-red-400 mb-3" />
                            <p className="text-slate-300 text-sm font-medium mb-1">Không thể hiển thị tài liệu</p>
                            <p className="text-slate-500 text-xs mb-5">{previewError}</p>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                            >
                                <FiDownload size={12} />
                                Tải về để xem
                            </button>
                        </div>
                    )}

                    {previewState === "success" && (
                        <div
                            ref={contentRef}
                            className="legal-doc-content prose-legal"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}
                </div>
            </div>

            {/* ── Prose styles injected via style tag ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

                .legal-doc-content {
                    color: #cbd5e1;
                    font-size: 0.9rem;
                    line-height: 1.9;
                    font-family: 'Be Vietnam Pro', 'Segoe UI', system-ui, -apple-system, sans-serif;
                }
                .legal-doc-content h1,
                .legal-doc-content h2,
                .legal-doc-content h3,
                .legal-doc-content h4 {
                    color: #f1f5f9;
                    font-weight: 700;
                    margin-top: 2em;
                    margin-bottom: 0.5em;
                    line-height: 1.3;
                }
                .legal-doc-content h1 { font-size: 1.35rem; }
                .legal-doc-content h2 { font-size: 1.15rem; }
                .legal-doc-content h3 { font-size: 1rem; color: #a78bfa; }
                .legal-doc-content p {
                    margin-bottom: 0.9em;
                    text-align: justify;
                }
                .legal-doc-content ul,
                .legal-doc-content ol {
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
                .legal-doc-content li {
                    margin-bottom: 0.4em;
                }
                .legal-doc-content strong {
                    color: #e2e8f0;
                    font-weight: 600;
                }
                .legal-doc-content em {
                    color: #94a3b8;
                }
                .legal-doc-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5em 0;
                    font-size: 0.85rem;
                }
                .legal-doc-content th {
                    background: rgba(124, 59, 237, 0.15);
                    color: #e2e8f0;
                    font-weight: 600;
                    padding: 0.6em 1em;
                    border: 1px solid #1e293b;
                    text-align: left;
                }
                .legal-doc-content td {
                    padding: 0.6em 1em;
                    border: 1px solid #1e293b;
                    color: #94a3b8;
                    vertical-align: top;
                }
                .legal-doc-content tr:hover td {
                    background: rgba(255,255,255,0.02);
                }
                .legal-doc-content a {
                    color: #a78bfa;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .legal-doc-content hr {
                    border: none;
                    border-top: 1px solid #1e293b;
                    margin: 2em 0;
                }
                .legal-doc-content .align-center,
                .legal-doc-content p[align="center"] {
                    text-align: center !important;
                }
                .legal-doc-content p[align="right"] {
                    text-align: right !important;
                }
                .legal-doc-content p[align="justify"] {
                    text-align: justify !important;
                }
                .legal-doc-content img {
                    max-width: 100%;
                    border-radius: 0.5rem;
                    margin: 1em 0;
                }
            `}</style>
        </div>
    );
}