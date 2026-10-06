import { Link } from 'react-router-dom'

export default function GameScreen() {
  return (
    <main className="game-screen" aria-label="tiny dungeon game">
      <Link className="back-link" to="/">
        back to title
      </Link>
    </main>
  )
}