// Sonic Speedrun Mode - Main Game
import Config from './config.js';
import Renderer from './renderer.js';

const SonicGame = {
    state: 'title',
    rings: 0,
    distance: 0,
    speed: 0,
    won: false,
    time: 0,
    bestTime: null,

    // Sonic Pikachu
    pikachu: null,
    isSpinning: false,
    isBoosting: false,
    boostTimer: 0,

    // Collectibles and obstacles
    ringsList: [],
    springs: [],
    spikes: [],
    boostPads: [],

    // Spawn tracking
    lastRingSpawn: 0,
    lastSpringSpawn: 0,
    lastSpikeSpawn: 0,
    lastBoostSpawn: 0,

    // Physics
    waves: [],
    particles: [],
    scorePopups: [],

    // DOM
    els: {},
    canvas: null,

    // Input
    input: { jump: false, left: false, right: false, spin: false },

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
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.input.spin = true;
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
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.input.spin = false;
            }
        });

        // Touch controls
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
        // Gentler waves for Sonic mode
        for (let x = 0; x < Config.COURSE_LENGTH + 1000; x += 200 + Math.random() * 150) {
            this.waves.push({
                x,
                width: 100 + Math.random() * 80,
                height: 15 + Math.random() * 20,
                phase: Math.random() * Math.PI * 2
            });
        }
    },

    getWaveHeightAt(screenX) {
        let height = Math.sin(screenX * 0.015 + this.distance * 0.008) * 8;
        const worldX = screenX + this.distance;

        for (const wave of this.waves) {
            const dx = worldX - wave.x;
            if (Math.abs(dx) < wave.width) {
                const t = 1 - Math.abs(dx) / wave.width;
                const waveHeight = wave.height * Math.sin(t * Math.PI);
                height += waveHeight * Math.sin(this.time * 0.004 + wave.phase);
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
            canJump: true
        };
    },

    start() {
        this.state = 'playing';
        this.rings = 0;
        this.distance = 0;
        this.speed = Config.BASE_SPEED;
        this.won = false;
        this.time = 0;
        this.isSpinning = false;
        this.isBoosting = false;
        this.boostTimer = 0;

        this.pikachu = this.resetPikachu();
        this.ringsList = [];
        this.springs = [];
        this.spikes = [];
        this.boostPads = [];
        this.particles = [];
        this.scorePopups = [];

        this.lastRingSpawn = 0;
        this.lastSpringSpawn = 0;
        this.lastSpikeSpawn = 0;
        this.lastBoostSpawn = 0;

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

        const timeBonus = won ? Math.max(0, 5000 - this.time) : 0;
        const finalScore = this.rings * 100 + timeBonus;

        // Format time
        const seconds = Math.floor(this.time / 60);
        const frames = this.time % 60;
        const timeStr = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;

        this.els.gameOverTitle.textContent = won ? 'GOAL!' : 'TOO SLOW!';
        this.els.finalRadness.textContent = this.rings;
        this.els.finalHP.textContent = timeStr;
        this.els.finalScore.textContent = finalScore;
        this.els.gameOverScreen.style.display = 'flex';

        // Update labels
        document.querySelector('#gameOverScreen .final-stats p:first-child').innerHTML =
            `Rings: <span id="finalRadness">${this.rings}</span>`;
        document.querySelector('#gameOverScreen .final-stats p:nth-child(2)').innerHTML =
            `Time: <span id="finalHP">${timeStr}</span>`;
    },

    spawnRings() {
        if (this.time - this.lastRingSpawn > Config.RING_SPAWN_RATE) {
            // Spawn ring pattern
            const pattern = Math.floor(Math.random() * 4);
            const baseX = Config.GAME_WIDTH + 50;
            const baseY = 150 + Math.random() * 100;

            switch (pattern) {
                case 0: // Single ring
                    this.ringsList.push({ x: baseX, y: baseY, phase: Math.random() * Math.PI * 2 });
                    break;
                case 1: // Horizontal line
                    for (let i = 0; i < 5; i++) {
                        this.ringsList.push({ x: baseX + i * 30, y: baseY, phase: Math.random() * Math.PI * 2 });
                    }
                    break;
                case 2: // Arc
                    for (let i = 0; i < 5; i++) {
                        const arcY = baseY - Math.sin(i / 4 * Math.PI) * 40;
                        this.ringsList.push({ x: baseX + i * 30, y: arcY, phase: Math.random() * Math.PI * 2 });
                    }
                    break;
                case 3: // Vertical line
                    for (let i = 0; i < 3; i++) {
                        this.ringsList.push({ x: baseX, y: baseY - 30 + i * 30, phase: Math.random() * Math.PI * 2 });
                    }
                    break;
            }
            this.lastRingSpawn = this.time;
        }
    },

    spawnObstacles() {
        // Springs
        if (this.time - this.lastSpringSpawn > Config.SPRING_SPAWN_RATE) {
            this.springs.push({
                x: Config.GAME_WIDTH + 50,
                y: Config.WATER_LEVEL - 10,
                compressed: false
            });
            this.lastSpringSpawn = this.time;
        }

        // Spikes
        if (this.time - this.lastSpikeSpawn > Config.SPIKE_SPAWN_RATE) {
            this.spikes.push({
                x: Config.GAME_WIDTH + 50,
                y: Config.WATER_LEVEL - 10
            });
            this.lastSpikeSpawn = this.time;
        }

        // Boost pads
        if (this.time - this.lastBoostSpawn > Config.BOOST_PAD_SPAWN_RATE) {
            this.boostPads.push({
                x: Config.GAME_WIDTH + 50,
                y: Config.WATER_LEVEL - 5
            });
            this.lastBoostSpawn = this.time;
        }
    },

    updatePikachu() {
        const p = this.pikachu;
        const waveHeight = this.getWaveHeightAt(p.x);
        const waterY = Config.WATER_LEVEL - waveHeight;

        // Spin mode
        if (this.input.spin && !p.isAirborne) {
            this.isSpinning = true;
        }

        // Jump (higher when spinning)
        if (this.input.jump && p.canJump && !p.isAirborne) {
            const jumpPower = this.isSpinning ? Config.JUMP_FORCE * 1.2 : Config.JUMP_FORCE;
            p.vy = jumpPower;
            p.isAirborne = true;
            p.canJump = false;
            p.totalRotation = 0;

            if (this.isSpinning) {
                p.rotationSpeed = 0.3;
            }
        }

        if (!this.input.jump) {
            p.canJump = true;
        }

        // Airborne spinning
        if (p.isAirborne) {
            if (this.input.left) {
                p.rotationSpeed = Math.max(-Config.MAX_ROTATION_SPEED, p.rotationSpeed - 0.025);
            } else if (this.input.right) {
                p.rotationSpeed = Math.min(Config.MAX_ROTATION_SPEED, p.rotationSpeed + 0.025);
            }

            p.rotation += p.rotationSpeed;
            p.totalRotation += Math.abs(p.rotationSpeed);

            // Auto-spin in spin mode
            if (this.isSpinning && Math.abs(p.rotationSpeed) < 0.2) {
                p.rotationSpeed = 0.25;
            }
        }

        // Gravity
        p.vy += Config.GRAVITY;
        p.y += p.vy;

        // Ground collision
        if (p.y >= waterY - 20) {
            if (p.isAirborne) {
                p.isAirborne = false;

                // Bonus for spins
                const spins = Math.floor(Math.abs(p.totalRotation) / (Math.PI * 2));
                if (spins > 0) {
                    const bonus = spins * 10;
                    this.rings += bonus;
                    this.scorePopups.push({
                        x: p.x, y: p.y - 50,
                        text: `+${bonus}`,
                        life: 60
                    });
                }

                this.isSpinning = false;
                p.rotation = 0;
                p.rotationSpeed = 0;
                p.totalRotation = 0;
            }

            p.y = waterY - 20;
            p.vy = 0;

            // Follow wave angle
            const nextHeight = this.getWaveHeightAt(p.x + 5);
            const slope = (nextHeight - waveHeight) / 5;
            if (!this.isSpinning) {
                p.rotation = Math.atan(slope) * 0.3;
            }
        }
    },

    updateObjects() {
        const p = this.pikachu;

        // Update and collect rings
        for (let i = this.ringsList.length - 1; i >= 0; i--) {
            const ring = this.ringsList[i];
            ring.x -= this.speed;

            // Collect ring
            const dx = ring.x - p.x;
            const dy = ring.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) {
                this.rings++;
                this.ringsList.splice(i, 1);

                // Ring collect particles
                for (let j = 0; j < 8; j++) {
                    this.particles.push({
                        x: ring.x,
                        y: ring.y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        size: 3,
                        life: 20,
                        type: 'ring'
                    });
                }
                continue;
            }

            // Remove off-screen
            if (ring.x < -30) {
                this.ringsList.splice(i, 1);
            }
        }

        // Update springs
        for (let i = this.springs.length - 1; i >= 0; i--) {
            const spring = this.springs[i];
            spring.x -= this.speed;
            spring.compressed = false;

            // Spring bounce
            const dx = spring.x - p.x;
            const dy = (spring.y - 20) - p.y;
            if (Math.abs(dx) < 20 && dy < 20 && dy > -10 && p.vy > 0) {
                p.vy = -18; // Super bounce!
                p.isAirborne = true;
                spring.compressed = true;
                this.scorePopups.push({
                    x: spring.x, y: spring.y - 40,
                    text: 'SPRING!',
                    life: 30
                });
            }

            if (spring.x < -50) {
                this.springs.splice(i, 1);
            }
        }

        // Update spikes
        for (let i = this.spikes.length - 1; i >= 0; i--) {
            const spike = this.spikes[i];
            spike.x -= this.speed;

            // Spike damage (only if not spinning)
            if (!this.isSpinning) {
                const dx = spike.x - p.x;
                const dy = spike.y - p.y;
                if (Math.abs(dx) < 25 && Math.abs(dy) < 30) {
                    // Lose rings!
                    if (this.rings > 0) {
                        const lostRings = Math.min(this.rings, 20);
                        this.rings -= lostRings;

                        // Scatter rings
                        for (let j = 0; j < Math.min(lostRings, 10); j++) {
                            this.ringsList.push({
                                x: p.x + (Math.random() - 0.5) * 60,
                                y: p.y - 30 - Math.random() * 40,
                                phase: Math.random() * Math.PI * 2,
                                vy: -5 - Math.random() * 5,
                                scattered: true
                            });
                        }

                        this.scorePopups.push({
                            x: p.x, y: p.y - 50,
                            text: 'OUCH!',
                            life: 30
                        });

                        // Brief invincibility knockback
                        p.vy = -8;
                        p.isAirborne = true;
                    } else {
                        // No rings = game over
                        this.end(false);
                        return;
                    }
                    this.spikes.splice(i, 1);
                    continue;
                }
            }

            if (spike.x < -50) {
                this.spikes.splice(i, 1);
            }
        }

        // Update boost pads
        for (let i = this.boostPads.length - 1; i >= 0; i--) {
            const pad = this.boostPads[i];
            pad.x -= this.speed;

            // Boost activation
            const dx = pad.x - p.x;
            if (Math.abs(dx) < 30 && !p.isAirborne) {
                this.isBoosting = true;
                this.boostTimer = 60;
                this.scorePopups.push({
                    x: pad.x, y: pad.y - 30,
                    text: 'BOOST!',
                    life: 30
                });
                this.boostPads.splice(i, 1);
                continue;
            }

            if (pad.x < -50) {
                this.boostPads.splice(i, 1);
            }
        }

        // Update scattered rings (they fall and can be recollected)
        for (const ring of this.ringsList) {
            if (ring.scattered) {
                ring.y += ring.vy || 0;
                ring.vy = (ring.vy || 0) + 0.3;
                if (ring.y > Config.WATER_LEVEL) {
                    ring.y = Config.WATER_LEVEL - 15;
                    ring.vy = -ring.vy * 0.5;
                    if (Math.abs(ring.vy) < 1) {
                        ring.scattered = false;
                        ring.vy = 0;
                    }
                }
            }
        }
    },

    updateEffects() {
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const p = this.scorePopups[i];
            p.y -= 1.5;
            p.life--;
            if (p.life <= 0) this.scorePopups.splice(i, 1);
        }

        // Boost timer
        if (this.boostTimer > 0) {
            this.boostTimer--;
            if (this.boostTimer <= 0) {
                this.isBoosting = false;
            }
        }
    },

    update() {
        if (this.state !== 'playing') return;

        this.time++;

        // Win condition
        if (this.distance >= Config.COURSE_LENGTH) {
            this.end(true);
            return;
        }

        // Calculate speed
        let targetSpeed = Config.BASE_SPEED + (this.distance / Config.COURSE_LENGTH) * Config.MAX_SPEED_BONUS;

        if (this.isBoosting) {
            targetSpeed = Config.BOOST_SPEED;
        }

        // Smooth speed changes
        this.speed += (targetSpeed - this.speed) * 0.1;

        this.distance += this.speed;

        this.spawnRings();
        this.spawnObstacles();
        this.updatePikachu();
        this.updateObjects();
        this.updateEffects();
        this.updateUI();
    },

    updateUI() {
        const progress = Math.min(100, (this.distance / Config.COURSE_LENGTH) * 100);

        this.els.progressFill.style.width = `${progress}%`;
        this.els.hpFill.style.width = `${Math.min(100, this.rings)}%`;
        this.els.hpValue.textContent = this.rings;
        this.els.radnessValue.textContent = Math.floor(this.time / 60);
    },

    draw() {
        Renderer.clear();

        if (this.state === 'playing') {
            // Speed lines first (background effect)
            Renderer.drawSpeedLines(this.speed, this.distance);

            Renderer.drawBackground(this.distance, this.time);
            Renderer.drawCheckerGround(this.distance);
            Renderer.drawWater(x => this.getWaveHeightAt(x), this.distance);

            // Draw objects
            for (const pad of this.boostPads) {
                Renderer.drawBoostPad(pad);
            }
            for (const spring of this.springs) {
                Renderer.drawSpring(spring);
            }
            for (const spike of this.spikes) {
                Renderer.drawSpike(spike);
            }
            for (const ring of this.ringsList) {
                Renderer.drawRing(ring);
            }

            Renderer.drawParticles(this.particles);

            // Draw Sonic Pikachu
            Renderer.drawSonicPikachu(
                this.pikachu.x,
                this.pikachu.y,
                this.pikachu.rotation,
                this.isSpinning,
                this.speed
            );

            Renderer.drawScorePopups(this.scorePopups);

            // Spin indicator
            if (this.pikachu.isAirborne) {
                const spins = Math.floor(Math.abs(this.pikachu.totalRotation) / (Math.PI * 2));
                Renderer.drawFlipIndicator(this.pikachu.x, this.pikachu.y, spins);
            }

            // HUD
            Renderer.drawRingCounter(this.rings);
            Renderer.drawSpeedometer(this.speed);
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
    document.addEventListener('DOMContentLoaded', () => SonicGame.init());
} else {
    SonicGame.init();
}

export default SonicGame;
