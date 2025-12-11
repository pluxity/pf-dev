export type TerrainProviderType = "ion" | "custom" | "ellipsoid";

export interface TerrainProps {
  provider?: TerrainProviderType;
  assetId?: number;
  url?: string;
}
