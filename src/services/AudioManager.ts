import { ASSETS, AUDIO } from './Config.ts'

class AudioManagerImpl {
  private bgm: HTMLAudioElement | null = null
  private initialized = false
  private muted = false

  async init(): Promise<void> {
    if (this.initialized) return
    try {
      this.bgm = new Audio(ASSETS.bgm)
      this.bgm.loop = true
      this.bgm.volume = this.muted ? 0 : AUDIO.bgVolume
      await this.bgm.play()
      this.initialized = true
    } catch {
      const unlock = () => {
        if (!this.bgm) return
        this.bgm.play().catch(() => {})
        this.initialized = true
        window.removeEventListener('pointerdown', unlock)
        window.removeEventListener('keydown', unlock)
      }
      this.bgm = new Audio(ASSETS.bgm)
      this.bgm.loop = true
      this.bgm.volume = this.muted ? 0 : AUDIO.bgVolume
      window.addEventListener('pointerdown', unlock)
      window.addEventListener('keydown', unlock)
    }
  }

  toggleMute(): void {
    this.setMuted(!this.muted)
  }

  setMuted(m: boolean): void {
    this.muted = m
    if (this.bgm) this.bgm.volume = this.muted ? 0 : AUDIO.bgVolume
  }

  isMuted(): boolean {
    return this.muted
  }
}

export const AudioManager = new AudioManagerImpl()


