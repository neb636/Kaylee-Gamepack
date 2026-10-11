// What fills this activity's window in Luna's explorer journal once she has its stamp (found automatically by Place.tsx).
import { art } from './art'

export default function JournalTile() {
  return (
      // Pepa and her three round chicks, porpoising home.
      <img src={art.pepa} alt="" style={{ height: '88%', maxWidth: '90%', objectFit: 'contain' }} />
  )
}
