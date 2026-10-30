// Who's who in Thailand's dialogue: each speaker's name, their animal and their color, for the bubbles' name tabs,
// the dialogue cards' portraits and the name tags over the family in the house (keyed by voice id, as in cast.json).
import type { Speaker } from '../../../sdk'

export const WHO: Record<string, Speaker> = {
  ji: { name: 'Mommy', icon: '🦄', color: '#FF8FB8' },
  nick: { name: 'Daddy', icon: '🦄', color: '#7FD1B9' },
  agong: { name: 'Agong', icon: '🐼', color: '#B9A6F5' },
  jum: { name: 'Jum', icon: '🐘', color: '#FFB3CF' },
  gan: { name: 'Gan', icon: '🦊', color: '#7CC4F2' },
  ken: { name: 'Ken', icon: '🦊', color: '#8FE3C8' },
  bb: { name: 'BB', icon: '🐃', color: '#FFB3D6' },
  joy: { name: 'Joy', color: '#FFC2A8' },
  bird: { name: 'Bird', color: '#A8DCFF' },
  kaylee: { name: 'Kaylee', icon: '🦄', color: '#D9CCFF' },
  sparkle: { name: 'Sparkle', icon: '🦄', color: '#FF8FB8' },
  sri: { name: 'Aunty Sri', icon: '🐦', color: '#FFC83D' },
  officer: { name: 'Officer', icon: '🐘', color: '#A8B4E8' },
  attendant: { name: 'Flight attendant', icon: '🐧', color: '#FFD3E6' },
  kids: { name: 'The kids', icon: '⚽', color: '#FFD27A' },
  coach: { name: 'Coach', icon: '🐒', color: '#FF8A8A' },
  staff: { name: 'HarborLand', icon: '🐃', color: '#FFD27A' },
  server: { name: 'The Pizza Company', icon: '🦊', color: '#8FD9A8' },
  kid: { name: 'A friend', icon: '🧒', color: '#A8DCFF' },
  farmer: { name: 'Mushroom aunty', icon: '🐃', color: '#8FE3C8' },
  saltaunty: { name: 'Salt aunty', icon: '🐴', color: '#9FD3F7' },
  lung: { name: 'Lung Kham', icon: '🐒', color: '#7FA8E0' },
}
