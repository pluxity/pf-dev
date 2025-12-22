import { useMemo } from "react";
import type { Object3D, Mesh } from "three";

export type MeshPredicate = (mesh: Mesh) => boolean;

export interface MeshFinderOptions {
  /**
   * 문자열 predicate 사용 시 정확히 일치하는 이름만 찾을지 여부
   * @default true
   */
  exact?: boolean;
}

export function useMeshFinder(
  object: Object3D | null,
  predicate: string | MeshPredicate,
  options: MeshFinderOptions = {}
): Mesh | null {
  const { exact = true } = options;

  return useMemo(() => {
    if (!object) return null;

    const matcher =
      typeof predicate === "string"
        ? exact
          ? (mesh: Mesh) => mesh.name === predicate
          : (mesh: Mesh) => mesh.name.includes(predicate)
        : predicate;

    let found: Mesh | null = null;

    object.traverse((child) => {
      if (found) return;
      if ((child as Mesh).isMesh && matcher(child as Mesh)) {
        found = child as Mesh;
      }
    });

    return found;
  }, [object, predicate, exact]);
}

export function useMeshFinderAll(
  object: Object3D | null,
  predicate: string | MeshPredicate,
  options: MeshFinderOptions = {}
): Mesh[] {
  const { exact = false } = options;

  return useMemo(() => {
    if (!object) return [];

    const matcher =
      typeof predicate === "string"
        ? exact
          ? (mesh: Mesh) => mesh.name === predicate
          : (mesh: Mesh) => mesh.name.includes(predicate)
        : predicate;

    const meshes: Mesh[] = [];

    object.traverse((child) => {
      if ((child as Mesh).isMesh && matcher(child as Mesh)) {
        meshes.push(child as Mesh);
      }
    });

    return meshes;
  }, [object, predicate, exact]);
}
