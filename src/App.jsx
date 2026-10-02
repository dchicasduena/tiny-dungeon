import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import GameScreen from './game/GameScreen.jsx'

function TitleScreen() {
  return (
    <main className="title-screen">
      <div className="title-content">
        <h1>tiny dungeon</h1>
        <Link className="enter-link" to="/game">
          click here to enter
        </Link>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<TitleScreen />} />
      </Routes>
    </HashRouter>
  )
}