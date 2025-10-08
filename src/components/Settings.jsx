import React, { useState } from 'react'

export default function Settings() {
  const saved = JSON.parse(localStorage.getItem('pomodoro-config') || 'null')
  const [work, setWork] = useState(saved ? Math.floor(saved.work / 60) : 25)
  const [shortBreak, setShortBreak] = useState(saved ? Math.floor(saved.short / 60) : 5)
  const [longBreak, setLongBreak] = useState(saved ? Math.floor(saved.long / 60) : 15)
  const [sessionsBeforeLong, setSessionsBeforeLong] = useState(saved ? saved.sessionsBeforeLong : 4)

  function handleSave() {
    const cfg = {
      work: Math.max(1, Number(work)) * 60,
      short: Math.max(1, Number(shortBreak)) * 60,
      long: Math.max(1, Number(longBreak)) * 60,
      sessionsBeforeLong: Math.max(1, Number(sessionsBeforeLong))
    }
    localStorage.setItem('pomodoro-config', JSON.stringify(cfg))
    // trigger a small event to let other components pick it up
    window.dispatchEvent(new CustomEvent('pomodoro-config-updated'))
    alert('Settings saved')
  }

  return (
    <aside className="settings" aria-label="Timer settings">
      <h3>Settings</h3>
      <label>
        Work (minutes)
        <input type="number" min="1" value={work} onChange={e => setWork(e.target.value)} />
      </label>
      <label>
        Short Break (minutes)
        <input type="number" min="1" value={shortBreak} onChange={e => setShortBreak(e.target.value)} />
      </label>
      <label>
        Long Break (minutes)
        <input type="number" min="1" value={longBreak} onChange={e => setLongBreak(e.target.value)} />
      </label>
      <label>
        Sessions before long break
        <input type="number" min="1" value={sessionsBeforeLong} onChange={e => setSessionsBeforeLong(e.target.value)} />
      </label>
      <button onClick={handleSave}>Save</button>
    </aside>
  )
}
