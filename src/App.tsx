import { useState } from 'react'
import { letters } from './content/letters'
import { LetterSelectScreen } from './screens/LetterSelectScreen'
import { TracingScreen } from './screens/TracingScreen'

type Screen = { name: 'select' } | { name: 'trace'; index: number }

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'select' })

  if (screen.name === 'trace') {
    return (
      <TracingScreen letters={letters} startIndex={screen.index} onExit={() => setScreen({ name: 'select' })} />
    )
  }

  return <LetterSelectScreen letters={letters} onSelectLetter={(index) => setScreen({ name: 'trace', index })} />
}
