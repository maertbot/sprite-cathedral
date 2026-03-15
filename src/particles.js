// Particle systems — golden pollen + chimney smoke

export class ParticleSystem {
  constructor() {
    this.pollen = [];
    this.smoke = [];
    this.canvasW = 0;
    this.canvasH = 0;
  }

  resize(w, h) {
    this.canvasW = w;
    this.canvasH = h;
  }

  // Spawn ambient golden pollen particles
  spawnPollen() {
    const maxPollen = 60;
    while (this.pollen.length < maxPollen) {
      this.pollen.push({
        x: Math.random() * this.canvasW,
        y: Math.random() * this.canvasH,
        vx: (Math.random() - 0.3) * 0.3,
        vy: -Math.random() * 0.2 - 0.05,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.15,
        life: Math.random() * 1000 + 500,
        maxLife: 1500,
        hue: Math.random() * 30 + 35, // gold range
      });
    }
  }

  // Spawn chimney smoke for an active building
  spawnSmoke(x, y) {
    if (this.smoke.length > 200) return;
    for (let i = 0; i < 2; i++) {
      this.smoke.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y - 5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.6 - 0.3,
        size: Math.random() * 4 + 3,
        alpha: 0.4,
        life: 0,
        maxLife: 1200 + Math.random() * 600,
      });
    }
  }

  update(dt) {
    // Update pollen
    for (let i = this.pollen.length - 1; i >= 0; i--) {
      const p = this.pollen[i];
      p.x += p.vx + Math.sin(Date.now() / 3000 + i) * 0.15;
      p.y += p.vy;
      p.life -= dt;

      if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > this.canvasW + 20) {
        this.pollen.splice(i, 1);
      }
    }

    // Update smoke
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i];
      s.x += s.vx + Math.sin(Date.now() / 2000 + i * 0.5) * 0.1;
      s.y += s.vy;
      s.size += 0.02;
      s.life += dt;
      s.alpha = 0.4 * (1 - s.life / s.maxLife);

      if (s.life >= s.maxLife) {
        this.smoke.splice(i, 1);
      }
    }

    this.spawnPollen();
  }

  draw(ctx) {
    // Draw pollen
    for (const p of this.pollen) {
      const fadeIn = Math.min(1, (p.maxLife - p.life) / 300);
      const fadeOut = Math.min(1, p.life / 300);
      const alpha = p.alpha * fadeIn * fadeOut;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = `hsl(${p.hue}, 90%, 80%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw smoke
    for (const s of this.smoke) {
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = `rgba(200, 200, 210, 0.8)`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
