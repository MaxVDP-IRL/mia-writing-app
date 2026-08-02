import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the letter select screen with all round-family letters', () => {
    render(<App />)
    expect(screen.getByText('Pick a letter')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.getByText('q')).toBeInTheDocument()
  })

  it('navigates to the tracing screen when an unlocked letter tile is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^Letter c,/ }))
    expect(screen.getByText('Letter 1 / 6')).toBeInTheDocument()
    expect(screen.getByText('← Letters')).toBeInTheDocument()
  })
})
