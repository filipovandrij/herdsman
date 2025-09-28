export const FULLSCREEN = false
export const APP_WIDTH = 1280
export const APP_HEIGHT = 720

export const COLORS = {
  background: 0x333333,
  field: 0x2e7d32,
  yard: 0xffff00,
  player: 0xff0000,
  animal: 0xffffff,
  animalHead: 0xeeeeee,
  animalEar: 0xcccccc,
  animalLeg: 0x444444,
  text: 0x000000,
} as const

export const YARD = {
  width: 200,
  height: 140,
  margin: 16,
} as const

export const PLAYER = {
  radius: 24,
  speed: 220, // pixels per second
  arrivalRadius: 10,
} as const

export const ASSISTANT = {
  radius: 22,
  speed: 200,
} as const

export const ANIMAL = {
  radius: 16,
  followSpeed: 160,
  minDistance: 18,
  patrolSpeed: 100,
} as const

export const UI = {
  fontSize: 22,
} as const

export const SPAWN = {
  count: 20,
  limit: 40,
  intervalMinSec: 2,
  intervalMaxSec: 6,
} as const

export const CAPTURE = {
  radius: 60,
  maxGroupSize: 5,
} as const

export const UPGRADES = {
  capacityLevels: [1, 2, 3, 5],
  capacityCosts: [0, 5, 10, 25],
  scorePerLevels: [1, 2, 3, 5],
  scorePerCosts: [0, 5, 10, 25],
  // Sheep spawn rate multiplier (applies as: baseInterval / multiplier)
  spawnRateLevels: [1, 1.5, 2],
  spawnRateCosts: [0, 10, 25],
  assistantCost: 50,
} as const

export const ASSETS = {
  sheep: '/sheep.png', // place file into public/sheep.png
  player: '/herdsman.png', // place file into public/herdsman.png
  corral: '/corral.png', // place file into public/corral.png
  shop: '/shop.png', // place file into public/shop.png
  assistant: '/herdsman.png', // optional dedicated icon
  bgm: '/bg.mp3', // place file into public/bg.mp3
} as const

export const AUDIO = {
  bgVolume: 0.35,
} as const

export const SHOP = {
  x: 16,
  y: 64,
  width: 128,
  height: 128,
} as const


