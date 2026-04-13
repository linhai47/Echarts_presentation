import { CATEGORY_COLORS, RELATION_COLORS } from "../config.js";

const THEMES = {
  dark: {
    background: "#000000",
    surface: "#111111",
    surfaceMuted: "rgba(20, 20, 20, 0.4)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "#ededed",
    textMuted: "#888888",
    accent: "#0070f3",
    accentStrong: "#3291ff",
    axisLine: "rgba(255, 255, 255, 0.1)",
    splitLine: "rgba(255, 255, 255, 0.05)",
    tooltipBackground: "rgba(10, 10, 10, 0.7)",
    tooltipBorder: "rgba(255, 255, 255, 0.1)",
    chartBackground: "transparent",
    inactiveOpacity: 0.2,
    hoverShadow: "rgba(255, 255, 255, 0.1)",
    difficultyColors: ["#3b82f6", "#10b981", "#f59e0b", "#f97316", "#ef4444"]
  },
  light: {
    background: "#fafafa",
    surface: "#ffffff",
    surfaceMuted: "rgba(245, 245, 245, 0.5)",
    border: "rgba(0, 0, 0, 0.08)",
    text: "#111111",
    textMuted: "#666666",
    accent: "#0070f3",
    accentStrong: "#3291ff",
    axisLine: "rgba(0, 0, 0, 0.1)",
    splitLine: "rgba(0, 0, 0, 0.04)",
    tooltipBackground: "rgba(255, 255, 255, 0.8)",
    tooltipBorder: "rgba(0, 0, 0, 0.08)",
    chartBackground: "transparent",
    inactiveOpacity: 0.2,
    hoverShadow: "rgba(0, 0, 0, 0.1)",
    difficultyColors: ["#3b82f6", "#10b981", "#f59e0b", "#f97316", "#ef4444"]
  }
};

export function getChartThemeTokens(theme = "dark") {
  const base = THEMES[theme] || THEMES.dark;

  return {
    ...base,
    categoryColors: CATEGORY_COLORS,
    relationColors: RELATION_COLORS
  };
}
