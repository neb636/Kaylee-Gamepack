export type SceneKind = 'camp' | 'beach' | 'fair' | 'snow' | 'market'
export interface SeekScene {
  id: SceneKind
  title: string
  emoji: string
  sky: string
  ground: string
  colors: string[]
  targets: [number, number][]
}
export const scenes: SeekScene[] = [
  { id: 'camp', title: 'Campground Adventure', emoji: '⛺', sky: '#b6e4eb', ground: '#b1d298', colors: ['#edb477', '#b5cfac', '#d89fad'], targets: [[190, 292], [680, 250], [1055, 365], [435, 535], [895, 595]] },
  { id: 'beach', title: 'Busy Beach Day', emoji: '🏖️', sky: '#b8e9f4', ground: '#f8dea2', colors: ['#f5d39b', '#b8dce8', '#edbcad'], targets: [[320, 245], [990, 270], [600, 380], [160, 525], [830, 610]] },
  { id: 'fair', title: 'Woodland Fun Fair', emoji: '🎡', sky: '#cbdaf5', ground: '#c2dca5', colors: ['#c0b3db', '#e8c794', '#aad1ae'], targets: [[205, 260], [720, 290], [1040, 440], [380, 545], [785, 625]] },
  { id: 'snow', title: 'Snowy Village', emoji: '⛄', sky: '#ccdce9', ground: '#eff5fa', colors: ['#d4e2eb', '#d6bfcf', '#b9d6cf'], targets: [[350, 285], [930, 250], [650, 450], [160, 600], [1040, 615]] },
  { id: 'market', title: 'Flower Market', emoji: '🌷', sky: '#d6e9dc', ground: '#e4d0bb', colors: ['#dbb2c3', '#b7cda4', '#eacb98'], targets: [[155, 280], [645, 265], [1060, 395], [370, 540], [845, 610]] },
]
