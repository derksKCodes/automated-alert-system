"use client"

import { useEffect, useRef } from "react"

interface SoundManagerProps {
  enabled: boolean
}

export function SoundManager({ enabled }: SoundManagerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create audio elements for different alert types
      audioRef.current = new Audio()
    }
  }, [])

  const playNotificationSound = (urgencyLevel: number) => {
    if (!enabled || !audioRef.current) return

    // Different sounds for different urgency levels
    const frequencies = {
      5: 800, // Critical - high pitch
      4: 600, // High
      3: 400, // Medium
      2: 300, // Low
      1: 200, // Info - low pitch
    }

    const frequency = frequencies[urgencyLevel as keyof typeof frequencies] || 400

    // Create a simple beep sound using Web Audio API
    if (typeof window !== "undefined" && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  // Expose the play function globally so other components can use it
  useEffect(() => {
    ;(window as any).playNotificationSound = playNotificationSound
  }, [enabled])

  return null
}
