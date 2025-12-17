import { useState, useRef, useEffect } from "react";
import { Input, Button, useToast, Toaster, Slider } from "@pf-dev/ui";
import { MapViewer, Terrain, Imagery, useFeatureStore, useCameraStore } from "@pf-dev/map";
import { HeightReference } from "cesium";

type InputFieldProps = {
  label: string;
  slider?: boolean;
};

type SectionFieldProps = {
  title: string;
  fields: InputFieldProps[];
  showSearchButton?: boolean;
};

const InputFields = ({ label, slider }: InputFieldProps) => {
  return (
    <div className="flex items-center gap-2">
      <strong className="w-30 text-sm">{label}</strong>
      {slider ? (
        <div className="flex items-center justify-between gap-2">
          <Slider className="w-40" />
          <Input inputSize="sm" className="w-20" type="number" />
        </div>
      ) : (
        <Input inputSize="sm" type="number" />
      )}
    </div>
  );
};

const SectionFields = ({ title, fields, showSearchButton }: SectionFieldProps) => {
  return (
    <div className="space-y-3">
      <strong className="mb-3 block border-b border-gray-100 pb-2">{title}</strong>
      {fields.map((field, index) => (
        <InputFields key={index} label={field.label} slider={field.slider} />
      ))}
      {showSearchButton && (
        <Button variant="outline" size="sm" className="w-full cursor-pointer">
          Search
        </Button>
      )}
    </div>
  );
};

const SectionFieldsData: SectionFieldProps[] = [
  {
    title: "Position",
    fields: [{ label: "Longitude" }, { label: "Latitude" }, { label: "Height" }],
    showSearchButton: true,
  },
  {
    title: "Rotation",
    fields: [
      { label: "Heading", slider: true },
      { label: "Pitch", slider: true },
      { label: "Roll", slider: true },
    ],
  },
  {
    title: "Scale",
    fields: [{ label: "Scale X" }, { label: "Scale Y" }, { label: "Scale Z" }],
  },
];

const DEFAULT_POSITION = {
  longitude: 126.970198,
  latitude: 37.394399,
  height: 1,
};

export function CalibratePage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, toast, dismissToast } = useToast();
  const { addFeature, removeFeature } = useFeatureStore();
  const { flyTo } = useCameraStore();

  const [featureId, setFeatureId] = useState<string | null>(null);

  const ionToken = import.meta.env.VITE_ION_CESIUM_ACCESS_TOKEN;
  const imageryAssetId = Number(import.meta.env.VITE_ION_CESIUM_MAP_ASSET_ID);
  const terrainAssetId = Number(import.meta.env.VITE_ION_CESIUM_TERRAIN_ASSET_ID);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    if (featureId) {
      removeFeature(featureId);
      setFeatureId(null);
    }

    if (
      file &&
      (file.name.toLowerCase().endsWith(".glb") || file.name.toLowerCase().endsWith(".gltf"))
    ) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);
      setFeatureId(crypto.randomUUID());
      toast.success("파일이 업로드되었습니다.");
    } else {
      toast.error("파일 형식이 올바르지 않습니다. GLB 또는 GLTF 파일을 선택해주세요.");
    }
  };

  const handleRemoveFile = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    if (featureId) {
      removeFeature(featureId);
      setFeatureId(null);
    }

    toast.success("파일이 제거되었습니다.");
  };

  useEffect(() => {
    if (!fileUrl || !featureId) {
      return;
    }

    const newFeature = addFeature(featureId, {
      position: DEFAULT_POSITION,
      visual: {
        type: "model",
        uri: fileUrl,
        heightReference: HeightReference.RELATIVE_TO_GROUND,
      },
    });

    if (newFeature) {
      toast.success("모델이 성공적으로 추가되었습니다.");

      flyTo({
        longitude: DEFAULT_POSITION.longitude,
        latitude: DEFAULT_POSITION.latitude,
        height: DEFAULT_POSITION.height,
      });
    } else {
      toast.error("모델을 추가할 수 없습니다.");
      console.error("모델을 추가할 수 없습니다.");
    }

    return () => {
      if (featureId) {
        removeFeature(featureId);
      }
    };
  }, [fileUrl, featureId, flyTo, removeFeature, addFeature, toast]);

  return (
    <div className="flex h-screen">
      <div className="w-96 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <div className="mb-2 border-b-2 border-primary-200 pb-2">
          <strong>LOCATION EDITOR</strong>
        </div>

        <div className="mb-4 space-y-2">
          <strong className="mb-3 block border-b border-gray-100 pb-2">GLB File</strong>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".glb,.gltf"
              className="hidden"
            />
          </div>

          {fileUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-green-700 font-medium truncate">{fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              파일 선택
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {SectionFieldsData.map((section, index) => (
            <SectionFields
              key={index}
              title={section.title}
              fields={section.fields}
              showSearchButton={section.showSearchButton}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="w-full cursor-pointer">
            Save
          </Button>
          <Button size="sm" variant="outline" className="w-full cursor-pointer">
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapViewer className="w-full h-screen" ionToken={ionToken}>
          <Imagery provider="ion" assetId={imageryAssetId} />
          <Terrain provider="ion" assetId={terrainAssetId} />
        </MapViewer>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export default CalibratePage;
