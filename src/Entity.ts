import { Container } from 'pixi.js'

export abstract class Entity {
  container: Container

  constructor() {
    this.container = new Container()
  }

  // dt is in seconds
  update(dt: number): void {
    void dt
  }
}


