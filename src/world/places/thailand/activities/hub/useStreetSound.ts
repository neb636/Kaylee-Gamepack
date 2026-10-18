import { useEffect } from 'react'
import { speakingVoice } from '../../../../../sdk'

const between = (a: number, b: number) => a + Math.random() * (b - a)

/** A busy soi: overlapping accelerating scooters, road noise, cars and short beeps.
 * Owns the graph so entering the house or leaving Thailand stops every sound. */
export function useStreetSound(outside: boolean) {
  useEffect(() => {
    if (!outside || typeof AudioContext === 'undefined') return
    const audio = new AudioContext()
    const master = audio.createGain()
    master.gain.value = 0
    const compressor = audio.createDynamicsCompressor()
    compressor.threshold.value = -14
    compressor.knee.value = 12
    compressor.ratio.value = 4
    compressor.attack.value = 0.008
    compressor.release.value = 0.2
    master.connect(compressor).connect(audio.destination)
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
    // Midrange road hiss remains audible on the iPad's small speakers.
    roadNoise(1100, 0.16, master)
    roadNoise(250, 0.18, master)

    function pass(motorbike: boolean) {
      const t = audio.currentTime
      const duration = motorbike ? between(4, 6) : between(6, 8)
      const loudness = motorbike ? between(0.32, 0.46) : 0.25
      const envelope = audio.createGain()
      envelope.gain.setValueAtTime(0, t)
      envelope.gain.linearRampToValueAtTime(loudness * 0.6, t + 0.25)
      envelope.gain.linearRampToValueAtTime(loudness, t + duration * 0.35)
      envelope.gain.linearRampToValueAtTime(loudness * 0.7, t + duration * 0.55)
      envelope.gain.exponentialRampToValueAtTime(0.001, t + duration)
      const pan = audio.createStereoPanner()
      const direction = Math.random() < 0.5 ? -1 : 1
      pan.pan.setValueAtTime(direction * 0.8, t)
      pan.pan.linearRampToValueAtTime(-direction * 0.8, t + duration)
      envelope.connect(pan).connect(master)

      const engine = audio.createOscillator()
      engine.type = 'sawtooth'
      const pitch = motorbike ? between(75, 125) : between(40, 60)
      // Open the throttle twice: an unmistakable rising rev, gear dip, then another surge.
      engine.frequency.setValueAtTime(pitch, t)
      engine.frequency.exponentialRampToValueAtTime(pitch * (motorbike ? 3.4 : 1.9), t + duration * 0.22)
      engine.frequency.exponentialRampToValueAtTime(pitch * 1.45, t + duration * 0.28)
      engine.frequency.exponentialRampToValueAtTime(pitch * (motorbike ? 3.8 : 2.2), t + duration * 0.46)
      engine.frequency.exponentialRampToValueAtTime(pitch * 1.8, t + duration * 0.58)
      engine.frequency.exponentialRampToValueAtTime(pitch * 0.7, t + duration)
      const filter = audio.createBiquadFilter()
      filter.type = 'lowpass'
      filter.Q.value = 0.6
      filter.frequency.setValueAtTime(motorbike ? 850 : 350, t)
      filter.frequency.linearRampToValueAtTime(motorbike ? 2800 : 850, t + duration * 0.22)
      filter.frequency.linearRampToValueAtTime(motorbike ? 1300 : 500, t + duration * 0.28)
      filter.frequency.linearRampToValueAtTime(motorbike ? 3200 : 1000, t + duration * 0.46)
      filter.frequency.exponentialRampToValueAtTime(350, t + duration)
      const exhaust = audio.createGain()
      exhaust.gain.value = 0.55
      const pulse = audio.createOscillator()
      pulse.type = 'triangle'
      pulse.frequency.setValueAtTime(motorbike ? 22 : 14, t)
      pulse.frequency.linearRampToValueAtTime(motorbike ? 65 : 28, t + duration * 0.22)
      pulse.frequency.linearRampToValueAtTime(motorbike ? 35 : 18, t + duration * 0.28)
      pulse.frequency.linearRampToValueAtTime(motorbike ? 75 : 32, t + duration * 0.46)
      pulse.frequency.linearRampToValueAtTime(18, t + duration)
      const depth = audio.createGain()
      depth.gain.value = 0.35
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
      const double = Math.random() < 0.65
      const end = double ? 0.37 : 0.15
      const volume = between(0.07, 0.12)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(volume, t + 0.015)
      gain.gain.setValueAtTime(volume, t + 0.09)
      gain.gain.linearRampToValueAtTime(0, t + 0.13)
      if (double) {
        gain.gain.setValueAtTime(0, t + 0.2)
        gain.gain.linearRampToValueAtTime(volume * 0.9, t + 0.215)
        gain.gain.setValueAtTime(volume * 0.9, t + 0.31)
        gain.gain.linearRampToValueAtTime(0, t + 0.35)
      }
      const pan = audio.createStereoPanner()
      pan.pan.value = between(-0.7, 0.7)
      gain.connect(pan).connect(master)
      let remaining = 2
      const pitch = between(520, 720)
      for (const frequency of [pitch, pitch * 1.26]) {
        const note = audio.createOscillator()
        note.type = 'triangle'
        note.frequency.value = frequency
        note.connect(gain)
        note.start(t)
        note.stop(t + end)
        note.onended = () => {
          note.disconnect()
          if (--remaining === 0) { gain.disconnect(); pan.disconnect() }
        }
      }
    }

    let nextBike = 0
    let nextCar = 0.5
    let nextHorn = between(1.5, 3)
    const tick = () => {
      if (document.hidden || audio.state !== 'running') return
      const t = audio.currentTime
      master.gain.setTargetAtTime(speakingVoice() ? 0.23 : 0.7, t, 0.2)
      if (t >= nextBike) {
        pass(true)
        nextBike = t + between(0.8, 1.7)
      }
      if (t >= nextCar) {
        pass(false)
        nextCar = t + between(4, 7)
      }
      if (t >= nextHorn) {
        if (!speakingVoice()) horn()
        nextHorn = t + between(2.5, 5)
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
