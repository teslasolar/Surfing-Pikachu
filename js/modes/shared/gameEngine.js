// Shared Game Engine - Common game lifecycle and state management
import InputManager from './input.js';
import Physics from './physics.js';
import { createParticleSystem } from './particles.js';

/**
 * Create a new game instance with shared functionality
 * @param {Object} config - Game configuration
 * @param {Object} renderer - Renderer module
 * @param {Object} hooks - Custom game hooks
 */
export function createGame(config, renderer, hooks = {}) {
    const particles = createParticleSystem();

    const game = {
        // State
        state: 'title',
        hp: 0,
        score: 0,
        distance: 0,
        speed: 0,
        won: false,
        time: 0,

        // Systems
        config,
        renderer,
        particles,
        player: null,

        // DOM
        els: {},
        canvas: null,

        // Hooks for custom behavior
        hooks: {
            onInit: null,
            onStart: null,
            onUpdate: null,
            onDraw: null,
            onEnd: null,
            onLand: null,
            getExtraPlayerState: () => ({}),
            getInputMappings: () => ({}),
            getTouchMap: () => ({ default: 'jump' }),
            ...hooks
        },

        /**
         * Initialize the game
         */
        init() {
            this.canvas = document.getElementById('gameCanvas');
            renderer.init(this.canvas);

            // Cache DOM elements
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

            // Setup input
            InputManager.init(this.hooks.getInputMappings());
            InputManager.bindCanvas(this.canvas, this.hooks.getTouchMap());

            // Bind buttons
            this.els.startBtn.addEventListener('click', () => this.start());
            this.els.restartBtn.addEventListener('click', () => this.start());

            // Keyboard start
            document.addEventListener('keydown', (e) => {
                if (this.state !== 'playing') {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.start();
                    }
                }
            });

            // Generate initial waves
            Physics.generateWaves(config.COURSE_LENGTH);

            // Custom init
            if (this.hooks.onInit) {
                this.hooks.onInit(this);
            }

            this.state = 'title';
            this.loop();
        },

        /**
         * Start/restart the game
         */
        start() {
            this.state = 'playing';
            this.hp = config.MAX_HP;
            this.score = 0;
            this.distance = 0;
            this.speed = config.BASE_SPEED;
            this.won = false;
            this.time = 0;

            // Create player with optional extra state
            this.player = Physics.createPlayerState(config, this.hooks.getExtraPlayerState());

            // Reset systems
            particles.reset();
            Physics.generateWaves(config.COURSE_LENGTH);
            InputManager.reset();

            // Hide screens, show game
            this.els.titleScreen.style.display = 'none';
            this.els.gameOverScreen.style.display = 'none';
            this.els.gameUI.style.display = 'flex';
            this.canvas.style.display = 'block';

            // Custom start
            if (this.hooks.onStart) {
                this.hooks.onStart(this);
            }

            this.updateUI();
        },

        /**
         * End the game
         * @param {boolean} won - Whether player won
         * @param {Object} extra - Extra data for end screen
         */
        end(won, extra = {}) {
            this.state = 'gameOver';
            this.won = won;

            const finalHP = won ? Math.floor(this.hp) : 0;
            const finalScore = this.score + finalHP + (extra.bonus || 0);

            this.els.gameOverTitle.textContent = extra.title || (won ? 'COURSE COMPLETE!' : 'GAME OVER');
            this.els.finalRadness.textContent = this.score;
            this.els.finalHP.textContent = extra.hpText || finalHP;
            this.els.finalScore.textContent = finalScore;
            this.els.gameOverScreen.style.display = 'flex';

            if (this.hooks.onEnd) {
                this.hooks.onEnd(this, won, extra);
            }
        },

        /**
         * Get wave height at screen position
         */
        getWaveHeightAt(screenX) {
            return Physics.getWaveHeightAt(screenX, this.distance, this.time);
        },

        /**
         * Update player physics
         */
        updatePlayer() {
            const p = this.player;
            const input = InputManager.getState();
            const waveHeight = this.getWaveHeightAt(p.x);
            const waterY = config.WATER_LEVEL - waveHeight;

            // Jump
            if (input.jump) {
                Physics.jump(p, config.JUMP_FORCE);
            }
            if (!input.jump) {
                p.canJump = true;
            }

            // Rotation
            const rotDir = input.left ? -1 : input.right ? 1 : 0;
            Physics.applyRotation(p, rotDir, config.MAX_ROTATION_SPEED);

            // Gravity
            Physics.applyGravity(p, config.GRAVITY);

            // Landing
            Physics.checkLanding(p, waterY, (result) => {
                if (this.hooks.onLand) {
                    this.hooks.onLand(this, result);
                } else {
                    // Default landing behavior
                    if (result.flips > 0 && result.isGoodLanding) {
                        const points = result.flips * 100;
                        this.score += points;
                        particles.createPopup(p.x, p.y - 40, points, { flips: result.flips });
                    } else if (result.isCrash) {
                        this.hp -= 100;
                        particles.createSplash(p.x, waterY);
                    }
                }
            });

            // Follow wave slope when grounded
            Physics.followWaveSlope(p, (x) => this.getWaveHeightAt(x));
        },

        /**
         * Main update loop
         */
        update() {
            if (this.state !== 'playing') return;

            this.time++;

            // HP drain
            this.hp -= 1;
            if (this.hp <= 0) {
                this.end(false);
                return;
            }

            // Win check
            if (this.distance >= config.COURSE_LENGTH) {
                this.end(true);
                return;
            }

            // Progress
            this.distance += this.speed;
            this.speed = config.BASE_SPEED + (this.distance / config.COURSE_LENGTH) * config.MAX_SPEED_BONUS;

            // Update systems
            this.updatePlayer();
            particles.update();

            // Custom update
            if (this.hooks.onUpdate) {
                this.hooks.onUpdate(this, InputManager.getState());
            }

            this.updateUI();
        },

        /**
         * Update UI elements
         */
        updateUI() {
            const progress = Math.min(100, (this.distance / config.COURSE_LENGTH) * 100);
            const hpPct = (this.hp / config.MAX_HP) * 100;

            this.els.progressFill.style.width = `${progress}%`;
            this.els.hpFill.style.width = `${hpPct}%`;
            this.els.hpValue.textContent = Math.max(0, Math.floor(this.hp));
            this.els.radnessValue.textContent = this.score;
        },

        /**
         * Main draw loop
         */
        draw() {
            renderer.clear();

            if (this.state === 'playing') {
                // Custom draw or default
                if (this.hooks.onDraw) {
                    this.hooks.onDraw(this);
                } else {
                    // Default draw sequence
                    renderer.drawBackground?.(this.distance, this.time);
                    renderer.drawWater?.((x) => this.getWaveHeightAt(x), Physics.waves, this.distance);
                    renderer.drawParticles?.(particles.getParticles());
                    renderer.drawPlayer?.(this.player.x, this.player.y, this.player.rotation);
                    renderer.drawScorePopups?.(particles.getPopups());

                    if (this.player.isAirborne) {
                        const flips = Math.floor(Math.abs(this.player.totalRotation) / (Math.PI * 2));
                        renderer.drawFlipIndicator?.(this.player.x, this.player.y, flips);
                    }
                }
            }
        },

        /**
         * Game loop
         */
        loop() {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.loop());
        },

        // Expose systems for hooks
        getInput() {
            return InputManager.getState();
        },

        getPhysics() {
            return Physics;
        },

        getParticles() {
            return particles;
        }
    };

    return game;
}

export { InputManager, Physics };
export default { createGame, InputManager, Physics };
