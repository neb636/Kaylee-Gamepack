import posthog, { type BeforeSendFn } from 'posthog-js'
import { keepOffline, startOutbox } from './analytics-outbox'
import { reportStorage } from './storage-report'

const apiKey = import.meta.env.VITE_POSTHOG_KEY
const apiHost = import.meta.env.VITE_POSTHOG_HOST
const enabledForBuild = import.meta.env.VITE_POSTHOG_ENABLED === 'true'

export const isPostHogEnabled = enabledForBuild && Boolean(apiKey && apiHost)

// Who is playing (docs/play-data.md). The game is built for one child: her devices are the target audience, and their
// play data decides what gets built, fixed or retired. Testers (the user's own devices) send errors only.
//   ?target_audience=1 / ?target_audience=0   tags or untags this browser as hers
//   ?tester=1 / ?tester=0                      tags or untags this browser as a tester's
// Her iPad was found in the data before there was a tag (2026-11-21): its anonymous ids tag it on its next launch.
const TARGET_AUDIENCE_IDS = new Set([
  '01a1d15e-e84c-7f57-9643-727cd59f29e5', // her iPad's Home Screen app, since 2026-11-12
  '01a17bf5-be61-78c6-96d3-10f54e01ffb3', // her iPad in Safari, 2026-10-27 to 2026-11-12
])
const TARGET_AUDIENCE_ID = 'target-audience'
// The user's devices, found the same way. A Home Screen app has no address bar and keeps its own storage apart from
// Safari's, so `?tester=1` can't reach it: its anonymous id tags it on its next launch instead.
const TESTER_IDS = new Set([
  '01a15e62-2191-7f6e-8f7f-de8eac4c1aec', // the user's iPhone (402×874), Home Screen app
  '01a1cf62-d52a-7cf8-9a3d-8f43a75893b9', // the user's old iPhone 14 Pro (393×852), Home Screen app
])

/** This browser's PostHog id from the last launch, read before init (posthog-js keeps it in localStorage). */
function savedDistinctId(): string | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(`ph_${apiKey}_posthog`) ?? '{}') as { distinct_id?: unknown }
    return typeof saved.distinct_id === 'string' ? saved.distinct_id : undefined
  } catch {
    return undefined
  }
}

/** Which tags this launch's URL cleared (`?param=0`): PostHog's own copy of them is cleared after init too. */
const cleared = new Set<string>()

/**
 * Reads (and, from `?param=1|0`, saves or clears) a per-browser tag. The param is taken off the URL. It works before
 * the `#` (`…/?tester=1#/world`) and inside the hash route's own query (`…/#/world/thailand?tester=1`), where every
 * deep link keeps its state: until 2026-11-21 only the first worked, so a tag typed onto a game link did nothing.
 */
function tag(key: string, param: string): boolean {
  try {
    const url = new URL(location.href)
    const [route, routeQuery] = url.hash.split('?')
    const hashParams = new URLSearchParams(routeQuery ?? '')
    const value = url.searchParams.get(param) ?? hashParams.get(param)
    if (value === '1') localStorage.setItem(key, '1')
    if (value === '0') {
      localStorage.removeItem(key)
      cleared.add(param)
    }
    if (value !== null) {
      url.searchParams.delete(param)
      hashParams.delete(param)
      const rest = hashParams.toString()
      url.hash = rest ? `${route}?${rest}` : route
      history.replaceState(history.state, '', url)
    }
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

const saveTag = (key: string) => {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // Storage blocked: the known ids still tag her on the next launch.
  }
}

const taggedTester = isPostHogEnabled && tag('gamepack.tester', 'tester')
const knownTester = isPostHogEnabled && !taggedTester && !cleared.has('tester') && TESTER_IDS.has(savedDistinctId() ?? '')
if (knownTester) saveTag('gamepack.tester')
export const isTester = taggedTester || knownTester
let isTargetAudience = isPostHogEnabled && !isTester && tag('gamepack.target-audience', 'target_audience')

/** Testers send nothing but errors. */
const errorsOnlyForTesters: BeforeSendFn = (cr) => (!isTester || cr.event === '$exception' ? cr : null)

/** Every event from her devices says so, from the very first pageview. */
const markTargetAudience: BeforeSendFn = (cr) => {
  if (!isTester && !isTargetAudience && !cleared.has('target_audience') && TARGET_AUDIENCE_IDS.has(posthog.get_distinct_id())) isTargetAudience = true
  if (isTargetAudience) cr.properties = { ...cr.properties, target_audience: true }
  if (isTester) cr.properties = { ...cr.properties, tester: true }
  return cr
}

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
      autocapture: !isTester,
      rageclick: !isTester,
      ...(isTester ? { capture_pageview: false, capture_pageleave: false, disable_session_recording: true } : {}),
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: true,
      },
      logs: {
        serviceName: 'kaylee-gamepack-web',
        environment: import.meta.env.MODE,
      },
      before_send: [errorsOnlyForTesters, markTargetAudience, keepOffline],
    })
    // An untagged browser forgets the tag everywhere: the saved property, and her shared identity (a fresh anonymous id).
    if (cleared.has('tester')) posthog.unregister('tester')
    if (cleared.has('target_audience')) {
      posthog.unregister('target_audience')
      if (posthog.get_distinct_id() === TARGET_AUDIENCE_ID) posthog.reset()
    }
    if (isTester) {
      posthog.register({ tester: true })
    } else if (isTargetAudience || (!cleared.has('target_audience') && TARGET_AUDIENCE_IDS.has(posthog.get_distinct_id()))) {
      // One person for all her devices, so a device whose storage iOS cleared joins her again once it's tagged.
      isTargetAudience = true
      saveTag('gamepack.target-audience')
      posthog.register({ target_audience: true })
      if (posthog.get_distinct_id() !== TARGET_AUDIENCE_ID) posthog.identify(TARGET_AUDIENCE_ID, { target_audience: true })
    }
    // Events saved offline before this browser became a tester's follow today's rule: errors only, marked as a tester's.
    startOutbox(apiHost, apiKey, (e) => (!isTester ? e : e.event === '$exception' ? { ...e, properties: { ...e.properties, tester: true } } : null))
    void reportStorage((event, props) => posthog.capture(event, props))
  }
}

export default posthog
