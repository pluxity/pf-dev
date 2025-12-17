import { useState, useRef, useEffect } from "react";
import { Input, Button, useToast, Toaster } from "@pf-dev/ui";
import { MapViewer, Terrain, Imagery } from "@pf-dev/map";

type InputFieldProps = {
  label: string;
};

type SectionFieldProps = {
  title: string;
  fields: InputFieldProps[];
  showSearchButton?: boolean;
};

const InputFields = ({ label }: InputFieldProps) => {
  return (
    <div className="flex items-center gap-2">
      <strong className="w-40 text-sm">{label}</strong>
      <Input inputSize="sm" type="number" />
    </div>
  );
};

const SectionFields = ({ title, fields, showSearchButton }: SectionFieldProps) => {
  return (
    <div className="space-y-3">
      <strong className="mb-3 block border-b border-gray-100 pb-2">{title}</strong>
      {fields.map((field, index) => (
        <InputFields key={index} label={field.label} />
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
    fields: [{ label: "Heading" }, { label: "Pitch" }, { label: "Roll" }],
  },
  {
    title: "Scale",
    fields: [{ label: "Scale X" }, { label: "Scale Y" }, { label: "Scale Z" }],
  },
];

export function CalibratePage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, toast, dismissToast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (
      file &&
      (file.name.toLowerCase().endsWith(".glb") || file.name.toLowerCase().endsWith(".gltf"))
    ) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);
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
      toast.success("파일이 제거되었습니다.");
    }
  };

  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  console.log("ION Token:", import.meta.env.VITE_ION_CESIUM_ACCESS_TOKEN);

  return (
    <div className="flex h-screen">
      <div className="w-96 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <div className="mb-2 border-b-2 border-gray-200 pb-2">
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
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change
                  </Button>
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
        <MapViewer
          className="w-full h-screen"
          ionToken={import.meta.env.VITE_ION_CESIUM_ACCESS_TOKEN}
        >
          <Imagery provider="ion" assetId={2} />
          <Terrain provider="ion" assetId={4154236} />
        </MapViewer>
      </div>

      <Toaster toasts={toasts} onDismiss={dismissToast} position="bottom-right" />
    </div>
  );
}

export default CalibratePage;
