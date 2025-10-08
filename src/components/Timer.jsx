import React, { useEffect, useRef, useState } from 'react'

const DEFAULTS = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
  sessionsBeforeLong: 4
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function Timer() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('pomodoro-config')
      return saved ? JSON.parse(saved) : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  const [mode, setMode] = useState('work') // work | short | long
  const [secondsLeft, setSecondsLeft] = useState(config.work)
  const [isRunning, setIsRunning] = useState(false)
  const [completedWorkSessions, setCompletedWorkSessions] = useState(() => {
    const v = localStorage.getItem('pomodoro-work-sessions')
    return v ? Number(v) : 0
  })

  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('pomodoro-config', JSON.stringify(config))
  }, [config])

  useEffect(() => {
    localStorage.setItem('pomodoro-work-sessions', String(completedWorkSessions))
  }, [completedWorkSessions])

  useEffect(() => {
    setSecondsLeft(mode === 'work' ? config.work : mode === 'short' ? config.short : config.long)
  }, [mode, config])

  // react to settings saved elsewhere (Settings component writes localStorage and dispatches this)
  useEffect(() => {
    function onUpdate() {
      try {
        const saved = JSON.parse(localStorage.getItem('pomodoro-config'))
        if (saved) setConfig(saved)
      } catch {}
    }
    window.addEventListener('pomodoro-config-updated', onUpdate)
    return () => window.removeEventListener('pomodoro-config-updated', onUpdate)
  }, [])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => s - 1)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  useEffect(() => {
    if (secondsLeft <= 0) {
      // play sound and advance (audio file or WebAudio fallback)
      playSound()
      if (mode === 'work') {
        const nextCount = completedWorkSessions + 1
        setCompletedWorkSessions(nextCount)
        if (nextCount % config.sessionsBeforeLong === 0) {
          setMode('long')
        } else {
          setMode('short')
        }
      } else {
        setMode('work')
      }
      setIsRunning(false)
    }
  }, [secondsLeft])

  function handleStart() {
    setIsRunning(true)
  }
  function handlePause() {
    setIsRunning(false)
  }
  function handleReset() {
    setIsRunning(false)
    setSecondsLeft(mode === 'work' ? config.work : mode === 'short' ? config.short : config.long)
  }

  function playSound() {
    const el = audioRef.current
    if (el) {
      el.currentTime = 0
      el.play().catch(() => {
        // fallback to WebAudio
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.type = 'sine'
          o.frequency.value = 880
          o.connect(g)
          g.connect(ctx.destination)
          g.gain.value = 0.05
          o.start()
          setTimeout(() => { o.stop(); ctx.close().catch(()=>{}) }, 350)
        } catch {}
      })
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.type = 'sine'
        o.frequency.value = 880
        o.connect(g)
        g.connect(ctx.destination)
        g.gain.value = 0.05
        o.start()
        setTimeout(() => { o.stop(); ctx.close().catch(()=>{}) }, 350)
      } catch {}
    }
  }

  return (
    <section className="timer" aria-label="Pomodoro timer">
      <div className="mode">
        <h2 id="session-type">{mode === 'work' ? 'Work' : mode === 'short' ? 'Short Break' : 'Long Break'}</h2>
        <p className="sessions">Completed work sessions: {completedWorkSessions}</p>
      </div>

      <div className="clock" role="timer" aria-live="polite" aria-atomic="true" aria-labelledby="session-type">
        <div className="time">{formatTime(Math.max(0, secondsLeft))}</div>
        <div className="controls">
          {!isRunning && (
            <button onClick={handleStart} aria-label="Start timer">Start</button>
          )}
          {isRunning && (
            <button onClick={handlePause} aria-label="Pause timer">Pause</button>
          )}
          <button onClick={handleReset} aria-label="Reset timer">Reset</button>
        </div>
      </div>

      <audio ref={audioRef} src="/assets/bell.mp3" preload="auto" aria-hidden="true" />

      <div className="quick-modes">
        <button onClick={() => { setMode('work'); setIsRunning(false); }} aria-pressed={mode==='work'}>Work</button>
        <button onClick={() => { setMode('short'); setIsRunning(false); }} aria-pressed={mode==='short'}>Short</button>
        <button onClick={() => { setMode('long'); setIsRunning(false); }} aria-pressed={mode==='long'}>Long</button>
      </div>
    </section>
  )
}
