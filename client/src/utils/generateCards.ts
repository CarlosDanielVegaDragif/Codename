// src/utils/generateCards.ts
import type { ServerCard } from '../hooks/useGameSocket'

const COLS = 5
const ROWS = 4
const CARD_W = 90
const CARD_H = 136
const GAP = 10

export interface Card extends ServerCard {
  x: number
  y: number
  size_x: number
  size_y: number
}

export function generateCards(words: string[]): Card[] {
  const total = COLS * ROWS
  const half = Math.floor(total / 2)
  const colors = [
    ...Array(half).fill('blue'),
    ...Array(total - half).fill('red'),
  ].sort(() => Math.random() - 0.5)

  const shuffledWords = [...words].sort(() => Math.random() - 0.5).slice(0, total)

  return Array.from({ length: total }, (_, i) => ({
    x: GAP + (i % COLS) * (CARD_W + GAP),
    y: GAP + Math.floor(i / COLS) * (CARD_H + GAP),
    size_x: CARD_W,
    size_y: CARD_H,
    card_color: colors[i],
    word: shuffledWords[i],
    revealed: false,
  }))
}