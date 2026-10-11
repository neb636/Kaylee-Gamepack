// What fills this activity's window in Luna's explorer journal once she has its stamp (found automatically by Place.tsx).
import { art } from './art'

export default function JournalTile() {
  return (
      // Coco and Pluma, wingtip to wingtip.
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '2%' }}>
        <img src={art.coco} alt="" style={{ width: '58%', maxHeight: '90%', objectFit: 'contain' }} />
        <img src={art.pluma} alt="" style={{ width: '32%', maxHeight: '70%', objectFit: 'contain' }} />
      </div>
  )
}
