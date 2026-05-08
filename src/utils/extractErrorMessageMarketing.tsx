export function extractErrorMessage(error: any, fallback: string): string {
    const problemTitle: string | undefined = error?.response?.data?.title;
    const problemDetail: string | undefined = error?.response?.data?.detail;

    if (
        problemTitle === "AiQuota.InsufficientTokens" ||
        problemDetail?.includes("Insufficient AI tokens")
    ) {
        const match = problemDetail?.match(/Requested:\s*(\d+),\s*Available:\s*(\d+)/);
        if (match) {
            return `Insufficient AI tokens. Requested: ${match[1]}, Available: ${match[2]}.`;
        }
        return "Insufficient AI tokens. Requested: 0, Available: 0.";
    }

    return error?.response?.data?.message ?? fallback;
}