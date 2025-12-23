import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export interface FilterOption<TValue = string> {
  value: TValue;
  label: string;
  category?: string;
}

export interface FilterBarContextValue<TValue = string> {
  selected: TValue[];
  onSelect: (value: TValue) => void;
  onRemove: (value: TValue) => void;
  onClear: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (search: string) => void;
  disabled?: boolean;
  options: FilterOption<TValue>[];
  getLabel: (value: TValue) => string;
  getCategory: (value: TValue) => string | undefined;
}

export interface FilterBarProps<TValue = string> {
  selected: TValue[];
  onSelectedChange: (selected: TValue[]) => void;
  options: FilterOption<TValue>[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}

export interface FilterBarTriggerProps extends ComponentPropsWithoutRef<"button"> {
  ref?: Ref<HTMLButtonElement>;
}

export interface FilterBarValueProps extends ComponentPropsWithoutRef<"span"> {
  placeholder?: string;
  ref?: Ref<HTMLSpanElement>;
}

export type FilterBarIconProps = ComponentPropsWithoutRef<"span"> & {
  ref?: Ref<HTMLSpanElement>;
};

export interface FilterBarContentProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarInputProps extends ComponentPropsWithoutRef<"input"> {
  ref?: Ref<HTMLInputElement>;
}

export interface FilterBarListProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarEmptyProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarItemProps<TValue = string> extends ComponentPropsWithoutRef<"div"> {
  value: TValue;
  disabled?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarChipsProps extends ComponentPropsWithoutRef<"div"> {
  showCategory?: boolean;
  removable?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarClearProps extends ComponentPropsWithoutRef<"button"> {
  ref?: Ref<HTMLButtonElement>;
}
