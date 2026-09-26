import { motion } from 'motion/react'
import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { SayButton, say } from '../../sdk'

/** Activity layout: a full-bleed picture, a spoken prompt under the top bar, then the play area. */
export function Stage({ bg, prompt, children, style }: { bg: string; prompt?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--lavender)',
        backgroundImage: `url(${bg})`,
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
      {prompt && <PromptBubble text={prompt} />}
      <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  )
}

/** Short instruction that is spoken when it appears and can be heard again. */
export function PromptBubble({ text, speak = true }: { text: string; speak?: boolean }) {
  useEffect(() => {
    if (speak) void say(text)
  }, [text, speak])
  return (
    <motion.div
      key={text}
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
      <p style={{ fontSize: 'var(--prompt-font)', fontWeight: 600, lineHeight: 1.15 }}>{text}</p>
      <div style={{ width: 'var(--say-size)', height: 'var(--say-size)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        <SayButton text={text} size={56} />
      </div>
    </motion.div>
  )
}

/** A friendly wiggle for wrong answers: `animate={wiggling ? WIGGLE : {}}`. */
export const WIGGLE = { x: [0, -14, 14, -10, 10, 0], rotate: [0, -6, 6, -4, 4, 0], transition: { duration: 0.5 } }
