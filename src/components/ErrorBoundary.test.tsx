import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Broken(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('shows a way to start again instead of a blank screen', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Oops!')
    expect(screen.getByRole('button', { name: /Start again/ })).toBeInTheDocument()
    quiet.mockRestore()
  })

  it('renders its children normally when nothing goes wrong', () => {
    render(
      <ErrorBoundary>
        <p>All fine</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All fine')).toBeInTheDocument()
  })
})
