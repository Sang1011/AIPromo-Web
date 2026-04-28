export async function uploadWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 1000
): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            const isRateLimit = err?.status === 429 || err?.statusCode === 429;
            if (!isRateLimit || attempt === retries - 1) throw err;
            await new Promise(res => setTimeout(res, delayMs * 2 ** attempt));
        }
    }
    throw new Error("Upload failed after retries");
}