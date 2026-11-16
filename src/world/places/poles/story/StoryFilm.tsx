// Plays one of the Poles' story films (story/films.ts) on the film stage (story/stage.ts), full screen: the 3D
// picture, the words under it with the speaker's chip, the storybook look for a memory and the hold-to-skip ⏭
// (engine3d/FilmOverlay). `onDone` is called once, when the film ends or is skipped.
import { useRef, useState } from 'react'
import type { Line } from '../../../../sdk'
import { Anchors } from '../../../engine3d/Anchors'
import type { FilmState } from '../../../engine3d/film'
import { FilmOverlay, type Speaker } from '../../../engine3d/FilmOverlay'
import { View3D, type RenderMode } from '../../../engine3d/View3D'
import { FILMS, type FilmId } from './films'
import { STORY_ANCHORS, StoryStage } from './stage'

/** Who each voice is (the chip beside a film's words). */
export const WHO: Record<string, Speaker> = {
  pola: { name: 'Pola', icon: '🐻‍❄️', color: '#BFE3FF' },
  mama: { name: 'Mama Bear', icon: '🐻‍❄️', color: '#FFD3E6' },
  pebble: { name: 'Pebble', icon: '🐧', color: '#D9CCFF' },
  papa: { name: 'Papa', icon: '🐧', color: '#FFC83D' },
  terry: { name: 'Terry', icon: '🐦', color: '#8FE3C8' },
  nari: { name: 'Nari', icon: '🦄', color: '#A8DCFF' },
}

export function StoryFilm({ id, onDone }: { id: FilmId; onDone: () => void }) {
  const [mode, setMode] = useState<RenderMode>('webgl')
  const [film, setFilm] = useState<FilmState | null>(null)
  const [line, setLine] = useState<Line | null>(null)
  const worldRef = useRef<StoryStage | null>(null)
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    // (After this frame: the stage is still inside its own update when it says so.)
    setTimeout(onDone, 0)
  }
  return (
    <div data-story-film={id} style={{ position: 'absolute', inset: 0, background: '#1B1622', overflow: 'clip', zIndex: 50 }}>
      <View3D
        name="The story"
        qaKey="__polesStoryQA"
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
