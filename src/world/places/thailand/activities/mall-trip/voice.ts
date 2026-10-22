// Who speaks in the mall trip: every screen's world says its lines (lines.ts `L.mall`) through here, and MallTrip.tsx
// points it at Sparkle's corner guide (trip/legs/Guide.tsx), which plays the recorded voice and shows the words with
// who said them. Until it's mounted (a screen on its own), a line just plays.
import { say, type Line } from '../../../../../sdk'

export const mallVoice = {
  say(l: Line) {
    void say(l)
  },
}
