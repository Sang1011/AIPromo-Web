import { renderAsync } from "docx-preview";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiChevronDown,
    FiChevronUp,
    FiDownload,
    FiExternalLink,
    FiFileText,
    FiSearch,
    FiX,
    FiZoomIn,
    FiZoomOut,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchPolicyById } from "../../store/policySlice";
import type { DashboardLayoutConfig } from "../../types/config/dashboard.config";

type DashboardContext = { setConfig: (config: DashboardLayoutConfig) => void };
type PreviewState = "idle" | "loading" | "success" | "error";

// ─── File type detection ──────────────────────────────────────────────────────

type FileFormat = "docx" | "pdf" | "doc" | "txt" | "other";

function detectFormat(url: string): FileFormat {
    const lower = url.toLowerCase().split("?")[0]; // strip query params
    if (lower.endsWith(".docx")) return "docx";
    if (lower.endsWith(".pdf")) return "pdf";
    if (lower.endsWith(".doc")) return "doc";
    if (lower.endsWith(".txt")) return "txt";
    return "other";
}

function formatLabel(fmt: FileFormat): string {
    const map: Record<FileFormat, string> = {
        docx: "Word (.docx)",
        doc: "Word (.doc)",
        pdf: "PDF",
        txt: "Text",
        other: "Tài liệu",
    };
    return map[fmt];
}

// Google Docs Viewer — works for doc, docx, xlsx, pptx, txt, pdf (public URLs)
function googleDocsViewerUrl(fileUrl: string): string {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

// Microsoft Office Online Viewer — works for doc, docx, xlsx, pptx (public URLs)
function officeOnlineViewerUrl(fileUrl: string): string {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

/** PDF via native browser embed — most reliable, no dep */
function PdfViewer({ fileUrl, zoom }: { fileUrl: string; zoom: number }) {
    const [state, setState] = useState<"loading" | "success" | "error">("loading");

    return (
        <div className="w-full flex-1 flex flex-col" style={{ minHeight: 600 }}>
            {state === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d24] z-10 pointer-events-none">
                    <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                </div>
            )}
            <div className="relative flex-1" style={{ minHeight: 600 }}>
                <iframe
                    src={`${fileUrl}#zoom=${Math.round(zoom * 100)}`}
                    className="w-full h-full border-0 rounded-b-2xl"
                    style={{ minHeight: 600 }}
                    title="PDF Viewer"
                    onLoad={() => setState("success")}
                    onError={() => setState("error")}
                />
            </div>
            {state === "error" && (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <FiAlertCircle size={28} className="text-red-400" />
                    <p className="text-slate-300 text-sm font-medium">Trình duyệt không hỗ trợ xem PDF trực tiếp</p>
                    <a
                        href={fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                    >
                        <FiDownload size={12} /> Tải về để xem
                    </a>
                </div>
            )}
        </div>
    );
}

/** Iframe-based viewer for Google Docs / Office Online */
function IframeViewer({
    src,
    label,
    fileUrl,
}: {
    src: string;
    label: string;
    fileUrl: string;
}) {
    const [state, setState] = useState<"loading" | "success" | "error">("loading");
    const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

    const handleError = () => {
        // Try Office Online as fallback if Google Docs failed
        if (!fallbackSrc) {
            setFallbackSrc(officeOnlineViewerUrl(fileUrl));
        } else {
            setState("error");
        }
    };

    const activeSrc = fallbackSrc ?? src;

    return (
        <div className="w-full flex-1 flex flex-col relative" style={{ minHeight: 600 }}>
            {state === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1d24] z-10 gap-3">
                    <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    <p className="text-xs text-slate-500">Đang tải {label} qua trình xem online...</p>
                </div>
            )}
            {state === "error" ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-12">
                    <FiAlertCircle size={28} className="text-red-400" />
                    <p className="text-slate-300 text-sm font-medium">Không thể hiển thị tài liệu online</p>
                    <p className="text-slate-500 text-xs">File có thể không ở URL công khai hoặc bị chặn CORS</p>
                    <div className="flex gap-2">
                        <a
                            href={fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                        >
                            <FiDownload size={12} /> Tải về
                        </a>
                        <a
                            href={googleDocsViewerUrl(fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
                        >
                            <FiExternalLink size={12} /> Mở Google Docs
                        </a>
                    </div>
                </div>
            ) : (
                <iframe
                    key={activeSrc}
                    src={activeSrc}
                    className="w-full flex-1 border-0 rounded-b-2xl"
                    style={{ minHeight: 600, height: "100%" }}
                    title={`${label} Viewer`}
                    onLoad={() => setState("success")}
                    onError={handleError}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
            )}
        </div>
    );
}

/** Plain text viewer */
function TxtViewer({ fileUrl }: { fileUrl: string }) {
    const [text, setText] = useState("");
    const [state, setState] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        setState("loading");
        fetch(fileUrl)
            .then((r) => r.text())
            .then((t) => { setText(t); setState("success"); })
            .catch(() => setState("error"));
    }, [fileUrl]);

    if (state === "loading") return (
        <div className="flex-1 flex items-center justify-center py-12">
            <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
        </div>
    );

    if (state === "error") return (
        <div className="flex-1 flex items-center justify-center py-12 text-slate-500 text-sm">
            Không đọc được file text
        </div>
    );

    return (
        <div className="flex-1 overflow-auto p-8">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-w-4xl mx-auto">
                {text}
            </pre>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LegalDetailPage() {
    const { setConfig } = useOutletContext<DashboardContext>();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { detail: policy, loading, error } = useSelector(
        (state: RootState) => state.POLICY
    );

    const format: FileFormat = policy?.fileUrl ? detectFormat(policy.fileUrl) : "other";

    // ── DOCX-specific state ───────────────────────────────────────────────────
    const [previewState, setPreviewState] = useState<PreviewState>("idle");
    const [previewError, setPreviewError] = useState("");
    const [pageCount, setPageCount] = useState(0);
    const [zoom, setZoom] = useState(1);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMatch, setActiveMatch] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    const viewerRef = useRef<HTMLDivElement>(null);
    const docxContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const showSkeleton = loading.detail;
    const showNotFound = !loading.detail && (error || !policy);
    const showViewer = !loading.detail && !error && !!policy;

    useEffect(() => {
        if (!id) return;
        dispatch(fetchPolicyById(id));
    }, [id, dispatch]);

    useEffect(() => {
        setConfig({ title: policy?.description ?? "Chi tiết điều khoản" });
        return () => setConfig({});
    }, [policy?.description, setConfig]);

    // ── DOCX render ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!showViewer || !policy?.fileUrl || !docxContainerRef.current) return;
        if (format !== "docx") return; // only for docx

        let cancelled = false;

        const loadDocx = async () => {
            try {
                setPreviewState("loading");
                setPreviewError("");
                setSearchQuery("");
                setActiveMatch(0);
                setTotalMatches(0);
                setPageCount(0);

                const res = await fetch(policy.fileUrl);
                if (!res.ok) throw new Error(`Không tải được file (HTTP ${res.status})`);

                const buffer = await res.arrayBuffer();
                if (!buffer || buffer.byteLength === 0) throw new Error("File rỗng hoặc không đọc được dữ liệu");

                if (cancelled || !docxContainerRef.current) return;

                docxContainerRef.current.innerHTML = "";

                await renderAsync(buffer, docxContainerRef.current, undefined, {
                    className: "docx",
                    inWrapper: true,
                    breakPages: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    ignoreLastRenderedPageBreak: false,
                    renderHeaders: true,
                    renderFooters: true,
                    renderFootnotes: true,
                    renderEndnotes: true,
                    useBase64URL: true,
                    experimental: true,
                });

                if (cancelled) return;

                requestAnimationFrame(() => {
                    if (!docxContainerRef.current || cancelled) return;
                    const pages =
                        docxContainerRef.current.querySelectorAll(".docx-wrapper section").length ||
                        docxContainerRef.current.querySelectorAll("section").length ||
                        1;
                    setPageCount(pages);
                    setPreviewState("success");
                });
            } catch (err: any) {
                if (cancelled) return;
                setPreviewError(err?.message ?? "Không thể tải hoặc hiển thị file");
                setPreviewState("error");
            }
        };

        loadDocx();
        return () => { cancelled = true; };
    }, [showViewer, policy?.fileUrl, format]);

    // ── Search (DOCX only) ────────────────────────────────────────────────────
    const clearHighlights = useCallback(() => {
        if (!docxContainerRef.current) return;
        const marks = docxContainerRef.current.querySelectorAll("mark.search-highlight");
        marks.forEach((mark) => {
            const parent = mark.parentNode;
            if (!parent) return;
            parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
            parent.normalize();
        });
    }, []);

    const highlightSearch = useCallback(
        (query: string) => {
            if (!docxContainerRef.current) return 0;
            clearHighlights();
            if (!query.trim()) return 0;

            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "gi");

            const walker = document.createTreeWalker(
                docxContainerRef.current,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {
                        const parent = node.parentElement;
                        if (!parent) return NodeFilter.FILTER_REJECT;
                        if (["SCRIPT", "STYLE", "MARK"].includes(parent.tagName) || parent.closest("mark.search-highlight"))
                            return NodeFilter.FILTER_REJECT;
                        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
                        return NodeFilter.FILTER_ACCEPT;
                    },
                }
            );

            const textNodes: Text[] = [];
            let currentNode: Node | null;
            while ((currentNode = walker.nextNode())) textNodes.push(currentNode as Text);

            let total = 0;
            for (const textNode of textNodes) {
                const text = textNode.textContent ?? "";
                regex.lastIndex = 0;
                if (!regex.test(text)) continue;

                const frag = document.createDocumentFragment();
                let lastIndex = 0;

                text.replace(regex, (match, offset) => {
                    if (offset > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
                    const mark = document.createElement("mark");
                    mark.className = "search-highlight";
                    mark.setAttribute("data-match-index", String(total));
                    mark.textContent = match;
                    frag.appendChild(mark);
                    total++;
                    lastIndex = offset + match.length;
                    return match;
                });

                if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
                textNode.parentNode?.replaceChild(frag, textNode);
            }

            return total;
        },
        [clearHighlights]
    );

    useEffect(() => {
        if (previewState !== "success" || format !== "docx") return;
        const timeout = setTimeout(() => {
            const count = highlightSearch(searchQuery);
            setTotalMatches(count);
            setActiveMatch(0);
        }, 150);
        return () => clearTimeout(timeout);
    }, [searchQuery, previewState, format, highlightSearch]);

    useEffect(() => {
        if (!docxContainerRef.current) return;
        const marks = docxContainerRef.current.querySelectorAll("mark.search-highlight");
        marks.forEach((mark) => mark.classList.remove("active-highlight"));
        if (!marks.length) return;
        const active = marks[activeMatch] as HTMLElement | undefined;
        if (!active) return;
        active.classList.add("active-highlight");
        active.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [activeMatch, totalMatches]);

    const prevMatch = () => { if (totalMatches) setActiveMatch((p) => (p > 0 ? p - 1 : totalMatches - 1)); };
    const nextMatch = () => { if (totalMatches) setActiveMatch((p) => (p < totalMatches - 1 ? p + 1 : 0)); };
    const clearSearch = () => { setSearchQuery(""); setActiveMatch(0); setTotalMatches(0); clearHighlights(); };

    const toggleSearch = () => {
        setSearchOpen((prev) => !prev);
        if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    // ── Zoom ──────────────────────────────────────────────────────────────────
    const zoomIn = () => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(1))));
    const zoomOut = () => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))));
    const resetZoom = () => setZoom(1);

    // ── Download ──────────────────────────────────────────────────────────────
    const handleDownload = () => {
        if (!policy?.fileUrl) return;
        const a = document.createElement("a");
        a.href = policy.fileUrl;
        a.download = policy.fileUrl.split("/").pop() ?? "policy";
        a.target = "_blank";
        a.click();
    };

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f" && format === "docx") {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
            }
            if (e.key === "Escape") { setSearchOpen(false); clearSearch(); }
            if (e.key === "Enter" && searchOpen) { e.shiftKey ? prevMatch() : nextMatch(); }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchOpen, totalMatches, format]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // ── Derived ───────────────────────────────────────────────────────────────
    // For PDF: show zoom controls. For DOCX: show zoom + search.
    const showZoom = format === "docx" || format === "pdf";
    const showSearch = format === "docx";
    const isDocxSuccess = format === "docx" && previewState === "success";
    const isDocxLoading = format === "docx" && previewState === "loading";

    // Viewer src for iframe-based formats
    const iframeSrc = policy?.fileUrl
        ? (format === "doc" || format === "other")
            ? googleDocsViewerUrl(policy.fileUrl)
            : null
        : null;

    return (
        <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 120px)" }}>

            {/* ── Skeleton ── */}
            {showSkeleton && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-10 w-48 rounded-xl bg-card-dark border border-border-dark" />
                    <div className="rounded-2xl border border-border-dark bg-card-dark p-8 space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-3 rounded bg-white/5"
                                style={{ width: `${60 + Math.sin(i * 1.7) * 30}%` }} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Not found ── */}
            {showNotFound && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <FiAlertCircle size={36} className="text-red-400 mb-4" />
                    <p className="text-white font-semibold mb-1">Không tìm thấy điều khoản</p>
                    <p className="text-slate-500 text-sm mb-6">{error ?? "Dữ liệu không tồn tại"}</p>
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
                        <FiArrowLeft size={14} /> Quay lại
                    </button>
                </div>
            )}

            {/* ── Viewer ── */}
            {showViewer && (
                <>
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                            Quay lại
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Format badge */}
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10 text-slate-400 bg-white/[0.03]">
                                <FiFileText size={11} />
                                {formatLabel(format)}
                            </span>

                            {/* Search — DOCX only */}
                            {showSearch && (
                                <button
                                    onClick={toggleSearch}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${searchOpen
                                        ? "border-primary/40 bg-primary/10 text-primary"
                                        : "border-white/10 text-slate-300 hover:bg-white/5"}`}
                                >
                                    <FiSearch size={13} /> Tìm kiếm
                                </button>
                            )}

                            {/* Open external (for iframe-based) */}
                            {(format === "doc" || format === "other") && (
                                <a
                                    href={googleDocsViewerUrl(policy!.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition"
                                >
                                    <FiExternalLink size={13} /> Mở ngoài
                                </a>
                            )}

                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-slate-300 hover:bg-white/5 transition"
                            >
                                <FiDownload size={13} /> Tải xuống
                            </button>
                        </div>
                    </div>

                    {/* Viewer shell */}
                    <div className="rounded-2xl border border-border-dark bg-[#111318] overflow-hidden flex flex-col flex-1">
                        {/* Toolbar */}
                        <div className="px-4 py-2.5 border-b border-border-dark bg-[#0d1017] flex items-center gap-3 flex-wrap">
                            {/* Page count — DOCX only */}
                            {format === "docx" && (
                                <>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="tabular-nums px-1">
                                            <span className="text-white font-semibold">
                                                {previewState === "success" ? pageCount || "—" : "—"}
                                            </span>
                                            <span className="text-slate-600 ml-1">trang</span>
                                        </span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                </>
                            )}

                            {/* Zoom — DOCX & PDF */}
                            {showZoom && (
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <button onClick={zoomOut}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 transition">
                                        <FiZoomOut size={13} />
                                    </button>
                                    <button onClick={resetZoom}
                                        className="px-2 py-0.5 rounded-md hover:bg-white/5 transition tabular-nums font-mono text-xs text-slate-300 min-w-[44px] text-center">
                                        {Math.round(zoom * 100)}%
                                    </button>
                                    <button onClick={zoomIn}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 transition">
                                        <FiZoomIn size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Format info for non-docx */}
                            {format !== "docx" && (
                                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <FiFileText size={11} />
                                    {format === "pdf" && "Xem PDF trực tiếp trên trình duyệt"}
                                    {format === "doc" && "Xem qua Google Docs Viewer"}
                                    {format === "txt" && "Plain text"}
                                    {format === "other" && "Xem qua Google Docs Viewer"}
                                </div>
                            )}

                            {/* Status — DOCX */}
                            <div className="ml-auto flex items-center gap-2">
                                {isDocxLoading && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                                        </svg>
                                        Đang tải văn bản...
                                    </span>
                                )}
                                {isDocxSuccess && (
                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                        Hiển thị thành công
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Search bar — DOCX only */}
                        {showSearch && searchOpen && (
                            <div className="px-4 py-2 border-b border-border-dark bg-[#0d1017] flex items-center gap-2">
                                <FiSearch size={13} className="text-slate-500 shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.shiftKey ? prevMatch() : nextMatch(); } }}
                                    placeholder="Tìm kiếm trong văn bản..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                                />
                                {searchQuery && (
                                    <>
                                        <span className="text-xs text-slate-500 tabular-nums shrink-0">
                                            {totalMatches > 0 ? `${activeMatch + 1}/${totalMatches}` : "Không tìm thấy"}
                                        </span>
                                        <button onClick={prevMatch} className="w-5 h-5 flex items-center justify-center hover:text-white text-slate-500 transition">
                                            <FiChevronUp size={12} />
                                        </button>
                                        <button onClick={nextMatch} className="w-5 h-5 flex items-center justify-center hover:text-white text-slate-500 transition">
                                            <FiChevronDown size={12} />
                                        </button>
                                        <button onClick={clearSearch} className="w-5 h-5 flex items-center justify-center hover:text-white text-slate-500 transition">
                                            <FiX size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── Document area ── */}
                        <div
                            ref={viewerRef}
                            className="flex-1 overflow-auto bg-[#1a1d24] flex flex-col items-center py-8 px-4"
                            style={{ minHeight: 500 }}
                        >
                            {/* ── PDF ── */}
                            {format === "pdf" && (
                                <div className="w-full flex-1 flex flex-col" style={{ minHeight: 600 }}>
                                    <PdfViewer fileUrl={policy!.fileUrl} zoom={zoom} />
                                </div>
                            )}

                            {/* ── TXT ── */}
                            {format === "txt" && (
                                <div className="w-full flex-1 flex flex-col">
                                    <TxtViewer fileUrl={policy!.fileUrl} />
                                </div>
                            )}

                            {/* ── DOC / Other → Google Docs Viewer iframe ── */}
                            {(format === "doc" || format === "other") && iframeSrc && (
                                <div className="w-full flex-1 flex flex-col" style={{ minHeight: 600 }}>
                                    <IframeViewer
                                        src={iframeSrc}
                                        label={formatLabel(format)}
                                        fileUrl={policy!.fileUrl}
                                    />
                                </div>
                            )}

                            {/* ── DOCX ── */}
                            {format === "docx" && (
                                <>
                                    {previewState === "idle" && (
                                        <div className="flex flex-col items-center justify-center flex-1 text-slate-600">
                                            <FiFileText size={36} className="mb-3 opacity-30" />
                                            <p className="text-sm">Đang chuẩn bị tài liệu...</p>
                                        </div>
                                    )}

                                    {previewState === "loading" && (
                                        <div className="w-full max-w-[794px] bg-white/[0.03] rounded-xl border border-white/5 animate-pulse p-12 space-y-4"
                                            style={{ minHeight: 1000 }}>
                                            {Array.from({ length: 18 }).map((_, i) => (
                                                <div key={i} className="h-3 rounded bg-white/5"
                                                    style={{ width: `${55 + Math.sin(i * 1.9) * 35}%` }} />
                                            ))}
                                        </div>
                                    )}

                                    {previewState === "error" && (
                                        <div className="flex flex-col items-center justify-center flex-1 text-center">
                                            <FiAlertCircle size={28} className="text-red-400 mb-3" />
                                            <p className="text-slate-300 text-sm font-medium mb-1">Không thể hiển thị tài liệu</p>
                                            <p className="text-slate-500 text-xs mb-4">{previewError}</p>
                                            {/* Fallback: try Google Docs Viewer */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleDownload}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                                                >
                                                    <FiDownload size={12} /> Tải về để xem
                                                </button>
                                                <a
                                                    href={googleDocsViewerUrl(policy!.fileUrl)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
                                                >
                                                    <FiExternalLink size={12} /> Thử Google Docs
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* DOCX container — luôn trong DOM, ẩn bằng visibility */}
                                    <div
                                        className="w-full flex justify-center"
                                        style={{
                                            visibility: previewState === "success" ? "visible" : "hidden",
                                            height: previewState === "success" ? "auto" : 0,
                                            overflow: previewState === "success" ? "visible" : "hidden",
                                            paddingBottom: zoom > 1 ? `${(zoom - 1) * 1200}px` : "0px",
                                        }}
                                    >
                                        <div
                                            ref={docxContainerRef}
                                            className="docx-preview-wrapper"
                                            style={{
                                                transform: `scale(${zoom})`,
                                                transformOrigin: "top center",
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .docx-preview-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }
                .docx-wrapper {
                    background: transparent !important;
                    padding: 0 !important;
                }
                .docx { color: #111827; }
                .docx .docx-page {
                    margin: 0 auto 24px auto !important;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.35);
                    background: white;
                }
                .docx .docx-page-content { padding: 48px 56px !important; }
                .docx p, .docx span, .docx div, .docx td, .docx th { color: inherit; }
                .docx table { border-collapse: collapse; }
                .docx img { max-width: 100%; height: auto; }
                mark.search-highlight {
                    background: #fde68a;
                    color: #92400e;
                    border-radius: 2px;
                    padding: 0 1px;
                }
                mark.active-highlight {
                    background: #f59e0b;
                    color: #1c1917;
                    outline: 2px solid #f59e0b;
                    outline-offset: 1px;
                }
            `}</style>
        </div>
    );
}