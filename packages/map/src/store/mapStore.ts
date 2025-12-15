import { create } from "zustand";
import { CustomDataSource, type Viewer } from "cesium";

// ============================================================================
// State & Actions
// ============================================================================

interface MapState {
  viewer: Viewer | null;
  dataSource: CustomDataSource | null; // 기본 DataSource (하위 호환)
  layerDataSources: Map<string, CustomDataSource>; // 레이어별 DataSource
}

interface MapActions {
  setViewer: (viewer: Viewer | null) => void;
  getViewer: () => Viewer | null;
  getLayerDataSource: (layerName: string) => CustomDataSource | null;
  getOrCreateLayerDataSource: (layerName: string) => CustomDataSource | null;
}

// ============================================================================
// Store
// ============================================================================

// cameraStore 순환 참조 방지를 위해 lazy import
let cameraStoreModule: typeof import("./cameraStore.ts") | null = null;
async function getCameraStore() {
  if (!cameraStoreModule) {
    cameraStoreModule = await import("./cameraStore.ts");
  }
  return cameraStoreModule.useCameraStore;
}

export const useMapStore = create<MapState & MapActions>((set, get) => {
  // 카메라 위치 업데이트 핸들러 (cameraStore에 위임)
  let cameraUpdateHandler: (() => void) | null = null;

  return {
    // State
    viewer: null,
    dataSource: null,
    layerDataSources: new Map(),

    // Actions
    setViewer: (viewer) => {
      const prevViewer = get().viewer;
      const prevDataSource = get().dataSource;
      const prevLayerDataSources = get().layerDataSources;

      // 이전 Viewer 이벤트 리스너 제거
      if (prevViewer && !prevViewer.isDestroyed() && cameraUpdateHandler) {
        prevViewer.camera.changed.removeEventListener(cameraUpdateHandler);
      }

      // 이전 DataSource들 제거
      if (prevViewer && !prevViewer.isDestroyed()) {
        if (prevDataSource) {
          prevViewer.dataSources.remove(prevDataSource);
        }
        prevLayerDataSources.forEach((ds) => {
          prevViewer.dataSources.remove(ds);
        });
      }

      let dataSource: CustomDataSource | null = null;
      const layerDataSources = new Map<string, CustomDataSource>();

      // 새 Viewer 설정
      if (viewer && !viewer.isDestroyed()) {
        // 기본 CustomDataSource 생성 (하위 호환)
        dataSource = new CustomDataSource("pf-dev-map");
        viewer.dataSources.add(dataSource);

        // 카메라 이벤트 리스너 등록
        getCameraStore().then((useCameraStore) => {
          // Promise resolve 시점에 viewer 재확인
          if (!viewer || viewer.isDestroyed()) return;

          const cameraStore = useCameraStore.getState();
          cameraUpdateHandler = cameraStore._updateCameraPosition;
          viewer.camera.changed.addEventListener(cameraUpdateHandler);
          viewer.camera.percentageChanged = 0.01;
        });
      }

      // 카메라 위치 초기화
      getCameraStore().then((useCameraStore) => {
        useCameraStore.getState()._resetCameraPosition();
      });

      set({ viewer, dataSource, layerDataSources });
    },

    getViewer: () => get().viewer,

    getLayerDataSource: (layerName: string) => {
      return get().layerDataSources.get(layerName) ?? null;
    },

    getOrCreateLayerDataSource: (layerName: string) => {
      const viewer = get().viewer;
      if (!viewer || viewer.isDestroyed()) return null;

      const existing = get().layerDataSources.get(layerName);
      if (existing) {
        console.log(`MapStore: Found existing DataSource for layer "${layerName}"`);
        return existing;
      }

      // 새 DataSource 생성
      console.log(`MapStore: Creating new DataSource for layer "${layerName}"`);
      const newDataSource = new CustomDataSource(`pf-dev-map-layer-${layerName}`);
      viewer.dataSources.add(newDataSource);

      set((state) => {
        const newMap = new Map(state.layerDataSources);
        newMap.set(layerName, newDataSource);
        console.log(
          `MapStore: Updated layerDataSources Map, now has ${newMap.size} layers:`,
          Array.from(newMap.keys())
        );
        return { layerDataSources: newMap };
      });

      return newDataSource;
    },
  };
});

// 컴포넌트 외부에서 사용할 때 편의를 위한 alias
export const mapStore = useMapStore;
