// Traverse
export {
  traverseModel,
  traverseMeshes,
  filterMeshes,
  findMeshByName,
  findMeshesByName,
} from "./traverse";

// Dispose
export {
  disposeMesh,
  disposeScene,
  disposeMeshes,
  disposeMaterial,
  disposeGeometry,
} from "./dispose";

// Geometry
export { getMeshInfo, computeBoundingBox, getCenterPoint, getSize } from "./geometry";

// Materials
export {
  cloneMaterial,
  updateMaterialProps,
  setMaterialColor,
  setMaterialOpacity,
  getAllMaterials,
} from "./materials";

// Types
export type { TraverseCallback, MeshCallback, MeshPredicate, MeshInfoData } from "./types";
