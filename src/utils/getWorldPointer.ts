import type Konva from "konva";

const getWorldPointer = (stage: Konva.Stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();

    return transform.point(pointer);
};
export { getWorldPointer }