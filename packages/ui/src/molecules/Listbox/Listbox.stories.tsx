import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle, Cloudy, Sunny, Users } from "../../atoms/Icon";
import {
  Listbox,
  ListboxButton,
  ListboxGroup,
  ListboxIcon,
  ListboxOption,
  ListboxOptionDescription,
  ListboxOptionIcon,
  ListboxOptionText,
  ListboxOptions,
  ListboxSelectedValue,
  ListboxSeparator,
} from "./Listbox";

const meta: Meta<typeof Listbox> = {
  title: "Molecules/Listbox",
  component: Listbox,
  parameters: {
    layout: "centered",
    docs: { canvas: { height: 320 } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const languages = [
  { id: "en", name: "English" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "ko", name: "Korean" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <Listbox
        value={value}
        onChange={(next) => setValue(Array.isArray(next) ? (next[0] ?? null) : next)}
      >
        <ListboxButton className="w-[220px]">
          <ListboxSelectedValue placeholder="Choose a language" />
          <ListboxIcon />
        </ListboxButton>
        <ListboxOptions>
          {languages.map((lang) => (
            <ListboxOption key={lang.id} value={lang.name}>
              <ListboxOptionIcon>
                <Users size="sm" />
              </ListboxOptionIcon>
              <ListboxOptionText>{lang.name}</ListboxOptionText>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    );
  },
};

export const WithDescriptions: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    const themes = [
      {
        id: "light",
        name: "Light",
        description: "Bright UI with clear contrast",
        icon: <Sunny size="sm" />,
      },
      {
        id: "dark",
        name: "Dark",
        description: "Dimmed UI for low light",
        icon: <Cloudy size="sm" />,
      },
      {
        id: "system",
        name: "System",
        description: "Follow OS preference",
        icon: <CheckCircle size="sm" />,
      },
    ];

    return (
      <Listbox
        value={value}
        onChange={(next) => setValue(Array.isArray(next) ? (next[0] ?? null) : next)}
      >
        <ListboxButton className="w-[280px]">
          <ListboxSelectedValue placeholder="Pick a theme" />
          <ListboxIcon />
        </ListboxButton>
        <ListboxOptions>
          <ListboxGroup label="Themes">
            {themes.map((theme) => (
              <ListboxOption key={theme.id} value={theme.name}>
                <ListboxOptionIcon>{theme.icon}</ListboxOptionIcon>
                <div className="flex flex-col">
                  <ListboxOptionText>{theme.name}</ListboxOptionText>
                  <ListboxOptionDescription>{theme.description}</ListboxOptionDescription>
                </div>
              </ListboxOption>
            ))}
          </ListboxGroup>
        </ListboxOptions>
      </Listbox>
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);

    return (
      <Listbox
        value={value}
        multiple
        onChange={(next) => setValue(Array.isArray(next) ? next : [])}
      >
        <ListboxButton className="w-[320px]">
          <ListboxSelectedValue placeholder="Select languages" />
          <ListboxIcon />
        </ListboxButton>
        <ListboxOptions>
          <ListboxGroup label="Languages">
            {languages.map((lang) => (
              <ListboxOption key={lang.id} value={lang.name}>
                <ListboxOptionIcon>
                  <Users size="sm" />
                </ListboxOptionIcon>
                <ListboxOptionText>{lang.name}</ListboxOptionText>
              </ListboxOption>
            ))}
          </ListboxGroup>
          <ListboxSeparator />
        </ListboxOptions>
      </Listbox>
    );
  },
};
