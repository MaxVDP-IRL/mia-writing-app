import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('opens on the home screen', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: "Mia's Writing" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Letters/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sticker book/ })).toBeInTheDocument()
  })

  it('locks joins and words until some letters have been practised', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Joins/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Words/ })).toBeDisabled()
  })

  it('shows the letters grouped into stroke families, with only the first unlocked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Letters/ }))

    expect(screen.getByRole('heading', { name: 'Curly caterpillars' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Zig-zag monsters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Letter c/ })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /^Letter a/ })).toBeDisabled()
  })

  it('navigates into tracing a letter and back out again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Letters/ }))
    await user.click(screen.getByRole('button', { name: /^Letter c/ }))

    expect(screen.getByText('Letter 1 / 26')).toBeInTheDocument()
    expect(screen.getByText('Start on the green dot')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '← Back' }))
    expect(screen.getByRole('heading', { name: 'Curly caterpillars' })).toBeInTheDocument()
  })

  it('shows the sticker book with everything still locked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Sticker book/ }))

    const caterpillar = screen.getByLabelText('Caterpillar, needs 3 stars')
    expect(within(caterpillar).getByText('★ 3')).toBeInTheDocument()
  })

  it('gates the grown-ups screen behind a PIN', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Grown-ups' }))

    expect(screen.getByLabelText('Choose a 4-digit PIN')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Choose a 4-digit PIN'), '1234')
    await user.click(screen.getByRole('button', { name: 'Save PIN' }))

    expect(screen.getByText('day streak')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset progress' })).toBeInTheDocument()
  })

  it('rejects the wrong PIN once one has been set', async () => {
    const user = userEvent.setup()
    localStorage.setItem('mia-writing-progress-v2', JSON.stringify({ items: {}, days: [], pin: '4321' }))
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Grown-ups' }))

    await user.type(screen.getByLabelText('Enter your PIN'), '1111')
    await user.click(screen.getByRole('button', { name: 'Unlock' }))
    expect(screen.getByText('That PIN does not match.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Enter your PIN'), '4321')
    await user.click(screen.getByRole('button', { name: 'Unlock' }))
    expect(screen.getByText('day streak')).toBeInTheDocument()
  })
})
