import { motion } from 'motion/react'
import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { lineText, SayButton, say, type Line } from '../../sdk'

/** Activity layout: a full-bleed picture, a spoken prompt under the top bar, then the play area.
 *  `scene` is a drawn backdrop instead of the `bg` picture (like StoryBeat's). It fills the screen behind the play
 *  area and its own buttons (a sun, a cloud) can be tapped: the play area then only catches touches on what's in it, so
 *  give the things she plays with `pointerEvents: 'auto'`. */
export function Stage({ bg, scene, prompt, children, style }: { bg?: string; scene?: ReactNode; prompt?: Line; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--lavender)',
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 12px)',
        gap: 12,
        overflow: 'hidden',
        ...style,
      }}
    >
      {scene && <div style={{ position: 'absolute', inset: 0 }}>{scene}</div>}
      {prompt && <PromptBubble text={prompt} />}
      <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: scene ? 'none' : undefined }}>{children}</div>
    </div>
  )
}

/** Short instruction that is spoken when it appears and can be heard again. */
export function PromptBubble({ text, speak = true }: { text: Line; speak?: boolean }) {
  useEffect(() => {
    if (speak) void say(text)
  }, [text, speak])
  return (
    <motion.div
      key={lineText(text)}
      className="stage-prompt"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        background: 'rgba(255,255,255,0.94)',
        borderRadius: 'var(--radius)',
        padding: '8px 10px 8px 22px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 'min(900px, 100%)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 5,
      }}
    >
      <p style={{ fontSize: 'var(--prompt-font)', fontWeight: 600, lineHeight: 1.15 }}>{lineText(text)}</p>
      <div style={{ width: 'var(--say-size)', height: 'var(--say-size)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        <SayButton text={text} size={56} />
      </div>
    </motion.div>
  )
}

/** A friendly wiggle for wrong answers: `animate={wiggling ? WIGGLE : {}}`. */
export const WIGGLE = { x: [0, -14, 14, -10, 10, 0], rotate: [0, -6, 6, -4, 4, 0], transition: { duration: 0.5 } }
