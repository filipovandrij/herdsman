import { Graphics } from 'pixi.js'
import { Entity } from './Entity.ts'
import { COLORS } from '../services/Config.ts'

export class Field extends Entity {
  constructor(width: number, height: number) {
    super()
    const g = new Graphics()
    g.rect(0, 0, width, height).fill(COLORS.field)
    this.container.addChild(g)
  }
}


