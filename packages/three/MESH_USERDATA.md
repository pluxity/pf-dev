# Mesh userData - 사용자 정의 속성 사용하기

Three.js의 모든 `Object3D` (Mesh 포함)는 `userData` 속성을 제공합니다.
이를 통해 Mesh에 사용자 정의 데이터를 자유롭게 담을 수 있습니다.

## userData란?

`userData`는 Three.js Object3D의 빈 객체(`{}`)로, 사용자가 원하는 데이터를 자유롭게 저장할 수 있습니다.

```typescript
mesh.userData = {
  id: "building-1",
  type: "commercial",
  floor: 3,
  department: "IT",
  occupied: true,
  metadata: {
    area: 120.5,
    capacity: 50,
  },
};
```

## 사용 예시

### 1. 모델 로드 시 userData 설정

```typescript
import { useGLTFLoader } from '@pf-dev/three';

function MyScene() {
  const { scene } = useGLTFLoader('/models/building.glb', {
    onLoaded: (gltf) => {
      // 특정 mesh 찾아서 userData 설정
      gltf.scene.traverse((child) => {
        if (child.name.includes('CCTV')) {
          child.userData = {
            type: 'sensor',
            sensorId: child.name,
            status: 'active',
            lastUpdate: Date.now(),
          };
        }

        if (child.name.includes('Room')) {
          const roomNumber = child.name.match(/\d+/)?.[0];
          child.userData = {
            type: 'room',
            roomNumber,
            occupied: false,
            temperature: 22.5,
          };
        }
      });
    }
  });

  return scene ? <primitive object={scene} /> : null;
}
```

### 2. Hover 시 userData 표시

```typescript
import { useInteractionStore } from '@pf-dev/three';

function CustomMeshInfo() {
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);

  if (!hoveredMesh) return null;

  const userData = hoveredMesh.mesh.userData;

  return (
    <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">{hoveredMesh.mesh.name}</h3>

      {/* userData 표시 */}
      {userData.type && (
        <p><strong>Type:</strong> {userData.type}</p>
      )}
      {userData.sensorId && (
        <p><strong>Sensor ID:</strong> {userData.sensorId}</p>
      )}
      {userData.roomNumber && (
        <p><strong>Room:</strong> {userData.roomNumber}</p>
      )}
      {userData.status && (
        <p><strong>Status:</strong> {userData.status}</p>
      )}

      {/* 전체 userData JSON 출력 */}
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-gray-600">
          Full Data
        </summary>
        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-40">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </details>
    </div>
  );
}
```

### 3. Click 이벤트에서 userData 활용

```typescript
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";

function ClickHandler() {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const userData = clickedMesh.userData;

        console.log("Clicked mesh:", clickedMesh.name);
        console.log("User data:", userData);

        // userData 기반 액션
        if (userData.type === "door") {
          openDoor(userData.doorId);
        } else if (userData.type === "sensor") {
          showSensorData(userData.sensorId);
        }
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, scene, gl]);

  return null;
}
```

### 4. userData 동적 업데이트

```typescript
import { useModelStore } from "@pf-dev/three";
import { useEffect } from "react";

function SensorMonitor() {
  const models = useModelStore((s) => s.models);
  const buildingModel = models.get("building");

  useEffect(() => {
    if (!buildingModel?.object) return;

    // 실시간 센서 데이터 업데이트
    const interval = setInterval(() => {
      buildingModel.object.traverse((child) => {
        if (child.userData.type === "sensor") {
          // 센서 상태 업데이트
          child.userData.temperature = Math.random() * 30 + 10;
          child.userData.lastUpdate = Date.now();

          // 온도에 따라 색상 변경 (선택적)
          if ((child as any).isMesh) {
            const mesh = child as THREE.Mesh;
            const material = mesh.material as THREE.MeshStandardMaterial;

            if (child.userData.temperature > 25) {
              material.color.set("#ff6b6b");
            } else {
              material.color.set("#51cf66");
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [buildingModel]);

  return null;
}
```

### 5. MeshInfo 컴포넌트에 userData 통합

```typescript
// packages/three/src/store/interactionStore.ts 에서
export interface MeshInfo {
  name: string;
  materialName?: string;
  userData?: Record<string, any>; // userData 추가
}

// getHoveredMeshInfo 업데이트
getHoveredMeshInfo: () => {
  const { hoveredMesh } = get();
  if (!hoveredMesh) return null;

  const mesh = hoveredMesh.mesh;

  return {
    name: mesh.name || "Unnamed Mesh",
    materialName: /* ... */,
    userData: mesh.userData, // userData 포함
  };
}
```

## userData 활용 시나리오

### 1. 건물 층 정보

```typescript
mesh.userData = {
  floor: 3,
  type: "office",
  area: 500, // m²
  departments: ["IT", "HR", "Finance"],
};
```

### 2. CCTV/센서 정보

```typescript
mesh.userData = {
  type: "cctv",
  id: "CCTV-F3-001",
  status: "online",
  streamUrl: "rtsp://...",
  coverage: { angle: 120, range: 30 },
};
```

### 3. 실내 공간 정보

```typescript
mesh.userData = {
  type: "room",
  roomId: "R-301",
  capacity: 20,
  occupied: true,
  equipment: ["projector", "whiteboard"],
  booking: { user: "John", until: "14:00" },
};
```

### 4. IoT 장비 정보

```typescript
mesh.userData = {
  type: "iot-device",
  deviceId: "TH-F3-015",
  sensorType: "temperature-humidity",
  lastReading: { temp: 22.5, humidity: 45 },
  lastUpdate: 1234567890,
};
```

## 주의사항

1. **직렬화 가능한 데이터만**: userData는 JSON.stringify()로 직렬화 가능해야 합니다
2. **함수나 클래스 인스턴스는 피하기**: 순수 객체 사용 권장
3. **메모리 관리**: 큰 데이터는 참조로 관리하고, userData에는 ID만 저장
4. **타입 안전성**: TypeScript 사용 시 interface 정의 권장

```typescript
interface RoomUserData {
  type: "room";
  roomId: string;
  floor: number;
  capacity: number;
  occupied: boolean;
}

mesh.userData = {
  type: "room",
  roomId: "R-301",
  floor: 3,
  capacity: 20,
  occupied: false,
} satisfies RoomUserData;
```

## 결론

`userData`를 활용하면 3D 모델과 비즈니스 로직을 유연하게 연결할 수 있습니다.
실시간 센서 데이터, 공간 정보, IoT 장비 상태 등을 Mesh에 직접 담아 관리할 수 있습니다.
