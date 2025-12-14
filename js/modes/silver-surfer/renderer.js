// Silver Surfer Mode Renderer
import Config from './config.js';

const SilverRenderer = {
    ctx: null,
    canvas: null,
    stars: [],
    nebulaClouds: [],

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.generateStars();
        this.generateNebulae();
        return this;
    },

    generateStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * Config.GAME_WIDTH,
                y: Math.random() * Config.WATER_LEVEL,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.5 + 0.1
            });
        }
    },

    generateNebulae() {
        this.nebulaClouds = [];
        const colors = [Config.colors.nebula1, Config.colors.nebula2, Config.colors.nebula3];
        for (let i = 0; i < 5; i++) {
            this.nebulaClouds.push({
                x: Math.random() * 800 - 100,
                y: Math.random() * 200 + 20,
                radius: Math.random() * 100 + 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 0.3 + 0.1
            });
        }
    },

    clear() {
        this.ctx.clearRect(0, 0, Config.GAME_WIDTH, Config.GAME_HEIGHT);
    },

    drawSilverPikachu(x, y, rotation, powerLevel = 1) {
        const ctx = this.ctx;
        const C = Config.colors;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Cosmic energy aura
        const auraSize = 40 + powerLevel * 10;
        const gradient = ctx.createRadialGradient(0, -10, 5, 0, -10, auraSize);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(150, 100, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(150, 100, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, -10, auraSize, 0, Math.PI * 2);
        ctx.fill();

        // Cosmic Surfboard
        ctx.fillStyle = C.surfboard;
        ctx.beginPath();
        ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.surfboard_energy;
        ctx.lineWidth = 2;
        ctx.shadowColor = C.surfboard_energy;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Energy trail on board
        ctx.strokeStyle = C.surfboard_energy;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-20, 12);
        ctx.lineTo(20, 12);
        ctx.stroke();

        // Silver Body
        ctx.fillStyle = C.silver_body;
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body shine
        ctx.fillStyle = C.silver_shine;
        ctx.beginPath();
        ctx.ellipse(-5, -8, 5, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Silver Head
        ctx.fillStyle = C.silver_body;
        ctx.beginPath();
        ctx.ellipse(0, -25, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head shine
        ctx.fillStyle = C.silver_shine;
        ctx.beginPath();
        ctx.ellipse(-4, -28, 4, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Silver Ears
        ctx.fillStyle = C.silver_body;
        [[-8, -12], [8, 12]].forEach(([bx, tx]) => {
            ctx.beginPath();
            ctx.moveTo(bx, -35);
            ctx.lineTo(tx, -55);
            ctx.lineTo(bx > 0 ? 3 : -3, -40);
            ctx.closePath();
            ctx.fill();
        });

        // Ear tips (darker silver)
        ctx.fillStyle = C.silver_dark;
        [[-10, -12, -7], [10, 12, 7]].forEach(([x1, x2, x3]) => {
            ctx.beginPath();
            ctx.moveTo(x1, -48);
            ctx.lineTo(x2, -55);
            ctx.lineTo(x3, -50);
            ctx.closePath();
            ctx.fill();
        });

        // Glowing cosmic eyes
        ctx.fillStyle = C.silver_glow;
        ctx.shadowColor = C.silver_glow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(-5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Nose
        ctx.fillStyle = C.silver_dark;
        ctx.beginPath();
        ctx.arc(0, -24, 2, 0, Math.PI * 2);
        ctx.fill();

        // Cosmic lightning tail
        ctx.strokeStyle = C.surfboard_energy;
        ctx.lineWidth = 3;
        ctx.shadowColor = C.surfboard_energy;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(10, 5);
        ctx.lineTo(25, -5);
        ctx.lineTo(20, 5);
        ctx.lineTo(35, 0);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
    },

    drawGalactus(x, y, distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const scale = Math.min(1, 0.3 + (distance + 500) / 1000);

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Galactus glow
        const gradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 150);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 150, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = C.galactus_body;
        ctx.beginPath();
        ctx.ellipse(0, 20, 40, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // Helmet
        ctx.fillStyle = C.galactus_helmet;
        ctx.beginPath();
        ctx.moveTo(-30, -20);
        ctx.lineTo(0, -80);
        ctx.lineTo(30, -20);
        ctx.lineTo(20, -10);
        ctx.lineTo(0, -30);
        ctx.lineTo(-20, -10);
        ctx.closePath();
        ctx.fill();

        // Helmet details
        ctx.strokeStyle = C.galactus_glow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-15, -30);
        ctx.lineTo(0, -70);
        ctx.lineTo(15, -30);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = C.galactus_glow;
        ctx.shadowColor = C.galactus_glow;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(-12, -15, 5, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(12, -15, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Arms reaching forward
        ctx.fillStyle = C.galactus_body;
        ctx.beginPath();
        ctx.ellipse(-50, 30, 15, 40, 0.3, 0, Math.PI * 2);
        ctx.ellipse(50, 30, 15, 40, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawBackground(distance, time) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const WL = Config.WATER_LEVEL;

        // Space gradient
        const grad = ctx.createLinearGradient(0, 0, 0, WL);
        grad.addColorStop(0, C.space_top);
        grad.addColorStop(0.5, C.space_mid);
        grad.addColorStop(1, C.space_bottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, WL);

        // Nebulae (parallax)
        for (const nebula of this.nebulaClouds) {
            const nx = (nebula.x - distance * nebula.speed) % (W + 200);
            const adjustedX = nx < -100 ? nx + W + 200 : nx;

            const gradient = ctx.createRadialGradient(
                adjustedX, nebula.y, 0,
                adjustedX, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(adjustedX, nebula.y, nebula.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Stars
        ctx.fillStyle = C.star;
        for (const star of this.stars) {
            const sx = (star.x - distance * star.speed * 0.5) % W;
            const adjustedX = sx < 0 ? sx + W : sx;
            const twinkle = Math.sin(time * 0.003 + star.twinkle) * 0.5 + 0.5;
            ctx.globalAlpha = 0.3 + twinkle * 0.7;
            ctx.beginPath();
            ctx.arc(adjustedX, star.y, star.size * twinkle + 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Distant galaxy
        const galaxyX = 380 - (distance * 0.02) % 500;
        ctx.save();
        ctx.translate(galaxyX, 60);
        ctx.rotate(distance * 0.0001);
        const galaxyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
        galaxyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        galaxyGrad.addColorStop(0.3, 'rgba(200, 150, 255, 0.4)');
        galaxyGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = galaxyGrad;
        ctx.scale(2, 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawCosmicWaves(getWaveHeightAt, waves, distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const H = Config.GAME_HEIGHT;
        const WL = Config.WATER_LEVEL;

        // Deep cosmic energy
        const deepGrad = ctx.createLinearGradient(0, WL, 0, H);
        deepGrad.addColorStop(0, C.cosmic_deep);
        deepGrad.addColorStop(1, '#0a0015');
        ctx.fillStyle = deepGrad;
        ctx.fillRect(0, WL, W, H - WL);

        // Energy wave surface
        ctx.fillStyle = C.cosmic_surface;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 5) {
            ctx.lineTo(x, WL - getWaveHeightAt(x));
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Glowing edge
        ctx.strokeStyle = C.cosmic_glow;
        ctx.lineWidth = 3;
        ctx.shadowColor = C.cosmic_glow;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
            const method = x === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x, WL - getWaveHeightAt(x));
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Energy highlights
        ctx.strokeStyle = C.highlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
            const method = x === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x, WL - getWaveHeightAt(x) - 5);
        }
        ctx.stroke();

        // Energy particles at wave peaks
        ctx.fillStyle = C.foam;
        for (const wave of waves) {
            const sx = wave.x - distance;
            if (sx > -wave.width && sx < W + wave.width) {
                const fy = WL - wave.height * 0.7;
                for (let i = 0; i < 5; i++) {
                    const px = sx + wave.width * (0.2 + i * 0.15);
                    const py = fy + Math.sin(distance * 0.02 + i) * 5;
                    ctx.beginPath();
                    ctx.arc(px, py, 3 + Math.random() * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    },

    drawCosmicDebris(debris) {
        const ctx = this.ctx;
        ctx.fillStyle = Config.colors.cosmic_debris;
        ctx.shadowColor = Config.colors.cosmic_debris;
        ctx.shadowBlur = 8;

        for (const d of debris) {
            ctx.globalAlpha = d.life / d.maxLife;
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);

            // Crystal shape
            ctx.beginPath();
            ctx.moveTo(0, -d.size);
            ctx.lineTo(d.size * 0.7, 0);
            ctx.lineTo(0, d.size);
            ctx.lineTo(-d.size * 0.7, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    },

    drawParticles(particles) {
        const ctx = this.ctx;
        for (const p of particles) {
            ctx.fillStyle = `rgba(150, 100, 255, ${p.life / 30})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawScorePopups(popups) {
        const ctx = this.ctx;
        for (const p of popups) {
            ctx.fillStyle = `rgba(0, 255, 255, ${p.life / 60})`;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 16px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`+${p.score}`, p.x, p.y);
            if (p.flips) {
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText(`${p.flips} COSMIC FLIP${p.flips > 1 ? 'S' : ''}!`, p.x, p.y + 15);
            }
            ctx.shadowBlur = 0;
        }
    },

    drawFlipIndicator(x, y, flips) {
        if (flips > 0) {
            this.ctx.fillStyle = Config.colors.score_popup;
            this.ctx.shadowColor = Config.colors.score_popup;
            this.ctx.shadowBlur = 10;
            this.ctx.font = 'bold 14px "Press Start 2P", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${flips}x`, x, y - 70);
            this.ctx.shadowBlur = 0;
        }
    },

    drawPowerCosmic(level) {
        const ctx = this.ctx;
        const W = Config.GAME_WIDTH;

        // Power Cosmic bar at top
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 150, 20);

        const gradient = ctx.createLinearGradient(12, 0, 140, 0);
        gradient.addColorStop(0, '#4a0080');
        gradient.addColorStop(0.5, '#9932cc');
        gradient.addColorStop(1, '#00ffff');

        ctx.fillStyle = gradient;
        ctx.fillRect(12, 12, 146 * level, 16);

        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 150, 20);

        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('POWER COSMIC', 12, 45);
    }
};

export default SilverRenderer;
