// What fills this activity's window in Luna's explorer journal once she has its stamp (found automatically by Place.tsx).
import { Tika } from '../../puppets/Tika'

export default function JournalTile() {
  return (
      // Tika's photobomb at Machu Picchu.
      <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(#A8DCFF 0 55%, #8FD86F 55%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <Tika height="94%" pose="grin" />
      </div>
  )
}
