import { Graphics, Sprite, Texture } from 'pixi.js'
import { Entity } from './Entity.ts'
import { ANIMAL, ASSETS, COLORS } from '../services/Config.ts'

export class Animal extends Entity {
  private body: Graphics | Sprite
  isFollowing = false
  followIndex = -1
  private radius: number
  patrolTarget: { x: number; y: number } | null = null

  constructor(radius = ANIMAL.radius) {
    super()
    this.radius = radius
    const tex = Texture.from(ASSETS.sheep)
    if (tex) {
      const spr = new Sprite({ texture: tex })
      const scale = (radius * 2) / Math.max(spr.width, spr.height)
      spr.scale.set(scale)
      spr.anchor.set(0.5)
      this.body = spr
    } else {
      const g = new Graphics()
      // legs
      g.circle(-radius * 0.5, -radius * 0.6, radius * 0.18).fill(COLORS.animalLeg)
      g.circle(radius * 0.5, -radius * 0.6, radius * 0.18).fill(COLORS.animalLeg)
      g.circle(-radius * 0.5, radius * 0.6, radius * 0.18).fill(COLORS.animalLeg)
      g.circle(radius * 0.5, radius * 0.6, radius * 0.18).fill(COLORS.animalLeg)
      // body
      g.ellipse(0, 0, radius * 0.9, radius * 1.2).fill(COLORS.animal)
      // head
      g.circle(radius * 0.9, 0, radius * 0.55).fill(COLORS.animalHead)
      // ears
      g.circle(radius * 0.9 + radius * 0.4, -radius * 0.3, radius * 0.18).fill(COLORS.animalEar)
      g.circle(radius * 0.9 + radius * 0.4, radius * 0.3, radius * 0.18).fill(COLORS.animalEar)
      this.body = g
    }
    this.container.addChild(this.body)
  }

  moveTowards(
    targetX: number,
    targetY: number,
    dt: number,
    speed: number = ANIMAL.followSpeed,
    minDistance: number = ANIMAL.minDistance,
  ): void {
    const dx = targetX - this.container.x
    const dy = targetY - this.container.y
    const dist = Math.hypot(dx, dy)
    if (dist <= minDistance) return
    const nx = dx / dist
    const ny = dy / dist
    const step = speed * dt
    const moveX = nx * step
    const moveY = ny * step
    if (step >= dist) {
      this.container.position.set(targetX, targetY)
      return
    }
    this.container.x += moveX
    this.container.y += moveY
    // orient toward movement; adjust if using sprite whose default faces down
    const angle = Math.atan2(dy, dx)
    if (this.body instanceof Sprite) {
      this.container.rotation = angle - Math.PI / 2
    } else {
      this.container.rotation = angle
    }
  }

  update(dt: number): void {
    super.update(dt)
  }
}


