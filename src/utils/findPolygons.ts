export default function findPolygons(mask: any): { x: number; y: number }[][] {
    const cv = window.cv;

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    cv.findContours(
        mask,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
    );

    const polygons: { x: number; y: number }[][] = [];

    for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);

        if (area < 1500) {
            cnt.delete();
            continue;
        }

        const approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 5, true);

        const poly: { x: number; y: number }[] = [];
        for (let j = 0; j < approx.data32S.length; j += 2) {
            poly.push({
                x: approx.data32S[j],
                y: approx.data32S[j + 1],
            });
        }

        polygons.push(poly);

        approx.delete();
        cnt.delete();
    }

    contours.delete();
    hierarchy.delete();

    return polygons;
}
