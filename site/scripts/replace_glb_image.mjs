import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";

const [, , input, imageName, imagePath, output] = process.argv;
if (!input || !imageName || !imagePath || !output) {
  console.error(
    "Usage: node replace_glb_image.mjs <in.glb> <imageName> <imageFile> <out.glb>",
  );
  process.exit(1);
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(),
    "draco3d.encoder": await draco3d.createEncoderModule(),
  });

const doc = await io.read(path.resolve(input));
const bytes = fs.readFileSync(path.resolve(imagePath));
const ext = path.extname(imagePath).toLowerCase();
const mime =
  ext === ".png" ? "image/png" :
  ext === ".webp" ? "image/webp" :
  "image/jpeg";

const tex = doc.getRoot().listTextures().find((t) => t.getName() === imageName);
if (!tex) {
  console.error(
    "No texture named",
    imageName,
    "have:",
    doc.getRoot().listTextures().map((t) => t.getName()),
  );
  process.exit(1);
}
tex.setImage(bytes);
tex.setMimeType(mime);
await io.write(path.resolve(output), doc);
console.log("wrote", output, "mime", mime, "bytes", bytes.length);
