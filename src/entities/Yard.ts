import { Graphics, Sprite, Texture } from 'pixi.js'
import { Entity } from './Entity.ts'
import { ASSETS, COLORS } from '../services/Config.ts'

export class Yard extends Entity {
  private body: Graphics | Sprite

  constructor(width: number, height: number) {
    super()
    const tex = Texture.from(ASSETS.corral)
    if (tex) {
      const spr = new Sprite({ texture: tex })
      const scaleX = width / Math.max(1, spr.width)
      const scaleY = height / Math.max(1, spr.height)
      spr.scale.set(scaleX, scaleY)
      spr.anchor.set(0, 0)
      this.body = spr
    } else {
      const g = new Graphics()
      g.rect(0, 0, width, height).fill(COLORS.yard)
      this.body = g
    }
    this.container.addChild(this.body)
  }
}


