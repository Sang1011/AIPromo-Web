// utils/metricsFormulas.ts

export function fmtPct(val: number | null, decimals = 2): string {
    if (val == null) return "—"
    return `${(val * 100).toFixed(decimals)}%`
}

// ─── Facebook ────────────────────────────────────────────────────────────────

/**
 * ER = (likes + comments) / reach
 * NOTE: Bỏ shares vì Facebook không track shares chính xác
 * (share qua tin nhắn, copy link... không được tính)
 */
export function calcFacebookER(likes: number, comments: number, reach: number): number | null {
    if (reach <= 0) return null
    return (likes + comments) / reach
}

/**
 * CTR = clicks / reach
 * NOTE: Facebook không trả về impressions qua Graph API cơ bản,
 * nên dùng reach làm mẫu số — CTR này là ước tính, thực tế có thể cao hơn
 */
export function calcFacebookCTR(clicks: number, reach: number): number | null {
    if (reach <= 0 || clicks <= 0) return null
    return clicks / reach
}

/**
 * CVR = buyCount / clicks
 * buyCount = số vé bán được từ tracking link này
 */
export function calcFacebookCVR(buyCount: number, clicks: number): number | null {
    if (clicks <= 0) return null
    return buyCount / clicks
}

// ─── Instagram ───────────────────────────────────────────────────────────────

/**
 * ER = (likes + comments + saves + shares) / reach
 * Instagram track đủ 4 loại tương tác
 */
export function calcInstagramER(
    likes: number, comments: number, saves: number, shares: number, reach: number
): number | null {
    if (reach <= 0) return null
    return (likes + comments + saves + shares) / reach
}

/**
 * CTR = clickCount / reach
 * Instagram không trả impressions riêng → dùng reach
 */
export function calcInstagramCTR(clickCount: number, reach: number): number | null {
    if (reach <= 0 || clickCount <= 0) return null
    return clickCount / reach
}

/**
 * CVR = buyCount / clickCount
 */
export function calcInstagramCVR(buyCount: number, clickCount: number): number | null {
    if (clickCount <= 0) return null
    return buyCount / clickCount
}

// ─── Threads ─────────────────────────────────────────────────────────────────

/**
 * ER = (likes + replies + reposts + quotes) / views
 * Bỏ shares vì Threads không phân biệt rõ internal/external share
 */
export function calcThreadsER(
    likes: number, replies: number, reposts: number, quotes: number, views: number
): number | null {
    if (views <= 0) return null
    return (likes + replies + reposts + quotes) / views
}

/**
 * CTR = clickCount / views
 * Threads không có clicks từ API → dùng clickCount từ tracking
 */
export function calcThreadsCTR(clickCount: number, views: number): number | null {
    if (views <= 0 || clickCount <= 0) return null
    return clickCount / views
}

/**
 * CVR = buyCount / clickCount
 */
export function calcThreadsCVR(buyCount: number, clickCount: number): number | null {
    if (clickCount <= 0) return null
    return buyCount / clickCount
}

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * Contribution = buyCount / ticketsSold (toàn sự kiện)
 * ticketsSold lấy từ 1 platform (FB) vì là số chung của sự kiện
 */
export function calcContribution(buyCount: number, ticketsSold: number): number | null {
    if (ticketsSold <= 0) return null
    return buyCount / ticketsSold
}