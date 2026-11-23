import { defineConfig, devices } from '@playwright/test'

const hostedUrl = process.env.E2E_BASE_URL
const basePath = '/viajes-lucas-aviles-PFY2202/'
const localOrigin = 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: hostedUrl || `${localOrigin}${basePath}`, trace: 'retain-on-failure' },
  webServer: hostedUrl ? undefined : {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    env: { VITE_BASE_PATH: basePath },
    url: `${localOrigin}${basePath}`,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'] } },
  ],
})
