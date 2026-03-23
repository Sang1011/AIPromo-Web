import QRCode from "qrcode";

export const generateQR = async (text: string): Promise<string> => {
    try {
        const qr = await QRCode.toDataURL(text, {
            errorCorrectionLevel: "H",
            type: "image/png",
            margin: 2,
            width: 300,
        });

        return qr;
    } catch (err) {
        console.error("Generate QR error:", err);
        throw err;
    }
};