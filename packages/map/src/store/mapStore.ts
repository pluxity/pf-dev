import { create } from "zustand";
import { Cartesian3, Math as CesiumMath, HeadingPitchRange, BoundingSphere } from "cesium";
import type { Viewer } from "cesium";
import type {
  CameraPosition,
  FlyToOptions,
  LookAtOptions,
  SetViewOptions,
} from "../types/index.ts";

// ============================================================================
// State & Actions
// ============================================================================

interface MapState {
  viewer: Viewer | null;
  cameraPosition: CameraPosition | null;
}

interface MapActions {
  setViewer: (viewer: Viewer | null) => void;
  getViewer: () => Viewer | null;
  flyTo: (options: FlyToOptions) => void;
  lookAt: (options: LookAtOptions) => void;
  setView: (options: SetViewOptions) => void;
}

// ============================================================================
// Store
// ============================================================================

export const useMapStore = create<MapState & MapActions>((set, get) => {
  // Private: 카메라 위치 업데이트
  const updateCameraPosition = () => {
    const viewer = get().viewer;
    if (!viewer || viewer.isDestroyed()) return;

    const cartographic = viewer.camera.positionCartographic;
    set({
      cameraPosition: {
        longitude: CesiumMath.toDegrees(cartographic.longitude),
        latitude: CesiumMath.toDegrees(cartographic.latitude),
        height: cartographic.height,
        heading: CesiumMath.toDegrees(viewer.camera.heading),
        pitch: CesiumMath.toDegrees(viewer.camera.pitch),
      },
    });
  };

  return {
    // State
    viewer: null,
    cameraPosition: null,

    // Actions
    setViewer: (viewer) => {
      const prevViewer = get().viewer;

      if (prevViewer && !prevViewer.isDestroyed()) {
        prevViewer.camera.changed.removeEventListener(updateCameraPosition);
      }

      if (viewer && !viewer.isDestroyed()) {
        viewer.camera.changed.addEventListener(updateCameraPosition);
        viewer.camera.percentageChanged = 0.01;
      }

      set({ viewer, cameraPosition: null });
    },

    getViewer: () => get().viewer,

    flyTo: ({ longitude, latitude, height = 1000, heading = 0, pitch = -45, duration = 1 }) => {
      const viewer = get().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
          heading: CesiumMath.toRadians(heading),
          pitch: CesiumMath.toRadians(pitch),
          roll: 0,
        },
        duration,
      });
    },

    lookAt: ({
      longitude,
      latitude,
      height = 0,
      distance = 1000,
      heading = 0,
      pitch = -45,
      duration = 1,
    }) => {
      const viewer = get().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      const target = Cartesian3.fromDegrees(longitude, latitude, height);
      const offset = new HeadingPitchRange(
        CesiumMath.toRadians(heading),
        CesiumMath.toRadians(pitch),
        distance
      );

      viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 0), {
        offset,
        duration,
      });
    },

    setView: ({ longitude, latitude, height = 1000, heading = 0, pitch = -45 }) => {
      const viewer = get().viewer;
      if (!viewer || viewer.isDestroyed()) return;

      viewer.camera.setView({
        destination: Cartesian3.fromDegrees(longitude, latitude, height),
        orientation: {
          heading: CesiumMath.toRadians(heading),
          pitch: CesiumMath.toRadians(pitch),
          roll: 0,
        },
      });
    },
  };
});

// 컴포넌트 외부에서 사용할 때 편의를 위한 alias
export const mapStore = useMapStore;
