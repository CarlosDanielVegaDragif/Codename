import Lobby from './Lobby'
import Canvas from './Canvas'
import { useGameSocket } from './hooks/useGameSocket'
import { generateCards } from './utils/generateCards'
import words from './words.json'

export default function App() {
  const { state, roomId, connected, error,
          createRoom, joinRoom, pickRole, startGame, revealCard } = useGameSocket()

  const handleCreate = () => {
    const cards = generateCards(words as string[])
    createRoom(cards)
  }

  // Mostrar lobby hasta que la partida empiece
  if (!state?.lobby.started) {
    return (
      <Lobby
        roomId={roomId}
        lobby={state?.lobby ?? null}
        yourRole={state?.yourRole ?? null}
        connected={connected}
        error={error}
        onCreate={handleCreate}
        onJoin={joinRoom}
        onPickRole={pickRole}
        onStart={startGame}
      />
    )
  }

  // Partida en curso
  return (
    <Canvas
      role={state.yourRole ?? 'guesser_blue'}
      gameState={state.game}
      revealCard={revealCard}
    />
  )
}