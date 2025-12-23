import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Raycaster, Vector2, Mesh, Object3D } from "three";
import { useInteractionStore } from "../store/interactionStore";
import type { RaycastOptions } from "../types/interaction";

export function useMeshHover(targets: Object3D[] | Object3D | null, options: RaycastOptions = {}) {
  const { enabled = true, recursive = true, filter, threshold = 0.01 } = options;

  const { camera, gl, scene } = useThree();
  const raycasterRef = useRef(new Raycaster());
  const mouseRef = useRef(new Vector2(-999, -999));
  const lastUpdateRef = useRef(0);

  const setHoveredMesh = useInteractionStore((s) => s.setHoveredMesh);
  const clearHover = useInteractionStore((s) => s.clearHover);
  const enableHover = useInteractionStore((s) => s.enableHover);
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);

  useEffect(() => {
    if (!enabled || !enableHover) {
      clearHover();
      return;
    }

    const canvas = gl.domElement;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(x, y);
    };

    const handleMouseLeave = () => {
      mouseRef.current.set(-999, -999);
      clearHover();
      canvas.style.cursor = "default";
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      clearHover();
      canvas.style.cursor = "default";
    };
  }, [enabled, enableHover, gl, clearHover]);

  useFrame(({ clock }) => {
    if (!enabled || !enableHover) {
      if (hoveredMesh) clearHover();
      return;
    }

    const now = clock.getElapsedTime();

    if (now - lastUpdateRef.current < 0.033) return;
    lastUpdateRef.current = now;

    const canvas = gl.domElement;

    if (
      mouseRef.current.x < -1 ||
      mouseRef.current.x > 1 ||
      mouseRef.current.y < -1 ||
      mouseRef.current.y > 1
    ) {
      if (hoveredMesh) {
        clearHover();
        canvas.style.cursor = "default";
      }
      return;
    }

    const raycaster = raycasterRef.current;
    raycaster.params.Points = { threshold };
    raycaster.params.Line = { threshold };
    raycaster.setFromCamera(mouseRef.current, camera);

    const targetsArray = Array.isArray(targets) ? targets : targets ? [targets] : [scene];

    const intersects = raycaster.intersectObjects(targetsArray, recursive);

    const validIntersects = filter ? intersects.filter((int) => filter(int.object)) : intersects;

    const firstMeshIntersect = validIntersects.find((int) => (int.object as Mesh).isMesh);

    if (firstMeshIntersect && (firstMeshIntersect.object as Mesh).isMesh) {
      const mesh = firstMeshIntersect.object as Mesh;

      if (hoveredMesh?.mesh !== mesh) {
        setHoveredMesh({
          mesh,
          intersection: firstMeshIntersect,
        });
      }
      canvas.style.cursor = "pointer";
    } else {
      if (hoveredMesh) {
        clearHover();
      }
      canvas.style.cursor = "default";
    }
  });

  return hoveredMesh;
}
