import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

const [, , input, outDir] = process.argv;
if (!input || !outDir) {
  console.error("Usage: node extract_glb_images.mjs <in.glb> <outDir>");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
  });
const doc = await io.read(path.resolve(input));
for (const image of doc.getRoot().listTextures()) {
  const name = image.getName() || "texture";
  const mime = image.getMimeType() || "application/octet-stream";
  const ext =
    mime.includes("png") ? "png" :
    mime.includes("webp") ? "webp" :
    mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "bin";
  const file = path.join(outDir, `${name}.${ext}`);
  fs.writeFileSync(file, image.getImage());
  console.log(file, mime, image.getImage()?.byteLength);
}
