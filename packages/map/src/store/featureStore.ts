import { create } from "zustand";
import { Cartesian3, Entity, ConstantPositionProperty, JulianDate } from "cesium";
import { useMapStore } from "./mapStore.ts";
import type { FeatureState, FeatureActions, PropertyFilter, Coordinate } from "../types/feature.ts";

// ============================================================================
// Helpers
// ============================================================================

function coordinateToCartesian3(coord: Coordinate): Cartesian3 {
  return Cartesian3.fromDegrees(coord.longitude, coord.latitude, coord.height ?? 0);
}

function matchesFilter(properties: Record<string, unknown>, filter: PropertyFilter): boolean {
  if (typeof filter === "function") {
    return filter(properties);
  }
  return Object.entries(filter).every(([key, value]) => properties[key] === value);
}

// ============================================================================
// Store
// ============================================================================

export const useFeatureStore = create<FeatureState & FeatureActions>((set, get) => ({
  // State
  groups: new Map(),

  // ========== Feature CRUD ==========

  addFeature: (groupId, featureId, options) => {
    const viewer = useMapStore.getState().viewer;
    if (!viewer || viewer.isDestroyed()) return null;

    const cartesian = coordinateToCartesian3(options.position);

    const entity = viewer.entities.add({
      id: `${groupId}:${featureId}`,
      position: cartesian,
      properties: options.properties,
    });

    set((state) => {
      const newGroups = new Map(state.groups);
      let group = newGroups.get(groupId);

      if (!group) {
        group = { entities: new Map() };
        newGroups.set(groupId, group);
      }

      group.entities.set(featureId, entity);
      return { groups: newGroups };
    });

    viewer.scene.requestRender();
    return entity;
  },

  removeFeature: (groupId, featureId) => {
    const viewer = useMapStore.getState().viewer;
    const group = get().groups.get(groupId);

    if (!group) return false;

    const entity = group.entities.get(featureId);
    if (!entity) return false;

    if (viewer && !viewer.isDestroyed()) {
      viewer.entities.remove(entity);
      viewer.scene.requestRender();
    }

    set((state) => {
      const newGroups = new Map(state.groups);
      const targetGroup = newGroups.get(groupId);
      if (targetGroup) {
        targetGroup.entities.delete(featureId);
        if (targetGroup.entities.size === 0) {
          newGroups.delete(groupId);
        }
      }
      return { groups: newGroups };
    });

    return true;
  },

  getFeature: (groupId, featureId) => {
    const group = get().groups.get(groupId);
    return group?.entities.get(featureId) ?? null;
  },

  hasFeature: (groupId, featureId) => {
    const group = get().groups.get(groupId);
    return group?.entities.has(featureId) ?? false;
  },

  // ========== Position Update ==========

  updatePosition: (groupId, featureId, position) => {
    const viewer = useMapStore.getState().viewer;
    const entity = get().getFeature(groupId, featureId);

    if (!entity || !viewer || viewer.isDestroyed()) return false;

    const cartesian = coordinateToCartesian3(position);
    entity.position = new ConstantPositionProperty(cartesian);
    viewer.scene.requestRender();
    return true;
  },

  // ========== Query by Property ==========

  findByProperty: (groupId, filter) => {
    const group = get().groups.get(groupId);
    if (!group) return [];

    const results: Entity[] = [];

    group.entities.forEach((entity) => {
      const props = entity.properties?.getValue(JulianDate.now()) ?? {};
      if (matchesFilter(props, filter)) {
        results.push(entity);
      }
    });

    return results;
  },

  findAllByProperty: (filter) => {
    const results: Entity[] = [];

    get().groups.forEach((group) => {
      group.entities.forEach((entity) => {
        const props = entity.properties?.getValue(JulianDate.now()) ?? {};
        if (matchesFilter(props, filter)) {
          results.push(entity);
        }
      });
    });

    return results;
  },

  // ========== Group Operations ==========

  getGroup: (groupId) => {
    const group = get().groups.get(groupId);
    return group?.entities ?? null;
  },

  clearGroup: (groupId) => {
    const viewer = useMapStore.getState().viewer;
    const group = get().groups.get(groupId);

    if (!group) return;

    if (viewer && !viewer.isDestroyed()) {
      group.entities.forEach((entity) => {
        viewer.entities.remove(entity);
      });
      viewer.scene.requestRender();
    }

    set((state) => {
      const newGroups = new Map(state.groups);
      const targetGroup = newGroups.get(groupId);
      if (targetGroup) {
        targetGroup.entities.clear();
      }
      return { groups: newGroups };
    });
  },

  removeGroup: (groupId) => {
    get().clearGroup(groupId);

    set((state) => {
      const newGroups = new Map(state.groups);
      newGroups.delete(groupId);
      return { groups: newGroups };
    });
  },

  getGroupIds: () => {
    return Array.from(get().groups.keys());
  },

  getFeatureCount: (groupId) => {
    if (groupId) {
      const group = get().groups.get(groupId);
      return group?.entities.size ?? 0;
    }

    let total = 0;
    get().groups.forEach((group) => {
      total += group.entities.size;
    });
    return total;
  },

  // ========== Clear All ==========

  clearAll: () => {
    const viewer = useMapStore.getState().viewer;

    if (viewer && !viewer.isDestroyed()) {
      get().groups.forEach((group) => {
        group.entities.forEach((entity) => {
          viewer.entities.remove(entity);
        });
      });
      viewer.scene.requestRender();
    }

    set({ groups: new Map() });
  },
}));

export const featureStore = useFeatureStore;
