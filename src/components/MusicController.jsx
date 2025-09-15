// src/components/MusicController.jsx
import React, { useEffect, useRef, useState } from 'react'

export default function MusicController() {
  const audioRef = useRef(null)
  const [enabled, setEnabled] = useState(true)   // music on/off
  const [ready, setReady] = useState(false)

  // try to autoplay quietly
  useEffect(() => {
    const a = new Audio('/audio/sing.mp3')
    a.loop = true
    a.preload = 'auto'
    a.muted = true
    a.volume = 0.4
    audioRef.current = a

    const tryPlay = async () => {
      try {
        await a.play()
        setReady(true)
      } catch {
        // Autoplay blocked; we’ll enable on first interaction
        setReady(false)
      }
    }
    tryPlay()

    // Unmute + play on first user interaction (required by many browsers)
    const onFirstInteract = async () => {
      if (!audioRef.current) return
      audioRef.current.muted = false
      try {
        await audioRef.current.play()
        setReady(true)
      } catch { /* ignore */ }
      window.removeEventListener('pointerdown', onFirstInteract)
      window.removeEventListener('keydown', onFirstInteract)
    }
    window.addEventListener('pointerdown', onFirstInteract, { once: true })
    window.addEventListener('keydown', onFirstInteract, { once: true })

    // Pause when movie starts
    const onMovieStart = () => {
      if (audioRef.current) {
        audioRef.current.pause()
        setEnabled(false)
      }
    }
    window.addEventListener('start-movie', onMovieStart)

    return () => {
      window.removeEventListener('start-movie', onMovieStart)
      window.removeEventListener('pointerdown', onFirstInteract)
      window.removeEventListener('keydown', onFirstInteract)
      a.pause()
      a.src = ''
    }
  }, [])

  // Reflect enabled/disabled state
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (enabled) {
      a.muted = false
      a.volume = 0.4
      a.play().catch(() => {})
    } else {
      a.pause()
    }
  }, [enabled])

  // Tiny, low-visibility toggle; remove the button if you want zero UI
  return (
    <button
      type="button"
      onClick={() => setEnabled(v => !v)}
      title={enabled ? 'Pause music' : 'Play music'}
      aria-label={enabled ? 'Pause background music' : 'Play background music'}
      className="fixed bottom-3 right-3 z-50 rounded-full w-6 h-6 opacity-30 hover:opacity-70 transition"
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
    >
      {/* optional dot UI */}
      <span
        className="block w-2 h-2 mx-auto my-auto rounded-full"
        style={{ background: enabled ? 'currentColor' : 'transparent', border: '1px solid currentColor' }}
      />
    </button>
  )
}
