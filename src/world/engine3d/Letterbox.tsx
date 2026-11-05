// The cinema camera's letterbox (cinema.ts): two dark bars that slide in at the top and bottom while a cutscene has
// the camera, and slide away when the game's camera is back. Only a picture: taps go straight through to the world and
// its tap targets underneath.
export function Letterbox({ on }: { on: boolean }) {
  const bar = (top: boolean) => ({
    position: 'absolute' as const,
    left: 0,
    right: 0,
    [top ? 'top' : 'bottom']: 0,
    height: 'min(9%, 96px)',
    background: '#1B1622',
    transform: on ? 'translateY(0)' : `translateY(${top ? '-101%' : '101%'})`,
    transition: 'transform 0.6s cubic-bezier(.2,.8,.2,1)',
    pointerEvents: 'none' as const,
    zIndex: 5,
  })
  return (
    <>
      <div aria-hidden style={bar(true)} />
      <div aria-hidden style={bar(false)} />
    </>
  )
}
