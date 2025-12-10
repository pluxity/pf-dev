import type { Entity } from "cesium";

// ============================================================================
// Position
// ============================================================================

export interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

// ============================================================================
// Feature Options
// ============================================================================

export interface FeatureOptions {
  position: Coordinate;
  properties?: Record<string, unknown>;
}

// Property 필터 타입
export type PropertyFilter =
  | Record<string, unknown>
  | ((properties: Record<string, unknown>) => boolean);

// ============================================================================
// Feature Store Types
// ============================================================================

export interface FeatureGroup {
  entities: Map<string, Entity>;
}

export interface FeatureState {
  groups: Map<string, FeatureGroup>;
}

export interface FeatureActions {
  // Feature CRUD
  addFeature: (groupId: string, featureId: string, options: FeatureOptions) => Entity | null;
  removeFeature: (groupId: string, featureId: string) => boolean;
  getFeature: (groupId: string, featureId: string) => Entity | null;
  hasFeature: (groupId: string, featureId: string) => boolean;

  // Position update
  updatePosition: (groupId: string, featureId: string, position: Coordinate) => boolean;

  // Query by property
  findByProperty: (groupId: string, filter: PropertyFilter) => Entity[];
  findAllByProperty: (filter: PropertyFilter) => Entity[];

  // Group operations
  getGroup: (groupId: string) => Map<string, Entity> | null;
  clearGroup: (groupId: string) => void;
  removeGroup: (groupId: string) => void;
  getGroupIds: () => string[];
  getFeatureCount: (groupId?: string) => number;

  // All features
  clearAll: () => void;
}
