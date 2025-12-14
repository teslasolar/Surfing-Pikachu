// Main Game Module - Orchestrates all systems
import Config from './config.js';
import Audio from './audio.js';
import Input from './input.js';
import Renderer from './renderer.js';
import Physics from './physics.js';

const Game = {
    state: 'loading', // loading, title, playing, gameOver
    hp: 0,
    radness: 0,
    distance: 0,
    speed: 0,
    won: false,

    pikachu: null,

    // DOM elements
    els: {},

    async init() {
        // Load config first
        await Config.load();

        // Cache DOM elements
        this.els = {
            titleScreen: document.getElementById('titleScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            gameCanvas: document.getElementById('gameCanvas'),
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

        // Initialize systems
        Renderer.init(this.els.gameCanvas);
        Input.init(this.els.gameCanvas);

        // Bind events
        this.els.startBtn.addEventListener('click', () => this.start());
        this.els.restartBtn.addEventListener('click', () => this.start());

        // Keyboard start
        document.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && this.state !== 'playing') {
                e.preventDefault();
                this.start();
            }
        });

        this.state = 'title';
        this.loop();
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
        Audio.init();
        Audio.resume();

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
        this.els.gameCanvas.style.display = 'block';
        this.els.gameUI.style.display = 'flex';

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
                    break;
                case 'score':
                    this.radness += result.score;
                    Physics.createScorePopup(this.pikachu.x, result.y - 35, result.score, result.flips);
                    Audio.play('score');
                    break;
                case 'crash':
                    this.hp -= result.penalty;
                    Audio.play('splash');
                    break;
                case 'land':
                    Audio.play('land');
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

        Renderer.clear();
        Renderer.drawBackground(this.distance);
        Renderer.drawWater(
            x => Physics.getWaveHeightAt(x, this.distance),
            Physics.waves,
            this.distance
        );
        Renderer.drawParticles(Physics.particles);
        Renderer.drawPikachu(this.pikachu.x, this.pikachu.y, this.pikachu.rotation);
        Renderer.drawScorePopups(Physics.scorePopups);

        // Flip indicator
        if (this.pikachu.isAirborne && Math.abs(this.pikachu.rotationSpeed) > 0.1) {
            const flips = Math.floor(Math.abs(this.pikachu.totalRotation) / (Math.PI * 2));
            Renderer.drawFlipIndicator(this.pikachu.x, this.pikachu.y, flips);
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
