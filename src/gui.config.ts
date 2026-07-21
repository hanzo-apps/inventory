/**
 * The @hanzo/gui (Tamagui) v5 config. `createGui(defaultConfig)` enables the
 * shorthand style props (gap/padding/bg/rounded/…) and design tokens the gui
 * primitives render against. Passed once to <GuiProvider> in providers.tsx.
 */
import { defaultConfig } from '@hanzogui/config/v5'
import { createGui } from '@hanzo/gui'

export const config = createGui(defaultConfig)

export default config
