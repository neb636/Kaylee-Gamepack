// Plays one of the films of Maple's Team (story/films/) on the film stage (story/stage.ts), full screen: the 3D
// picture, the words under it with the speaker's chip, the storybook look for a memory and the hold-to-skip ⏭
// (engine3d/FilmOverlay). `onDone` is called once, when the film ends or is skipped.
import { useRef, useState } from 'react'
import { useTimers, type Line } from '../../../../sdk'
import { Anchors } from '../../../engine3d/Anchors'
import type { FilmState } from '../../../engine3d/film'
import { FilmOverlay, type Speaker } from '../../../engine3d/FilmOverlay'
import { View3D, type RenderMode } from '../../../engine3d/View3D'
import type { FilmId } from '../activities/story/sections'
import { FILMS } from './films'
import { STORY_ANCHORS, StoryStage } from './stage'

/** Who each voice is (the chip beside a film's words). */
export const WHO: Record<string, Speaker> = {
  maple: { name: 'Maple', icon: '🦫', color: '#FFC2D6' },
  moose: { name: 'Monty', icon: '🫎', color: '#E2C9A8' },
  raccoon: { name: 'Roxy', icon: '🦝', color: '#D9D4E6' },
  snowman: { name: 'Tuque', icon: '⛄', color: '#FFD3CF' },
  otter: { name: 'Ollie', icon: '🦦', color: '#BFE9F5' },
  bear: { name: 'Misty', icon: '🐻‍❄️', color: '#FFF1D6' },
  loon: { name: 'Lulu', icon: '🎵', color: '#CFE0FF' },
  gus: { name: 'Gus', icon: '🪿', color: '#BFD9FF' },
}

export function StoryFilm({ id, onDone }: { id: FilmId; onDone: () => void }) {
  const timers = useTimers()
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [film, setFilm] = useState<FilmState | null>(null)
  const [line, setLine] = useState<Line | null>(null)
  const worldRef = useRef<StoryStage | null>(null)
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    // (After this frame: the stage is still inside its own update when it says so.)
    timers.later(onDone, 0)
  }
  return (
    <div data-story-film={id} style={{ position: 'absolute', inset: 0, background: '#1B1622', overflow: 'clip', zIndex: 50 }}>
      <View3D
        name="The story"
        qaKey="__canadaStoryQA"
        worldRef={worldRef}
        onMode={(m) => {
          setMode(m)
          // (A lost picture mustn't trap her in a film: go on.)
          if (m === 'lost') finish()
        }}
        make={(renderer) => new StoryStage(renderer, FILMS[id], { line: setLine, film: setFilm, done: finish })}
        anchors={(input, els) => <Anchors list={STORY_ANCHORS} els={els} {...input} />}
      />
      {mode === 'webgl' && <FilmOverlay state={film} line={line} speaker={(v) => WHO[v]} onSkip={() => worldRef.current?.skipFilm()} />}
    </div>
  )
}
