import React, { useRef, useEffect, useCallback } from 'react'

// ─── Flame color palettes (matching LandingPage) ──────────────────
const EMBER_COLORS = [
  { r: 255, g: 160, b: 20 },
  { r: 255, g: 120, b: 10 },
  { r: 255, g: 200, b: 60 },
  { r: 255, g: 80, b: 200 },
  { r: 230, g: 30, b: 120 },
  { r: 180, g: 60, b: 255 },
  { r: 150, g: 40, b: 220 },
  { r: 80, g: 180, b: 255 },
]

const SPARKLE_COLORS = [
  { r: 255, g: 220, b: 150 },
  { r: 255, g: 180, b: 100 },
  { r: 255, g: 200, b: 255 },
  { r: 200, g: 200, b: 255 },
  { r: 255, g: 255, b: 200 },
]

function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Ember Particle Class ─────────────────────────────────────────
class EmberParticle {
  constructor(canvasW, canvasH) {
    this.reset(canvasW, canvasH)
  }

  reset(canvasW, canvasH) {
    this.x = randomRange(0, canvasW)
    this.y = randomRange(canvasH * 0.6, canvasH * 1.1)
    this.size = randomRange(1, 3.5)
    this.life = randomRange(3, 7)
    this.maxLife = this.life
    this.vx = randomRange(-0.3, 0.3)
    this.vy = randomRange(-0.6, -0.2)
    const col = pickRandom(EMBER_COLORS)
    this.r = col.r
    this.g = col.g
    this.b = col.b
    this.alpha = randomRange(0.3, 0.7)
    this.flickerSpeed = randomRange(3, 8)
    this.flickerPhase = Math.random() * Math.PI * 2
    this.swayAmp = randomRange(0.2, 0.8)
    this.swayFreq = randomRange(1, 3)
    this.swayPhase = Math.random() * Math.PI * 2
    this.age = 0
    this.alive = true
  }

  update(dt, canvasW, canvasH, time) {
    this.age += dt
    if (this.age >= this.maxLife) {
      this.alive = false
      return
    }
    const progress = this.age / this.maxLife
    this.x += this.vx * 60 * dt
    this.y += this.vy * 60 * dt
    this.x += Math.sin(time * this.swayFreq + this.swayPhase) * this.swayAmp * dt * 20
    this.currentSize = this.size * (1 - progress * 0.5)
    const flicker = Math.sin(time * this.flickerSpeed + this.flickerPhase) * 0.3 + 0.7
    const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
    const fadeIn = progress < 0.15 ? progress / 0.15 : 1
    this.currentAlpha = this.alpha * flicker * fadeOut * fadeIn
  }

  draw(ctx) {
    if (!this.alive || this.currentSize <= 0) return
    const size = Math.max(this.currentSize, 0.5)
    if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(size)) return
    ctx.save()
    ctx.globalAlpha = this.currentAlpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
    ctx.shadowColor = `rgb(${this.r}, ${this.g}, ${this.b})`
    ctx.shadowBlur = size * 6
    ctx.fill()
    ctx.restore()
  }
}

// ─── Sparkle Particle Class ───────────────────────────────────────
class SparkleParticle {
  constructor(canvasW, canvasH) {
    this.reset(canvasW, canvasH)
  }

  reset(canvasW, canvasH) {
    this.x = randomRange(0, canvasW)
    this.y = randomRange(0, canvasH)
    this.size = randomRange(0.5, 2)
    this.life = randomRange(0.5, 1.5)
    this.maxLife = this.life
    const col = pickRandom(SPARKLE_COLORS)
    this.r = col.r
    this.g = col.g
    this.b = col.b
    this.alpha = randomRange(0.5, 1.0)
    this.age = 0
    this.alive = true
  }

  update(dt) {
    this.age += dt
    if (this.age >= this.maxLife) {
      this.alive = false
      return
    }
    const progress = this.age / this.maxLife
    // Sparkles flash in and out
    if (progress < 0.3) {
      this.currentAlpha = this.alpha * (progress / 0.3)
    } else {
      this.currentAlpha = this.alpha * (1 - (progress - 0.3) / 0.7)
    }
    this.currentSize = this.size * (1 - progress * 0.3)
  }

  draw(ctx) {
    if (!this.alive || this.currentSize <= 0) return
    ctx.save()
    ctx.globalAlpha = this.currentAlpha
    // Draw a 4-pointed star
    const s = this.currentSize
    ctx.beginPath()
    ctx.moveTo(this.x, this.y - s * 2)
    ctx.lineTo(this.x + s * 0.5, this.y - s * 0.5)
    ctx.lineTo(this.x + s * 2, this.y)
    ctx.lineTo(this.x + s * 0.5, this.y + s * 0.5)
    ctx.lineTo(this.x, this.y + s * 2)
    ctx.lineTo(this.x - s * 0.5, this.y + s * 0.5)
    ctx.lineTo(this.x - s * 2, this.y)
    ctx.lineTo(this.x - s * 0.5, this.y - s * 0.5)
    ctx.closePath()
    ctx.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
    ctx.shadowColor = `rgb(${this.r}, ${this.g}, ${this.b})`
    ctx.shadowBlur = s * 8
    ctx.fill()
    ctx.restore()
  }
}

// ─── Intensity presets ────────────────────────────────────────────
const PRESETS = {
  low: { embers: 20, sparkles: 6, sparkleRate: 0.008 },
  medium: { embers: 40, sparkles: 10, sparkleRate: 0.02 },
  high: { embers: 70, sparkles: 18, sparkleRate: 0.04 },
}

// ─── FireBackground Component ─────────────────────────────────────
const FireBackground = ({
  intensity = 'low',
  enableEmbers = true,
  enableSparkles = true,
  className = '',
}) => {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const particlesRef = useRef({ embers: [], sparkles: [] })

  const getPreset = useCallback(() => {
    const base = PRESETS[intensity] || PRESETS.low
    const w = window.innerWidth
    const scale = w < 480 ? 0.4 : w < 768 ? 0.6 : w < 1200 ? 0.8 : 1
    return {
      embers: Math.round(base.embers * scale),
      sparkles: Math.round(base.sparkles * scale),
      sparkleRate: base.sparkleRate,
    }
  }, [intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let startTime = performance.now() / 1000
    let lastTime = startTime

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.parentElement?.clientWidth || window.innerWidth
      const h = canvas.parentElement?.clientHeight || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)

      const preset = getPreset()
      const embers = []
      const sparkles = []

      if (enableEmbers) {
        for (let i = 0; i < preset.embers; i++) {
          const p = new EmberParticle(w, h)
          p.age = Math.random() * p.maxLife
          embers.push(p)
        }
      }
      if (enableSparkles) {
        for (let i = 0; i < preset.sparkles; i++) {
          const p = new SparkleParticle(w, h)
          p.age = Math.random() * p.maxLife
          sparkles.push(p)
        }
      }
      particlesRef.current = { embers, sparkles }
    }

    resize()
    window.addEventListener('resize', resize)

    const animate = (timestamp) => {
      const now = timestamp / 1000
      const dt = Math.min(now - lastTime, 0.05)
      lastTime = now
      const time = now - startTime

      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'

      const { embers, sparkles } = particlesRef.current
      const preset = getPreset()

      // Update & draw embers
      if (enableEmbers) {
        for (let i = 0; i < embers.length; i++) {
          const p = embers[i]
          p.update(dt, w, h, time)
          if (!p.alive) {
            p.reset(w, h)
          }
          p.draw(ctx)
        }
      }

      // Update & draw sparkles
      if (enableSparkles) {
        for (let i = 0; i < sparkles.length; i++) {
          const p = sparkles[i]
          p.update(dt)
          if (!p.alive) {
            p.reset(w, h)
          }
          p.draw(ctx)
        }

        // Randomly spawn extra sparkle bursts
        if (Math.random() < preset.sparkleRate) {
          const burst = new SparkleParticle(w, h)
          burst.size = randomRange(1.5, 3)
          burst.alpha = randomRange(0.7, 1.0)
          sparkles.push(burst)
          if (sparkles.length > preset.sparkles + 15) {
            sparkles.shift()
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over'
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [intensity, enableEmbers, enableSparkles, getPreset])

  return (
    <canvas
      ref={canvasRef}
      className={`fire-background-canvas ${className}`}
      aria-hidden="true"
    />
  )
}

export default FireBackground
