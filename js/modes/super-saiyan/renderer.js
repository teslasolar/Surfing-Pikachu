// Super Saiyan Mode Renderer
import Config from './config.js';

const SSJRenderer = {
    ctx: null,
    canvas: null,
    time: 0,

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        return this;
    },

    clear() {
        this.ctx.clearRect(0, 0, Config.GAME_WIDTH, Config.GAME_HEIGHT);
    },

    // Draw SSJ Pikachu with transformation level
    drawSSJPikachu(x, y, rotation, ki, transformLevel) {
        const ctx = this.ctx;
        const C = Config.colors;
        this.time++;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Aura based on transformation
        if (transformLevel > 0) {
            const auraColors = [C.ssj_aura, C.ssj2_aura, C.ssj3_aura];
            const auraColor = auraColors[Math.min(transformLevel - 1, 2)];
            const auraSize = 50 + transformLevel * 15 + Math.sin(this.time * 0.1) * 5;

            // Flame-like aura
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + this.time * 0.05;
                const flameHeight = auraSize * (0.7 + Math.sin(this.time * 0.2 + i) * 0.3);

                ctx.fillStyle = auraColor;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.ellipse(
                    Math.cos(angle) * 15,
                    -15 + Math.sin(angle) * 10,
                    10,
                    flameHeight * 0.5,
                    angle,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            // SSJ2 lightning
            if (transformLevel >= 2) {
                ctx.strokeStyle = C.ssj2_lightning;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.8;
                for (let i = 0; i < 3; i++) {
                    const startX = (Math.random() - 0.5) * 60;
                    const startY = -50 + Math.random() * 30;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    let lx = startX, ly = startY;
                    for (let j = 0; j < 4; j++) {
                        lx += (Math.random() - 0.5) * 20;
                        ly += 15 + Math.random() * 10;
                        ctx.lineTo(lx, ly);
                    }
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;
        }

        // Surfboard (energy platform for SSJ)
        if (transformLevel > 0) {
            ctx.fillStyle = C.energy_glow;
            ctx.shadowColor = C.energy_glow;
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = '#ff6b35';
            ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Body
        ctx.fillStyle = C.pikachu_body;
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -25, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // SSJ Hair (spiky and golden/white)
        const hairColor = transformLevel >= 3 ? C.ssj3_hair :
                         transformLevel >= 1 ? C.ssj_hair : C.pikachu_body;

        ctx.fillStyle = hairColor;

        if (transformLevel > 0) {
            // Spiky SSJ hair
            const spikes = transformLevel >= 3 ? 7 : transformLevel >= 2 ? 5 : 4;
            for (let i = 0; i < spikes; i++) {
                const angle = -Math.PI / 2 + (i - spikes / 2 + 0.5) * 0.4;
                const length = 25 + (transformLevel * 8) + (i === Math.floor(spikes / 2) ? 10 : 0);

                ctx.beginPath();
                ctx.moveTo(Math.cos(angle + 0.2) * 10, -30 + Math.sin(angle + 0.2) * 5);
                ctx.lineTo(Math.cos(angle) * length, -35 + Math.sin(angle) * length * 0.5 - length * 0.3);
                ctx.lineTo(Math.cos(angle - 0.2) * 10, -30 + Math.sin(angle - 0.2) * 5);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Ears (also go SSJ)
        ctx.fillStyle = hairColor;
        [[-8, -12], [8, 12]].forEach(([bx, tx]) => {
            ctx.beginPath();
            ctx.moveTo(bx, -35);
            ctx.lineTo(tx * (transformLevel > 0 ? 1.3 : 1), -55 - transformLevel * 5);
            ctx.lineTo(bx > 0 ? 3 : -3, -40);
            ctx.closePath();
            ctx.fill();
        });

        // Ear tips
        ctx.fillStyle = transformLevel > 0 ? hairColor : C.pikachu_dark;
        [[-10, -12, -7], [10, 12, 7]].forEach(([x1, x2, x3]) => {
            ctx.beginPath();
            ctx.moveTo(x1 * (transformLevel > 0 ? 1.2 : 1), -48 - transformLevel * 3);
            ctx.lineTo(x2 * (transformLevel > 0 ? 1.3 : 1), -55 - transformLevel * 5);
            ctx.lineTo(x3 * (transformLevel > 0 ? 1.2 : 1), -50 - transformLevel * 3);
            ctx.closePath();
            ctx.fill();
        });

        // Cheeks (glow when powered up)
        if (transformLevel > 0) {
            ctx.fillStyle = C.energy_glow;
            ctx.shadowColor = C.energy_glow;
            ctx.shadowBlur = 8;
        } else {
            ctx.fillStyle = C.pikachu_cheeks;
        }
        ctx.beginPath();
        ctx.arc(-10, -22, 4, 0, Math.PI * 2);
        ctx.arc(10, -22, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes (intense for SSJ)
        if (transformLevel > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 5;
        } else {
            ctx.fillStyle = C.pikachu_dark;
        }
        ctx.beginPath();
        ctx.ellipse(-5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

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

        // Determined mouth for SSJ
        ctx.strokeStyle = C.pikachu_dark;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (transformLevel > 0) {
            ctx.moveTo(-5, -19);
            ctx.lineTo(5, -19);
        } else {
            ctx.arc(0, -20, 5, 0.2, Math.PI - 0.2);
        }
        ctx.stroke();

        // Tail (electric when SSJ)
        ctx.fillStyle = hairColor;
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

        if (transformLevel > 0) {
            ctx.strokeStyle = C.ssj2_lightning;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    },

    drawVillain(villain) {
        const ctx = this.ctx;
        const C = Config.colors;

        ctx.save();
        ctx.translate(villain.x, villain.y);

        // Draw based on type
        switch (villain.type) {
            case 'frieza':
                this.drawFrieza(villain.hp / villain.maxHp);
                break;
            case 'cell':
                this.drawCell(villain.hp / villain.maxHp);
                break;
            case 'buu':
                this.drawBuu(villain.hp / villain.maxHp);
                break;
        }

        ctx.restore();
    },

    drawFrieza(hpPercent) {
        const ctx = this.ctx;
        const C = Config.colors;
        const scale = 0.8;

        ctx.scale(scale, scale);

        // Aura
        ctx.fillStyle = 'rgba(200, 100, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = C.frieza_body;
        ctx.beginPath();
        ctx.ellipse(0, 10, 15, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -20, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Purple sections
        ctx.fillStyle = C.frieza_purple;
        ctx.beginPath();
        ctx.ellipse(0, -35, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-12, 5, 5, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(12, 5, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.ellipse(-5, -22, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -22, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = C.frieza_body;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(0, 35);
        ctx.quadraticCurveTo(30, 40, 40, 20);
        ctx.stroke();
    },

    drawCell(hpPercent) {
        const ctx = this.ctx;
        const C = Config.colors;

        // Aura
        ctx.fillStyle = 'rgba(50, 200, 50, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = C.cell_green;
        ctx.beginPath();
        ctx.ellipse(0, 5, 18, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spots
        ctx.fillStyle = C.cell_spots;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(-8 + i * 4, 5 + (i % 2) * 10, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Head crest
        ctx.fillStyle = C.cell_green;
        ctx.beginPath();
        ctx.moveTo(-15, -25);
        ctx.lineTo(0, -50);
        ctx.lineTo(15, -25);
        ctx.closePath();
        ctx.fill();

        // Face
        ctx.beginPath();
        ctx.ellipse(0, -15, 12, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.ellipse(-5, -18, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -18, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = C.cell_spots;
        ctx.beginPath();
        ctx.ellipse(-25, 0, 8, 20, -0.3, 0, Math.PI * 2);
        ctx.ellipse(25, 0, 8, 20, 0.3, 0, Math.PI * 2);
        ctx.fill();
    },

    drawBuu(hpPercent) {
        const ctx = this.ctx;
        const C = Config.colors;

        // Aura
        ctx.fillStyle = 'rgba(255, 100, 180, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();

        // Body (fat and round)
        ctx.fillStyle = C.buu_pink;
        ctx.beginPath();
        ctx.ellipse(0, 10, 25, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -25, 18, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head tentacle
        ctx.beginPath();
        ctx.moveTo(0, -43);
        ctx.quadraticCurveTo(20, -50, 25, -30);
        ctx.quadraticCurveTo(30, -20, 20, -25);
        ctx.quadraticCurveTo(10, -35, 0, -43);
        ctx.fill();

        // Face details
        ctx.fillStyle = C.buu_dark;
        ctx.beginPath();
        ctx.arc(-8, -28, 4, 0, Math.PI * 2);
        ctx.arc(8, -28, 4, 0, Math.PI * 2);
        ctx.fill();

        // Evil smile
        ctx.strokeStyle = C.buu_dark;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -20, 8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Belt area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-20, 5, 40, 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-5, 5, 10, 8);
    },

    drawKiBlast(blast) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(blast.x, blast.y);

        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, blast.size * 2);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(65, 105, 225, 0.4)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, blast.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, blast.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawExplosion(exp) {
        const ctx = this.ctx;
        const progress = 1 - exp.life / exp.maxLife;

        ctx.save();
        ctx.translate(exp.x, exp.y);

        // Multiple expanding rings
        for (let i = 0; i < 3; i++) {
            const ringProgress = Math.min(1, progress * 1.5 - i * 0.2);
            if (ringProgress > 0) {
                const size = exp.size * ringProgress;
                ctx.globalAlpha = (1 - ringProgress) * 0.6;
                ctx.strokeStyle = i === 0 ? '#ffffff' : i === 1 ? '#ffff00' : '#ff6600';
                ctx.lineWidth = 4 - i;
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    },

    drawBackground(distance, time) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const WL = Config.WATER_LEVEL;

        // Planet Vegeta sky (red/dark)
        const grad = ctx.createLinearGradient(0, 0, 0, WL);
        grad.addColorStop(0, C.sky_top);
        grad.addColorStop(0.5, C.sky_mid);
        grad.addColorStop(1, C.sky_bottom);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, WL);

        // Twin suns
        ctx.fillStyle = '#ff4500';
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(350, 50, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(420, 70, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Distant mountains
        ctx.fillStyle = C.ground_far;
        ctx.beginPath();
        ctx.moveTo(0, WL);
        for (let x = 0; x <= W; x += 50) {
            const h = 30 + Math.sin((x + distance * 0.1) * 0.02) * 20;
            ctx.lineTo(x, WL - h);
        }
        ctx.lineTo(W, WL);
        ctx.closePath();
        ctx.fill();

        // Destroyed city silhouettes
        ctx.fillStyle = '#1a0505';
        for (let i = 0; i < 5; i++) {
            const bx = (200 + i * 150 - distance * 0.2) % (W + 200) - 100;
            const bh = 40 + Math.sin(i * 2.5) * 20;
            ctx.fillRect(bx, WL - bh, 20, bh);
            ctx.fillRect(bx + 25, WL - bh * 0.7, 15, bh * 0.7);
        }
    },

    drawEnergyWaves(getWaveHeightAt, waves, distance) {
        const ctx = this.ctx;
        const C = Config.colors;
        const W = Config.GAME_WIDTH;
        const H = Config.GAME_HEIGHT;
        const WL = Config.WATER_LEVEL;

        // Deep energy
        ctx.fillStyle = C.energy_deep;
        ctx.fillRect(0, WL, W, H - WL);

        // Energy surface
        ctx.fillStyle = C.energy_surface;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 5) {
            ctx.lineTo(x, WL - getWaveHeightAt(x));
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Ki energy glow on surface
        ctx.strokeStyle = C.energy_glow;
        ctx.lineWidth = 3;
        ctx.shadowColor = C.energy_glow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 5) {
            const method = x === 0 ? 'moveTo' : 'lineTo';
            ctx[method](x, WL - getWaveHeightAt(x));
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    },

    drawKiBar(ki, maxKi, transformLevel) {
        const ctx = this.ctx;
        const W = Config.GAME_WIDTH;

        // Ki bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(W - 160, 10, 150, 25);

        // Ki bar fill
        const kiPercent = ki / maxKi;
        const gradient = ctx.createLinearGradient(W - 158, 0, W - 12, 0);

        if (transformLevel >= 3) {
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(1, '#ffffff');
        } else if (transformLevel >= 2) {
            gradient.addColorStop(0, '#0066ff');
            gradient.addColorStop(1, '#00ffff');
        } else if (transformLevel >= 1) {
            gradient.addColorStop(0, '#ffaa00');
            gradient.addColorStop(1, '#ffff00');
        } else {
            gradient.addColorStop(0, '#0044aa');
            gradient.addColorStop(1, '#0088ff');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(W - 158, 12, 146 * kiPercent, 21);

        // Border
        ctx.strokeStyle = transformLevel > 0 ? '#ffff00' : '#0088ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(W - 160, 10, 150, 25);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('KI', W - 165, 27);

        // Transform level indicator
        if (transformLevel > 0) {
            ctx.fillStyle = '#ffff00';
            ctx.textAlign = 'center';
            ctx.fillText(`SSJ${transformLevel > 1 ? transformLevel : ''}`, W - 85, 50);
        }
    },

    drawParticles(particles) {
        const ctx = this.ctx;
        for (const p of particles) {
            ctx.fillStyle = `rgba(255, 150, 50, ${p.life / 30})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawScorePopups(popups) {
        const ctx = this.ctx;
        for (const p of popups) {
            ctx.fillStyle = `rgba(255, 215, 0, ${p.life / 60})`;
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 5;
            ctx.font = 'bold 16px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`+${p.score}`, p.x, p.y);
            if (p.flips) {
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText(`${p.flips} POWER FLIP${p.flips > 1 ? 'S' : ''}!`, p.x, p.y + 15);
            }
            ctx.shadowBlur = 0;
        }
    },

    drawFlipIndicator(x, y, flips) {
        if (flips > 0) {
            this.ctx.fillStyle = Config.colors.score_popup;
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 10;
            this.ctx.font = 'bold 14px "Press Start 2P", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${flips}x`, x, y - 70);
            this.ctx.shadowBlur = 0;
        }
    },

    drawVillainHP(villain) {
        const ctx = this.ctx;
        const hpPercent = villain.hp / villain.maxHp;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(villain.x - 25, villain.y - 60, 50, 8);

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(villain.x - 24, villain.y - 59, 48 * hpPercent, 6);
    }
};

export default SSJRenderer;
