import type { Asset, Feature, Facility } from "./types";
import { useAssetStore } from "./store/assetStore";
import { useFeatureStore } from "./store/featureStore";
import { useFacilityStore } from "./store/facilityStore";

export interface InitializeOptions {
  facility?: Promise<Facility>;
  assets: Promise<Asset[]>;
  features: Promise<Feature[]>;
}

/**
 * 씬 초기화 함수
 *
 * Asset, Feature, Facility 데이터를 Promise 형태로 전달하면
 * 패키지 내부에서 순서를 보장하며 초기화합니다.
 *
 * @example
 * ```tsx
 * await initializeScene({
 *   facility: api.fetchFacility(),
 *   assets: api.fetchAssets(),
 *   features: api.fetchFeatures()
 * });
 * ```
 */
export async function initializeScene({
  facility,
  assets,
  features,
}: InitializeOptions): Promise<void> {
  // 모든 Promise 병렬 대기
  const [assetsData, featuresData, facilityData] = await Promise.all([assets, features, facility]);

  // Facility 등록 (독립적)
  if (facilityData) {
    useFacilityStore.getState().addFacility(facilityData);
  }

  // Asset 등록 + 로드 완료 대기
  await useAssetStore.getState().addAssets(assetsData);

  // Feature 등록 (Asset 로드 완료 후)
  useFeatureStore.getState().addFeatures(featuresData);
}
