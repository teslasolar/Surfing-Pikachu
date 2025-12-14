// Super Saiyan Mode - Main Game
import Config from './config.js';
import Renderer from './renderer.js';

const SSJGame = {
    state: 'title',
    hp: 0,
    radness: 0,
    distance: 0,
    speed: 0,
    won: false,
    time: 0,

    // Ki system
    ki: 0,
    transformLevel: 0, // 0 = base, 1 = SSJ, 2 = SSJ2, 3 = SSJ3

    // Pikachu
    pikachu: null,

    // Villains
    villains: [],
    lastVillainSpawn: 0,
    villainsDefeated: 0,

    // Ki blasts
    kiBlasts: [],

    // Effects
    explosions: [],
    waves: [],
    particles: [],
    scorePopups: [],

    // DOM
    els: {},
    canvas: null,

    // Input
    input: { jump: false, left: false, right: false, blast: false },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        Renderer.init(this.canvas);

        this.els = {
            titleScreen: document.getElementById('titleScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            gameUI: document.getElementById('gameUI'),
            progressFill: document.getElementById('progressFill'),
            hpFill: document.getElementById('hpFill'),
            hpValue: document.getElementById('hpValue'),
            radnessValue: document.getElementById('radnessValue'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            finalRadness: document.getElementById('finalRadness'),
            finalHP: document.getElementById('finalHP'),
            finalScore: document.getElementById('finalScore'),
            startBtn: document.getElementById('startBtn'),
            restartBtn: document.getElementById('restartBtn')
        };

        this.els.startBtn.addEventListener('click', () => this.start());
        this.els.restartBtn.addEventListener('click', () => this.start());

        document.addEventListener('keydown', e => {
            if (this.state !== 'playing') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.start();
                }
            }
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.input.jump = true;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.input.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.input.right = true;
            }
            if (e.key === 'x' || e.key === 'X' || e.key === 'k' || e.key === 'K') {
                this.input.blast = true;
            }
        });

        document.addEventListener('keyup', e => {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.input.jump = false;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.input.left = false;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.input.right = false;
            }
            if (e.key === 'x' || e.key === 'X' || e.key === 'k' || e.key === 'K') {
                this.input.blast = false;
            }
        });

        // Touch controls
        this.canvas.addEventListener('mousedown', e => {
            if (e.clientX > this.canvas.width / 2) {
                this.input.blast = true;
            } else {
                this.input.jump = true;
            }
        });
        this.canvas.addEventListener('mouseup', () => {
            this.input.jump = false;
            this.input.blast = false;
        });
        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            this.input.jump = true;
        });
        this.canvas.addEventListener('touchend', () => {
            this.input.jump = false;
            this.input.blast = false;
        });

        this.state = 'title';
        this.generateWaves();
        this.loop();
    },

    generateWaves() {
        this.waves = [];
        for (let x = 0; x < Config.COURSE_LENGTH + 1000; x += 150 + Math.random() * 100) {
            this.waves.push({
                x,
                width: 80 + Math.random() * 60,
                height: 25 + Math.random() * 35,
                phase: Math.random() * Math.PI * 2
            });
        }
    },

    getWaveHeightAt(screenX) {
        let height = Math.sin(screenX * 0.02 + this.distance * 0.01) * 10;
        const worldX = screenX + this.distance;

        for (const wave of this.waves) {
            const dx = worldX - wave.x;
            if (Math.abs(dx) < wave.width) {
                const t = 1 - Math.abs(dx) / wave.width;
                const waveHeight = wave.height * Math.sin(t * Math.PI);
                height += waveHeight * Math.sin(this.time * 0.005 + wave.phase);
            }
        }
        return height;
    },

    resetPikachu() {
        return {
            x: Config.PIKACHU_X,
            y: Config.WATER_LEVEL - 30,
            vy: 0,
            rotation: 0,
            rotationSpeed: 0,
            isAirborne: false,
            flipDirection: 0,
            totalRotation: 0,
            lastFlipDir: 0,
            canJump: true,
            canBlast: true
        };
    },

    start() {
        this.state = 'playing';
        this.hp = Config.MAX_HP;
        this.radness = 0;
        this.distance = 0;
        this.speed = Config.BASE_SPEED;
        this.won = false;
        this.time = 0;
        this.ki = 0;
        this.transformLevel = 0;
        this.villainsDefeated = 0;

        this.pikachu = this.resetPikachu();
        this.villains = [];
        this.kiBlasts = [];
        this.explosions = [];
        this.particles = [];
        this.scorePopups = [];
        this.lastVillainSpawn = 0;
        this.generateWaves();

        this.els.titleScreen.style.display = 'none';
        this.els.gameOverScreen.style.display = 'none';
        this.els.gameUI.style.display = 'flex';
        this.canvas.style.display = 'block';

        this.updateUI();
    },

    end(won) {
        this.state = 'gameOver';
        this.won = won;

        const finalHP = won ? Math.floor(this.hp) : 0;
        const villainBonus = this.villainsDefeated * 200;
        const transformBonus = this.transformLevel * 500;
        const finalScore = this.radness + finalHP + villainBonus + transformBonus;

        this.els.gameOverTitle.textContent = won ? 'PLANET SAVED!' : 'DEFEATED...';
        this.els.finalRadness.textContent = this.radness;
        this.els.finalHP.textContent = finalHP;
        this.els.finalScore.textContent = finalScore;
        this.els.gameOverScreen.style.display = 'flex';
    },

    updateTransformLevel() {
        const prevLevel = this.transformLevel;

        if (this.ki >= Config.SSJ3_THRESHOLD) {
            this.transformLevel = 3;
        } else if (this.ki >= Config.SSJ2_THRESHOLD) {
            this.transformLevel = 2;
        } else if (this.ki >= Config.SSJ_THRESHOLD) {
            this.transformLevel = 1;
        } else {
            this.transformLevel = 0;
        }

        // Transform effect
        if (this.transformLevel > prevLevel && this.transformLevel > 0) {
            // Create transformation burst
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: this.pikachu.x + (Math.random() - 0.5) * 60,
                    y: this.pikachu.y + (Math.random() - 0.5) * 60,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    size: Math.random() * 6 + 2,
                    life: 40
                });
            }
        }
    },

    spawnVillain() {
        const types = Config.VILLAIN_TYPES;
        const type = types[Math.floor(Math.random() * types.length)];

        // Stronger villains as game progresses
        const progressMultiplier = 1 + (this.distance / Config.COURSE_LENGTH);

        this.villains.push({
            type,
            x: Config.GAME_WIDTH + 50,
            y: 150 + Math.random() * 80,
            vx: -2 - Math.random() * 2,
            hp: (type === 'buu' ? 150 : type === 'cell' ? 120 : 100) * progressMultiplier,
            maxHp: (type === 'buu' ? 150 : type === 'cell' ? 120 : 100) * progressMultiplier,
            attackCooldown: 0
        });
    },

    fireKiBlast() {
        if (this.ki >= Config.KI_BLAST_COST && this.pikachu.canBlast) {
            this.ki -= Config.KI_BLAST_COST;
            this.pikachu.canBlast = false;

            // Ki blast power scales with transform level
            const power = 30 + this.transformLevel * 20;

            this.kiBlasts.push({
                x: this.pikachu.x + 30,
                y: this.pikachu.y - 10,
                vx: 12 + this.transformLevel * 2,
                vy: 0,
                size: 8 + this.transformLevel * 3,
                power
            });
        }
    },

    updatePikachu() {
        const p = this.pikachu;
        const waveHeight = this.getWaveHeightAt(p.x);
        const waterY = Config.WATER_LEVEL - waveHeight;

        // Jump
        if (this.input.jump && p.canJump && !p.isAirborne) {
            // SSJ gets higher jumps
            const jumpBoost = 1 + this.transformLevel * 0.15;
            p.vy = Config.JUMP_FORCE * jumpBoost;
            p.isAirborne = true;
            p.canJump = false;
            p.totalRotation = 0;
        }

        if (!this.input.jump) {
            p.canJump = true;
        }

        // Ki blast
        if (this.input.blast) {
            this.fireKiBlast();
        }
        if (!this.input.blast) {
            p.canBlast = true;
        }

        // Rotation while airborne
        if (p.isAirborne) {
            const rotSpeed = Config.MAX_ROTATION_SPEED * (1 + this.transformLevel * 0.1);
            if (this.input.left) {
                p.rotationSpeed = Math.max(-rotSpeed, p.rotationSpeed - 0.02);
                p.flipDirection = -1;
            } else if (this.input.right) {
                p.rotationSpeed = Math.min(rotSpeed, p.rotationSpeed + 0.02);
                p.flipDirection = 1;
            } else {
                p.rotationSpeed *= 0.98;
            }

            p.rotation += p.rotationSpeed;
            p.totalRotation += p.rotationSpeed;
        }

        // Gravity (reduced for SSJ)
        const gravityMod = 1 - this.transformLevel * 0.05;
        p.vy += Config.GRAVITY * gravityMod;
        p.y += p.vy;

        // Wave collision
        if (p.y >= waterY - 20) {
            if (p.isAirborne) {
                p.isAirborne = false;

                const flips = Math.floor(Math.abs(p.totalRotation) / (Math.PI * 2));
                const normalizedRotation = ((p.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const isGoodLanding = normalizedRotation < 0.5 || normalizedRotation > Math.PI * 2 - 0.5;

                if (flips > 0 && isGoodLanding) {
                    const score = flips * 100 * (1 + this.transformLevel * 0.5);
                    this.radness += Math.floor(score);
                    this.scorePopups.push({
                        x: p.x, y: p.y - 40,
                        score: Math.floor(score), flips,
                        life: 60
                    });

                    // Gain Ki from flips
                    this.ki = Math.min(Config.MAX_KI, this.ki + flips * Config.KI_PER_FLIP);
                    this.updateTransformLevel();
                } else if (!isGoodLanding && Math.abs(p.rotationSpeed) > 0.1) {
                    this.hp -= 80;
                    this.ki = Math.max(0, this.ki - 10);
                    this.updateTransformLevel();
                    this.createSplash(p.x, waterY);
                }

                p.rotation = 0;
                p.rotationSpeed = 0;
                p.totalRotation = 0;
            }

            p.y = waterY - 20;
            p.vy = 0;

            const nextHeight = this.getWaveHeightAt(p.x + 5);
            const slope = (nextHeight - waveHeight) / 5;
            p.rotation = Math.atan(slope) * 0.5;
        }
    },

    updateVillains() {
        // Spawn villains
        if (this.time - this.lastVillainSpawn > Config.VILLAIN_SPAWN_RATE) {
            this.spawnVillain();
            this.lastVillainSpawn = this.time;
        }

        // Update villains
        for (let i = this.villains.length - 1; i >= 0; i--) {
            const v = this.villains[i];
            v.x += v.vx;

            // Remove off-screen villains
            if (v.x < -100) {
                this.villains.splice(i, 1);
                continue;
            }

            // Check collision with Pikachu
            const dx = v.x - this.pikachu.x;
            const dy = v.y - this.pikachu.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 50) {
                this.hp -= 50;
                this.ki = Math.max(0, this.ki - 5);
                this.updateTransformLevel();

                // Knockback
                v.x += 30;
            }
        }

        // Update ki blasts
        for (let i = this.kiBlasts.length - 1; i >= 0; i--) {
            const b = this.kiBlasts[i];
            b.x += b.vx;
            b.y += b.vy;

            // Check collision with villains
            for (let j = this.villains.length - 1; j >= 0; j--) {
                const v = this.villains[j];
                const dx = b.x - v.x;
                const dy = b.y - v.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 40) {
                    v.hp -= b.power;

                    // Create explosion
                    this.explosions.push({
                        x: b.x,
                        y: b.y,
                        size: 30 + this.transformLevel * 10,
                        life: 20,
                        maxLife: 20
                    });

                    // Remove blast
                    this.kiBlasts.splice(i, 1);

                    // Check if villain defeated
                    if (v.hp <= 0) {
                        this.villains.splice(j, 1);
                        this.villainsDefeated++;
                        this.radness += 500;
                        this.ki = Math.min(Config.MAX_KI, this.ki + 20);
                        this.updateTransformLevel();

                        // Big explosion
                        this.explosions.push({
                            x: v.x,
                            y: v.y,
                            size: 80,
                            life: 30,
                            maxLife: 30
                        });
                    }
                    break;
                }
            }

            // Remove off-screen blasts
            if (b.x > Config.GAME_WIDTH + 50) {
                this.kiBlasts.splice(i, 1);
            }
        }
    },

    createSplash(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 8 - 2,
                size: Math.random() * 4 + 2,
                life: 30
            });
        }
    },

    updateEffects() {
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const p = this.scorePopups[i];
            p.y -= 1;
            p.life--;
            if (p.life <= 0) this.scorePopups.splice(i, 1);
        }

        // Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].life--;
            if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
        }

        // Ki drain
        this.ki = Math.max(0, this.ki - Config.KI_DRAIN_RATE);
        this.updateTransformLevel();
    },

    update() {
        if (this.state !== 'playing') return;

        this.time++;
        this.hp -= 0.8; // Slower HP drain

        if (this.hp <= 0) {
            this.end(false);
            return;
        }

        if (this.distance >= Config.COURSE_LENGTH) {
            this.end(true);
            return;
        }

        this.distance += this.speed;
        this.speed = Config.BASE_SPEED + (this.distance / Config.COURSE_LENGTH) * Config.MAX_SPEED_BONUS;

        // SSJ speed boost
        this.speed += this.transformLevel * 0.5;

        this.updatePikachu();
        this.updateVillains();
        this.updateEffects();
        this.updateUI();
    },

    updateUI() {
        const progress = Math.min(100, (this.distance / Config.COURSE_LENGTH) * 100);
        const hpPct = (this.hp / Config.MAX_HP) * 100;

        this.els.progressFill.style.width = `${progress}%`;
        this.els.hpFill.style.width = `${hpPct}%`;
        this.els.hpValue.textContent = Math.max(0, Math.floor(this.hp));
        this.els.radnessValue.textContent = this.radness;
    },

    draw() {
        Renderer.clear();

        if (this.state === 'playing') {
            Renderer.drawBackground(this.distance, this.time);
            Renderer.drawEnergyWaves(
                x => this.getWaveHeightAt(x),
                this.waves,
                this.distance
            );
            Renderer.drawParticles(this.particles);

            // Draw explosions
            for (const exp of this.explosions) {
                Renderer.drawExplosion(exp);
            }

            // Draw villains
            for (const villain of this.villains) {
                Renderer.drawVillain(villain);
                Renderer.drawVillainHP(villain);
            }

            // Draw ki blasts
            for (const blast of this.kiBlasts) {
                Renderer.drawKiBlast(blast);
            }

            // Draw SSJ Pikachu
            Renderer.drawSSJPikachu(
                this.pikachu.x,
                this.pikachu.y,
                this.pikachu.rotation,
                this.ki,
                this.transformLevel
            );

            Renderer.drawScorePopups(this.scorePopups);

            if (this.pikachu.isAirborne && Math.abs(this.pikachu.rotationSpeed) > 0.1) {
                const flips = Math.floor(Math.abs(this.pikachu.totalRotation) / (Math.PI * 2));
                Renderer.drawFlipIndicator(this.pikachu.x, this.pikachu.y, flips);
            }

            // Ki bar
            Renderer.drawKiBar(this.ki, Config.MAX_KI, this.transformLevel);
        }
    },

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
};

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SSJGame.init());
} else {
    SSJGame.init();
}

export default SSJGame;
