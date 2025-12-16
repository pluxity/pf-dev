import { create } from "zustand";
import type { AssetState, AssetActions, AssetType } from "../types/feature";
import { disposeScene } from "../utils/dispose";

export const useAssetStore = create<AssetState & AssetActions>((set, get) => ({
  assets: new Map(),

  addAsset: (asset) => {
    const currentAssets = get().assets;
    if (currentAssets.has(asset.id)) return;

    const assets = new Map(currentAssets);
    assets.set(asset.id, { ...asset, loadedAt: Date.now() });
    set({ assets });
  },

  getAsset: (id) => {
    return get().assets.get(id) ?? null;
  },

  removeAsset: (id) => {
    const assets = new Map(get().assets);
    const asset = assets.get(id);
    if (asset?.object) {
      disposeScene(asset.object);
    }
    assets.delete(id);
    set({ assets });
  },

  updateAsset: (id, updates) => {
    const assets = new Map(get().assets);
    const asset = assets.get(id);
    if (asset) {
      assets.set(id, { ...asset, ...updates });
      set({ assets });
    }
  },

  getAllAssets: () => {
    return Array.from(get().assets.values());
  },

  getAssetsByType: (type: AssetType) => {
    return Array.from(get().assets.values()).filter((a) => a.type === type);
  },

  clearAll: () => {
    const assets = get().assets;
    assets.forEach((asset) => {
      if (asset.object) {
        disposeScene(asset.object);
      }
    });
    set({ assets: new Map() });
  },
}));

export const assetStore = useAssetStore;
