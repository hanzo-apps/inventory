import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './providers'
import { App } from './app'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')

createRoot(root).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
