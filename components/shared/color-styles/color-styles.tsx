import colors from "@/styles/colors.json";

const TYPED_COLORS = colors as unknown as Record<
  string,
  Record<"hex" | "p3", string>
>;

const hslValues = Object.entries(TYPED_COLORS).map(([key, value]) => {
  // Fix hex values - they need # prefix
  const hexValue = value.hex.startsWith("#") ? value.hex : `#${value.hex}`;
  return `--${key}: ${hexValue}`;
});

const p3Values = Object.entries(TYPED_COLORS)
  .filter(([, value]) => value.p3)
  .map(([key, value]) => `--${key}: color(display-p3 ${value.p3})`);

const darkOverrides: Record<string, string> = {
  "accent-white": "#1a1a1f",
  "accent-black": "#f5f5f5",
  "border-faint": "rgba(255, 255, 255, 0.08)",
  "border-muted": "rgba(255, 255, 255, 0.12)",
  "border-loud": "rgba(255, 255, 255, 0.18)",
  "background-base": "#111118",
  "background-lighter": "#181820",
  "black-alpha-4": "rgba(255, 255, 255, 0.06)",
  "black-alpha-8": "rgba(255, 255, 255, 0.1)",
  "black-alpha-12": "rgba(255, 255, 255, 0.16)",
  "black-alpha-16": "rgba(255, 255, 255, 0.2)",
  "black-alpha-24": "rgba(255, 255, 255, 0.28)",
  "black-alpha-32": "rgba(255, 255, 255, 0.36)",
  "black-alpha-40": "rgba(255, 255, 255, 0.44)",
  "black-alpha-48": "rgba(255, 255, 255, 0.52)",
  "black-alpha-56": "rgba(255, 255, 255, 0.6)",
  "black-alpha-64": "rgba(255, 255, 255, 0.68)",
  "black-alpha-72": "rgba(255, 255, 255, 0.76)",
  "black-alpha-88": "rgba(255, 255, 255, 0.88)",
};

const darkValues = Object.entries(darkOverrides).map(
  ([key, value]) => `--${key}: ${value}`
);

const colorsStyle = `
:root {
  ${hslValues.join(";\n  ")}
}

.dark {
  ${darkValues.join(";\n  ")}
}

@supports (color: color(display-p3 1 1 1)) {
  :root {
    ${p3Values.join(";\n    ")}
  }
}`;

export default function ColorStyles() {
  return <style dangerouslySetInnerHTML={{ __html: colorsStyle }} />;
}
