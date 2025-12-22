import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
export type EnsureArray<T> = T extends unknown[] ? T : Expand<T>[];

export type ComboBoxValueType<
  TValue,
  TMultiple extends boolean | undefined = false,
> = TMultiple extends true ? EnsureArray<TValue> : TValue | null;

export type ComboBoxFilterFn<TValue> = (
  query: string,
  textValue: string,
  itemProps: ComboBoxItemProps<TValue>
) => boolean;

export interface ComboBoxProps<TValue, TMultiple extends boolean | undefined = false> {
  value: ComboBoxValueType<TValue, TMultiple>;
  onValueChange: (value: ComboBoxValueType<TValue, TMultiple>) => void;
  multiple?: TMultiple;
  disabled?: boolean;
  nullable?: boolean;
  by?: ((a: TValue, b: TValue) => boolean) | string;
  renderValue?: (value: ComboBoxValueType<TValue, TMultiple>) => ReactNode;
  filter?: ComboBoxFilterFn<TValue>;
  isLoading?: boolean;
  className?: string;
  children: ReactNode;
}

export type ComboBoxTriggerProps = ComponentPropsWithoutRef<"button">;

export type ComboBoxContentProps = ComponentPropsWithoutRef<"div">;

export type ComboBoxInputProps = ComponentPropsWithoutRef<"input">;

export interface ComboBoxListProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export interface ComboBoxGroupProps extends ComponentPropsWithoutRef<"div"> {
  label?: ReactNode;
}

export interface ComboBoxItemProps<TValue> extends Omit<ComponentPropsWithoutRef<"li">, "value"> {
  value: TValue;
  textValue?: string;
  disabled?: boolean;
}

export type ComboBoxSeparatorProps = ComponentPropsWithoutRef<"div">;

export type ComboBoxEmptyProps = ComponentPropsWithoutRef<"div">;

export interface ComboBoxLoadingProps extends ComponentPropsWithoutRef<"div"> {
  label?: ReactNode;
}

export interface ComboBoxValueProps extends ComponentPropsWithoutRef<"span"> {
  placeholder?: string;
  maxVisible?: number;
}

export type ComboBoxIconProps = ComponentPropsWithoutRef<"span">;

export type ComboBoxItemIconProps = ComponentPropsWithoutRef<"span">;
