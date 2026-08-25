import "@testing-library/jest-dom/vitest";

// antd's responsive breakpoint hooks (used by Flex, Segmented, etc.) call
// window.matchMedia, which jsdom does not implement.
window.matchMedia ??= (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});
