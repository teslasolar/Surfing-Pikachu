// Main Game Module - Orchestrates all systems
import Config from './config.js';
import Audio from './audio.js';
import Input from './input.js';
import Renderer from './renderer.js';
import Physics from './physics.js';
import Characters from './characters/index.js';
import Components from './components.js';

// Dynamic import for 3D (only load if needed)
let Renderer3D = null;

const Game = {
    state: 'loading', // loading, title, playing, gameOver
    hp: 0,
    radness: 0,
    distance: 0,
    speed: 0,
    won: false,
    is3D: false,
    renderer3DLoaded: false,
    renderer3DError: null,

    pikachu: null,

    // DOM elements
    els: {},

    async init() {
        // Load components first
        await Components.loadAll();

        // Inject dock components into containers
        Components.inject('dockNorth', 'north');
        Components.inject('dockWest', 'west');
        Components.inject('dockEast', 'east');
        Components.inject('dockSouth', 'south');
        Components.inject('gameBody', 'body');

        // Load config
        await Config.load();

        // Cache DOM elements (after components are injected)
        this.els = {
            titleScreen: document.getElementById('titleScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            gameCanvas: document.getElementById('gameCanvas'),
            gameContainer: document.querySelector('.game-container'),
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
            restartBtn: document.getElementById('restartBtn'),
            modeToggle: document.getElementById('modeToggle'),
            modeLabel: document.getElementById('modeLabel'),
            charName: document.getElementById('charName'),
            charPrev: document.getElementById('charPrev'),
            charNext: document.getElementById('charNext'),
            charPreview: document.getElementById('charPreview')
        };

        // Initialize 2D renderer
        Renderer.init(this.els.gameCanvas);
        Input.init(this.els.gameCanvas);

        // Bind events
        this.els.startBtn.addEventListener('click', () => this.start());
        this.els.restartBtn.addEventListener('click', () => this.start());

        // Mode toggle
        if (this.els.modeToggle) {
            this.els.modeToggle.addEventListener('click', () => this.toggleMode());
        }

        // Character selection
        if (this.els.charPrev) {
            this.els.charPrev.addEventListener('click', () => this.prevCharacter());
        }
        if (this.els.charNext) {
            this.els.charNext.addEventListener('click', () => this.nextCharacter());
        }

        // Keyboard controls
        document.addEventListener('keydown', e => {
            if (this.state !== 'playing') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.start();
                }
                // Character selection with [ and ]
                if (e.key === '[' || e.key === 'ArrowLeft') {
                    this.prevCharacter();
                }
                if (e.key === ']' || e.key === 'ArrowRight') {
                    this.nextCharacter();
                }
            }
            // Toggle 3D with 'T' key (anytime)
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.toggleMode();
            }
        });

        // Update character display
        this.updateCharacterUI();

        this.state = 'title';
        this.loop();
    },

    prevCharacter() {
        Characters.prev();
        this.updateCharacterUI();
    },

    nextCharacter() {
        Characters.next();
        this.updateCharacterUI();
    },

    updateCharacterUI() {
        const char = Characters.current;
        if (this.els.charName && char) {
            this.els.charName.textContent = char.name;
        }
        // Draw preview
        if (this.els.charPreview && char) {
            const ctx = this.els.charPreview.getContext('2d');
            ctx.clearRect(0, 0, 80, 80);
            Characters.draw(ctx, 40, 55, 0);
        }
    },

    async toggleMode() {
        // If already loading, ignore
        if (this.els.modeLabel?.textContent === 'Loading 3D...') {
            return;
        }

        const wasPlaying = this.state === 'playing';

        if (!this.is3D) {
            // Switching TO 3D
            if (!this.renderer3DLoaded) {
                try {
                    if (this.els.modeLabel) {
                        this.els.modeLabel.textContent = 'Loading 3D...';
                    }
                    if (this.els.modeToggle) {
                        this.els.modeToggle.disabled = true;
                    }

                    const module = await import('./renderer3d.js');
                    Renderer3D = module.default;
                    Renderer3D.init(this.els.gameContainer);
                    this.renderer3DLoaded = true;

                    // Bind input to 3D canvas too
                    const canvas3D = document.getElementById('game3DCanvas');
                    if (canvas3D) {
                        Input.init(canvas3D);
                    }
                } catch (e) {
                    console.error('Failed to load 3D renderer:', e);
                    this.renderer3DError = e.message;
                    if (this.els.modeLabel) {
                        this.els.modeLabel.textContent = '3D Error';
                    }
                    setTimeout(() => {
                        if (this.els.modeLabel) {
                            this.els.modeLabel.textContent = '2D Mode';
                        }
                    }, 2000);
                    if (this.els.modeToggle) {
                        this.els.modeToggle.disabled = false;
                    }
                    return;
                }
            }

            this.is3D = true;
        } else {
            // Switching TO 2D
            this.is3D = false;
        }

        // Update button
        if (this.els.modeToggle) {
            this.els.modeToggle.disabled = false;
            this.els.modeToggle.classList.toggle('active', this.is3D);
        }
        if (this.els.modeLabel) {
            this.els.modeLabel.textContent = this.is3D ? '3D Mode' : '2D Mode';
        }

        // Toggle canvas visibility if playing
        if (wasPlaying) {
            if (this.is3D && Renderer3D) {
                this.els.gameCanvas.style.display = 'none';
                Renderer3D.show();
            } else {
                this.els.gameCanvas.style.display = 'block';
                if (Renderer3D) Renderer3D.hide();
            }
        }
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

    async start() {
        Audio.init();
        Audio.resume();

        // If 3D mode selected but not loaded, try to load
        if (this.is3D && !this.renderer3DLoaded) {
            await this.toggleMode();
            if (!this.renderer3DLoaded) {
                // Failed to load 3D, fall back to 2D
                this.is3D = false;
            }
        }

        this.state = 'playing';
        this.hp = Config.MAX_HP;
        this.radness = 0;
        this.distance = 0;
        this.speed = Config.BASE_SPEED;
        this.won = false;

        this.pikachu = this.resetPikachu();
        Physics.reset();
        Physics.generateWaves();
        Input.reset();

        // Show game UI
        this.els.titleScreen.style.display = 'none';
        this.els.gameOverScreen.style.display = 'none';
        this.els.gameUI.style.display = 'flex';

        // Show appropriate canvas
        if (this.is3D && Renderer3D) {
            this.els.gameCanvas.style.display = 'none';
            Renderer3D.show();
        } else {
            this.els.gameCanvas.style.display = 'block';
            if (Renderer3D) Renderer3D.hide();
        }

        this.updateUI();
    },

    end(won) {
        this.state = 'gameOver';
        this.won = won;

        const finalHP = won ? Math.floor(this.hp) : 0;
        const finalScore = this.radness + finalHP;

        this.els.gameOverTitle.textContent = won ? 'COURSE COMPLETE!' : 'GAME OVER';
        this.els.finalRadness.textContent = this.radness;
        this.els.finalHP.textContent = finalHP;
        this.els.finalScore.textContent = finalScore;
        this.els.gameOverScreen.style.display = 'flex';

        Audio.play(won ? 'win' : 'splash');
    },

    update() {
        if (this.state !== 'playing') return;

        // Timer/HP decreases
        this.hp -= 1;
        if (this.hp <= 0) {
            this.end(false);
            return;
        }

        // Win condition
        if (this.distance >= Config.COURSE_LENGTH) {
            this.end(true);
            return;
        }

        // Move forward
        this.distance += this.speed;
        this.speed = Config.BASE_SPEED + (this.distance / Config.COURSE_LENGTH) * Config.MAX_SPEED_BONUS;

        // Get input and update physics
        const input = Input.getState();
        const result = Physics.updatePikachu(this.pikachu, this.distance, input);

        // Handle physics results
        if (result) {
            switch (result.type) {
                case 'jump':
                    Audio.play('jump');
                    if (this.is3D && Renderer3D) {
                        Renderer3D.addRipple(0.5);
                    }
                    break;
                case 'score':
                    this.radness += result.score;
                    Physics.createScorePopup(this.pikachu.x, result.y - 35, result.score, result.flips);
                    Audio.play('score');
                    if (this.is3D && Renderer3D) {
                        Renderer3D.createSplash(2);
                        Renderer3D.createScorePopup(result.score, result.flips);
                    }
                    break;
                case 'crash':
                    this.hp -= result.penalty;
                    Audio.play('splash');
                    if (this.is3D && Renderer3D) {
                        Renderer3D.createSplash(4);
                    }
                    break;
                case 'land':
                    Audio.play('land');
                    if (this.is3D && Renderer3D) {
                        Renderer3D.createSplash(1);
                    }
                    break;
            }
        }

        // Update effects
        Physics.updateEffects();
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
        if (this.state !== 'playing') return;

        if (this.is3D && Renderer3D) {
            // 3D Rendering
            Renderer3D.updatePikachu(
                this.pikachu.x,
                this.pikachu.y,
                this.pikachu.rotation,
                this.distance
            );
            Renderer3D.render(this.distance);
        } else {
            // 2D Rendering
            Renderer.clear();
            Renderer.drawBackground(this.distance);
            Renderer.drawWater(
                x => Physics.getWaveHeightAt(x, this.distance),
                Physics.waves,
                this.distance
            );
            Renderer.drawParticles(Physics.particles);

            // Use character system for drawing
            Characters.draw(Renderer.ctx, this.pikachu.x, this.pikachu.y, this.pikachu.rotation);

            Renderer.drawScorePopups(Physics.scorePopups);

            // Flip indicator
            if (this.pikachu.isAirborne && Math.abs(this.pikachu.rotationSpeed) > 0.1) {
                const flips = Math.floor(Math.abs(this.pikachu.totalRotation) / (Math.PI * 2));
                Renderer.drawFlipIndicator(this.pikachu.x, this.pikachu.y, flips);
            }
        }
    },

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
};

// Start when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}

export default Game;
