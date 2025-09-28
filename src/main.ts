import './style.css'
import { Application } from 'pixi.js'
import { Game } from './core/Game.ts'
import { MainMenuUI } from './ui/MainMenuUI.ts'
import { AudioManager } from './services/AudioManager.ts'
import { APP_HEIGHT, APP_WIDTH, COLORS, FULLSCREEN } from './services/Config.ts'

const appRoot = document.querySelector<HTMLDivElement>('#app')!

async function start(): Promise<void> {
  const app = new Application()
  const width = FULLSCREEN ? window.innerWidth : APP_WIDTH
  const height = FULLSCREEN ? window.innerHeight : APP_HEIGHT
  await app.init({ width, height, background: COLORS.background })
  appRoot.appendChild(app.canvas)

  // Main menu
  const menu = new MainMenuUI(width, height)
  app.stage.addChild(menu.container)
  await AudioManager.init()

  menu.bind(
    async () => {
      app.stage.removeChild(menu.container)
      const game = new Game(app)
      await game.init()
      app.ticker.add((ticker) => game.update(ticker.deltaMS / 1000))
    },
    () => {
      AudioManager.toggleMute()
    },
  )
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
})
