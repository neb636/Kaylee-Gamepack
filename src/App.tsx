import { useState } from 'react'
import { useRoute } from './router'
import { GameFrame } from './shell/GameFrame'
import { Home } from './shell/Home'
import { Playground } from './shell/Playground'
import { Splash } from './shell/Splash'
import { TrophyRoom } from './shell/TrophyRoom'
import { World } from './world/World'

export default function App() {
  const route = useRoute()
  const [started, setStarted] = useState(false)

  if (!started) return <Splash onStart={() => setStarted(true)} />
  switch (route.name) {
    case 'game':
      return <GameFrame id={route.id} />
    case 'trophies':
      return <TrophyRoom />
    case 'playground':
      return <Playground />
    case 'world':
      return <World place={route.place} activity={route.activity} />
    default:
      return <Home />
  }
}
