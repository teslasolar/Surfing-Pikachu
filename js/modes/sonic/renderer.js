// Sonic Speedrun Mode Renderer
import Config from './config.js';

const SonicRenderer = {
    ctx: null,
    canvas: null,
    time: 0,
    speedLines: [],

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        return this;
    },

    clear() {
        this.ctx.clearRect(0, 0, Config.GAME_WIDTH, Config.GAME_HEIGHT);
    },

    // Draw Sonic-style Pikachu
    drawSonicPikachu(x, y, rotation, isSpinning, speed) {
        const ctx = this.ctx;
        const C = Config.colors;
        this.time++;

        ctx.save();
        ctx.translate(x, y);

        // Speed aura when fast
        if (speed > 8) {
            const auraIntensity = Math.min(1, (speed - 8) / 8);
            ctx.strokeStyle = `rgba(0, 150, 255, ${auraIntensity * 0.5})`;
            ctx.lineWidth = 3;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(0, -10, 30 + i * 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.rotate(rotation);

        if (isSpinning) {
            // Spin ball mode
            const spinFrame = Math.floor(this.time / 2) % 8;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
            gradient.addColorStop(0, C.sonic_blue);
            gradient.addColorStop(0.7, C.sonic_spikes);
            gradient.addColorStop(1, '#001144');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fill();

            // Spin lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                const angle = (spinFrame / 8) * Math.PI * 2 + (i * Math.PI / 2);
                ctx.beginPath();
                ctx.arc(0, 0, 20, angle, angle + 0.5);
                ctx.stroke();
            }
        } else {
            // Surfboard (red like Sonic's shoes)
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 12, 20, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Body (blue like Sonic)
            ctx.fillStyle = C.sonic_blue;
            ctx.beginPath();
            ctx.ellipse(0, -5, 15, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Belly
            ctx.fillStyle = C.sonic_belly;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = C.sonic_blue;
            ctx.beginPath();
            ctx.ellipse(0, -25, 14, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sonic spikes (back of head)
            ctx.fillStyle = C.sonic_spikes;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(5 + i * 3, -25 - i * 2);
                ctx.lineTo(25 + i * 8, -30 - i * 5);
                ctx.lineTo(10 + i * 3, -20 - i * 2);
                ctx.closePath();
                ctx.fill();
            }

            // Ears (Pikachu style but blue-tipped)
            ctx.fillStyle = '#ffd700'; // Yellow Pikachu ears
            [[-8, -12], [8, 12]].forEach(([bx, tx]) => {
                ctx.beginPath();
                ctx.moveTo(bx, -35);
                ctx.lineTo(tx, -55);
                ctx.lineTo(bx > 0 ? 3 : -3, -40);
                ctx.closePath();
                ctx.fill();
            });

            // Blue ear tips (Sonic style)
            ctx.fillStyle = C.sonic_blue;
            [[-10, -12, -7], [10, 12, 7]].forEach(([x1, x2, x3]) => {
                ctx.beginPath();
                ctx.moveTo(x1, -48);
                ctx.lineTo(x2, -55);
                ctx.lineTo(x3, -50);
                ctx.closePath();
                ctx.fill();
            });

            // Face
            ctx.fillStyle = C.sonic_belly;
            ctx.beginPath();
            ctx.ellipse(0, -22, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eyes (Sonic's connected eyes style)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(-3, -28, 5, 6, 0, 0, Math.PI * 2);
            ctx.ellipse(3, -28, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(-2, -27, 2.5, 3, 0, 0, Math.PI * 2);
            ctx.ellipse(4, -27, 2.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Nose
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(0, -23, 3, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Confident smirk
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(2, -19, 4, 0.2, Math.PI - 0.5);
            ctx.stroke();

            // Lightning bolt tail (yellow)
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.moveTo(10, 5);
            ctx.lineTo(25, -5);
            ctx.lineTo(20, 5);
            ctx.lineTo(35, 0);
            ctx.lineTo(22, 12);
            ctx.lineTo(26, 8);
            ctx.lineTo(12, 12);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    },

    drawRing(ring) {
        const ctx = this.ctx;
        const C = Config.colors;

        ctx.save();
        ctx.translate(ring.x, ring.y);

        // Ring rotation animation
        const scale = Math.abs(Math.sin(this.time * 0.1 + ring.phase));
        ctx.scale(scale * 0.8 + 0.2, 1);

        // Outer ring
        ctx.strokeStyle = C.ring_gold;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Inner shine
        ctx.strokeStyle = C.ring_shine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, -0.5, 1);
        ctx.stroke();

        // Sparkle
        if (Math.sin(this.time * 0.2 + ring.phase) > 0.8) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5, -5, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    },

    drawSpring(spring) {
        const ctx = this.ctx;
        const C = Config.colors;

        ctx.save();
        ctx.translate(spring.x, spring.y);

        // Spring base
        ctx.fillStyle = C.spring_yellow;
        ctx.fillRect(-15, 0, 30, 10);

        // Spring coils
        ctx.strokeStyle = C.spring_yellow;
        ctx.lineWidth = 4;
        const compression = spring.compressed ? 0.5 : 1;
        for (let i = 0; i < 3; i++) {
            const y = -5 - i * 8 * compression;
            ctx.beginPath();
            ctx.moveTo(-12, y);
            ctx.lineTo(12, y);
            ctx.stroke();
        }

        // Red top
        ctx.fillStyle = C.spring_red;
        ctx.beginPath();
        ctx.ellipse(0, -25 * compression, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawSpike(spike) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(spike.x, spike.y);

        // Spike base
        ctx.fillStyle = '#404040';
        ctx.fillRect(-20, 0, 40, 10);

        // Spikes
        ctx.fillStyle = Config.colors.spike_silver;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-15 + i * 10, 0);
            ctx.lineTo(-10 + i * 10, -20);
            ctx.lineTo(-5 + i * 10, 0);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    },

    drawBoostPad(pad) {
        const ctx = this.ctx;
        const C = Config.colors;

        ctx.save();
        ctx.translate(pad.x, pad.y);

        // Glowing base
        ctx.fillStyle = C.boost_blue;
        ctx.shadowColor = C.boost_glow;
        ctx.shadowBlur = 15;
        ctx.fillRect(-25, -5, 50, 10);

        // Arrow pattern
        ctx.fillStyle = C.boost_glow;
        for (let i = 0; i < 3; i++) {
            const ax = -15 + i * 15 + (this.time % 30) * 0.5;
            if (ax < 20) {
                ctx.beginPath();
                ctx.moveTo(ax, 0);
                ctx.lineTo(ax + 8, -3);
                ctx.lineTo(ax + 8, 3);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    },

    drawSpeedLines(speed, distance) {
        if (speed < 7) return;

        const ctx = this.ctx;
        const intensity = Math.min(1, (speed - 7) / 8);
        ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.4})`;
        ctx.lineWidth = 2;

        for (let i = 0; i < 10; i++) {
            const y = (i * 45 + distance * 2) % Config.GAME_HEIGHT;
            const length = 30 + speed * 5;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(length, y);
            ctx.stroke();
        }
    },

    drawBackground(distance, time) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const WL = Config.WATER_LEVEL;

        // Green Hill Zone sky
        const grad = ctx.createLinearGradient(0, 0, 0, WL);
        grad.addColorStop(0, C.sky_top);
        grad.addColorStop(0.5, C.sky_mid);
        grad.addColorStop(1, C.sky_bottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, WL);

        // Fluffy clouds
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            const cx = ((i * 150 + 50) - distance * 0.3) % (W + 100);
            const cy = 40 + Math.sin(i * 2.5) * 20;
            this.drawCloud(cx, cy, 0.8 + Math.sin(i) * 0.2);
        }

        // Distant mountains (Green Hill style)
        ctx.fillStyle = '#60c040';
        ctx.beginPath();
        ctx.moveTo(0, WL - 40);
        for (let x = 0; x <= W; x += 30) {
            const h = 40 + Math.sin((x + distance * 0.05) * 0.03) * 25;
            ctx.lineTo(x, WL - h);
        }
        ctx.lineTo(W, WL);
        ctx.lineTo(0, WL);
        ctx.closePath();
        ctx.fill();

        // Palm trees
        for (let i = 0; i < 3; i++) {
            const tx = ((i * 200 + 100) - distance * 0.4) % (W + 150) - 50;
            if (tx > -50 && tx < W + 50) {
                this.drawPalmTree(tx, WL - 30 - i * 10);
            }
        }
    },

    drawCloud(x, y, scale) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.arc(30, -5, 30, 0, Math.PI * 2);
        ctx.arc(60, 0, 25, 0, Math.PI * 2);
        ctx.arc(30, 10, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawPalmTree(x, y) {
        const ctx = this.ctx;

        // Trunk (checkered)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x - 8, y, 16, 50);

        // Trunk pattern
        ctx.fillStyle = '#6b3510';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(x - 8, y + i * 10, 16, 5);
        }

        // Leaves
        ctx.fillStyle = '#228b22';
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((i / 5) * Math.PI * 2 - Math.PI / 2);
            ctx.beginPath();
            ctx.ellipse(25, 0, 30, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    },

    drawCheckerGround(distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const H = Config.GAME_HEIGHT;
        const WL = Config.WATER_LEVEL;

        // Grass top
        ctx.fillStyle = C.grass;
        ctx.fillRect(0, WL - 10, W, 20);

        // Checkerboard ground
        const tileSize = 30;
        const offset = distance % (tileSize * 2);

        for (let y = WL + 10; y < H; y += tileSize) {
            for (let x = -offset - tileSize; x < W + tileSize; x += tileSize) {
                const row = Math.floor((y - WL) / tileSize);
                const col = Math.floor((x + offset) / tileSize);
                ctx.fillStyle = (row + col) % 2 === 0 ? C.ground_light : C.ground_dark;
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
    },

    drawWater(getWaveHeightAt, distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const WL = Config.WATER_LEVEL;

        // Water surface (thin line for Sonic style)
        ctx.strokeStyle = C.water_surface;
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
            const method = x === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x, WL - getWaveHeightAt(x));
        }
        ctx.stroke();

        // Highlight
        ctx.strokeStyle = C.highlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
            const method = x === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x, WL - getWaveHeightAt(x) - 3);
        }
        ctx.stroke();
    },

    drawRingCounter(rings) {
        const ctx = this.ctx;

        // Ring icon
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(25, 25, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Ring count
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${rings}`, 45, 32);
    },

    drawSpeedometer(speed) {
        const ctx = this.ctx;
        const W = Config.GAME_WIDTH;

        // Speed label
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('SPEED', W - 15, 20);

        // Speed bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(W - 120, 25, 105, 12);

        const speedPercent = Math.min(1, speed / 15);
        const gradient = ctx.createLinearGradient(W - 118, 0, W - 17, 0);
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(0.5, '#ffff00');
        gradient.addColorStop(1, '#ff0000');

        ctx.fillStyle = gradient;
        ctx.fillRect(W - 118, 27, 101 * speedPercent, 8);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(W - 120, 25, 105, 12);
    },

    drawParticles(particles) {
        const ctx = this.ctx;
        for (const p of particles) {
            if (p.type === 'ring') {
                ctx.fillStyle = `rgba(255, 215, 0, ${p.life / 30})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 30})`;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawScorePopups(popups) {
        const ctx = this.ctx;
        for (const p of popups) {
            ctx.fillStyle = `rgba(255, 215, 0, ${p.life / 60})`;
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y);
        }
    },

    drawFlipIndicator(x, y, flips) {
        if (flips > 0) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = 'bold 14px "Press Start 2P", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${flips}x SPIN!`, x, y - 70);
        }
    }
};

export default SonicRenderer;
