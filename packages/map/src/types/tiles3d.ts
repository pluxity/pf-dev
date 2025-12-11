import type { Cesium3DTileset } from "cesium";

export type Tiles3DSource = { type: "url"; url: string } | { type: "ion"; assetId: number };

export interface Tiles3DProps {
  url?: string;
  ionAssetId?: number;
  show?: boolean;
  onReady?: (tileset: Cesium3DTileset) => void;
  onError?: (error: Error) => void;
}
