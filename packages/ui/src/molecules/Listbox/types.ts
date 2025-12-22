import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ListboxValue<TValue> = TValue | TValue[] | null;

export interface ListboxProps<TValue> {
  value: ListboxValue<TValue>;
  onChange: (value: ListboxValue<TValue>) => void;
  multiple?: boolean;
  disabled?: boolean;
  by?: ((a: TValue, b: TValue) => boolean) | string;
  renderValue?: (value: ListboxValue<TValue>) => ReactNode;
  className?: string;
  children: ReactNode;
}

export type ListboxButtonProps = ComponentPropsWithoutRef<"button">;

export type ListboxOptionsProps = ComponentPropsWithoutRef<"ul">;

export interface ListboxOptionProps<TValue> extends Omit<ComponentPropsWithoutRef<"li">, "value"> {
  value: TValue;
  disabled?: boolean;
}

export type ListboxOptionIconProps = ComponentPropsWithoutRef<"span">;

export type ListboxOptionTextProps = ComponentPropsWithoutRef<"span">;

export type ListboxOptionDescriptionProps = ComponentPropsWithoutRef<"p">;

export interface ListboxSelectedValueProps extends ComponentPropsWithoutRef<"span"> {
  placeholder?: string;
  maxVisible?: number;
}

export type ListboxIconProps = ComponentPropsWithoutRef<"span">;

export interface ListboxGroupProps extends ComponentPropsWithoutRef<"div"> {
  label?: ReactNode;
}

export type ListboxSeparatorProps = ComponentPropsWithoutRef<"div">;
