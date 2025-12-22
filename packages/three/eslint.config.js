import rootConfig from "../../eslint.config.js";

export default [
  ...rootConfig,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // Three.js requires direct material mutations which are intentional
      "react-hooks/immutability": "off",
    },
  },
];
