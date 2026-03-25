import { useRef, useEffect, useState } from 'react'
import { generateCards } from './utils/generateCards'
import type { GameState, Role } from './hooks/useGameSocket'
import type { Card } from './utils/generateCards'
import words from './words.json'
import './canvas.css'

interface CanvasProps {
  role: Role
  gameState: GameState
  revealCard: (index: number) => void
}

export default function Canvas({ role, gameState, revealCard }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scaleRef = useRef(1)
  const [layout] = useState<Card[]>(() => generateCards(words as string[]))

  const cards: Card[] = gameState.cards.map((serverCard, i) => ({
    ...layout[i],
    ...serverCard,
  }))

  useEffect(() => {
    const updateCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const scaleX = window.innerWidth / 1280
      const scaleY = window.innerHeight / 720
      const scale = Math.min(scaleX, scaleY)
      scaleRef.current = scale

      ctx.save()
      ctx.translate((window.innerWidth - 1280 * scale) / 2, (window.innerHeight - 720 * scale) / 2)

      ctx.clearRect(0, 0, 1280 * scale, 720 * scale)

      cards.forEach((card) => {
        if (card.revealed) {
          ctx.fillStyle = '#888'
        } else if (card.card_color === 'hidden') {
          ctx.fillStyle = '#333'
        } else {
          ctx.fillStyle = card.card_color
        }

        ctx.fillRect(card.x * scale, card.y * scale, card.size_x * scale, card.size_y * scale)

        ctx.fillStyle = 'white'
        ctx.font = `bold ${14 * scale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(card.word, (card.x + card.size_x / 2) * scale, (card.y + card.size_y / 2) * scale, card.size_x * scale - 10)
      })

      ctx.restore()
    }

    updateCanvas()
    window.addEventListener('resize', updateCanvas)
    return () => window.removeEventListener('resize', updateCanvas)
  }, [gameState])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (role !== 'guesser_blue' && role !== 'guesser_red') return

    const rect = canvasRef.current!.getBoundingClientRect()
    const scale = scaleRef.current
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale

    const index = cards.findIndex(card =>
      x >= card.x && x <= card.x + card.size_x &&
      y >= card.y && y <= card.y + card.size_y
    )

    if (index >= 0) revealCard(index)
  }

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      onClick={handleClick}
      style={{ cursor: (role === 'guesser_blue' || role === 'guesser_red') ? 'pointer' : 'default' }}
    />
  )
}