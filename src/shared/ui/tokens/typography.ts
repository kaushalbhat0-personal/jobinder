export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: 700 }],
    'display-md': ['2.25rem', { lineHeight: '1.3', fontWeight: 700 }],
    'heading-lg': ['1.875rem', { lineHeight: '1.3', fontWeight: 600 }],
    'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: 600 }],
    'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: 600 }],
    'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: 400 }],
    'body-md': ['1rem', { lineHeight: '1.6', fontWeight: 400 }],
    'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: 400 }],
    caption: ['0.75rem', { lineHeight: '1.5', fontWeight: 400 }],
    label: [
      '0.75rem',
      {
        lineHeight: '1.5',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
      },
    ],
  },
} as const;

export type TypographyToken = keyof typeof typography.fontSize;
