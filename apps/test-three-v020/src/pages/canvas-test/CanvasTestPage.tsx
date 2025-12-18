import { useState, useCallback, useEffect } from "react";
import {
  Canvas,
  SceneLighting,
  GLTFModel,
  FBXModel,
  Stats,
  type LightingPreset,
} from "@pf-dev/three";
import { Box3, Vector3, Group } from "three";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

type ModelType =
  | "none"
  | "cube"
  | "yongsan"
  | "fbx-b1"
  | "fbx-f1"
  | "fbx-fm1"
  | "fbx-f2"
  | "fbx-f3"
  | "fbx-f4"
  | "fbx-roof";

const MODEL_OPTIONS = [
  { value: "none", label: "없음" },
  { value: "cube", label: "테스트 큐브" },
  { value: "yongsan", label: "용산 (GLTF)", path: "/yongsan.glb" },
  {
    value: "fbx-b1",
    label: "창녕문화예술회관 B1 (FBX)",
    path: "/창녕문화예술회관/-1_B1_창녕문화예술회관.fbx",
  },
  {
    value: "fbx-f1",
    label: "창녕문화예술회관 F1 (FBX)",
    path: "/창녕문화예술회관/1_F1_창녕문화예술회관.fbx",
  },
  {
    value: "fbx-fm1",
    label: "창녕문화예술회관 FM1 (FBX)",
    path: "/창녕문화예술회관/2_FM1_창녕문화예술회관.fbx",
  },
  {
    value: "fbx-f2",
    label: "창녕문화예술회관 F2 (FBX)",
    path: "/창녕문화예술회관/3_F2_창녕문화예술회관.fbx",
  },
  {
    value: "fbx-f3",
    label: "창녕문화예술회관 F3 (FBX)",
    path: "/창녕문화예술회관/4_F3_창녕문화예술회관.fbx",
  },
  {
    value: "fbx-f4",
    label: "창녕문화예술회관 F4 (FBX)",
    path: "/창녕문화예술회관/5_F4_창녕문화예술회관.fbx",
  },
  {
    value: "fbx-roof",
    label: "창녕문화예술회관 ROOF (FBX)",
    path: "/창녕문화예술회관/6_ROOF_창녕문화예술회관.fbx",
  },
] as const;

// FOV 실시간 업데이트 헬퍼 컴포넌트
function CameraFOVController({ fov }: { fov: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if ("fov" in camera) {
      const perspectiveCamera = camera as PerspectiveCamera;
      // eslint-disable-next-line react-hooks/immutability
      perspectiveCamera.fov = fov;
      perspectiveCamera.updateProjectionMatrix();
    }
  }, [camera, fov]);

  return null;
}

export function CanvasTestPage() {
  const [lighting, setLighting] = useState<LightingPreset | false>("default");
  const [showGrid, setShowGrid] = useState(true);
  const [background, setBackground] = useState("#1a1a1a");
  const [gridColor, setGridColor] = useState("#6b7280");
  const [sectionColor, setSectionColor] = useState("#6b7280");
  const [cameraFov, setCameraFov] = useState(75);
  const [selectedModel, setSelectedModel] = useState<ModelType>("cube");
  const [autoFitGrid, setAutoFitGrid] = useState(false);
  const [gridSize, setGridSize] = useState(100);
  const [gridDivisions, setGridDivisions] = useState(100);

  // SceneLighting 커스터마이징 (이슈 #32)
  const [useCustomLighting, setUseCustomLighting] = useState(false);
  const [customAmbient, setCustomAmbient] = useState<number | undefined>(undefined);
  const [customDirectionalIntensity, setCustomDirectionalIntensity] = useState<number | undefined>(
    undefined
  );
  const [customDirectionalCastShadow, setCustomDirectionalCastShadow] = useState<
    boolean | undefined
  >(undefined);

  // CameraControls 설정 (이슈 #33)
  const [enableControls, setEnableControls] = useState(true);
  const [useCustomControls, setUseCustomControls] = useState(false);
  const [controlsMinDistance, setControlsMinDistance] = useState(1);
  const [controlsMaxDistance, setControlsMaxDistance] = useState(500);
  const [controlsEnableDamping, setControlsEnableDamping] = useState(true);
  const [controlsDampingFactor, setControlsDampingFactor] = useState(0.05);
  const [controlsEnablePan, setControlsEnablePan] = useState(true);
  const [controlsEnableZoom, setControlsEnableZoom] = useState(true);
  const [controlsEnableRotate, setControlsEnableRotate] = useState(true);

  // Stats 표시 (이슈 #34)
  const [showStats, setShowStats] = useState(false);

  const handleGLTFLoad = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (gltf: any) => {
      // 모델을 센터링: X, Z는 중앙, Y는 바닥을 그리드에 맞춤
      const box = new Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new Vector3());

      // X, Z만 센터링하고, Y는 바닥(min)을 0에 맞춤
      gltf.scene.position.set(
        -center.x,
        -box.min.y, // 바닥을 y=0에 맞춤
        -center.z
      );

      if (!autoFitGrid) {
        return;
      }

      // 모델의 크기 계산 (센터링 후 다시 계산)
      const finalBox = new Box3().setFromObject(gltf.scene);
      const finalSize = finalBox.getSize(new Vector3());

      // 가장 큰 축을 기준으로 그리드 크기 설정
      const maxSize = Math.max(finalSize.x, finalSize.y, finalSize.z);
      const newGridSize = Math.ceil(maxSize * 1.1); // 모델보다 10% 크게 (각 방향 5% 여유)
      const newDivisions = newGridSize; // cellSize = 1m 유지

      setGridSize(newGridSize);
      setGridDivisions(newDivisions);
    },
    [autoFitGrid]
  );

  const handleFBXLoad = useCallback(
    (object: Group) => {
      // 모델을 센터링: X, Z는 중앙, Y는 바닥을 그리드에 맞춤
      const box = new Box3().setFromObject(object);
      const center = box.getCenter(new Vector3());

      // X, Z만 센터링하고, Y는 바닥(min)을 0에 맞춤
      object.position.set(
        -center.x,
        -box.min.y, // 바닥을 y=0에 맞춤
        -center.z
      );

      if (!autoFitGrid) {
        return;
      }

      // 모델의 크기 계산
      const size = box.getSize(new Vector3());

      // 가장 큰 축을 기준으로 그리드 크기 설정
      const maxSize = Math.max(size.x, size.y, size.z);
      const newGridSize = Math.ceil(maxSize * 1.1); // 모델보다 10% 크게 (각 방향 5% 여유)
      const newDivisions = newGridSize; // cellSize = 1m 유지

      setGridSize(newGridSize);
      setGridDivisions(newDivisions);
    },
    [autoFitGrid]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Canvas */}
      <Canvas
        lighting={useCustomLighting ? false : lighting}
        grid={
          showGrid
            ? {
                size: gridSize,
                divisions: gridDivisions,
                color: gridColor,
                sectionColor: sectionColor,
              }
            : false
        }
        background={background}
        camera={{ fov: cameraFov }}
        controls={
          !enableControls
            ? false
            : useCustomControls
              ? {
                  minDistance: controlsMinDistance,
                  maxDistance: controlsMaxDistance,
                  enableDamping: controlsEnableDamping,
                  dampingFactor: controlsDampingFactor,
                  enablePan: controlsEnablePan,
                  enableZoom: controlsEnableZoom,
                  enableRotate: controlsEnableRotate,
                }
              : true
        }
      >
        {/* FOV 실시간 업데이트 */}
        <CameraFOVController fov={cameraFov} />

        {/* Stats 컴포넌트 (이슈 #34) */}
        {showStats && <Stats />}

        {/* 커스텀 SceneLighting (이슈 #32) */}
        {useCustomLighting && lighting !== false && (
          <SceneLighting
            preset={lighting as LightingPreset}
            ambient={customAmbient}
            directional={{
              ...(customDirectionalIntensity !== undefined && {
                intensity: customDirectionalIntensity,
              }),
              ...(customDirectionalCastShadow !== undefined && {
                castShadow: customDirectionalCastShadow,
              }),
            }}
          />
        )}

        {/* 선택된 모델 렌더링 */}
        {selectedModel === "cube" && (
          <>
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="orange" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#444" />
            </mesh>
          </>
        )}

        {selectedModel === "yongsan" && (
          <GLTFModel url="/yongsan.glb" onLoaded={handleGLTFLoad} castShadow receiveShadow />
        )}

        {selectedModel.startsWith("fbx-") && (
          <FBXModel
            url={
              (MODEL_OPTIONS.find((m) => m.value === selectedModel) as { path?: string })?.path ||
              ""
            }
            onLoaded={handleFBXLoad}
            castShadow
            receiveShadow
          />
        )}
      </Canvas>

      {/* 컨트롤 패널 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0, 0, 0, 0.85)",
          color: "white",
          padding: "20px",
          borderRadius: "12px",
          fontFamily: "monospace",
          maxWidth: "300px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h1 style={{ marginBottom: "16px", fontSize: "20px", fontWeight: "bold" }}>
          @pf-dev/three v0.2.0 테스트
        </h1>
        <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "20px" }}>
          Issue #30 - v0.2.0 EPIC
          <br />
          #31 Canvas | #32 SceneLighting
          <br />
          #33 CameraControls | #34 SceneGrid & Stats
        </p>

        {/* 모델 선택 */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}
          >
            3D Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelType)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              background: "#333",
              color: "white",
              border: "1px solid #555",
              fontSize: "12px",
            }}
          >
            {MODEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedModel !== "none" && selectedModel !== "cube" && (
            <p style={{ fontSize: "10px", opacity: 0.6, marginTop: "4px" }}>
              {selectedModel === "yongsan" ? "GLTFModel 컴포넌트" : "FBXModel 컴포넌트"}
            </p>
          )}
        </div>

        {/* Lighting 프리셋 */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}
          >
            Lighting Preset
          </label>
          <select
            value={lighting === false ? "false" : lighting}
            onChange={(e) => {
              const value = e.target.value;
              setLighting(value === "false" ? false : (value as LightingPreset));
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              background: "#333",
              color: "white",
              border: "1px solid #555",
            }}
          >
            <option value="default">default</option>
            <option value="studio">studio</option>
            <option value="outdoor">outdoor</option>
            <option value="false">false (조명 없음)</option>
          </select>

          {/* 커스텀 SceneLighting 토글 (이슈 #32) */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "12px",
              padding: "8px",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "4px",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <input
              type="checkbox"
              checked={useCustomLighting}
              onChange={(e) => setUseCustomLighting(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontSize: "12px", color: "#60a5fa" }}>Custom SceneLighting (#32)</span>
          </label>

          {/* 커스텀 조명 컨트롤 */}
          {useCustomLighting && lighting !== false && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "12px" }}>
                조명 커스터마이징
              </div>

              {/* Ambient 강도 */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                  <input
                    type="checkbox"
                    checked={customAmbient !== undefined}
                    onChange={(e) => setCustomAmbient(e.target.checked ? 0.5 : undefined)}
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ fontSize: "11px" }}>Ambient Override</span>
                </label>
                {customAmbient !== undefined && (
                  <>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={customAmbient}
                      onChange={(e) => setCustomAmbient(Number(e.target.value))}
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                    <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>
                      intensity: {customAmbient.toFixed(1)}
                    </div>
                  </>
                )}
              </div>

              {/* Directional 강도 */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                  <input
                    type="checkbox"
                    checked={customDirectionalIntensity !== undefined}
                    onChange={(e) =>
                      setCustomDirectionalIntensity(e.target.checked ? 1.0 : undefined)
                    }
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ fontSize: "11px" }}>Directional Intensity</span>
                </label>
                {customDirectionalIntensity !== undefined && (
                  <>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={customDirectionalIntensity}
                      onChange={(e) => setCustomDirectionalIntensity(Number(e.target.value))}
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                    <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>
                      intensity: {customDirectionalIntensity.toFixed(1)}
                    </div>
                  </>
                )}
              </div>

              {/* Shadow */}
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                  <input
                    type="checkbox"
                    checked={customDirectionalCastShadow !== undefined}
                    onChange={(e) =>
                      setCustomDirectionalCastShadow(e.target.checked ? true : undefined)
                    }
                    style={{ marginRight: "6px" }}
                  />
                  <span style={{ fontSize: "11px" }}>Cast Shadow Override</span>
                </label>
                {customDirectionalCastShadow !== undefined && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "20px",
                      marginTop: "4px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={customDirectionalCastShadow}
                      onChange={(e) => setCustomDirectionalCastShadow(e.target.checked)}
                      style={{ marginRight: "6px" }}
                    />
                    <span style={{ fontSize: "11px" }}>Enabled</span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Show Grid</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
            <input
              type="checkbox"
              checked={autoFitGrid}
              onChange={(e) => setAutoFitGrid(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontSize: "12px" }}>Auto-fit to Model</span>
          </label>

          {showGrid && (
            <>
              <div style={{ marginTop: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "12px",
                  }}
                >
                  Grid Color
                </label>
                <input
                  type="color"
                  value={gridColor}
                  onChange={(e) => setGridColor(e.target.value)}
                  style={{
                    width: "100%",
                    height: "32px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                  }}
                />
              </div>

              <div style={{ marginTop: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "12px",
                  }}
                >
                  Section Color
                </label>
                <input
                  type="color"
                  value={sectionColor}
                  onChange={(e) => setSectionColor(e.target.value)}
                  style={{
                    width: "100%",
                    height: "32px",
                    borderRadius: "4px",
                    border: "1px solid #555",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Background */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Background Color
          </label>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            style={{
              width: "100%",
              height: "32px",
              borderRadius: "4px",
              border: "1px solid #555",
            }}
          />
        </div>

        {/* Camera FOV */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Camera FOV: {cameraFov}°
          </label>
          <input
            type="range"
            min="30"
            max="120"
            value={cameraFov}
            onChange={(e) => setCameraFov(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <p style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px" }}>
            ✓ camera prop 병합 테스트 (position은 기본값 사용)
          </p>
        </div>

        {/* CameraControls (이슈 #33) */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "bold" }}
          >
            Camera Controls
          </label>

          <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={enableControls}
              onChange={(e) => setEnableControls(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontSize: "12px" }}>Enable Controls</span>
          </label>

          {enableControls && (
            <>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  padding: "8px",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "4px",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <input
                  type="checkbox"
                  checked={useCustomControls}
                  onChange={(e) => setUseCustomControls(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                <span style={{ fontSize: "12px", color: "#60a5fa" }}>
                  Custom CameraControls (#33)
                </span>
              </label>

              {useCustomControls && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "12px" }}>
                    카메라 컨트롤 커스터마이징
                  </div>

                  {/* Min Distance */}
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ fontSize: "11px" }}>
                      Min Distance: {controlsMinDistance.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={controlsMinDistance}
                      onChange={(e) => setControlsMinDistance(Number(e.target.value))}
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                  </div>

                  {/* Max Distance */}
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ fontSize: "11px" }}>
                      Max Distance: {controlsMaxDistance.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={controlsMaxDistance}
                      onChange={(e) => setControlsMaxDistance(Number(e.target.value))}
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                  </div>

                  {/* Enable Damping */}
                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={controlsEnableDamping}
                      onChange={(e) => setControlsEnableDamping(e.target.checked)}
                      style={{ marginRight: "6px" }}
                    />
                    <span style={{ fontSize: "11px" }}>Enable Damping</span>
                  </label>

                  {/* Damping Factor */}
                  {controlsEnableDamping && (
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ fontSize: "11px" }}>
                        Damping Factor: {controlsDampingFactor.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        value={controlsDampingFactor}
                        onChange={(e) => setControlsDampingFactor(Number(e.target.value))}
                        style={{ width: "100%", marginTop: "4px" }}
                      />
                    </div>
                  )}

                  {/* Enable Pan */}
                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={controlsEnablePan}
                      onChange={(e) => setControlsEnablePan(e.target.checked)}
                      style={{ marginRight: "6px" }}
                    />
                    <span style={{ fontSize: "11px" }}>Enable Pan</span>
                  </label>

                  {/* Enable Zoom */}
                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={controlsEnableZoom}
                      onChange={(e) => setControlsEnableZoom(e.target.checked)}
                      style={{ marginRight: "6px" }}
                    />
                    <span style={{ fontSize: "11px" }}>Enable Zoom</span>
                  </label>

                  {/* Enable Rotate */}
                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={controlsEnableRotate}
                      onChange={(e) => setControlsEnableRotate(e.target.checked)}
                      style={{ marginRight: "6px" }}
                    />
                    <span style={{ fontSize: "11px" }}>Enable Rotate</span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats (이슈 #34) */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={showStats}
              onChange={(e) => setShowStats(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>Show Stats (#34)</span>
          </label>
          <p style={{ fontSize: "11px", opacity: 0.6 }}>
            FPS 및 메모리 사용량을 좌측 상단에 표시합니다.
          </p>
        </div>

        {/* 현재 설정 요약 */}
        <div
          style={{
            marginTop: "24px",
            padding: "12px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "6px",
            fontSize: "11px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>현재 설정:</div>
          <div>model: {MODEL_OPTIONS.find((m) => m.value === selectedModel)?.label}</div>
          <div>lighting: {lighting === false ? "false" : lighting}</div>
          <div>grid: {showGrid ? "true" : "false"}</div>
          {showGrid && (
            <>
              <div>
                gridSize: {gridSize} x {gridSize}
              </div>
              <div>gridDivisions: {gridDivisions}</div>
              <div>cellSize: {(gridSize / gridDivisions).toFixed(2)}</div>
              <div>sectionSize: {(gridSize / 10).toFixed(2)}</div>
              <div>gridColor: {gridColor}</div>
              <div>sectionColor: {sectionColor}</div>
              <div>autoFit: {autoFitGrid ? "true" : "false"}</div>
            </>
          )}
          <div>background: {background}</div>
          <div>camera.fov: {cameraFov}</div>
        </div>

        {/* 테스트 체크리스트 */}
        <div style={{ marginTop: "20px", fontSize: "11px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>테스트 체크리스트:</div>

          <div style={{ opacity: 0.8, marginBottom: "4px" }}>Issue #31 - Canvas:</div>
          <div>✓ 3D 모델 로드 (GLTF/FBX)</div>
          <div>✓ Lighting 프리셋 변경</div>
          <div>✓ Grid 표시/숨김</div>
          <div>✓ Grid 색상 변경</div>
          <div>✓ Background 색상 변경</div>
          <div>✓ Camera FOV 변경</div>
          <div>✓ Controls prop (boolean | object)</div>

          <div style={{ opacity: 0.8, marginTop: "8px", marginBottom: "4px" }}>
            Issue #32 - SceneLighting:
          </div>
          <div>□ 프리셋 동작 확인 (default/studio/outdoor)</div>
          <div>□ Ambient 강도 커스터마이징</div>
          <div>□ Directional 강도 커스터마이징</div>
          <div>□ Shadow 토글</div>

          <div style={{ opacity: 0.8, marginTop: "8px", marginBottom: "4px" }}>
            Issue #33 - CameraControls:
          </div>
          <div>□ Controls 활성화/비활성화</div>
          <div>□ Min/Max Distance 제한</div>
          <div>□ Damping 설정</div>
          <div>□ Pan/Zoom/Rotate 토글</div>

          <div style={{ opacity: 0.8, marginTop: "8px", marginBottom: "4px" }}>
            Issue #34 - Stats:
          </div>
          <div>□ Stats 표시/숨김</div>
          <div>□ FPS 모니터링</div>
          <div>□ 메모리 사용량 확인</div>
        </div>
      </div>

      {/* 사용 팁 */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "11px",
          maxWidth: "240px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>💡 사용 팁</div>
        <div>• 마우스 드래그: 카메라 회전</div>
        <div>• 마우스 휠: 줌 in/out</div>
        <div>• 우클릭 드래그: 패닝</div>
        <div style={{ marginTop: "8px", opacity: 0.8 }}>
          CameraControls를 비활성화하면 카메라가 고정됩니다.
        </div>
      </div>
    </div>
  );
}
