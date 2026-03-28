export const getCurrentDateTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    return {
        iso: now.toISOString(),
        formatted: `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(now.getHours())}-${pad(now.getMinutes())}`
    };
};