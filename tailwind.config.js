/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Existing brand scales (kept for backward compat with patient theme)
        primary: {
          50: '#fdf2fc',
          100: '#fae6f9',
          200: '#f5ccf2',
          300: '#eda3e6',
          400: '#e06dd4',
          500: '#c946b8',
          600: '#a32d96',
          700: '#89007a',
          800: '#6d0062',
          900: '#5a0051',
          950: '#3a0034',
        },
        secondary: {
          50: '#f0f7fe',
          100: '#deeefc',
          200: '#c4e1fa',
          300: '#9ccef6',
          400: '#6db4ef',
          500: '#459fdc',
          600: '#3384c9',
          700: '#2a6ba8',
          800: '#275a8a',
          900: '#244c6e',
          950: '#183049',
        },
        accent: {
          50: '#fdf2f9',
          100: '#fce7f5',
          200: '#fad0ec',
          300: '#f5a9dc',
          400: '#ec74c4',
          500: '#C25BAB',
          600: '#a83d8e',
          700: '#8e2d74',
          800: '#75275f',
          900: '#632551',
          950: '#3c0f2f',
        },
        navy: '#061b42',
        footer: '#c8dfff',

        // Neutral scale (zinc-aligned, for B2B Swiss aesthetic)
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },

        // Semantic color bridges to CSS variables (theme-aware)
        surface: {
          DEFAULT: 'var(--color-bg-primary)',
          alt: 'var(--color-bg-secondary)',
          subtle: 'var(--color-bg-tertiary)',
          inverse: 'var(--color-bg-inverse)',
          elevated: 'var(--color-bg-elevated)',
        },
        ink: {
          DEFAULT: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          link: 'var(--color-text-link)',
          'link-hover': 'var(--color-text-link-hover)',
        },
        edge: {
          DEFAULT: 'var(--color-border-primary)',
          subtle: 'var(--color-border-secondary)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
        accentp: {
          // accent-primary token bridge (separate alias to avoid Tailwind `accent` collision)
          DEFAULT: 'var(--color-accent-primary)',
          hover: 'var(--color-accent-primary-hover)',
          active: 'var(--color-accent-primary-active)',
          fg: 'var(--color-accent-primary-fg)',
          subtle: 'var(--color-accent-primary-subtle)',
        },
      },
      fontFamily: {
        sans: ['var(--font-cabin)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-cabin)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cabin)', 'system-ui', 'sans-serif'],
        cabin: ['var(--font-cabin)', 'system-ui', 'sans-serif'],
        // Aliases — Fraunces/Inter were swapped out for Cabin in the patient redesign;
        // these aliases let any leftover class compile to Cabin instead of breaking.
        fraunces: ['var(--font-cabin)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-cabin)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Add Swiss display sizes (extends Tailwind defaults)
        '5xl-display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '6xl-display': ['6rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '7xl-display': ['7.5rem', { lineHeight: '1.0', letterSpacing: '-0.015em' }],
      },
      aspectRatio: {
        portrait: '4 / 5',
        landscape: '3 / 2',
        wide: '16 / 9',
        cinema: '21 / 9',
      },
      borderRadius: {
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
        card: 'var(--radius-card)',
      },
      boxShadow: {
        focus: 'var(--shadow-focus)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms',
        slow: '320ms',
        slower: '500ms',
      },
      transitionTimingFunction: {
        emphatic: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      maxWidth: {
        prose: '65ch',
        wide: '1280px',
        page: '1440px',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
