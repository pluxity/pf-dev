import { useState, useCallback, useMemo } from "react";
import GridLayout from "react-grid-layout";
import { z } from "zod";
import { Button, Edit, Check, X } from "@pf-dev/ui/atoms";

import "react-grid-layout/css/styles.css";

import type { StatCardProps } from "./widgets/StatCard";
import type { ChartWidgetProps } from "./widgets/ChartWidget";
import type { TableWidgetProps } from "./widgets/TableWidget";
import type { EmptyWidgetProps } from "./widgets/EmptyWidget";

// Layout 스키마 정의
const LayoutItemSchema = z.object({
  i: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
  maxH: z.number().optional(),
  static: z.boolean().optional(),
});

const LayoutSchema = z.array(LayoutItemSchema);

export type LayoutItem = z.infer<typeof LayoutItemSchema>;

// Discriminated Union 타입으로 WidgetConfig 정의
interface StatWidgetConfig {
  id: string;
  type: "stat";
  props: StatCardProps;
}

interface ChartWidgetConfig {
  id: string;
  type: "chart";
  props: ChartWidgetProps;
}

interface TableWidgetConfig {
  id: string;
  type: "table";
  props: TableWidgetProps<Record<string, unknown>>;
}

interface EmptyWidgetConfig {
  id: string;
  type: "empty";
  props: EmptyWidgetProps;
}

export type WidgetConfig =
  | StatWidgetConfig
  | ChartWidgetConfig
  | TableWidgetConfig
  | EmptyWidgetConfig;

export interface DashboardGridProps {
  widgets: WidgetConfig[];
  layout: LayoutItem[];
  onLayoutChange?: (layout: LayoutItem[]) => void;
  renderWidget: (widget: WidgetConfig) => React.ReactNode;
  cols?: number;
  rowHeight?: number;
  width?: number;
}

const STORAGE_KEY = "dashboard-layout";

// react-grid-layout@2.x와 @types/react-grid-layout@1.x 간 타입 불일치로 인해
// any 캐스팅 사용. 라이브러리 타입이 업데이트되면 제거 예정.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RGL = GridLayout as any;

export function DashboardGrid({
  widgets,
  layout: initialLayout,
  onLayoutChange,
  renderWidget,
  cols = 12,
  rowHeight = 100,
  width = 1200,
}: DashboardGridProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const result = LayoutSchema.safeParse(parsed);
        if (result.success) {
          return result.data;
        }
      } catch {
        // JSON.parse 실패 시 initialLayout 반환
      }
    }
    return initialLayout;
  });
  const [tempLayout, setTempLayout] = useState<LayoutItem[]>(layout);

  const handleLayoutChange = useCallback(
    (newLayout: LayoutItem[]) => {
      if (isEditing) {
        setTempLayout(newLayout);
      }
    },
    [isEditing]
  );

  const handleEditStart = useCallback(() => {
    setTempLayout(layout);
    setIsEditing(true);
  }, [layout]);

  const handleSave = useCallback(() => {
    setLayout(tempLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempLayout));
    onLayoutChange?.(tempLayout);
    setIsEditing(false);
  }, [tempLayout, onLayoutChange]);

  const handleCancel = useCallback(() => {
    setTempLayout(layout);
    setIsEditing(false);
  }, [layout]);

  const currentLayout = useMemo(
    () => (isEditing ? tempLayout : layout),
    [isEditing, tempLayout, layout]
  );

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X size="sm" />
                <span className="ml-1">취소</span>
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Check size="sm" />
                <span className="ml-1">저장</span>
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEditStart}>
              <Edit size="sm" />
              <span className="ml-1">편집</span>
            </Button>
          )}
        </div>
      </div>

      <div
        className={`rounded-lg transition-all ${isEditing ? "bg-gray-100 p-2 ring-2 ring-blue-200" : ""}`}
      >
        {isEditing && (
          <div className="mb-2 text-center text-sm text-gray-500">
            드래그하여 위젯을 이동하거나 모서리를 드래그하여 크기를 조절하세요.
          </div>
        )}

        <RGL
          className="layout"
          layout={currentLayout}
          cols={cols}
          rowHeight={rowHeight}
          width={width}
          onLayoutChange={handleLayoutChange}
          isDraggable={isEditing}
          isResizable={isEditing}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`overflow-hidden ${isEditing ? "cursor-move ring-2 ring-blue-300" : ""}`}
            >
              {renderWidget(widget)}
            </div>
          ))}
        </RGL>
      </div>
    </div>
  );
}
