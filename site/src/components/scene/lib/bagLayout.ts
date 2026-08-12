/** bboxMin.y from gltf-transform inspect on bag.glb / msgbag mesh */
export const BAG_GLB_MIN_Y = -0.89849;
export const BAG_POS_Y = 0.75;

/** World Y offset applied on the model so the mesh bottom rests on y=0 stage. */
export function bagModelYOffset(
  scale: number,
  minY: number = BAG_GLB_MIN_Y,
  bagPosY: number = BAG_POS_Y,
): number {
  return -bagPosY - minY * scale;
}
