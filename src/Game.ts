import { Application, Container, Assets, Sprite, Texture } from 'pixi.js'
import { Player } from './Player.ts'
import { Animal } from './Animal.ts'
import { Yard } from './Yard.ts'
import { ScoreUI } from './ScoreUI.ts'
import { ANIMAL, APP_HEIGHT, APP_WIDTH, ASSETS, CAPTURE, FULLSCREEN, PLAYER, SHOP, SPAWN, UPGRADES, YARD } from './config.ts'
import { AudioManager } from './AudioManager.ts'
import { Field } from './Field.ts'
import { ShopUI } from './ShopUI.ts'
import { Assistant } from './Assistant.ts'

export class Game {
  private app: Application
  private stage: Container

  animals: Animal[] = []
  player!: Player
  yard!: Yard
  scoreUI!: ScoreUI
  field!: Field
  private followers: Animal[] = []
  private score = 0
  private spawnTimer = 0
  private nextSpawnIn = 0
  private keys: Record<string, boolean> = {}
  private shop!: ShopUI
  private capacityLevel = 0
  private scorePerLevel = 0
  private assistant = false
  private shopMarker!: Sprite
  private shopRect = { x: 0, y: 0, w: 0, h: 0 }
  private assistantEntity: Assistant | null = null
  private assistantFollowers: Animal[] = []

  constructor(app: Application) {
    this.app = app
    this.stage = app.stage
  }

  async init(): Promise<void> {
    const width = FULLSCREEN ? this.app.renderer.width : APP_WIDTH
    const height = FULLSCREEN ? this.app.renderer.height : APP_HEIGHT

    // preload assets before creating sprites
    try { await Assets.load(ASSETS.sheep) } catch {}
    try { await Assets.load(ASSETS.player) } catch {}
    try { await Assets.load(ASSETS.corral) } catch {}
    try { await Assets.load(ASSETS.shop) } catch {}
    try { await Assets.load(ASSETS.assistant) } catch {}

    // Field layer (green background)
    this.field = new Field(width, height)
    this.stage.addChild(this.field.container)

    // Yard in bottom-right with margins
    this.yard = new Yard(YARD.width, YARD.height)
    this.yard.container.position.set(width - YARD.width - YARD.margin, height - YARD.height - YARD.margin)
    this.stage.addChild(this.yard.container)

    this.player = new Player(PLAYER.radius)
    this.player.container.position.set(width * 0.5, height * 0.5)
    this.stage.addChild(this.player.container)

    // shop marker in top-right
    const shopTex = Texture.from(ASSETS.shop)
    this.shopMarker = new Sprite({ texture: shopTex })
    this.shopMarker.anchor.set(0, 0)
    const sx = SHOP.width / Math.max(1, this.shopMarker.width)
    const sy = SHOP.height / Math.max(1, this.shopMarker.height)
    this.shopMarker.scale.set(sx, sy)
    const shopX = width - SHOP.width - 16
    const shopY = 16
    this.shopMarker.position.set(shopX, shopY)
    this.shopRect = { x: shopX, y: shopY, w: SHOP.width, h: SHOP.height }
    this.stage.addChild(this.shopMarker)

    this.animals.length = 0
    this.followers.length = 0
    const yardRect = {
      x: this.yard.container.x,
      y: this.yard.container.y,
      w: YARD.width,
      h: YARD.height,
    }
    const margin = ANIMAL.radius
    const isInsideYard = (x: number, y: number): boolean => {
      return (
        x >= yardRect.x - margin &&
        x <= yardRect.x + yardRect.w + margin &&
        y >= yardRect.y - margin &&
        y <= yardRect.y + yardRect.h + margin
      )
    }
    for (let i = 0; i < SPAWN.count; i += 1) {
      let x = 0
      let y = 0
      do {
        x = Math.random() * width
        y = Math.random() * height
      } while (isInsideYard(x, y))
      const a = new Animal(ANIMAL.radius)
      a.container.position.set(x, y)
      this.animals.push(a)
      this.stage.addChild(a.container)
    }

    this.scoreUI = new ScoreUI()
    this.stage.addChild(this.scoreUI.container)
    this.scoreUI.setScore(this.score)

    // Input: mouse click movement disabled; keep keyboard only
    this.stage.eventMode = 'auto'

    // setup spawn timer
    this.nextSpawnIn = this.randomSpawnInterval()

    // keyboard WASD
    window.addEventListener('keydown', (e) => {
      const code = e.code
      this.keys[code] = true
      if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight') e.preventDefault()
      if (code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD' || code.startsWith('Arrow')) {
        this.player.clearTarget()
      }
    })
    window.addEventListener('keyup', (e) => {
      const code = e.code
      this.keys[code] = false
    })

    // shop overlay
    this.shop = new ShopUI(width, height)
    this.stage.addChild(this.shop.container)
    this.shop.updateLabels(this.capacityLevel, this.scorePerLevel, this.assistant, this.score)
    this.shop.bind(
      () => this.buyCapacity(),
      () => this.buyScorePer(),
      () => this.hireAssistant(),
    )

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        this.shop.container.visible = !this.shop.container.visible
      } else if (e.code === 'KeyB') {
        AudioManager.toggleMute()
      }
    })
    // bgm is handled by AudioManager now
  }

  update(delta: number): void {
    const dt = delta // seconds provided by main via deltaMS/1000
    // Keyboard move
    const move = { x: 0, y: 0 }
    if (this.keys['KeyW'] || this.keys['ArrowUp']) move.y -= 1
    if (this.keys['KeyS'] || this.keys['ArrowDown']) move.y += 1
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) move.x -= 1
    if (this.keys['KeyD'] || this.keys['ArrowRight']) move.x += 1
    if (move.x !== 0 || move.y !== 0) {
      const len = Math.hypot(move.x, move.y) || 1
      move.x /= len
      move.y /= len
      this.player.moveBy(move.x * PLAYER.speed * dt, move.y * PLAYER.speed * dt)
      // rotate farmer sprite (faces down by default)
      const angle = Math.atan2(move.y, move.x)
      this.player.container.rotation = angle - Math.PI / 2
      // clamp to field bounds
      const minX = this.player.getRadius()
      const minY = this.player.getRadius()
      const maxX = (FULLSCREEN ? this.app.renderer.width : APP_WIDTH) - this.player.getRadius()
      const maxY = (FULLSCREEN ? this.app.renderer.height : APP_HEIGHT) - this.player.getRadius()
      if (this.player.container.x < minX) this.player.container.x = minX
      if (this.player.container.y < minY) this.player.container.y = minY
      if (this.player.container.x > maxX) this.player.container.x = maxX
      if (this.player.container.y > maxY) this.player.container.y = maxY
    }

    this.player.update(dt)

    // auto open/close shop on zone overlap (player center inside shop rect)
    const px = this.player.container.x
    const py = this.player.container.y
    const r = this.shopRect
    const inShop = px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
    if (this.shop) this.shop.container.visible = inShop

    // Capture logic
    for (const a of this.animals) {
      if (a.isFollowing) continue
      const maxGroup = UPGRADES.capacityLevels[this.capacityLevel]
      if (this.followers.length >= maxGroup) break
      const dx = a.container.x - this.player.container.x
      const dy = a.container.y - this.player.container.y
      const dist = Math.hypot(dx, dy)
      if (dist < CAPTURE.radius) {
        a.isFollowing = true
        a.followIndex = this.followers.length
        this.followers.push(a)
      }
    }

    // Movement for followers (snake-like)
    for (let i = 0; i < this.followers.length; i += 1) {
      const follower = this.followers[i]
      const targetX = i === 0 ? this.player.container.x : this.followers[i - 1].container.x
      const targetY = i === 0 ? this.player.container.y : this.followers[i - 1].container.y
      follower.moveTowards(targetX, targetY, dt)
    }

    // AABB of yard
    const yardX = this.yard.container.x
    const yardY = this.yard.container.y
    const yardW = YARD.width
    const yardH = YARD.height

    // Update animals, patrol and yard check
    for (let i = this.animals.length - 1; i >= 0; i -= 1) {
      const a = this.animals[i]
      if (!a.isFollowing) {
        // Patrol: pick new target if none or reached
        if (!a.patrolTarget) {
          a.patrolTarget = this.randomPatrolPoint()
        }
        a.moveTowards(a.patrolTarget.x, a.patrolTarget.y, dt, ANIMAL.patrolSpeed, ANIMAL.minDistance)
        const dx = a.patrolTarget.x - a.container.x
        const dy = a.patrolTarget.y - a.container.y
        if (Math.hypot(dx, dy) <= ANIMAL.minDistance) {
          a.patrolTarget = this.randomPatrolPoint()
        }
      }

      // Yard intersection (point-in-rect by center)
      const ax = a.container.x
      const ay = a.container.y
      const inside = ax >= yardX && ax <= yardX + yardW && ay >= yardY && ay <= yardY + yardH
      if (inside) {
        // increment score and remove animal
        this.score += UPGRADES.scorePerLevels[this.scorePerLevel]
        this.scoreUI.setScore(this.score)
        this.stage.removeChild(a.container)
        this.animals.splice(i, 1)
        const followerIdx = this.followers.indexOf(a)
        if (followerIdx >= 0) this.followers.splice(followerIdx, 1)
        const asIdx = this.assistantFollowers.indexOf(a)
        if (asIdx >= 0) this.assistantFollowers.splice(asIdx, 1)
        continue
      }

      a.update(dt)
    }

    // Spawner
    this.spawnTimer += dt
    if (this.spawnTimer >= this.nextSpawnIn && this.animals.length < SPAWN.limit) {
      this.spawnTimer = 0
      this.nextSpawnIn = this.randomSpawnInterval()
      const { x, y } = this.randomSpawnPoint()
      const a = new Animal(ANIMAL.radius)
      a.container.position.set(x, y)
      this.animals.push(a)
      this.stage.addChild(a.container)
    }

    // Assistant behavior: visible herder that collects up to 1 sheep
    if (this.assistant) {
      // ensure assistant entity exists
      if (!this.assistantEntity) {
        this.assistantEntity = new Assistant()
        // spawn near player
        this.assistantEntity.container.position.set(this.player.container.x + 32, this.player.container.y + 32)
        this.stage.addChild(this.assistantEntity.container)
      }

      const aEnt = this.assistantEntity

      if (this.assistantFollowers.length < 1) {
        // seek nearest non-following animal to assistant
        let target: Animal | null = null
        let bestDist = Number.POSITIVE_INFINITY
        for (const a of this.animals) {
          if (a.isFollowing) continue
          const d = Math.hypot(a.container.x - aEnt.container.x, a.container.y - aEnt.container.y)
          if (d < bestDist) {
            bestDist = d
            target = a
          }
        }
        if (target) {
          // move assistant towards target
          aEnt.setTarget(target.container.x, target.container.y)
          // capture if close enough
          if (bestDist < CAPTURE.radius) {
            target.isFollowing = true
            target.followIndex = 0
            this.assistantFollowers.push(target)
          }
        }
      } else {
        // has one follower: go to yard center to deliver
        const tx = this.yard.container.x + YARD.width * 0.5
        const ty = this.yard.container.y + YARD.height * 0.5
        aEnt.setTarget(tx, ty)
        // move the follower toward assistant
        const follower = this.assistantFollowers[0]
        follower.moveTowards(aEnt.container.x, aEnt.container.y, dt)
        // if follower delivered (entered yard), assistant will be freed by yard check above
        // when freed, assistant will automatically search next target in the next frames
      }

      // update assistant movement
      this.assistantEntity.update(dt)
    }
  }

  destroy(): void {
    if (this.field) this.stage.removeChild(this.field.container)
    if (this.scoreUI) this.stage.removeChild(this.scoreUI.container)
    if (this.player) this.stage.removeChild(this.player.container)
    if (this.yard) this.stage.removeChild(this.yard.container)
    for (const a of this.animals) this.stage.removeChild(a.container)
    this.animals.length = 0
    this.followers.length = 0
  }

  private canAfford(cost: number): boolean {
    return this.score >= cost
  }

  private spend(cost: number): void {
    this.score -= cost
    if (this.score < 0) this.score = 0
    this.scoreUI.setScore(this.score)
  }

  private buyCapacity(): void {
    const next = Math.min(this.capacityLevel + 1, UPGRADES.capacityLevels.length - 1)
    if (next === this.capacityLevel) return
    const cost = UPGRADES.capacityCosts[next]
    if (!this.canAfford(cost)) return
    this.spend(cost)
    this.capacityLevel = next
    this.shop.updateLabels(this.capacityLevel, this.scorePerLevel, this.assistant, this.score)
  }

  private buyScorePer(): void {
    const next = Math.min(this.scorePerLevel + 1, UPGRADES.scorePerLevels.length - 1)
    if (next === this.scorePerLevel) return
    const cost = UPGRADES.scorePerCosts[next]
    if (!this.canAfford(cost)) return
    this.spend(cost)
    this.scorePerLevel = next
    this.shop.updateLabels(this.capacityLevel, this.scorePerLevel, this.assistant, this.score)
  }

  private hireAssistant(): void {
    if (this.assistant) return
    const cost = UPGRADES.assistantCost
    if (!this.canAfford(cost)) return
    this.spend(cost)
    this.assistant = true
    this.shop.updateLabels(this.capacityLevel, this.scorePerLevel, this.assistant, this.score)
  }

  private randomSpawnInterval(): number {
    const min = SPAWN.intervalMinSec
    const max = SPAWN.intervalMaxSec
    return min + Math.random() * (max - min)
  }

  private randomSpawnPoint(): { x: number; y: number } {
    const width = FULLSCREEN ? this.app.renderer.width : APP_WIDTH
    const height = FULLSCREEN ? this.app.renderer.height : APP_HEIGHT
    const margin = ANIMAL.radius
    const yardX = this.yard.container.x
    const yardY = this.yard.container.y
    const yardW = YARD.width
    const yardH = YARD.height
    let x = 0
    let y = 0
    do {
      x = Math.random() * width
      y = Math.random() * height
    } while (
      x >= yardX - margin &&
      x <= yardX + yardW + margin &&
      y >= yardY - margin &&
      y <= yardY + yardH + margin
    )
    return { x, y }
  }

  private randomPatrolPoint(): { x: number; y: number } {
    const width = FULLSCREEN ? this.app.renderer.width : APP_WIDTH
    const height = FULLSCREEN ? this.app.renderer.height : APP_HEIGHT
    const margin = ANIMAL.radius
    const yardX = this.yard.container.x
    const yardY = this.yard.container.y
    const yardW = YARD.width
    const yardH = YARD.height
    let x = 0
    let y = 0
    do {
      x = Math.random() * width
      y = Math.random() * height
    } while (
      x >= yardX - margin &&
      x <= yardX + yardW + margin &&
      y >= yardY - margin &&
      y <= yardY + yardH + margin
    )
    return { x, y }
  }
}


