import { useState } from 'react'
import type { Role, LobbyState } from './hooks/useGameSocket'

interface LobbyProps {
  roomId: string | null
  lobby: LobbyState | null
  yourRole: Role | null
  connected: boolean
  error: string | null
  onCreate: () => void
  onJoin: (id: string) => void
  onPickRole: (role: Role) => void
  onStart: () => void
}

const ROLE_LABELS: Record<Role, string> = {
  spymaster_blue: '🔵 Spymaster azul',
  spymaster_red:  '🔴 Spymaster rojo',
  guesser_blue:   '🔵 Adivinador azul',
  guesser_red:    '🔴 Adivinador rojo',
}

export default function Lobby({
  roomId, lobby, yourRole, connected, error,
  onCreate, onJoin, onPickRole, onStart,
}: LobbyProps) {
  const [joinInput, setJoinInput] = useState('')

  if (!connected) {
    return <div style={styles.center}>Conectando al servidor...</div>
  }

  // Pantalla inicial: crear o unirse
  if (!roomId) {
    return (
      <div style={styles.center}>
        <h2 style={styles.title}>Codenames</h2>
        <button style={styles.btn} onClick={onCreate}>
          Crear sala
        </button>
        <div style={styles.divider}>o</div>
        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Código de sala"
            value={joinInput}
            onChange={e => setJoinInput(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button
            style={styles.btn}
            onClick={() => joinInput.length > 0 && onJoin(joinInput)}
          >
            Unirse
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    )
  }

  // Pantalla de lobby: elegir rol
  return (
    <div style={styles.center}>
      <h2 style={styles.title}>Sala: <span style={styles.code}>{roomId}</span></h2>
      <p style={styles.subtitle}>Compartí este código con los demás jugadores</p>

      <div style={styles.grid}>
        {(Object.keys(ROLE_LABELS) as Role[]).map(role => {
          const taken  = lobby?.roles[role] ?? false
          const isYours = yourRole === role
          return (
            <button
              key={role}
              style={{
                ...styles.roleBtn,
                opacity: taken && !isYours ? 0.4 : 1,
                outline: isYours ? '2px solid white' : 'none',
              }}
              disabled={taken && !isYours}
              onClick={() => onPickRole(role)}
            >
              {ROLE_LABELS[role]}
              {taken && <span style={styles.tag}>{isYours ? ' (vos)' : ' tomado'}</span>}
            </button>
          )
        })}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <button
        style={{ ...styles.btn, marginTop: 32, opacity: yourRole ? 1 : 0.4 }}
        disabled={!yourRole}
        onClick={onStart}
      >
        Iniciar partida
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  center:   { display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100vh', gap: 12, background: '#1a1a2e', color: 'white' },
  title:    { fontSize: 32, margin: 0 },
  subtitle: { color: '#aaa', margin: 0 },
  code:     { fontFamily: 'monospace', background: '#333', padding: '2px 8px', borderRadius: 4 },
  btn:      { padding: '10px 24px', fontSize: 16, borderRadius: 8, border: 'none',
              background: '#4f46e5', color: 'white', cursor: 'pointer' },
  divider:  { color: '#666', fontSize: 14 },
  row:      { display: 'flex', gap: 8 },
  input:    { padding: '10px 14px', fontSize: 16, borderRadius: 8, border: '1px solid #444',
              background: '#222', color: 'white', width: 140, textTransform: 'uppercase',
              letterSpacing: 4 },
  grid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 },
  roleBtn:  { padding: '16px 24px', fontSize: 15, borderRadius: 8, border: '1px solid #444',
              background: '#222', color: 'white', cursor: 'pointer' },
  tag:      { fontSize: 12, color: '#aaa' },
  error:    { color: '#f87171', fontSize: 14 },
}