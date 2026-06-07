export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  drawer: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

export type ZIndexToken = keyof typeof zIndex;
