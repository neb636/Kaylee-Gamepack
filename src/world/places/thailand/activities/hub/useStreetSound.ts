import { useEffect } from 'react'
import { speakingVoice } from '../../../../../sdk'

const between = (a: number, b: number) => a + Math.random() * (b - a)

/** A busy soi: distant road noise, revving scooters, cars and occasional soft horns.
 * Owns the graph so entering the house or leaving Thailand stops every sound. */
export function useStreetSound(outside: boolean) {
  useEffect(() => {
    if (!outside || typeof AudioContext === 'undefined') return
    const audio = new AudioContext()
    const master = audio.createGain()
    master.gain.value = 0
    master.connect(audio.destination)
    const buffer = audio.createBuffer(1, audio.sampleRate * 3, audio.sampleRate)
    const samples = buffer.getChannelData(0)
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1

    function roadNoise(cutoff: number, volume: number, output: AudioNode) {
      const source = audio.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const filter = audio.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = cutoff
      const gain = audio.createGain()
      gain.gain.value = volume
      source.connect(filter).connect(gain).connect(output)
      source.start(0, between(0, 3))
      return { source, filter, gain }
    }
    // A quiet bed keeps the street alive between nearby vehicles.
    roadNoise(650, 0.11, master)
    roadNoise(180, 0.15, master)

    function pass(motorbike: boolean) {
      const t = audio.currentTime
      const duration = motorbike ? between(4, 6) : between(6, 8)
      const envelope = audio.createGain()
      envelope.gain.setValueAtTime(0, t)
      envelope.gain.linearRampToValueAtTime(motorbike ? 0.23 : 0.16, t + duration * 0.4)
      envelope.gain.exponentialRampToValueAtTime(0.001, t + duration)
      const pan = audio.createStereoPanner()
      const direction = Math.random() < 0.5 ? -1 : 1
      pan.pan.setValueAtTime(direction * 0.8, t)
      pan.pan.linearRampToValueAtTime(-direction * 0.8, t + duration)
      envelope.connect(pan).connect(master)

      const engine = audio.createOscillator()
      engine.type = 'sawtooth'
      const pitch = motorbike ? between(65, 95) : between(35, 48)
      // Accelerate, change gear, then drop in pitch as the vehicle recedes.
      engine.frequency.setValueAtTime(pitch, t)
      engine.frequency.linearRampToValueAtTime(pitch * 1.9, t + duration * 0.3)
      engine.frequency.linearRampToValueAtTime(pitch * 1.25, t + duration * 0.36)
      engine.frequency.linearRampToValueAtTime(pitch * 1.7, t + duration * 0.5)
      engine.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + duration)
      const filter = audio.createBiquadFilter()
      filter.type = 'lowpass'
      filter.Q.value = 0.6
      filter.frequency.setValueAtTime(motorbike ? 450 : 220, t)
      filter.frequency.linearRampToValueAtTime(motorbike ? 1600 : 500, t + duration * 0.4)
      filter.frequency.exponentialRampToValueAtTime(180, t + duration)
      const exhaust = audio.createGain()
      exhaust.gain.value = 0.55
      const pulse = audio.createOscillator()
      pulse.frequency.setValueAtTime(motorbike ? 24 : 14, t)
      pulse.frequency.linearRampToValueAtTime(motorbike ? 42 : 20, t + duration * 0.4)
      const depth = audio.createGain()
      depth.gain.value = 0.18
      pulse.connect(depth).connect(exhaust.gain)
      engine.connect(filter).connect(exhaust).connect(envelope)
      const tires = roadNoise(motorbike ? 1100 : 1900, motorbike ? 0.16 : 0.5, envelope)
      engine.start(t)
      pulse.start(t)
      engine.stop(t + duration)
      pulse.stop(t + duration)
      tires.source.stop(t + duration)
      tires.source.onended = () => {
        for (const node of [engine, filter, exhaust, pulse, depth, tires.source, tires.filter, tires.gain, envelope, pan]) node.disconnect()
      }
    }

    function horn() {
      const t = audio.currentTime
      const gain = audio.createGain()
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.018, t + 0.04)
      gain.gain.linearRampToValueAtTime(0, t + 0.24)
      gain.connect(master)
      let remaining = 2
      for (const frequency of [349, 440]) {
        const note = audio.createOscillator()
        note.type = 'triangle'
        note.frequency.value = frequency
        note.connect(gain)
        note.start(t)
        note.stop(t + 0.25)
        note.onended = () => {
          note.disconnect()
          if (--remaining === 0) gain.disconnect()
        }
      }
    }

    let nextBike = 0
    let nextCar = 2
    let nextHorn = between(12, 20)
    const tick = () => {
      if (document.hidden || audio.state !== 'running') return
      const t = audio.currentTime
      master.gain.setTargetAtTime(speakingVoice() ? 0.12 : 0.38, t, 0.3)
      if (t >= nextBike) {
        pass(true)
        nextBike = t + between(2.5, 4.5)
      }
      if (t >= nextCar) {
        pass(false)
        nextCar = t + between(7, 11)
      }
      if (t >= nextHorn) {
        if (!speakingVoice()) horn()
        nextHorn = t + between(14, 25)
      }
    }
    // A context created after the splash may need its own gesture on iPad Safari.
    let disposed = false
    const resume = () => {
      if (!disposed && !document.hidden && audio.state === 'suspended') void audio.resume().then(() => { if (!disposed) tick() }).catch(() => {})
    }
    const visibility = () => {
      if (document.hidden) void audio.suspend().catch(() => {})
      else resume()
    }
    window.addEventListener('pointerdown', resume, true)
    window.addEventListener('keydown', resume, true)
    document.addEventListener('visibilitychange', visibility)
    const timer = window.setInterval(tick, 250)
    visibility()
    tick()
    return () => {
      disposed = true
      clearInterval(timer)
      window.removeEventListener('pointerdown', resume, true)
      window.removeEventListener('keydown', resume, true)
      document.removeEventListener('visibilitychange', visibility)
      master.gain.cancelScheduledValues(audio.currentTime)
      master.gain.setTargetAtTime(0, audio.currentTime, 0.05)
      // Fade at the doorway, then release all sources, including the road bed.
      window.setTimeout(() => { void audio.close().catch(() => {}) }, 250)
    }
  }, [outside])
}
