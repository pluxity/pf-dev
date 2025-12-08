import { Viewer, CesiumTerrainProvider, EllipsoidTerrainProvider } from "cesium";
import type { TerrainConfig } from "../types.ts";

export async function setupTerrain(
  viewer: Viewer,
  config: TerrainConfig = { provider: "ellipsoid" }
): Promise<void> {
  const provider = config.provider ?? "ellipsoid";

  switch (provider) {
    case "ion":
      if (!config.assetId) {
        throw new Error("Ion terrain requires assetId");
      }
      viewer.terrainProvider = await CesiumTerrainProvider.fromIonAssetId(config.assetId);
      break;

    case "custom":
      if (!config.url) {
        throw new Error("Custom terrain requires url");
      }
      viewer.terrainProvider = await CesiumTerrainProvider.fromUrl(config.url);
      break;

    case "ellipsoid":
    default:
      // 기본 평면 지구 (Ion 불필요)
      viewer.terrainProvider = new EllipsoidTerrainProvider();
      break;
  }
}
