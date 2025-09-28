import { Graphics, Text } from 'pixi.js'
import { Entity } from '../entities/Entity.ts'
import { COLORS, UI } from '../services/Config.ts'
import { AudioManager } from '../services/AudioManager.ts'

export class ScoreUI extends Entity {
  private score: number
  private label: Text
  private muteBtn: Graphics
  private muteIcon: Text

  constructor() {
    super()
    this.score = 0
    this.label = new Text({
      text: `Score: ${this.score}`,
      style: {
        fill: COLORS.text,
        fontSize: UI.fontSize,
        fontFamily: 'Arial',
      },
    })
    this.label.x = 8
    this.label.y = 8
    this.container.addChild(this.label)

    // Mute toggle button near score
    this.muteBtn = new Graphics()
    this.muteBtn.roundRect(0, 0, 40, 28, 6).fill(0x2a5bd7)
    this.muteBtn.x = 160
    this.muteBtn.y = 6
    this.muteBtn.eventMode = 'static'
    this.muteBtn.cursor = 'pointer'
    this.container.addChild(this.muteBtn)

    this.muteIcon = new Text({
      text: AudioManager.isMuted() ? '🔇' : '🔊',
      style: { fill: 0xffffff, fontSize: UI.fontSize, fontFamily: 'Arial' },
    })
    this.muteIcon.x = this.muteBtn.x + 10
    this.muteIcon.y = this.muteBtn.y + 4
    this.container.addChild(this.muteIcon)

    this.muteBtn.on('pointerdown', () => {
      AudioManager.toggleMute()
      this.refreshMuteIcon()
    })
  }

  setScore(value: number): void {
    this.score = value
    this.label.text = `Score: ${this.score}`
  }

  private refreshMuteIcon(): void {
    this.muteIcon.text = AudioManager.isMuted() ? '🔇' : '🔊'
  }
}


