export const validateImageFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) return `${file.name} không phải định dạng hợp lệ`;
    if (file.size > maxSize) return `${file.name} vượt quá 10MB`;
    return null;
};