import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { applyToonToGltf, getToonGradientMap } from "./toon";

function makeStandardMesh(withMap: boolean): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({ color: 0xff00ff });
  if (withMap) {
    material.map = new THREE.Texture();
  }
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
}

describe("applyToonToGltf", () => {
  it("replaces standard materials with toon materials preserving map and color", () => {
    const root = new THREE.Group();
    const mesh = makeStandardMesh(true);
    const map = (mesh.material as THREE.MeshStandardMaterial).map;
    root.add(mesh);

    applyToonToGltf(root);

    const toon = mesh.material as THREE.MeshToonMaterial;
    expect(toon).toBeInstanceOf(THREE.MeshToonMaterial);
    expect(toon.map).toBe(map);
    expect(toon.gradientMap).toBe(getToonGradientMap());
    expect(toon.color.getHex()).toBe(0xff00ff);
  });

  it("leaves non-mesh nodes and geometry untouched", () => {
    const root = new THREE.Group();
    const mesh = makeStandardMesh(false);
    const geometry = mesh.geometry;
    root.add(new THREE.Object3D());
    root.add(mesh);

    applyToonToGltf(root);

    expect(mesh.geometry).toBe(geometry);
    expect((mesh.material as THREE.MeshToonMaterial).map).toBeNull();
  });
});
