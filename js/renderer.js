// Renderer module - All drawing functions
import Config from './config.js';

const Renderer = {
    ctx: null,
    canvas: null,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        return this;
    },

    clear() {
        this.ctx.clearRect(0, 0, Config.GAME_WIDTH, Config.GAME_HEIGHT);
    },

    // Draw Pikachu on surfboard
    drawPikachu(x, y, rotation) {
        const ctx = this.ctx;
        const C = Config.colors;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Surfboard
        ctx.fillStyle = C.surfboard;
        ctx.beginPath();
        ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.surfboard_stroke;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Surfboard stripe
        ctx.fillStyle = C.pikachu_body;
        ctx.fillRect(-20, 10, 40, 4);

        // Body
        ctx.fillStyle = C.pikachu_body;
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -25, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        [[-8, -12], [8, 12]].forEach(([bx, tx]) => {
            ctx.beginPath();
            ctx.moveTo(bx, -35);
            ctx.lineTo(tx, -55);
            ctx.lineTo(bx > 0 ? 3 : -3, -40);
            ctx.closePath();
            ctx.fill();
        });

        // Ear tips
        ctx.fillStyle = C.pikachu_dark;
        [[-10, -12, -7], [10, 12, 7]].forEach(([x1, x2, x3]) => {
            ctx.beginPath();
            ctx.moveTo(x1, -48);
            ctx.lineTo(x2, -55);
            ctx.lineTo(x3, -50);
            ctx.closePath();
            ctx.fill();
        });

        // Cheeks
        ctx.fillStyle = C.pikachu_cheeks;
        ctx.beginPath();
        ctx.arc(-10, -22, 4, 0, Math.PI * 2);
        ctx.arc(10, -22, 4, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = C.pikachu_dark;
        ctx.beginPath();
        ctx.ellipse(-5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -29, 1.5, 0, Math.PI * 2);
        ctx.arc(6, -29, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = C.pikachu_dark;
        ctx.beginPath();
        ctx.arc(0, -24, 2, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = C.pikachu_dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -20, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Tail
        ctx.fillStyle = C.pikachu_body;
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
        ctx.strokeStyle = C.pikachu_tail_stroke;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    },

    drawCloud(x, y, scale) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.arc(25, -5, 25, 0, Math.PI * 2);
        ctx.arc(50, 0, 20, 0, Math.PI * 2);
        ctx.arc(25, 10, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawBackground(distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const WL = Config.WATER_LEVEL;
        const CL = Config.COURSE_LENGTH;

        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, WL);
        grad.addColorStop(0, C.sky_top);
        grad.addColorStop(0.5, C.sky_mid);
        grad.addColorStop(1, C.sky_bottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, WL);

        // Sun
        ctx.fillStyle = C.sun;
        ctx.beginPath();
        ctx.arc(400, 50, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = C.sun_glow;
        ctx.beginPath();
        ctx.arc(400, 50, 45, 0, Math.PI * 2);
        ctx.fill();

        // Clouds (parallax)
        ctx.fillStyle = C.cloud;
        this.drawCloud(100 - (distance * 0.1) % 600, 40, 1);
        this.drawCloud(300 - (distance * 0.15) % 600, 70, 0.8);
        this.drawCloud(450 - (distance * 0.12) % 600, 30, 1.2);

        // Shore (near end)
        if (distance > CL - 2000) {
            const prog = (distance - (CL - 2000)) / 2000;
            ctx.fillStyle = C.shore;
            ctx.beginPath();
            ctx.moveTo(W - 50 * prog, WL);
            ctx.lineTo(W, WL - 50);
            ctx.lineTo(W, Config.GAME_HEIGHT);
            ctx.lineTo(W - 100 * prog, Config.GAME_HEIGHT);
            ctx.closePath();
            ctx.fill();

            // Palm tree
            if (prog > 0.5) {
                const tx = W - 30, ty = WL - 60;
                ctx.fillStyle = C.palm_trunk;
                ctx.fillRect(tx - 5, ty, 10, 60);
                ctx.fillStyle = C.palm_leaves;
                for (let i = 0; i < 5; i++) {
                    ctx.save();
                    ctx.translate(tx, ty);
                    ctx.rotate((i * Math.PI * 2 / 5) - Math.PI / 2);
                    ctx.beginPath();
                    ctx.ellipse(20, 0, 25, 8, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }
    },

    drawWater(getWaveHeightAt, waves, distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const H = Config.GAME_HEIGHT;
        const WL = Config.WATER_LEVEL;

        // Deep water
        ctx.fillStyle = C.water_deep;
        ctx.fillRect(0, WL, W, H - WL);

        // Wave surface
        ctx.fillStyle = C.water_surface;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 5) {
            ctx.lineTo(x, WL - getWaveHeightAt(x));
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Highlights
        ctx.strokeStyle = C.highlight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
            const method = x === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x, WL - getWaveHeightAt(x) - 3);
        }
        ctx.stroke();

        // Foam
        ctx.fillStyle = C.foam;
        for (const wave of waves) {
            const sx = wave.x - distance;
            if (sx > -wave.width && sx < W + wave.width) {
                const fy = WL - wave.height * 0.7;
                ctx.beginPath();
                ctx.arc(sx + wave.width * 0.3, fy + 10, 8, 0, Math.PI * 2);
                ctx.arc(sx + wave.width * 0.5, fy + 5, 10, 0, Math.PI * 2);
                ctx.arc(sx + wave.width * 0.7, fy + 12, 7, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    drawParticles(particles) {
        const ctx = this.ctx;
        for (const p of particles) {
            ctx.fillStyle = `rgba(255,255,255,${p.life / 30})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawScorePopups(popups) {
        const ctx = this.ctx;
        for (const p of popups) {
            ctx.fillStyle = `rgba(255,203,5,${p.life / 60})`;
            ctx.font = 'bold 16px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`+${p.score}`, p.x, p.y);
            if (p.flips) {
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText(`${p.flips} FLIP${p.flips > 1 ? 'S' : ''}!`, p.x, p.y + 15);
            }
        }
    },

    drawFlipIndicator(x, y, flips) {
        if (flips > 0) {
            this.ctx.fillStyle = Config.colors.score_popup;
            this.ctx.font = 'bold 14px "Press Start 2P", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${flips}x`, x, y - 70);
        }
    }
};

export default Renderer;
