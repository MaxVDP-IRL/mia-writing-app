import { useState } from 'react'
import { itemsOfKind } from './content/items'
import type { ItemKind } from './content/types'
import { HomeScreen } from './screens/HomeScreen'
import { ItemSelectScreen } from './screens/ItemSelectScreen'
import { ParentScreen } from './screens/ParentScreen'
import { StickerBookScreen } from './screens/StickerBookScreen'
import { TracingScreen } from './screens/TracingScreen'

type Screen =
  | { name: 'home' }
  | { name: 'select'; kind: ItemKind }
  | { name: 'trace'; kind: ItemKind; index: number }
  | { name: 'stickers' }
  | { name: 'parent' }

const SELECT_TITLES: Record<ItemKind, string> = {
  letter: 'Letters',
  join: 'Joins',
  word: 'Words',
}

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const home = () => setScreen({ name: 'home' })

  switch (screen.name) {
    case 'select':
      return (
        <ItemSelectScreen
          title={SELECT_TITLES[screen.kind]}
          items={itemsOfKind(screen.kind)}
          onSelect={(index) => setScreen({ name: 'trace', kind: screen.kind, index })}
          onExit={home}
        />
      )
    case 'trace':
      return (
        <TracingScreen
          items={itemsOfKind(screen.kind)}
          startIndex={screen.index}
          onExit={() => setScreen({ name: 'select', kind: screen.kind })}
        />
      )
    case 'stickers':
      return <StickerBookScreen onExit={home} />
    case 'parent':
      return <ParentScreen onExit={home} />
    default:
      return (
        <HomeScreen
          onChooseKind={(kind) => setScreen({ name: 'select', kind })}
          onOpenStickers={() => setScreen({ name: 'stickers' })}
          onOpenParent={() => setScreen({ name: 'parent' })}
        />
      )
  }
}
