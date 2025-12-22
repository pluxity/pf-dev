import type { Mesh, Intersection, Object3D } from "three";

export interface HoveredMesh {
  mesh: Mesh;
  intersection: Intersection;
  modelId?: string;
}

export interface MeshInfo {
  name: string;
  type: string;
  position: [number, number, number];
  vertices: number;
  triangles: number;
  materialName?: string;
  visible: boolean;
}

export type HoverTarget = "facility" | "feature" | "all";

export interface InteractionState {
  hoveredMesh: HoveredMesh | null;
  selectedMesh: Mesh | null;
  enableHover: boolean;
  enableOutline: boolean;
  outlineColor: string;
  outlineThickness: number;
  hoverTarget: HoverTarget;
}

export interface InteractionActions {
  setHoveredMesh: (mesh: HoveredMesh | null) => void;
  setSelectedMesh: (mesh: Mesh | null) => void;
  clearHover: () => void;
  clearSelection: () => void;
  clearAll: () => void;
  toggleHover: () => void;
  toggleOutline: () => void;
  setOutlineColor: (color: string) => void;
  setOutlineThickness: (thickness: number) => void;
  getHoveredMeshInfo: () => MeshInfo | null;
  setHoverTarget: (target: HoverTarget) => void;
}

export interface RaycastOptions {
  enabled?: boolean;
  recursive?: boolean;
  filter?: (object: Object3D) => boolean;
  threshold?: number;
}
