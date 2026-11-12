// Everything a game needs. Games import ONLY from here (and their own folder):
//   import { say, sounds, SparklePuppet } from '../../sdk'

export { DEVICE, IS_MOUSE, onDevice, type Device } from './device'
export { say, stopSpeaking, lineMs, lineText, lineVoice, speechLevel, speakingVoice, type Line, type SayOptions } from './speech'
export { sounds } from './sounds'
export { burst, bigCelebration } from './confetti'
export { KID_NAME, wait, pick, shuffle, sample, numberWord } from './helpers'
export { useAlive, useSayOnMount, useLandscape, useElementSize, useGameLoop, useSaved } from './hooks'
export { useOnline } from './online'
export { spendHint, firstTime, HINT_SPOKEN, HINT_GAP_S } from './hints'
export { usePuppet, spring, setT, setA, show, clamp, lerp, smooth, bell, span, wobble, type PuppetFrame, type PuppetHandle, type PuppetOptions } from './puppet/core'
export { Buddy, type BuddyAction } from './puppet/Buddy'
export { SparklePuppet, SPARKLE_ACTIONS, type SparkleAction, type SparklePuppetProps } from './puppet/Sparkle'

export { BigButton, type BigButtonProps } from './components/BigButton'
export { ChoiceCards, type Choice, type ChoiceCardsProps } from './components/ChoiceCards'
export { DragArea, Draggable, DropZone, type DraggableProps } from './components/Drag'
export { Mascot, type MascotPose } from './components/Mascot'
export { StarProgress } from './components/StarProgress'
export { SayButton } from './components/SayButton'
export { Trophy } from './components/Trophy'

// Advanced interactions (see docs/interactions.md): pointer dragging, snapping, place-anywhere.
export { usePointerDrag, toLocal, centerOf, distance, type DragInfo, type PointerDragOptions } from './interact/pointer'
export { PlayArea, Piece, Target, type PieceProps, type TargetProps, type Drop, type PlaceResult } from './interact/PlayArea'
export { JigsawPuzzle, type JigsawPuzzleProps } from './interact/JigsawPuzzle'
export { StickerBoard, type Sticker, type Placed, type StickerBoardProps } from './interact/StickerBoard'
