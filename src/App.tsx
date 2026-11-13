import { useState } from 'react'
import { useRoute } from './router'
import { Splash } from './shell/Splash'
import { World } from './world/World'
import { ErrorCard } from './shell/ErrorCard'
import { HalloweenMusic } from './shell/seasonal/HalloweenMusic'

export default function App() {
  const route = useRoute()
  // The splash's tap unlocks audio on the iPad, so every build starts there.
  const [started, setStarted] = useState(false)

  return <>
    <HalloweenMusic started={started} route={route} />
    {started ? <ErrorCard><StartedApp route={route} /></ErrorCard> : <Splash onStart={() => setStarted(true)} />}
  </>
}

function StartedApp({ route }: { route: ReturnType<typeof useRoute> }) {
  switch (route.name) {
    case 'world':
      return <World place={route.place} activity={route.activity} section={route.section} params={route.params} />
    default:
      // Around the World is the home screen: "Let's play!" lands on the world map.
      return <World />
  }
}
