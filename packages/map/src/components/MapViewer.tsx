import { useEffect, useRef } from "react";
import { Viewer, Ion } from "cesium";
import { mapStore, useMapStore } from "../store/index.ts";
import type { MapViewerProps } from "../types/index.ts";

export type { MapViewerProps };

const DEFAULT_VIEWER_OPTIONS: Viewer.ConstructorOptions = {
  timeline: false,
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  navigationHelpButton: false,
  scene3DOnly: true,
  skyBox: false,
  skyAtmosphere: false,
  baseLayer: false,
  requestRenderMode: true,
  maximumRenderTimeChange: Infinity,
};

let hiddenCreditContainer: HTMLDivElement | null = null;
function getHiddenCreditContainer() {
  if (!hiddenCreditContainer) {
    hiddenCreditContainer = document.createElement("div");
    hiddenCreditContainer.style.display = "none";
  }
  return hiddenCreditContainer;
}

export function MapViewer({ children, className, ionToken }: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewer = useMapStore((state) => state.viewer);

  useEffect(() => {
    if (!containerRef.current) return;

    if (ionToken) {
      Ion.defaultAccessToken = ionToken;
    }

    const viewerInstance = new Viewer(containerRef.current, {
      ...DEFAULT_VIEWER_OPTIONS,
      creditContainer: getHiddenCreditContainer(),
    });

    mapStore.getState().setViewer(viewerInstance);

    return () => {
      mapStore.getState().setViewer(null);
      if (!viewerInstance.isDestroyed()) {
        viewerInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (ionToken) {
      Ion.defaultAccessToken = ionToken;
    }
  }, [ionToken]);

  return (
    <div ref={containerRef} className={className}>
      {viewer && children}
    </div>
  );
}
