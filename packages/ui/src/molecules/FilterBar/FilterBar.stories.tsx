import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  FilterBar,
  FilterBarChips,
  FilterBarClear,
  FilterBarContent,
  FilterBarEmpty,
  FilterBarIcon,
  FilterBarInput,
  FilterBarItem,
  FilterBarList,
  FilterBarTrigger,
  FilterBarValue,
  useFilterBar,
} from "./FilterBar";
import type { FilterOption } from "./types";

const meta: Meta<typeof FilterBar> = {
  title: "Molecules/FilterBar",
  component: FilterBar,
  parameters: {
    layout: "centered",
    docs: { canvas: { height: 400 } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const statusOptions: FilterOption[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const categoryOptions: FilterOption[] = [
  { value: "electronics", label: "Electronics", category: "Category" },
  { value: "clothing", label: "Clothing", category: "Category" },
  { value: "books", label: "Books", category: "Category" },
  { value: "sports", label: "Sports", category: "Category" },
  { value: "home", label: "Home & Garden", category: "Category" },
];

const mixedOptions: FilterOption[] = [
  { value: "active", label: "Active", category: "Status" },
  { value: "pending", label: "Pending", category: "Status" },
  { value: "completed", label: "Completed", category: "Status" },
  { value: "electronics", label: "Electronics", category: "Category" },
  { value: "clothing", label: "Clothing", category: "Category" },
  { value: "books", label: "Books", category: "Category" },
  { value: "high", label: "High", category: "Priority" },
  { value: "medium", label: "Medium", category: "Priority" },
  { value: "low", label: "Low", category: "Priority" },
];

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <FilterBar selected={selected} onSelectedChange={setSelected} options={statusOptions}>
            <FilterBarTrigger>
              <FilterBarValue placeholder="Add filter..." />
              <FilterBarIcon />
            </FilterBarTrigger>
            <FilterBarContent>
              <FilterBarInput />
              <FilterBarList>
                {statusOptions.map((option) => (
                  <FilterBarItem key={option.value} value={option.value}>
                    {option.label}
                  </FilterBarItem>
                ))}
              </FilterBarList>
            </FilterBarContent>
          </FilterBar>
          <FilterBarClear />
        </div>
        <FilterBarChips />
      </div>
    );
  },
};

export const WithCategories: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["electronics"]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <FilterBar selected={selected} onSelectedChange={setSelected} options={categoryOptions}>
            <FilterBarTrigger>
              <FilterBarValue />
              <FilterBarIcon />
            </FilterBarTrigger>
            <FilterBarContent>
              <FilterBarInput placeholder="Search categories..." />
              <FilterBarList>
                {categoryOptions.map((option) => (
                  <FilterBarItem key={option.value} value={option.value} />
                ))}
              </FilterBarList>
            </FilterBarContent>
          </FilterBar>
          <FilterBarClear />
        </div>
        <FilterBarChips showCategory />
      </div>
    );
  },
};

function FilterableList() {
  const { search, options } = useFilterBar<string>();

  const filtered = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

  if (filtered.length === 0) {
    return <FilterBarEmpty>No filters found</FilterBarEmpty>;
  }

  return (
    <FilterBarList>
      {filtered.map((option) => (
        <FilterBarItem key={option.value} value={option.value} />
      ))}
    </FilterBarList>
  );
}

export const WithSearch: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <FilterBar selected={selected} onSelectedChange={setSelected} options={mixedOptions}>
            <FilterBarTrigger>
              <FilterBarValue />
              <FilterBarIcon />
            </FilterBarTrigger>
            <FilterBarContent className="w-64">
              <FilterBarInput />
              <FilterableList />
            </FilterBarContent>
          </FilterBar>
          <FilterBarClear />
        </div>
        <FilterBarChips showCategory />
      </div>
    );
  },
};

export const PreSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["active", "electronics", "high"]);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <FilterBar selected={selected} onSelectedChange={setSelected} options={mixedOptions}>
            <FilterBarTrigger>
              <FilterBarValue />
              <FilterBarIcon />
            </FilterBarTrigger>
            <FilterBarContent className="w-64">
              <FilterBarInput />
              <FilterableList />
            </FilterBarContent>
          </FilterBar>
          <FilterBarClear />
        </div>
        <FilterBarChips showCategory />
      </div>
    );
  },
};

export const InlineLayout: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["pending"]);

    return (
      <FilterBar selected={selected} onSelectedChange={setSelected} options={statusOptions}>
        <div className="flex flex-wrap items-center gap-2">
          <FilterBarChips showCategory={false} />
          <FilterBarTrigger className="h-8 px-2">
            <span className="text-xs text-gray-500">+ Add filter</span>
          </FilterBarTrigger>
          <FilterBarContent>
            <FilterBarList>
              {statusOptions.map((option) => (
                <FilterBarItem key={option.value} value={option.value}>
                  {option.label}
                </FilterBarItem>
              ))}
            </FilterBarList>
          </FilterBarContent>
        </div>
      </FilterBar>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["active"]);

    return (
      <div className="flex flex-col gap-4">
        <FilterBar
          selected={selected}
          onSelectedChange={setSelected}
          options={statusOptions}
          disabled
        >
          <div className="flex items-center gap-4">
            <FilterBarTrigger>
              <FilterBarValue />
              <FilterBarIcon />
            </FilterBarTrigger>
            <FilterBarClear />
          </div>
          <FilterBarChips className="mt-2" />
        </FilterBar>
      </div>
    );
  },
};

export const CustomChipStyle: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["electronics", "books"]);

    return (
      <FilterBar selected={selected} onSelectedChange={setSelected} options={categoryOptions}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <FilterBarTrigger>
              <FilterBarValue />
              <FilterBarIcon />
            </FilterBarTrigger>
            <FilterBarContent>
              <FilterBarInput />
              <FilterBarList>
                {categoryOptions.map((option) => (
                  <FilterBarItem key={option.value} value={option.value} />
                ))}
              </FilterBarList>
            </FilterBarContent>
            <FilterBarClear />
          </div>
          <FilterBarChips
            showCategory
            className="[&>span]:bg-gray-100 [&>span]:text-gray-800 [&>span]:font-normal"
          />
        </div>
      </FilterBar>
    );
  },
};
