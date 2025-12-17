import { create } from "zustand";
import type { FacilityState, FacilityActions } from "../types/facility";
import { disposeScene } from "../utils/dispose";

export const useFacilityStore = create<FacilityState & FacilityActions>((set, get) => ({
  facilities: new Map(),

  addFacility: (facility) => {
    const facilities = new Map(get().facilities);
    facilities.set(facility.id, { ...facility, loadedAt: Date.now() });
    set({ facilities });
  },

  getFacility: (id) => {
    return get().facilities.get(id) ?? null;
  },

  removeFacility: (id) => {
    const facilities = new Map(get().facilities);
    facilities.delete(id);
    set({ facilities });
  },

  updateFacilityStatus: (id, status, error) => {
    const facilities = new Map(get().facilities);
    const facility = facilities.get(id);
    if (facility) {
      facilities.set(id, { ...facility, status, error });
      set({ facilities });
    }
  },

  updateFacilityProgress: (id, progress) => {
    const facilities = new Map(get().facilities);
    const facility = facilities.get(id);
    if (facility) {
      facilities.set(id, { ...facility, progress });
      set({ facilities });
    }
  },

  getAllFacilities: () => {
    return Array.from(get().facilities.values());
  },

  getFacilitiesByStatus: (status) => {
    return Array.from(get().facilities.values()).filter((f) => f.status === status);
  },

  clearAll: () => {
    set({ facilities: new Map() });
  },

  disposeFacility: (id) => {
    const facility = get().facilities.get(id);
    if (facility) {
      disposeScene(facility.object);
      get().removeFacility(id);
    }
  },
}));

export const facilityStore = useFacilityStore;
