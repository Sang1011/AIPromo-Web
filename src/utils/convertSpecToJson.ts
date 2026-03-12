export function convertSpecToJson(response: any) {
    if (!response?.isSuccess || !response?.data?.spec) {
        return null;
    }

    try {
        const specJson = JSON.parse(response.data.spec);
        return {
            ...response.data,
            spec: specJson,
        };
    } catch (error) {
        console.error("Spec parse error:", error);
        return null;
    }
}