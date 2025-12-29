import { defineConfig, presetUno, presetTypography } from 'unocss';

export default defineConfig({
  // Issue #180 - Enable class-based dark mode
  presets: [
    presetUno({
      dark: 'class'
    }),
    presetTypography()
  ],
  theme: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      danger: '#ef4444',
      dark: '#1e293b',
      light: '#f1f5f9'
    }
  }
});
