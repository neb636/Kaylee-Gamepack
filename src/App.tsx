import { useState } from 'react'
import { useRoute } from './router'
import { GameFrame } from './shell/GameFrame'
import { Home } from './shell/Home'
import { Playground } from './shell/Playground'
import { Splash } from './shell/Splash'
import { TrophyRoom } from './shell/TrophyRoom'

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
    default:
      return <Home />
  }
}
