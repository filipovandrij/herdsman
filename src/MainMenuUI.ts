import { Container, Graphics, Text } from 'pixi.js'
import { UI } from './config.ts'
import { AudioManager } from './AudioManager.ts'

type ClickHandler = () => void

export class MainMenuUI {
  container: Container
  private bg: Graphics
  private title: Text
  private rules: Text
  private btnStart: Graphics
  private btnMute: Graphics
  private labelStart: Text
  private labelMute: Text
  private iconMute: Text

  constructor(width: number, height: number) {
    this.container = new Container()

    this.bg = new Graphics()
    this.bg.roundRect(0, 0, width, height, 0).fill(0x101215)
    this.bg.alpha = 0.92
    this.container.addChild(this.bg)

    this.title = new Text({
      text: 'Herdsman',
      style: { fill: 0xffffff, fontSize: UI.fontSize + 14, fontFamily: 'Arial' },
    })
    this.title.x = width / 2
    this.title.y = height * 0.18
    this.title.anchor.set(0.5)
    this.container.addChild(this.title)

    this.rules = new Text({
      text: 'Move: WASD/Arrows\nLead sheep to the corral\nBuy upgrades in the top-right shop',
      style: { fill: 0xa0acc0, fontSize: UI.fontSize, fontFamily: 'Arial', align: 'center' },
    })
    this.rules.x = width / 2
    this.rules.y = height * 0.32
    this.rules.anchor.set(0.5)
    this.container.addChild(this.rules)

    this.btnStart = this.createButton(width / 2 - 120, height * 0.55, 240, 56, () => {})
    this.labelStart = this.createLabel('Start Game', width / 2, height * 0.55 + 10)
    this.container.addChild(this.btnStart, this.labelStart)
    this.attachButtonFX(this.btnStart, this.labelStart)

    this.btnMute = this.createButton(width / 2 - 120, height * 0.55 + 76, 240, 56, () => {})
    this.labelMute = this.createLabel('Sound', width / 2 + 12, height * 0.55 + 86)
    this.iconMute = new Text({ text: AudioManager.isMuted() ? '🔇' : '🔊', style: { fill: 0xffffff, fontSize: UI.fontSize + 2, fontFamily: 'Arial' } })
    this.iconMute.anchor.set(0.5, 0)
    this.iconMute.x = width / 2 - 60
    this.iconMute.y = height * 0.55 + 86
    this.container.addChild(this.btnMute, this.labelMute, this.iconMute)
    this.attachButtonFX(this.btnMute, this.labelMute, this.iconMute)
  }

  private createButton(x: number, y: number, w: number, h: number, onClick: ClickHandler): Graphics {
    const g = new Graphics()
    g.roundRect(x, y, w, h, 10).fill(0x2a5bd7)
    g.eventMode = 'static'
    g.cursor = 'pointer'
    g.on('pointerover', () => { g.alpha = 1 })
    g.on('pointerout', () => { g.alpha = 1 })
    g.on('pointerdown', onClick)
    return g
  }

  private createLabel(text: string, x: number, y: number): Text {
    const t = new Text({ text, style: { fill: 0xffffff, fontSize: UI.fontSize + 2, fontFamily: 'Arial' } })
    t.x = x
    t.y = y
    t.anchor.set(0.5, 0)
    return t
  }

  bind(onStart: ClickHandler, onToggleMute: ClickHandler): void {
    this.btnStart.removeAllListeners()
    this.btnMute.removeAllListeners()
    this.btnStart.on('pointerdown', onStart)
    this.btnMute.on('pointerdown', () => {
      onToggleMute()
      this.refreshMuteIcon()
    })
  }

  private refreshMuteIcon(): void {
    const isMuted = AudioManager.isMuted()
    if (this.iconMute) this.iconMute.text = isMuted ? '🔇' : '🔊'
  }

  private attachButtonFX(btn: Graphics, label?: Text, extra?: Text): void {
    const dy = 3
    const scaleHover = 1.1
    const tintDefault = 0xffffff
    const tintHover = 0xeef2ff
    const tintPress = 0xdbe5ff
    btn.on('pointerover', () => { btn.alpha = 1; btn.scale.set(scaleHover); (btn as any).tint = tintHover })
    btn.on('pointerout', () => {
      btn.alpha = 1
      btn.scale.set(1)
      ;(btn as any).tint = tintDefault
      if (label && (label as any).__pressed) { label.y -= dy; (label as any).__pressed = false }
      if (extra && (extra as any).__pressed) { extra.y -= dy; (extra as any).__pressed = false }
    })
    btn.on('pointerdown', () => {
      btn.alpha = 1
      ;(btn as any).tint = tintPress
      btn.y += dy
      if (label) { (label as any).__pressed = true; label.y += dy }
      if (extra) { (extra as any).__pressed = true; extra.y += dy }
    })
    const release = () => {
      btn.alpha = 1
      btn.y -= dy
      btn.scale.set(1)
      ;(btn as any).tint = tintDefault
      if (label && (label as any).__pressed) { label.y -= dy; (label as any).__pressed = false }
      if (extra && (extra as any).__pressed) { extra.y -= dy; (extra as any).__pressed = false }
    }
    btn.on('pointerup', release)
    btn.on('pointerupoutside', release)
  }
}


