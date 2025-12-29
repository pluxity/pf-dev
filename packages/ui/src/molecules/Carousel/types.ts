import type { ReactNode, ComponentPropsWithoutRef } from "react";

export type CarouselTransition = "slide" | "fade" | "none";

export interface CarouselProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** 슬라이드로 표시할 children 배열 */
  children: ReactNode[];
  /** 전환 효과 */
  transition?: CarouselTransition;
  /** 자동 재생 여부 */
  autoPlay?: boolean;
  /** 자동 재생 간격 (ms) */
  autoPlayInterval?: number;
  /** 이전/다음 화살표 표시 */
  showArrows?: boolean;
  /** 인디케이터 점 표시 */
  showIndicators?: boolean;
  /** 무한 루프 여부 */
  loop?: boolean;
  /** 비활성 슬라이드 lazy 렌더링 (기본 true) - 활성 슬라이드만 마운트 */
  lazy?: boolean;
  /** 이전/다음 슬라이드 미리 마운트 */
  preloadAdjacent?: boolean;
  /** 현재 슬라이드 인덱스 (제어 컴포넌트용) */
  activeIndex?: number;
  /** 슬라이드 변경 콜백 */
  onChange?: (index: number) => void;
  /** 전환 애니메이션 지속 시간 (ms) */
  transitionDuration?: number;
}

export interface CarouselContextValue {
  activeIndex: number;
  totalSlides: number;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  transition: CarouselTransition;
  transitionDuration: number;
}
