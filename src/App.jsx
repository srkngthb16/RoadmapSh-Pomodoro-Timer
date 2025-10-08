import React from 'react'
import Timer from './components/Timer'
import Settings from './components/Settings'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Pomodoro Timer</h1>
      </header>
      <main>
        <Timer />
        <Settings />
      </main>
      <footer>
        <p>Built for practice — accessible and responsive.</p>
      </footer>
    </div>
  )
}
