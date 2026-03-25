import { useEffect, useRef, useState } from 'react'

export type Role = 'spymaster_blue' | 'spymaster_red' | 'guesser_blue' | 'guesser_red'

export interface ServerCard {
  word: string
  card_color: string
  revealed: boolean
}

export interface GameState {
  cards: ServerCard[]
  turn: 'blue' | 'red'
  scores: { blue: number; red: number }
  winner: 'blue' | 'red' | null
}

export interface LobbyState {
  roles: Record<Role, boolean>
  started: boolean
}

export interface FullState {
  game: GameState
  lobby: LobbyState
  yourRole: Role | null
}

export function useGameSocket() {
  const ws = useRef<WebSocket | null>(null)
  const [state, setState] = useState<FullState | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.0.10:3001')

    ws.current.onopen = () => setConnected(true)

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      console.log('Received:', msg)

      if (msg.type === 'created') {
        setRoomId(msg.roomId)
      }

      if (msg.type === 'state') {
        setState({
          game: msg.game,
          lobby: msg.lobby,
          yourRole: msg.yourRole,
        })
      }

      if (msg.type === 'error') {
        setError(msg.message)
      }
    }

    ws.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnected(false);
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => ws.current?.close()
  }, [])

  const send = (data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('Sending:', data)
      ws.current.send(JSON.stringify(data))
    }
  }

  const createRoom = (cards: ServerCard[]) => send({ type: 'create', cards })
  const joinRoom   = (id: string)          => { setRoomId(id); send({ type: 'join', roomId: id }) }
  const pickRole   = (role: Role)          => send({ type: 'pick_role', role })
  const startGame  = ()                    => send({ type: 'start' })
  const revealCard = (index: number)       => send({ type: 'reveal', index })

  return {
    state, roomId, connected, error,
    createRoom, joinRoom, pickRole, startGame, revealCard,
  }
}