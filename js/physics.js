// Physics module - Wave generation, collision, movement
import Config from './config.js';

const Physics = {
    waves: [],
    particles: [],
    scorePopups: [],

    // Generate wave course
    generateWaves() {
        this.waves = [];
        let x = 200;
        const endX = Config.COURSE_LENGTH + 500;

        while (x < endX) {
            const waveType = Config.getWaveType(Math.random());
            this.waves.push({
                x,
                size: waveType.size,
                height: waveType.height,
                width: waveType.width
            });
            x += waveType.width + 100 + Math.random() * 150;
        }
        return this.waves;
    },

    // Get wave height at position
    getWaveHeightAt(x, distance) {
        let height = 0;
        for (const wave of this.waves) {
            const relX = x - wave.x + distance;
            if (relX >= 0 && relX <= wave.width) {
                const progress = relX / wave.width;
                height = Math.max(height, Math.sin(progress * Math.PI) * wave.height);
            }
        }
        // Ocean ripples
        height += Math.sin((x + distance) * 0.05) * 5;
        height += Math.sin((x + distance) * 0.02 + 1) * 3;
        return height;
    },

    // Check if position is on a significant wave
    isOnWave(x, distance) {
        return this.getWaveHeightAt(x, distance) > Config.WAVE_MIN_HEIGHT;
    },

    // Get launch power from current wave
    getLaunchPower(x, distance) {
        let maxHeight = 0;
        for (const wave of this.waves) {
            const relX = x - wave.x + distance;
            if (relX >= 0 && relX <= wave.width && wave.height > maxHeight) {
                maxHeight = wave.height;
            }
        }
        return maxHeight;
    },

    // Update pikachu physics - returns landing result if landed
    updatePikachu(pika, distance, input) {
        const WL = Config.WATER_LEVEL;
        const waveHeight = this.getWaveHeightAt(pika.x, distance);
        const waterY = WL - waveHeight;
        let landingResult = null;

        // Handle jumping - IMMEDIATELY check if we can jump
        if (input.up && !pika.isAirborne && this.isOnWave(pika.x, distance)) {
            const power = this.getLaunchPower(pika.x, distance);
            pika.vy = -Config.JUMP_BASE_POWER - (power / Config.JUMP_WAVE_FACTOR);
            pika.isAirborne = true;
            pika.canJump = false;
            return { type: 'jump' };
        }

        if (pika.isAirborne) {
            // Handle flipping
            if (input.left) {
                pika.rotationSpeed = Math.max(pika.rotationSpeed - Config.ROTATION_ACCEL, -Config.MAX_ROTATION_SPEED);
                if (pika.lastFlipDir === 1) pika.flipDirection = 0;
                else if (pika.flipDirection !== -1) pika.flipDirection = -1;
                pika.lastFlipDir = -1;
            } else if (input.right) {
                pika.rotationSpeed = Math.min(pika.rotationSpeed + Config.ROTATION_ACCEL, Config.MAX_ROTATION_SPEED);
                if (pika.lastFlipDir === -1) pika.flipDirection = 0;
                else if (pika.flipDirection !== 1) pika.flipDirection = 1;
                pika.lastFlipDir = 1;
            }

            pika.rotation += pika.rotationSpeed;
            pika.totalRotation += pika.rotationSpeed;

            // Apply gravity
            pika.vy += Config.GRAVITY;
            pika.y += pika.vy;

            // Check landing
            if (pika.y >= waterY - Config.LANDING_THRESHOLD && pika.vy > 0) {
                landingResult = this.handleLanding(pika, waterY);
            }
        } else {
            // Follow wave surface smoothly
            const targetY = waterY - Config.LANDING_THRESHOLD;
            pika.y += (targetY - pika.y) * 0.3;

            // Tilt with wave slope
            const aheadHeight = this.getWaveHeightAt(pika.x + 20, distance);
            pika.rotation = Math.atan2(waveHeight - aheadHeight, 20) * 0.5;

            // Allow jumping immediately when on wave
            pika.canJump = true;
        }

        return landingResult;
    },

    handleLanding(pika, waterY) {
        // Normalize rotation
        let angle = pika.rotation % (Math.PI * 2);
        if (angle < 0) angle += Math.PI * 2;

        const uprightThreshold = Config.UPRIGHT_ANGLE;
        const isUpright = (angle < uprightThreshold) ||
                         (angle > Math.PI * 2 - uprightThreshold) ||
                         (angle > Math.PI - uprightThreshold && angle < Math.PI + uprightThreshold);

        const fullFlips = Math.floor(Math.abs(pika.totalRotation) / (Math.PI * 2));
        const hasOpposite = pika.flipDirection === 0;

        let result;
        if (isUpright && fullFlips > 0) {
            // Good landing with flips
            const score = Config.getFlipScore(fullFlips, hasOpposite);
            result = { type: 'score', score, flips: fullFlips, y: waterY };
            this.createSplash(pika.x, waterY, 2);
        } else if (!isUpright && pika.isAirborne) {
            // Crash
            result = { type: 'crash', penalty: Config.CRASH_PENALTY, y: waterY };
            this.createSplash(pika.x, waterY, 4);
        } else {
            // Normal landing
            result = { type: 'land', y: waterY };
            this.createSplash(pika.x, waterY, 1);
        }

        // Reset pikachu state - IMPORTANT: allow immediate re-jump
        pika.y = waterY - Config.LANDING_THRESHOLD;
        pika.vy = 0;
        pika.isAirborne = false;
        pika.rotation = 0;
        pika.rotationSpeed = 0;
        pika.totalRotation = 0;
        pika.flipDirection = 0;
        pika.canJump = true; // Ready to jump immediately

        return result;
    },

    // Create splash particles
    createSplash(x, y, intensity) {
        for (let i = 0; i < intensity * 10; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * intensity * 3,
                vy: -Math.random() * intensity * 4,
                size: 2 + Math.random() * 3,
                life: 20 + Math.random() * 20
            });
        }
    },

    // Create score popup
    createScorePopup(x, y, score, flips) {
        this.scorePopups.push({ x, y, score, flips, life: 60 });
    },

    // Update particles and popups
    updateEffects() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            if (--p.life <= 0) this.particles.splice(i, 1);
        }

        // Update popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const p = this.scorePopups[i];
            p.y -= 1.5;
            if (--p.life <= 0) this.scorePopups.splice(i, 1);
        }
    },

    // Reset effects
    reset() {
        this.particles = [];
        this.scorePopups = [];
    }
};

export default Physics;
