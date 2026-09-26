// Runs one country: loads its Place component, draws the top bar, saves stamps, and shows the trophy ceremony.
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import posthog, { isPostHogEnabled } from '../posthog'
import { go } from '../router'
import { Mascot, StarProgress, stopSpeaking, type GameMeta } from '../sdk'
import { WinCeremony } from '../shell/WinCeremony'
import { BarPill, TopBar } from './kit/Chrome'
import { findPlace, type PlaceEntry } from './registry'
import { addStamp, markVisited, resetPassport, setStamps, usePassport } from './stamps'
import type { PlaceMeta } from './types'

declare global {
  interface Window {
    /** Test/dev hooks for Around the World. */
    __kayleeWorld?: { stampAll: () => void; reset: () => void; /** Finishes the open activity (set by the country). */ finish?: () => void }
  }
}

const capture = (event: string, props: Record<string, unknown>) => {
  if (isPostHogEnabled) posthog.capture(event, props)
}

/** The shell's trophy ceremony takes a GameMeta; a country trophy only needs the name parts. */
const trophyMeta = (meta: PlaceMeta): GameMeta => ({
  id: `world-${meta.id}`,
  title: meta.name,
  emoji: meta.emoji,
  cover: meta.friend.img,
  subject: 'social studies: around the world',
  skills: [],
  vocabulary: [],
  mechanic: '',
  setting: '',
  source: { pages: [] },
  createdAt: meta.createdAt,
  trophyTitle: meta.trophyTitle,
})

function RunningPlace({ entry, activity }: { entry: PlaceEntry; activity?: string }) {
  const { meta } = entry
  const Place = useMemo(() => lazy(entry.load), [entry])
  const passport = usePassport()
  const stamps = passport.stamps[meta.id] ?? []
  const [won, setWon] = useState(false)
  const [progress, setProgressState] = useState({ done: 0, total: 0 })

  const setProgress = useCallback((done: number, total: number) => setProgressState({ done, total }), [])
  const backToMap = useCallback(() => go.world(meta.id), [meta.id])
  const openActivity = useCallback((id: string) => go.world(meta.id, id), [meta.id])
  const earnStamp = useCallback(
    (id: string) => {
      if (addStamp(meta.id, id)) capture('world_activity_completed', { place_id: meta.id, activity_id: id, stamp_count: stamps.length + 1 })
    },
    [meta.id, stamps.length],
  )
  const onWin = useCallback(() => {
    capture('world_trophy_won', { place_id: meta.id })
    setWon(true)
  }, [meta.id])

  useEffect(() => {
    capture('world_place_opened', { place_id: meta.id, stamp_count: stamps.length })
    markVisited(meta.id)
    // Only when she arrives, not every time a stamp is added.
  }, [meta.id])

  useEffect(() => {
    setProgressState({ done: 0, total: 0 })
    if (activity) capture('world_activity_started', { place_id: meta.id, activity_id: activity })
  }, [activity, meta.id])

  useEffect(() => {
    window.__kaylee = { win: onWin }
    window.__kayleeWorld = { stampAll: () => setStamps(meta.id, meta.activities.map((a) => a.id)), reset: resetPassport }
    return () => {
      delete window.__kaylee
      delete window.__kayleeWorld
      stopSpeaking()
    }
  }, [onWin, meta])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Suspense
        fallback={
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'var(--lavender)' }}>
            <Mascot pose="think" />
          </div>
        }
      >
        <Place meta={meta} activity={activity} stamps={stamps} openActivity={openActivity} backToMap={backToMap} earnStamp={earnStamp} onWin={onWin} setProgress={setProgress} />
      </Suspense>

      {/* The theater draws its own top bar (its back button goes to the shelf while a video plays). */}
      {activity === 'theater' ? null : activity ? (
        <TopBar icon="🗺️" label="Back to the map" onBack={backToMap}>
          {progress.total > 0 && (
            <BarPill>
              <StarProgress done={progress.done} total={progress.total} size="clamp(22px, min(6vw, 6vh), 34px)" />
            </BarPill>
          )}
        </TopBar>
      ) : (
        <TopBar icon="🌍" label="World map" onBack={() => go.world()}>
          <BarPill>
            📕 {stamps.length}/{meta.activities.length}
          </BarPill>
        </TopBar>
      )}

      {won && (
        <WinCeremony
          meta={trophyMeta(meta)}
          onPlayAgain={() => {
            setWon(false)
            backToMap()
          }}
          onHome={() => go.world()}
          onTrophies={go.trophies}
        />
      )}
    </div>
  )
}

export function PlaceFrame({ id, activity }: { id: string; activity?: string }) {
  const entry = findPlace(id)
  useEffect(() => {
    if (!entry) go.world()
  }, [entry])
  return entry ? <RunningPlace key={id} entry={entry} activity={activity} /> : null
}
