// Sonic Speedrun Mode - Refactored with Shared Modules
// Original: 645 lines → Refactored: ~280 lines (57% reduction)

import { createGame, InputManager, Physics } from '../shared/gameEngine.js';
import Config from './config.js';
import Renderer from './renderer.js';

// Sonic-specific state
let ringsList = [];
let springs = [];
let spikes = [];
let boostPads = [];
let isSpinning = false;
let isBoosting = false;
let boostTimer = 0;
let lastRingSpawn = 0;
let lastSpringSpawn = 0;
let lastSpikeSpawn = 0;
let lastBoostSpawn = 0;

// Create game with Sonic-specific hooks
const SonicGame = createGame(Config, Renderer, {
    // Custom input mappings
    getInputMappings: () => ({
        jump: ['Space', 'ArrowUp', 'KeyW'],
        left: ['ArrowLeft', 'KeyA'],
        right: ['ArrowRight', 'KeyD'],
        spin: ['ArrowDown', 'KeyS']
    }),

    // Extra player state
    getExtraPlayerState: () => ({
        rings: 0
    }),

    // Custom init
    onInit(game) {
        // Override HP to be rings
        game.hp = 0;
    },

    // Custom start
    onStart(game) {
        ringsList = [];
        springs = [];
        spikes = [];
        boostPads = [];
        isSpinning = false;
        isBoosting = false;
        boostTimer = 0;
        lastRingSpawn = 0;
        lastSpringSpawn = 0;
        lastSpikeSpawn = 0;
        lastBoostSpawn = 0;
        game.player.rings = 0;
    },

    // Custom landing behavior
    onLand(game, result) {
        isSpinning = false;
        if (result.flips > 0) {
            const bonus = result.flips * 10;
            game.player.rings += bonus;
            game.getParticles().createPopup(game.player.x, game.player.y - 50, `+${bonus}`, { life: 60 });
        }
    },

    // Main update logic
    onUpdate(game, input) {
        const p = game.player;

        // Spin mode
        if (input.spin && !p.isAirborne) {
            isSpinning = true;
        }

        // Auto-spin rotation
        if (isSpinning && p.isAirborne && Math.abs(p.rotationSpeed) < 0.2) {
            p.rotationSpeed = 0.25;
        }

        // Boost timer
        if (boostTimer > 0) {
            boostTimer--;
            if (boostTimer <= 0) isBoosting = false;
        }

        // Speed adjustments
        if (isBoosting) {
            game.speed = Config.BOOST_SPEED;
        }

        // Spawn objects
        spawnRings(game);
        spawnObstacles(game);

        // Update objects
        updateObjects(game);

        // Override HP display with rings
        game.hp = Math.min(Config.MAX_HP, game.player.rings);
    },

    // Custom draw
    onDraw(game) {
        const p = game.player;
        const particles = game.getParticles();

        Renderer.drawSpeedLines(game.speed, game.distance);
        Renderer.drawBackground(game.distance, game.time);
        Renderer.drawCheckerGround(game.distance);
        Renderer.drawWater(x => game.getWaveHeightAt(x), game.distance);

        // Draw objects
        for (const pad of boostPads) Renderer.drawBoostPad(pad);
        for (const spring of springs) Renderer.drawSpring(spring);
        for (const spike of spikes) Renderer.drawSpike(spike);
        for (const ring of ringsList) Renderer.drawRing(ring);

        Renderer.drawParticles(particles.getParticles());
        Renderer.drawSonicPikachu(p.x, p.y, p.rotation, isSpinning, game.speed);
        Renderer.drawScorePopups(particles.getPopups());

        if (p.isAirborne) {
            const spins = Math.floor(Math.abs(p.totalRotation) / (Math.PI * 2));
            Renderer.drawFlipIndicator(p.x, p.y, spins);
        }

        Renderer.drawRingCounter(game.player.rings);
        Renderer.drawSpeedometer(game.speed);
    },

    // Custom end
    onEnd(game, won) {
        const seconds = Math.floor(game.time / 60);
        const frames = game.time % 60;
        const timeStr = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`;

        game.els.gameOverTitle.textContent = won ? 'GOAL!' : 'TOO SLOW!';
        game.els.finalHP.textContent = timeStr;
    }
});

// Ring spawning
function spawnRings(game) {
    if (game.time - lastRingSpawn < Config.RING_SPAWN_RATE) return;

    const pattern = Math.floor(Math.random() * 4);
    const baseX = Config.GAME_WIDTH + 50;
    const baseY = 150 + Math.random() * 100;

    const patterns = {
        0: () => [{ x: baseX, y: baseY }],
        1: () => Array.from({ length: 5 }, (_, i) => ({ x: baseX + i * 30, y: baseY })),
        2: () => Array.from({ length: 5 }, (_, i) => ({
            x: baseX + i * 30,
            y: baseY - Math.sin(i / 4 * Math.PI) * 40
        })),
        3: () => Array.from({ length: 3 }, (_, i) => ({ x: baseX, y: baseY - 30 + i * 30 }))
    };

    const newRings = patterns[pattern]();
    for (const r of newRings) {
        ringsList.push({ ...r, phase: Math.random() * Math.PI * 2 });
    }
    lastRingSpawn = game.time;
}

// Obstacle spawning
function spawnObstacles(game) {
    if (game.time - lastSpringSpawn > Config.SPRING_SPAWN_RATE) {
        springs.push({ x: Config.GAME_WIDTH + 50, y: Config.WATER_LEVEL - 10, compressed: false });
        lastSpringSpawn = game.time;
    }
    if (game.time - lastSpikeSpawn > Config.SPIKE_SPAWN_RATE) {
        spikes.push({ x: Config.GAME_WIDTH + 50, y: Config.WATER_LEVEL - 10 });
        lastSpikeSpawn = game.time;
    }
    if (game.time - lastBoostSpawn > Config.BOOST_PAD_SPAWN_RATE) {
        boostPads.push({ x: Config.GAME_WIDTH + 50, y: Config.WATER_LEVEL - 5 });
        lastBoostSpawn = game.time;
    }
}

// Object updates
function updateObjects(game) {
    const p = game.player;
    const particles = game.getParticles();

    // Rings
    for (let i = ringsList.length - 1; i >= 0; i--) {
        const ring = ringsList[i];
        ring.x -= game.speed;

        // Scattered ring physics
        if (ring.scattered) {
            ring.y += ring.vy || 0;
            ring.vy = (ring.vy || 0) + 0.3;
            if (ring.y > Config.WATER_LEVEL) {
                ring.y = Config.WATER_LEVEL - 15;
                ring.vy = -ring.vy * 0.5;
                if (Math.abs(ring.vy) < 1) ring.scattered = false;
            }
        }

        // Collect
        const dx = ring.x - p.x, dy = ring.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
            p.rings++;
            ringsList.splice(i, 1);
            particles.createSplash(ring.x, ring.y, { count: 8, life: 20, type: 'ring' });
            continue;
        }

        if (ring.x < -30) ringsList.splice(i, 1);
    }

    // Springs
    for (let i = springs.length - 1; i >= 0; i--) {
        const spring = springs[i];
        spring.x -= game.speed;
        spring.compressed = false;

        const dx = spring.x - p.x, dy = (spring.y - 20) - p.y;
        if (Math.abs(dx) < 20 && dy < 20 && dy > -10 && p.vy > 0) {
            p.vy = -18;
            p.isAirborne = true;
            spring.compressed = true;
            particles.createPopup(spring.x, spring.y - 40, 'SPRING!', { life: 30 });
        }

        if (spring.x < -50) springs.splice(i, 1);
    }

    // Spikes
    for (let i = spikes.length - 1; i >= 0; i--) {
        const spike = spikes[i];
        spike.x -= game.speed;

        if (!isSpinning) {
            const dx = spike.x - p.x, dy = spike.y - p.y;
            if (Math.abs(dx) < 25 && Math.abs(dy) < 30) {
                if (p.rings > 0) {
                    const lost = Math.min(p.rings, 20);
                    p.rings -= lost;

                    // Scatter rings
                    for (let j = 0; j < Math.min(lost, 10); j++) {
                        ringsList.push({
                            x: p.x + (Math.random() - 0.5) * 60,
                            y: p.y - 30 - Math.random() * 40,
                            phase: Math.random() * Math.PI * 2,
                            vy: -5 - Math.random() * 5,
                            scattered: true
                        });
                    }

                    particles.createPopup(p.x, p.y - 50, 'OUCH!', { life: 30 });
                    p.vy = -8;
                    p.isAirborne = true;
                } else {
                    game.end(false);
                    return;
                }
                spikes.splice(i, 1);
                continue;
            }
        }

        if (spike.x < -50) spikes.splice(i, 1);
    }

    // Boost pads
    for (let i = boostPads.length - 1; i >= 0; i--) {
        const pad = boostPads[i];
        pad.x -= game.speed;

        if (Math.abs(pad.x - p.x) < 30 && !p.isAirborne) {
            isBoosting = true;
            boostTimer = 60;
            particles.createPopup(pad.x, pad.y - 30, 'BOOST!', { life: 30 });
            boostPads.splice(i, 1);
            continue;
        }

        if (pad.x < -50) boostPads.splice(i, 1);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SonicGame.init());
} else {
    SonicGame.init();
}

export default SonicGame;
