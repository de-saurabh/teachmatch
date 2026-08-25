import { theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";

// The "Chalkboard" theme — schoolhouse green board, chalk-white ink,
// a warm chalk-yellow accent. Palette also lives as CSS custom
// properties in index.css; keep the two in sync by hand.
export const chalk = {
  board: "#24352B",
  boardDeep: "#1C2A22",
  panel: "#2B3E32",
  white: "#F4F1E6",
  yellow: "#E4BE5E",
  blue: "#8FB3AC",
  green: "#3B6E55", // brand seal-green, kept as the "verified" accent
};

export const theme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: chalk.yellow,
    colorTextLightSolid: chalk.boardDeep,
    colorBgBase: chalk.board,
    colorBgContainer: chalk.panel,
    colorBgElevated: chalk.panel,
    colorBorder: "rgba(244, 241, 230, 0.35)",
    colorBorderSecondary: "rgba(244, 241, 230, 0.18)",
    colorText: chalk.white,
    colorTextSecondary: "#C9D6C7",
    colorTextTertiary: "#8FA08C",
    colorLink: chalk.yellow,
    colorLinkHover: "#EED17F",
    colorSuccess: "#7FB88F",
    fontFamily: "'Figtree', 'Segoe UI', sans-serif",
    borderRadius: 8,
  },
  components: {
    Segmented: {
      itemSelectedBg: chalk.yellow,
      itemSelectedColor: chalk.boardDeep,
      trackBg: "rgba(244, 241, 230, 0.06)",
    },
    Button: {
      primaryShadow: "none",
      fontWeight: 600,
    },
  },
};
