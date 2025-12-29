import { type ReactNode, type Ref, type HTMLAttributes } from "react";
import { cn } from "../../utils";

export interface CardListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  data: T[];
  renderCard: (item: T, index: number) => ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: number;
  ref?: Ref<HTMLDivElement>;
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

function CardList<T>({
  data,
  renderCard,
  columns = 3,
  gap = 16,
  className,
  ref,
  ...props
}: CardListProps<T>) {
  return (
    <div
      ref={ref}
      className={cn("grid", columnClasses[columns], className)}
      style={{ gap }}
      {...props}
    >
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
}

export { CardList };
