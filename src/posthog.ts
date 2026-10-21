import posthog from 'posthog-js'

const apiKey = import.meta.env.VITE_POSTHOG_KEY
const apiHost = import.meta.env.VITE_POSTHOG_HOST
const enabledForBuild = import.meta.env.VITE_POSTHOG_ENABLED === 'true'

export const isPostHogEnabled = enabledForBuild && Boolean(apiKey && apiHost)

if (enabledForBuild) {
  const missingEnvironmentVariable = !apiKey ? 'VITE_POSTHOG_KEY' : !apiHost ? 'VITE_POSTHOG_HOST' : undefined
  if (missingEnvironmentVariable) {
    throw new Error(
      `${missingEnvironmentVariable} is required when PostHog is enabled for this build`,
    )
  }
  if (apiKey && apiHost) {
    posthog.init(apiKey, {
      api_host: apiHost,
      defaults: '2026-05-30',
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      },
      logs: {
        serviceName: 'kaylee-gamepack-web',
        environment: import.meta.env.MODE,
      },
    })
  }
}

export default posthog
