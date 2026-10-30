import { useState } from 'react'
import { useRoute } from './router'
import { GameFrame } from './shell/GameFrame'
import { Playground } from './shell/Playground'
import { Splash } from './shell/Splash'
import { World } from './world/World'

export default function App() {
  const route = useRoute()
  const [started, setStarted] = useState(false)

  if (!started) return <Splash onStart={() => setStarted(true)} />
  switch (route.name) {
    case 'game':
      return <GameFrame id={route.id} />
    case 'playground':
      return <Playground />
    case 'world':
      return <World place={route.place} activity={route.activity} section={route.section} params={route.params} />
    default:
      // Around the World is the home screen: "Let's play!" lands on the world map.
      return <World />
  }
}
