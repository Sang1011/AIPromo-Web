import { renderAsync } from "docx-preview";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiChevronDown,
    FiChevronUp,
    FiDownload,
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

export default function LegalDetailPage() {
    const { setConfig } = useOutletContext<DashboardContext>();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { detail: policy, loading, error } = useSelector(
        (state: RootState) => state.POLICY
    );

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

    useEffect(() => {
        if (!showViewer || !policy?.fileUrl || !docxContainerRef.current) return;

        const isDocx = policy.fileUrl.toLowerCase().endsWith(".docx");
        if (!isDocx) {
            setPreviewState("error");
            setPreviewError("File không phải định dạng .docx");
            return;
        }

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

                if (!res.ok) {
                    throw new Error(`Không tải được file (HTTP ${res.status})`);
                }

                const buffer = await res.arrayBuffer();

                if (!buffer || buffer.byteLength === 0) {
                    throw new Error("File rỗng hoặc không đọc được dữ liệu");
                }

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

        return () => {
            cancelled = true;
        };
    }, [showViewer, policy?.fileUrl]);

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
                        if (
                            ["SCRIPT", "STYLE", "MARK"].includes(parent.tagName) ||
                            parent.closest("mark.search-highlight")
                        ) return NodeFilter.FILTER_REJECT;
                        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
                        return NodeFilter.FILTER_ACCEPT;
                    },
                }
            );

            const textNodes: Text[] = [];
            let currentNode: Node | null;
            while ((currentNode = walker.nextNode())) {
                textNodes.push(currentNode as Text);
            }

            let total = 0;
            for (const textNode of textNodes) {
                const text = textNode.textContent ?? "";
                regex.lastIndex = 0;
                if (!regex.test(text)) continue;

                const frag = document.createDocumentFragment();
                let lastIndex = 0;

                text.replace(regex, (match, offset) => {
                    if (offset > lastIndex) {
                        frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
                    }
                    const mark = document.createElement("mark");
                    mark.className = "search-highlight";
                    mark.setAttribute("data-match-index", String(total));
                    mark.textContent = match;
                    frag.appendChild(mark);
                    total++;
                    lastIndex = offset + match.length;
                    return match;
                });

                if (lastIndex < text.length) {
                    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
                }
                textNode.parentNode?.replaceChild(frag, textNode);
            }

            return total;
        },
        [clearHighlights]
    );

    useEffect(() => {
        if (previewState !== "success") return;
        const timeout = setTimeout(() => {
            const count = highlightSearch(searchQuery);
            setTotalMatches(count);
            setActiveMatch(0);
        }, 150);
        return () => clearTimeout(timeout);
    }, [searchQuery, previewState, highlightSearch]);

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

    const prevMatch = () => {
        if (totalMatches === 0) return;
        setActiveMatch((prev) => (prev > 0 ? prev - 1 : totalMatches - 1));
    };

    const nextMatch = () => {
        if (totalMatches === 0) return;
        setActiveMatch((prev) => (prev < totalMatches - 1 ? prev + 1 : 0));
    };

    const clearSearch = () => {
        setSearchQuery("");
        setActiveMatch(0);
        setTotalMatches(0);
        clearHighlights();
    };

    const toggleSearch = () => {
        setSearchOpen((prev) => !prev);
        if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    };

    // ─────────────────────────────────────────────
    // Zoom
    // ─────────────────────────────────────────────
    const zoomIn = () => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(1))));
    const zoomOut = () => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))));
    const resetZoom = () => setZoom(1);

    // ─────────────────────────────────────────────
    // Download
    // ─────────────────────────────────────────────
    const handleDownload = () => {
        if (!policy?.fileUrl) return;
        const a = document.createElement("a");
        a.href = policy.fileUrl;
        a.download = policy.fileUrl.split("/").pop() ?? "policy.docx";
        a.target = "_blank";
        a.click();
    };

    // ─────────────────────────────────────────────
    // Keyboard shortcuts
    // ─────────────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
                e.preventDefault();
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
            }
            if (e.key === "Escape") { setSearchOpen(false); clearSearch(); }
            if (e.key === "Enter" && searchOpen) {
                if (e.shiftKey) prevMatch(); else nextMatch();
            }
        },
        [searchOpen, totalMatches]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);


    return (
        <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 120px)" }}>

            {/* ── Skeleton ── */}
            {showSkeleton && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-10 w-48 rounded-xl bg-card-dark border border-border-dark" />
                    <div className="rounded-2xl border border-border-dark bg-card-dark p-8 space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-3 rounded bg-white/5"
                                style={{ width: `${60 + Math.sin(i * 1.7) * 30}%` }}
                            />
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
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                    >
                        <FiArrowLeft size={14} /> Quay lại
                    </button>
                </div>
            )}

            {/* ── Viewer — chỉ render khi có policy ── */}
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
                            <button
                                onClick={toggleSearch}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${searchOpen
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-white/10 text-slate-300 hover:bg-white/5"
                                    }`}
                            >
                                <FiSearch size={13} /> Tìm kiếm
                            </button>
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
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="tabular-nums px-1">
                                    <span className="text-white font-semibold">
                                        {previewState === "success" ? pageCount || "—" : "—"}
                                    </span>
                                    <span className="text-slate-600 ml-1">trang</span>
                                </span>
                            </div>

                            <div className="w-px h-4 bg-white/10" />

                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <button onClick={zoomOut} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 transition">
                                    <FiZoomOut size={13} />
                                </button>
                                <button onClick={resetZoom} className="px-2 py-0.5 rounded-md hover:bg-white/5 transition tabular-nums font-mono text-xs text-slate-300 min-w-[44px] text-center">
                                    {Math.round(zoom * 100)}%
                                </button>
                                <button onClick={zoomIn} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5 transition">
                                    <FiZoomIn size={13} />
                                </button>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
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
                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                        Hiển thị thành công
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Search bar */}
                        {searchOpen && (
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

                        {/* Document area */}
                        <div
                            ref={viewerRef}
                            className="flex-1 overflow-auto bg-[#1a1d24] flex flex-col items-center py-8 px-4"
                            style={{ minHeight: 500 }}
                        >
                            {previewState === "idle" && (
                                <div className="flex flex-col items-center justify-center flex-1 text-slate-600">
                                    <FiFileText size={36} className="mb-3 opacity-30" />
                                    <p className="text-sm">Đang chuẩn bị tài liệu...</p>
                                </div>
                            )}

                            {previewState === "loading" && (
                                <div
                                    className="w-full max-w-[794px] bg-white/[0.03] rounded-xl border border-white/5 animate-pulse p-12 space-y-4"
                                    style={{ minHeight: 1000 }}
                                >
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
                                    <p className="text-slate-500 text-xs mb-2">{previewError}</p>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                                    >
                                        <FiDownload size={12} /> Tải về để xem
                                    </button>
                                </div>
                            )}

                            {/* ✅ Luôn mount trong DOM, ẩn bằng visibility */}
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