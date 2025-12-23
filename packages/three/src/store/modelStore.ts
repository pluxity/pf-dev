import { create } from "zustand";
import type { ModelState, ModelActions } from "../types/model";
import { disposeScene } from "../utils/dispose";

export const useModelStore = create<ModelState & ModelActions>((set, get) => ({
  models: new Map(),

  addModel: (model) => {
    const models = new Map(get().models);
    models.set(model.id, { ...model, loadedAt: Date.now() });
    set({ models });
  },

  getModel: (id) => {
    return get().models.get(id) ?? null;
  },

  removeModel: (id) => {
    const models = new Map(get().models);
    models.delete(id);
    set({ models });
  },

  updateModelStatus: (id, status, error) => {
    const models = new Map(get().models);
    const model = models.get(id);
    if (model) {
      models.set(id, { ...model, status, error });
      set({ models });
    }
  },

  updateModelProgress: (id, progress) => {
    const models = new Map(get().models);
    const model = models.get(id);
    if (model) {
      models.set(id, { ...model, progress });
      set({ models });
    }
  },

  getAllModels: () => {
    return Array.from(get().models.values());
  },

  getModelsByStatus: (status) => {
    return Array.from(get().models.values()).filter((m) => m.status === status);
  },

  clearAll: () => {
    set({ models: new Map() });
  },

  disposeModel: (id) => {
    const model = get().models.get(id);
    if (model) {
      disposeScene(model.object);
      get().removeModel(id);
    }
  },
}));

export const modelStore = useModelStore;
