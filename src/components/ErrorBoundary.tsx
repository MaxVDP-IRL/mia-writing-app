import { Component, type ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * If something goes wrong, show a friendly way back rather than a blank white
 * screen a six-year-old can't do anything with. Progress is in localStorage,
 * so restarting loses nothing.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown): void {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="error-screen" role="alert">
        <span className="error-emoji" aria-hidden="true">
          🙈
        </span>
        <p className="error-text">Oops! Something went wrong.</p>
        <button className="primary-btn" onClick={() => window.location.reload()}>
          🏠 Start again
        </button>
      </div>
    )
  }
}
