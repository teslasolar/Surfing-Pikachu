// Shared Physics Module - Wave generation and character physics
const Physics = {
    waves: [],

    /**
     * Generate waves for the course
     * @param {number} courseLength - Total course length
     * @param {Object} options - Wave generation options
     */
    generateWaves(courseLength, options = {}) {
        const {
            spacing = 150,
            spacingVariance = 100,
            minWidth = 80,
            widthVariance = 60,
            minHeight = 25,
            heightVariance = 35
        } = options;

        this.waves = [];
        for (let x = 0; x < courseLength + 1000; x += spacing + Math.random() * spacingVariance) {
            this.waves.push({
                x,
                width: minWidth + Math.random() * widthVariance,
                height: minHeight + Math.random() * heightVariance,
                phase: Math.random() * Math.PI * 2
            });
        }
        return this.waves;
    },

    /**
     * Calculate wave height at a screen position
     * @param {number} screenX - Screen X coordinate
     * @param {number} distance - Current game distance
     * @param {number} time - Current game time
     * @param {Object} options - Wave calculation options
     */
    getWaveHeightAt(screenX, distance, time, options = {}) {
        const {
            baseAmplitude = 10,
            baseFrequency = 0.02,
            scrollFrequency = 0.01,
            waveSpeed = 0.005
        } = options;

        let height = Math.sin(screenX * baseFrequency + distance * scrollFrequency) * baseAmplitude;
        const worldX = screenX + distance;

        for (const wave of this.waves) {
            const dx = worldX - wave.x;
            if (Math.abs(dx) < wave.width) {
                const t = 1 - Math.abs(dx) / wave.width;
                const waveHeight = wave.height * Math.sin(t * Math.PI);
                height += waveHeight * Math.sin(time * waveSpeed + wave.phase);
            }
        }
        return height;
    },

    /**
     * Create initial player state
     * @param {Object} config - Game config with PIKACHU_X, WATER_LEVEL
     * @param {Object} extra - Extra properties to add
     */
    createPlayerState(config, extra = {}) {
        return {
            x: config.PIKACHU_X,
            y: config.WATER_LEVEL - 30,
            vy: 0,
            rotation: 0,
            rotationSpeed: 0,
            isAirborne: false,
            flipDirection: 0,
            totalRotation: 0,
            lastFlipDir: 0,
            canJump: true,
            ...extra
        };
    },

    /**
     * Apply gravity and update player vertical position
     * @param {Object} player - Player state
     * @param {number} gravity - Gravity value
     * @param {number} gravityModifier - Optional gravity modifier (e.g., 0.9 for reduced gravity)
     */
    applyGravity(player, gravity, gravityModifier = 1) {
        player.vy += gravity * gravityModifier;
        player.y += player.vy;
    },

    /**
     * Handle player jump
     * @param {Object} player - Player state
     * @param {number} jumpForce - Jump force (negative value)
     * @param {Object} options - Jump options
     */
    jump(player, jumpForce, options = {}) {
        const { jumpModifier = 1, resetRotation = true } = options;

        if (player.canJump && !player.isAirborne) {
            player.vy = jumpForce * jumpModifier;
            player.isAirborne = true;
            player.canJump = false;
            if (resetRotation) {
                player.totalRotation = 0;
            }
            return true;
        }
        return false;
    },

    /**
     * Apply rotation to airborne player
     * @param {Object} player - Player state
     * @param {number} direction - -1 for left, 1 for right, 0 for none
     * @param {number} maxRotationSpeed - Maximum rotation speed
     * @param {number} acceleration - Rotation acceleration
     */
    applyRotation(player, direction, maxRotationSpeed, acceleration = 0.02) {
        if (!player.isAirborne) return;

        if (direction < 0) {
            player.rotationSpeed = Math.max(-maxRotationSpeed, player.rotationSpeed - acceleration);
            player.flipDirection = -1;
        } else if (direction > 0) {
            player.rotationSpeed = Math.min(maxRotationSpeed, player.rotationSpeed + acceleration);
            player.flipDirection = 1;
        } else {
            player.rotationSpeed *= 0.98; // Natural deceleration
        }

        player.rotation += player.rotationSpeed;
        player.totalRotation += player.rotationSpeed;
    },

    /**
     * Check and handle landing on wave
     * @param {Object} player - Player state
     * @param {number} waterY - Water surface Y position
     * @param {function} onLand - Callback when landing (receives flip count and landing quality)
     */
    checkLanding(player, waterY, onLand = null) {
        const surfaceY = waterY - 20;

        if (player.y >= surfaceY) {
            if (player.isAirborne) {
                player.isAirborne = false;

                const flips = Math.floor(Math.abs(player.totalRotation) / (Math.PI * 2));
                const normalizedRotation = ((player.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const isGoodLanding = normalizedRotation < 0.5 || normalizedRotation > Math.PI * 2 - 0.5;
                const isCrash = !isGoodLanding && Math.abs(player.rotationSpeed) > 0.1;

                if (onLand) {
                    onLand({ flips, isGoodLanding, isCrash });
                }

                player.rotation = 0;
                player.rotationSpeed = 0;
                player.totalRotation = 0;
            }

            player.y = surfaceY;
            player.vy = 0;
            return true;
        }
        return false;
    },

    /**
     * Make player follow wave slope
     * @param {Object} player - Player state
     * @param {function} getWaveHeight - Function to get wave height at x
     * @param {number} factor - How much to follow the slope (0-1)
     */
    followWaveSlope(player, getWaveHeight, factor = 0.5) {
        if (player.isAirborne) return;

        const currentHeight = getWaveHeight(player.x);
        const nextHeight = getWaveHeight(player.x + 5);
        const slope = (nextHeight - currentHeight) / 5;
        player.rotation = Math.atan(slope) * factor;
    }
};

export default Physics;
