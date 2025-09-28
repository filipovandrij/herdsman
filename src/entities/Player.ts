import { Graphics, Sprite, Texture, type PointData } from 'pixi.js'
import { Entity } from './Entity.ts'
import { ASSETS, COLORS, PLAYER } from '../services/Config.ts'

export class Player extends Entity {
  private body: Graphics | Sprite
  private target: PointData | null = null
  private radius: number

  constructor(radius = PLAYER.radius) {
    super()
    this.radius = radius
    const tex = Texture.from(ASSETS.player)
    if (tex) {
      const spr = new Sprite({ texture: tex })
      const scale = (radius * 2) / Math.max(spr.width, spr.height)
      spr.scale.set(scale)
      spr.anchor.set(0.5)
      this.body = spr
    } else {
      const g = new Graphics()
      g.circle(0, 0, radius).fill(COLORS.player)
      this.body = g
    }
    this.container.addChild(this.body)
  }

  setTarget(x: number, y: number): void {
    this.target = { x, y }
  }

  clearTarget(): void {
    this.target = null
  }

  moveBy(dx: number, dy: number): void {
    this.container.x += dx
    this.container.y += dy
  }

  getRadius(): number {
    return this.radius
  }

  update(dt: number): void {
    super.update(dt)
    if (!this.target) return

    const dx = this.target.x - this.container.x
    const dy = this.target.y - this.container.y
    const dist = Math.hypot(dx, dy)
    if (dist <= PLAYER.arrivalRadius) {
      this.target = null
      return
    }
    const nx = dx / dist
    const ny = dy / dist
    const step = PLAYER.speed * dt
    const moveX = nx * step
    const moveY = ny * step

    if (step >= dist) {
      this.container.position.set(this.target.x, this.target.y)
      this.target = null
      return
    }
    this.container.x += moveX
    this.container.y += moveY
    // rotate toward movement; assume sprite faces down by default
    const angle = Math.atan2(dy, dx)
    if (this.body instanceof Sprite) {
      this.container.rotation = angle - Math.PI / 2
    }
  }
}


