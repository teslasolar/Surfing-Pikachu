// Shared Particle System - Manages particles and score popups
const ParticleSystem = {
    particles: [],
    scorePopups: [],

    /**
     * Reset all particles and popups
     */
    reset() {
        this.particles = [];
        this.scorePopups = [];
    },

    /**
     * Create splash particles at a position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Particle options
     */
    createSplash(x, y, options = {}) {
        const {
            count = 12,
            spreadX = 8,
            spreadY = 8,
            minSize = 2,
            sizeVariance = 4,
            life = 30,
            type = 'splash'
        } = options;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * spreadX,
                vy: -Math.random() * spreadY - 2,
                size: Math.random() * sizeVariance + minSize,
                life,
                maxLife: life,
                type
            });
        }
    },

    /**
     * Create a score popup
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number|string} score - Score value or text to display
     * @param {Object} options - Popup options
     */
    createPopup(x, y, score, options = {}) {
        const { flips = 0, life = 60, text = null } = options;

        this.scorePopups.push({
            x,
            y,
            score,
            text: text || `+${score}`,
            flips,
            life,
            maxLife: life
        });
    },

    /**
     * Update all particles
     * @param {Object} options - Update options
     */
    updateParticles(options = {}) {
        const { gravity = 0.3 } = options;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += gravity;
            p.life--;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    /**
     * Update all score popups
     * @param {Object} options - Update options
     */
    updatePopups(options = {}) {
        const { floatSpeed = 1 } = options;

        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const p = this.scorePopups[i];
            p.y -= floatSpeed;
            p.life--;

            if (p.life <= 0) {
                this.scorePopups.splice(i, 1);
            }
        }
    },

    /**
     * Update all effects (particles + popups)
     * @param {Object} options - Update options
     */
    update(options = {}) {
        this.updateParticles(options);
        this.updatePopups(options);
    },

    /**
     * Get particles array (for rendering)
     */
    getParticles() {
        return this.particles;
    },

    /**
     * Get popups array (for rendering)
     */
    getPopups() {
        return this.scorePopups;
    },

    /**
     * Add a custom particle
     * @param {Object} particle - Particle object with x, y, vx, vy, size, life, type
     */
    addParticle(particle) {
        this.particles.push({
            life: 30,
            maxLife: 30,
            type: 'custom',
            ...particle
        });
    },

    /**
     * Add multiple custom particles
     * @param {Array} particles - Array of particle objects
     */
    addParticles(particles) {
        for (const p of particles) {
            this.addParticle(p);
        }
    }
};

// Factory function to create independent instances
export function createParticleSystem() {
    return {
        particles: [],
        scorePopups: [],
        ...ParticleSystem,
        reset() {
            this.particles = [];
            this.scorePopups = [];
        }
    };
}

export default ParticleSystem;
