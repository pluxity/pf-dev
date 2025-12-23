import type { Group, Object3D } from "three";
import type { GLTF } from "three-stdlib";

export type FacilityStatus = "loading" | "loaded" | "error";

export interface Facility {
  id: string;
  url: string;
  object: Group | Object3D;
  gltf?: GLTF;
  loadedAt: number;
  status: FacilityStatus;
  error?: string;
  progress?: number;
}

export interface FacilityState {
  facilities: Map<string, Facility>;
}

export interface FacilityActions {
  addFacility: (facility: Omit<Facility, "loadedAt">) => void;
  getFacility: (id: string) => Facility | null;
  removeFacility: (id: string) => void;
  updateFacilityStatus: (id: string, status: FacilityStatus, error?: string) => void;
  updateFacilityProgress: (id: string, progress: number) => void;
  getAllFacilities: () => Facility[];
  getFacilitiesByStatus: (status: FacilityStatus) => Facility[];
  clearAll: () => void;
  disposeFacility: (id: string) => void;
}

export type FacilityStore = FacilityState & FacilityActions;
