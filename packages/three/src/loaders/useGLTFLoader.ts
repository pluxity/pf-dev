import { useEffect, useState } from "react";
import { GLTFLoader } from "three-stdlib";
import { useFacilityStore } from "../store/facilityStore";
import type { UseGLTFLoaderOptions, UseGLTFLoaderReturn } from "../types/loader";

export function useGLTFLoader(
  url: string | null,
  options: UseGLTFLoaderOptions = {}
): UseGLTFLoaderReturn {
  const {
    autoAddToStore = false,
    modelId = url || "unnamed",
    onProgress,
    onLoaded,
    onError,
  } = options;

  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [gltf, setGltf] = useState<UseGLTFLoaderReturn["gltf"]>(null);

  const addFacility = useFacilityStore((s) => s.addFacility);
  const updateFacilityProgress = useFacilityStore((s) => s.updateFacilityProgress);
  const updateFacilityStatus = useFacilityStore((s) => s.updateFacilityStatus);
  const disposeFacility = useFacilityStore((s) => s.disposeFacility);

  useEffect(() => {
    if (!url) return;

    if (autoAddToStore) {
      disposeFacility(modelId);
    }

    let cancelled = false;

    const loadModel = () => {
      if (cancelled) return;

      setIsLoading(true);
      setError(null);
      setProgress(0);

      const loader = new GLTFLoader();

      loader.load(
        url,
        (loadedGltf) => {
          if (cancelled) return;

          setGltf(loadedGltf);
          setIsLoading(false);
          setProgress(100);

          if (autoAddToStore) {
            addFacility({
              id: modelId,
              url,
              object: loadedGltf.scene,
              gltf: loadedGltf,
              status: "loaded",
              progress: 100,
            });
          }

          onLoaded?.(loadedGltf);
        },
        (event) => {
          if (cancelled) return;
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            setProgress(percent);
            onProgress?.(percent);

            if (autoAddToStore) {
              updateFacilityProgress(modelId, percent);
            }
          }
        },
        (err) => {
          if (cancelled) return;
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsLoading(false);

          if (autoAddToStore) {
            updateFacilityStatus(modelId, "error", error.message);
          }

          onError?.(error);
        }
      );
    };

    loadModel();

    return () => {
      cancelled = true;

      if (autoAddToStore) {
        disposeFacility(modelId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, modelId, autoAddToStore]);

  return {
    gltf,
    scene: gltf?.scene ?? null,
    animations: gltf?.animations ?? [],
    isLoading,
    progress,
    error,
  };
}
