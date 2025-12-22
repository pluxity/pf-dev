import {
  Listbox as HeadlessListbox,
  ListboxButton as HeadlessListboxButton,
  ListboxOption as HeadlessListboxOption,
  ListboxOptions as HeadlessListboxOptions,
  Transition,
} from "@headlessui/react";
import { createContext, useContext, useMemo, type JSX, type ReactNode } from "react";
import { Check, ChevronUpDownSmall } from "../../atoms";
import { cn } from "../../utils";
import type {
  ListboxButtonProps,
  ListboxGroupProps,
  ListboxIconProps,
  ListboxOptionDescriptionProps,
  ListboxOptionIconProps,
  ListboxOptionProps,
  ListboxOptionTextProps,
  ListboxOptionsProps,
  ListboxProps,
  ListboxSelectedValueProps,
  ListboxSeparatorProps,
  ListboxValue,
} from "./types";

interface ListboxContextValue<TValue> {
  value: ListboxValue<TValue>;
  multiple?: boolean;
  open: boolean;
  renderValue?: (value: ListboxValue<TValue>) => ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ListboxContext = createContext<ListboxContextValue<any> | null>(null);

function useListboxContext<TValue>() {
  const context = useContext(ListboxContext);
  if (!context) {
    throw new Error("Listbox components must be used within a Listbox root.");
  }
  return context as ListboxContextValue<TValue>;
}

function ListboxRoot<TValue>({
  children,
  value,
  onChange,
  multiple,
  by,
  className,
  renderValue,
  disabled,
  ...props
}: ListboxProps<TValue>) {
  const headlessBy =
    typeof by === "string"
      ? (a: TValue, b: TValue) =>
          (a as Record<string, unknown>)[by] === (b as Record<string, unknown>)[by]
      : by;
  const providerValue = useMemo(
    () => ({
      value,
      multiple,
      open: false,
      renderValue,
    }),
    [multiple, renderValue, value]
  );

  return (
    <HeadlessListbox
      value={value as ListboxValue<TValue>}
      onChange={onChange}
      multiple={multiple}
      by={headlessBy}
      disabled={disabled}
      {...props}
    >
      {({ open }) => (
        <ListboxContext.Provider value={{ ...providerValue, open }}>
          <div className={cn("relative w-full", className)}>{children}</div>
        </ListboxContext.Provider>
      )}
    </HeadlessListbox>
  );
}

function ListboxButton({ className, children, ...props }: ListboxButtonProps) {
  return (
    <HeadlessListboxButton
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm",
        "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </HeadlessListboxButton>
  );
}

function ListboxSelectedValueComponent<TValue>({
  placeholder = "Select...",
  className,
  maxVisible = 3,
  ...props
}: ListboxSelectedValueProps) {
  const { value, renderValue } = useListboxContext<TValue>();
  const isEmpty = value === null || (Array.isArray(value) && value.length === 0);
  const isArrayValue = Array.isArray(value);

  const defaultRenderValue = () => {
    if (Array.isArray(value)) {
      const visible = value.slice(0, maxVisible).map((item) => (item === null ? "" : String(item)));
      const remaining = value.length - maxVisible;
      return (
        <>
          {visible.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs text-primary-700"
            >
              {item}
            </span>
          ))}
          {remaining > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              +{remaining} more
            </span>
          ) : null}
        </>
      );
    }
    if (value === null) return "";
    return String(value);
  };

  const rendered = renderValue ? renderValue(value) : defaultRenderValue();

  return (
    <span
      className={cn(
        "flex-1 text-left",
        isArrayValue && "flex flex-wrap items-center gap-1",
        isEmpty ? "text-gray-500" : "text-gray-900",
        className
      )}
      {...props}
    >
      {isEmpty ? placeholder : rendered}
    </span>
  );
}

function ListboxIcon({ className, ...props }: ListboxIconProps) {
  return (
    <span className={cn("ml-2 text-gray-500", className)} aria-hidden="true" {...props}>
      <ChevronUpDownSmall />
    </span>
  );
}

function ListboxOptions({ className, children, ...props }: ListboxOptionsProps) {
  const { open } = useListboxContext<unknown>();

  return (
    <Transition
      show={open}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 translate-y-1 scale-95"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 translate-y-1 scale-95"
    >
      <HeadlessListboxOptions
        as="ul"
        className={cn(
          "absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg",
          "focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </HeadlessListboxOptions>
    </Transition>
  );
}

function ListboxGroup({ className, label, children, ...props }: ListboxGroupProps) {
  return (
    <div className={cn("px-1 py-1.5", className)} role="group" {...props}>
      {label ? <div className="px-2 pb-1 text-xs font-semibold text-gray-500">{label}</div> : null}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ListboxOption<TValue>({
  value,
  className,
  children,
  disabled,
  ...props
}: ListboxOptionProps<TValue>) {
  return (
    <HeadlessListboxOption
      value={value}
      disabled={disabled}
      as="li"
      className={({ active, selected, disabled: optionDisabled }) =>
        cn(
          "flex w-full cursor-default select-none items-start gap-3 rounded-md px-3 py-2 text-sm",
          active && "bg-gray-50",
          selected && "text-primary-600",
          (disabled || optionDisabled) && "cursor-not-allowed opacity-50",
          className
        )
      }
      {...props}
    >
      {({ selected }) => (
        <>
          <div className="flex flex-1 items-center gap-2 text-gray-900">{children}</div>
          {selected ? <Check size="sm" className="mt-0.5 text-primary-500" /> : null}
        </>
      )}
    </HeadlessListboxOption>
  );
}

function ListboxOptionIcon({ className, ...props }: ListboxOptionIconProps) {
  return (
    <span
      className={cn("flex h-4 w-4 items-center justify-center text-gray-500", className)}
      {...props}
    />
  );
}

function ListboxOptionText({ className, ...props }: ListboxOptionTextProps) {
  return (
    <span
      className={cn("block truncate text-sm font-medium text-gray-900", className)}
      {...props}
    />
  );
}

function ListboxOptionDescription({ className, ...props }: ListboxOptionDescriptionProps) {
  return <p className={cn("text-xs text-gray-500", className)} {...props} />;
}

function ListboxSeparator({ className, ...props }: ListboxSeparatorProps) {
  return (
    <div className={cn("my-1 border-t border-gray-200", className)} role="separator" {...props} />
  );
}

const Listbox = ListboxRoot as <TValue>(props: ListboxProps<TValue>) => JSX.Element;
const ListboxSelectedValue = ListboxSelectedValueComponent;

export {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxOptionIcon,
  ListboxOptionText,
  ListboxOptionDescription,
  ListboxSelectedValue,
  ListboxIcon,
  ListboxGroup,
  ListboxSeparator,
};
