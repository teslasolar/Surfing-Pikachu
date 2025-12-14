// Silver Surfer Mode - Main Game
import Config from './config.js';
import Renderer from './renderer.js';

const SilverSurferGame = {
    state: 'title',
    hp: 0,
    radness: 0,
    distance: 0,
    speed: 0,
    won: false,
    powerCosmic: 0,
    time: 0,

    // Silver Pikachu
    pikachu: null,

    // Galactus pursuer
    galactus: {
        distance: Config.GALACTUS_START_DISTANCE,
        y: 200
    },

    // Cosmic debris generated from tricks
    cosmicDebris: [],

    // Physics
    waves: [],
    particles: [],
    scorePopups: [],

    // DOM
    els: {},
    canvas: null,

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
        });

        // Input state
        this.input = { jump: false, left: false, right: false };

        document.addEventListener('keydown', e => {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.input.jump = true;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.input.left = true;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.input.right = true;
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
        });

        // Touch/click for jump
        this.canvas.addEventListener('mousedown', () => this.input.jump = true);
        this.canvas.addEventListener('mouseup', () => this.input.jump = false);
        this.canvas.addEventListener('touchstart', e => { e.preventDefault(); this.input.jump = true; });
        this.canvas.addEventListener('touchend', () => this.input.jump = false);

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
            canJump: true
        };
    },

    start() {
        this.state = 'playing';
        this.hp = Config.MAX_HP;
        this.radness = 0;
        this.distance = 0;
        this.speed = Config.BASE_SPEED;
        this.won = false;
        this.powerCosmic = 0;
        this.time = 0;

        this.pikachu = this.resetPikachu();
        this.galactus = {
            distance: Config.GALACTUS_START_DISTANCE,
            y: 200
        };
        this.cosmicDebris = [];
        this.particles = [];
        this.scorePopups = [];
        this.generateWaves();

        this.els.titleScreen.style.display = 'none';
        this.els.gameOverScreen.style.display = 'none';
        this.els.gameUI.style.display = 'flex';
        this.canvas.style.display = 'block';

        this.updateUI();
    },

    end(won, caughtByGalactus = false) {
        this.state = 'gameOver';
        this.won = won;

        const finalHP = won ? Math.floor(this.hp) : 0;
        const finalScore = this.radness + finalHP + Math.floor(this.powerCosmic * 100);

        if (caughtByGalactus) {
            this.els.gameOverTitle.textContent = 'GALACTUS WINS!';
        } else {
            this.els.gameOverTitle.textContent = won ? 'ESCAPED GALACTUS!' : 'COSMIC WIPEOUT';
        }
        this.els.finalRadness.textContent = this.radness;
        this.els.finalHP.textContent = finalHP;
        this.els.finalScore.textContent = finalScore;
        this.els.gameOverScreen.style.display = 'flex';
    },

    updatePikachu() {
        const p = this.pikachu;
        const waveHeight = this.getWaveHeightAt(p.x);
        const waterY = Config.WATER_LEVEL - waveHeight;

        // Jump
        if (this.input.jump && p.canJump && !p.isAirborne) {
            p.vy = Config.JUMP_FORCE;
            p.isAirborne = true;
            p.canJump = false;
            p.totalRotation = 0;
        }

        if (!this.input.jump) {
            p.canJump = true;
        }

        // Rotation while airborne
        if (p.isAirborne) {
            if (this.input.left) {
                p.rotationSpeed = Math.max(-Config.MAX_ROTATION_SPEED, p.rotationSpeed - 0.02);
                p.flipDirection = -1;
            } else if (this.input.right) {
                p.rotationSpeed = Math.min(Config.MAX_ROTATION_SPEED, p.rotationSpeed + 0.02);
                p.flipDirection = 1;
            } else {
                p.rotationSpeed *= 0.98;
            }

            p.rotation += p.rotationSpeed;
            p.totalRotation += p.rotationSpeed;
        }

        // Gravity
        p.vy += Config.GRAVITY;
        p.y += p.vy;

        // Wave collision
        if (p.y >= waterY - 20) {
            if (p.isAirborne) {
                p.isAirborne = false;

                // Calculate flips
                const flips = Math.floor(Math.abs(p.totalRotation) / (Math.PI * 2));

                // Check landing angle
                const normalizedRotation = ((p.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const isGoodLanding = normalizedRotation < 0.5 || normalizedRotation > Math.PI * 2 - 0.5;

                if (flips > 0 && isGoodLanding) {
                    const score = flips * 100 * (1 + this.powerCosmic);
                    this.radness += Math.floor(score);
                    this.scorePopups.push({
                        x: p.x, y: p.y - 40,
                        score: Math.floor(score), flips,
                        life: 60
                    });
                    this.powerCosmic = Math.min(1, this.powerCosmic + flips * 0.1);

                    // Generate cosmic debris
                    for (let i = 0; i < flips * Config.DEBRIS_PER_FLIP; i++) {
                        this.cosmicDebris.push({
                            x: p.x + (Math.random() - 0.5) * 40,
                            y: p.y,
                            vx: (Math.random() - 0.5) * 8,
                            vy: -Math.random() * 10 - 5,
                            rotation: Math.random() * Math.PI * 2,
                            rotationSpeed: (Math.random() - 0.5) * 0.2,
                            size: 5 + Math.random() * 10,
                            life: 120,
                            maxLife: 120
                        });
                    }
                } else if (!isGoodLanding && Math.abs(p.rotationSpeed) > 0.1) {
                    // Crash
                    this.hp -= 100;
                    this.powerCosmic = Math.max(0, this.powerCosmic - 0.2);
                    this.createSplash(p.x, waterY);
                }

                p.rotation = 0;
                p.rotationSpeed = 0;
                p.totalRotation = 0;
            }

            p.y = waterY - 20;
            p.vy = 0;

            // Follow wave
            const nextHeight = this.getWaveHeightAt(p.x + 5);
            const slope = (nextHeight - waveHeight) / 5;
            p.rotation = Math.atan(slope) * 0.5;
        }
    },

    updateGalactus() {
        // Galactus slowly catches up
        const catchSpeed = Config.GALACTUS_SPEED + (this.distance / Config.COURSE_LENGTH) * 1.5;
        this.galactus.distance += catchSpeed - this.speed;

        // Oscillate vertically
        this.galactus.y = 180 + Math.sin(this.time * 0.002) * 30;

        // Check if caught
        if (this.galactus.distance > Config.GALACTUS_CATCH_DISTANCE) {
            this.end(false, true);
        }
    },

    createSplash(x, y) {
        for (let i = 0; i < 15; i++) {
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

        // Cosmic debris
        for (let i = this.cosmicDebris.length - 1; i >= 0; i--) {
            const d = this.cosmicDebris[i];
            d.x += d.vx;
            d.y += d.vy;
            d.vy += 0.2;
            d.rotation += d.rotationSpeed;
            d.life--;
            if (d.life <= 0) this.cosmicDebris.splice(i, 1);
        }

        // Power cosmic decay
        this.powerCosmic = Math.max(0, this.powerCosmic - 0.001);
    },

    update() {
        if (this.state !== 'playing') return;

        this.time++;
        this.hp -= 1;

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

        // Boost from power cosmic
        this.speed += this.powerCosmic * 2;

        this.updatePikachu();
        this.updateGalactus();
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
            Renderer.drawCosmicWaves(
                x => this.getWaveHeightAt(x),
                this.waves,
                this.distance
            );
            Renderer.drawParticles(this.particles);
            Renderer.drawCosmicDebris(this.cosmicDebris);

            // Draw Galactus behind Pikachu
            const galactusScreenX = -50 + this.galactus.distance;
            Renderer.drawGalactus(galactusScreenX, this.galactus.y, this.galactus.distance);

            // Draw Silver Pikachu
            Renderer.drawSilverPikachu(
                this.pikachu.x,
                this.pikachu.y,
                this.pikachu.rotation,
                this.powerCosmic
            );

            Renderer.drawScorePopups(this.scorePopups);

            if (this.pikachu.isAirborne && Math.abs(this.pikachu.rotationSpeed) > 0.1) {
                const flips = Math.floor(Math.abs(this.pikachu.totalRotation) / (Math.PI * 2));
                Renderer.drawFlipIndicator(this.pikachu.x, this.pikachu.y, flips);
            }

            // Power Cosmic meter
            Renderer.drawPowerCosmic(this.powerCosmic);
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
    document.addEventListener('DOMContentLoaded', () => SilverSurferGame.init());
} else {
    SilverSurferGame.init();
}

export default SilverSurferGame;
