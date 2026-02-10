export default function polygonToPoints(poly: { x: number; y: number }[]) {
    return poly.flatMap(p => [p.x, p.y]);
}
