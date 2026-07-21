import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Hanzo starter — Vite config.
 *
 * @hanzo/gui is the Tamagui line: its runtime resolves styles against
 * react-native-web. The IN-BROWSER builder runtime can't do this, which is
 * exactly why a real-stack template ships as a real repo built here. Three
 * things make @hanzo/gui compile + render under plain Vite (no Tamagui compiler,
 * no `one`, no Expo — the optimizer is a perf pass, not a correctness one):
 *   1. alias `react-native` -> `react-native-web` (gui imports RN primitives),
 *   2. define `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`
 *      (Tamagui core reads these; Vite doesn't shim `process.env` for the client),
 *   3. dedupe react / react-dom / react-native-web to one copy.
 */
export default defineConfig(({ mode }) => {
  const dev = mode !== 'production'
  return {
    plugins: [react()],
    define: {
      'process.env.TAMAGUI_TARGET': JSON.stringify('web'),
      'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
      __DEV__: JSON.stringify(dev),
    },
    resolve: {
      alias: { 'react-native': 'react-native-web' },
      dedupe: ['react', 'react-dom', 'react-native-web'],
    },
    optimizeDeps: {
      include: ['@hanzo/gui', '@hanzogui/config', 'react-native-web'],
    },
  }
})
