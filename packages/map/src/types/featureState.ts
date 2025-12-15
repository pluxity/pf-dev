import type { Color } from "cesium";

// ============================================================================
// Feature State
// ============================================================================

/**
 * Feature의 상태 타입
 * - 기본 상태: 'normal', 'selected', 'warning', 'critical'
 * - 커스텀 상태 추가 가능
 */
export type FeatureState = "normal" | "selected" | "warning" | "critical" | string;

// ============================================================================
// State Effects
// ============================================================================

/**
 * Silhouette 효과 (Model에 외곽선)
 */
export interface SilhouetteEffect {
  type: "silhouette";
  color: Color;
  size?: number; // 기본값: 2
}

/**
 * Ripple 효과 (바닥에 물결 애니메이션)
 */
export interface RippleEffect {
  type: "ripple";
  color: Color;
  period?: number; // 애니메이션 주기 (ms), 기본값: 1200
  maxSize?: number; // 최대 크기 (픽셀), 기본값: 50
  baseSize?: number; // 기본 크기 (픽셀), 기본값: 6
}

/**
 * Glow 효과 (Billboard/Point가 빛나는 효과)
 */
export interface GlowEffect {
  type: "glow";
  color: Color;
  intensity?: number; // 빛 강도 (0-1), 기본값: 0.8
}

/**
 * Outline 효과 (Billboard/Point 외곽선 강조)
 */
export interface OutlineEffect {
  type: "outline";
  color: Color;
  width?: number; // 외곽선 두께 (픽셀), 기본값: 3
}

/**
 * 상태별 시각 효과
 */
export type StateEffect = SilhouetteEffect | RippleEffect | GlowEffect | OutlineEffect;

// ============================================================================
// FeatureStateEffects Props
// ============================================================================

/**
 * FeatureStateEffects 컴포넌트 Props
 *
 * 각 상태(state)에 대한 시각 효과를 정의합니다.
 *
 * @example
 * ```tsx
 * <FeatureStateEffects
 *   selected={{ type: "silhouette", color: Color.YELLOW, size: 2 }}
 *   warning={{ type: "ripple", color: Color.ORANGE }}
 *   critical={{ type: "ripple", color: Color.RED, period: 800 }}
 * />
 * ```
 */
export interface FeatureStateEffectsProps {
  [state: string]: StateEffect;
}
