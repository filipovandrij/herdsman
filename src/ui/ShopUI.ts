import { Container, Graphics, Text } from 'pixi.js'
import { UI, UPGRADES } from '../services/Config.ts'

type ClickHandler = () => void

export class ShopUI {
  container: Container
  private bg: Graphics
  private header: Graphics
  private title: Text
  private btnCapacity: Graphics
  private btnScore: Graphics
  private btnAssistant: Graphics
  private btnSpawn: Graphics
  private labelCapacity: Text
  private labelScore: Text
  private labelAssistant: Text
  private labelSpawn: Text
  private scoreLabel: Text

  constructor(width: number, height: number) {
    this.container = new Container()
    this.container.visible = false

    const panelW = width * 0.6
    const panelH = height * 0.6
    this.bg = new Graphics()
    this.bg.roundRect(0, 0, panelW, panelH, 12).fill(0x111318)
    this.bg.alpha = 0.9
    this.container.addChild(this.bg)
    // header bar
    this.header = new Graphics()
    this.header.roundRect(0, 0, panelW, 44, 12).fill(0x1f2330)
    this.container.addChild(this.header)
    this.container.x = width * 0.2
    this.container.y = height * 0.2

    this.title = new Text({
      text: 'Upgrades Shop',
      style: { fill: 0xffffff, fontSize: UI.fontSize + 6, fontFamily: 'Arial' },
    })
    this.title.x = 16
    this.title.y = 10
    this.container.addChild(this.title)

    this.scoreLabel = new Text({
      text: 'Score: 0',
      style: { fill: 0xa0ffc8, fontSize: UI.fontSize, fontFamily: 'Arial' },
    })
    this.scoreLabel.x = panelW - 16
    this.scoreLabel.y = 12
    this.scoreLabel.anchor.set(1, 0)
    this.container.addChild(this.scoreLabel)

    this.btnCapacity = this.createButton(16, 64, 360, 48, () => {})
    this.labelCapacity = this.createLabel(24, 76)
    this.container.addChild(this.btnCapacity, this.labelCapacity)
    this.attachButtonFX(this.btnCapacity, this.labelCapacity)

    this.btnScore = this.createButton(16, 128, 360, 48, () => {})
    this.labelScore = this.createLabel(24, 140)
    this.container.addChild(this.btnScore, this.labelScore)
    this.attachButtonFX(this.btnScore, this.labelScore)

    this.btnAssistant = this.createButton(16, 192, 360, 48, () => {})
    this.labelAssistant = this.createLabel(24, 204)
    this.container.addChild(this.btnAssistant, this.labelAssistant)
    this.attachButtonFX(this.btnAssistant, this.labelAssistant)

    this.btnSpawn = this.createButton(16, 256, 360, 48, () => {})
    this.labelSpawn = this.createLabel(24, 268)
    this.container.addChild(this.btnSpawn, this.labelSpawn)
    this.attachButtonFX(this.btnSpawn, this.labelSpawn)
  }

  private createButton(x: number, y: number, w: number, h: number, onClick: ClickHandler): Graphics {
    const g = new Graphics()
    g.roundRect(x, y, w, h, 10).fill(0x2255aa)
    g.eventMode = 'static'
    g.cursor = 'pointer'
    g.on('pointerover', () => { g.alpha = 0.9 })
    g.on('pointerout', () => { g.alpha = 1 })
    g.on('pointerdown', onClick)
    return g
  }

  private createLabel(x: number, y: number): Text {
    return new Text({ text: '', style: { fill: 0xffffff, fontSize: UI.fontSize, fontFamily: 'Arial' }, x, y })
  }

  updateLabels(capacityLevel: number, scorePerLevel: number, assistant: boolean, currentScore: number, spawnLevel = 0): void {
    const nextCapIdx = Math.min(capacityLevel + 1, UPGRADES.capacityLevels.length - 1)
    const nextScoreIdx = Math.min(scorePerLevel + 1, UPGRADES.scorePerLevels.length - 1)
    const nextCapCost = UPGRADES.capacityCosts[nextCapIdx]
    const nextScoreCost = UPGRADES.scorePerCosts[nextScoreIdx]

    this.labelCapacity.text = `Capacity: ${UPGRADES.capacityLevels[capacityLevel]} → ${UPGRADES.capacityLevels[nextCapIdx]}  (cost: ${nextCapCost})`
    this.labelScore.text = `Score per sheep: ${UPGRADES.scorePerLevels[scorePerLevel]} → ${UPGRADES.scorePerLevels[nextScoreIdx]}  (cost: ${nextScoreCost})`
    this.labelAssistant.text = assistant ? `Assistant: hired` : `Hire assistant (cost: ${UPGRADES.assistantCost})`
    this.scoreLabel.text = `Score: ${currentScore}`
    const nextSpawnIdx = Math.min(spawnLevel + 1, UPGRADES.spawnRateLevels.length - 1)
    const nextSpawnCost = UPGRADES.spawnRateCosts[nextSpawnIdx]
    this.labelSpawn.text = `Spawn rate: x${UPGRADES.spawnRateLevels[spawnLevel]} → x${UPGRADES.spawnRateLevels[nextSpawnIdx]}  (cost: ${nextSpawnCost})`
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

  bind(
    onBuyCapacity: ClickHandler,
    onBuyScore: ClickHandler,
    onHireAssistant: ClickHandler,
    onBuySpawn: ClickHandler,
  ): void {
    this.btnCapacity.removeAllListeners()
    this.btnScore.removeAllListeners()
    this.btnAssistant.removeAllListeners()
    this.btnSpawn.removeAllListeners()
    this.btnCapacity.on('pointerdown', onBuyCapacity)
    this.btnScore.on('pointerdown', onBuyScore)
    this.btnAssistant.on('pointerdown', onHireAssistant)
    this.btnSpawn.on('pointerdown', onBuySpawn)
  }
}


