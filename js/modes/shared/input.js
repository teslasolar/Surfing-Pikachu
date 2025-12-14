// Shared Input Manager - Handles keyboard, mouse, and touch input
const InputManager = {
    state: {},
    keyMappings: {},
    canvas: null,

    /**
     * Initialize input manager with custom key mappings
     * @param {Object} mappings - Key mappings like { jump: ['Space', 'ArrowUp', 'KeyW'], left: ['ArrowLeft', 'KeyA'] }
     */
    init(mappings = {}) {
        // Default mappings
        this.keyMappings = {
            jump: ['Space', 'ArrowUp', 'KeyW'],
            left: ['ArrowLeft', 'KeyA'],
            right: ['ArrowRight', 'KeyD'],
            ...mappings
        };

        // Initialize state for each action
        this.state = {};
        for (const action of Object.keys(this.keyMappings)) {
            this.state[action] = false;
        }

        this.setupKeyboardListeners();
        return this;
    },

    /**
     * Bind touch/mouse controls to a canvas
     * @param {HTMLCanvasElement} canvas
     * @param {Object} touchMap - Maps screen regions to actions, e.g., { left: 'blast', right: 'jump' }
     */
    bindCanvas(canvas, touchMap = { default: 'jump' }) {
        this.canvas = canvas;

        const handleStart = (e) => {
            e.preventDefault();
            const x = e.clientX || e.touches?.[0]?.clientX || 0;
            const midX = canvas.width / 2;

            if (touchMap.left && x < midX) {
                this.state[touchMap.left] = true;
            } else if (touchMap.right && x >= midX) {
                this.state[touchMap.right] = true;
            } else if (touchMap.default) {
                this.state[touchMap.default] = true;
            }
        };

        const handleEnd = () => {
            // Reset touch-triggered actions
            for (const action of Object.values(touchMap)) {
                if (action) this.state[action] = false;
            }
        };

        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('touchstart', handleStart, { passive: false });
        canvas.addEventListener('touchend', handleEnd);

        return this;
    },

    setupKeyboardListeners() {
        // Build reverse lookup: keyCode -> action
        this.keyToAction = {};
        for (const [action, keys] of Object.entries(this.keyMappings)) {
            for (const key of keys) {
                this.keyToAction[key] = action;
                // Also map lowercase variants
                this.keyToAction[key.toLowerCase()] = action;
            }
        }

        document.addEventListener('keydown', (e) => {
            const action = this.keyToAction[e.code] || this.keyToAction[e.key];
            if (action) {
                this.state[action] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            const action = this.keyToAction[e.code] || this.keyToAction[e.key];
            if (action) {
                this.state[action] = false;
            }
        });
    },

    /**
     * Get current input state
     */
    getState() {
        return { ...this.state };
    },

    /**
     * Check if an action is currently pressed
     */
    isPressed(action) {
        return this.state[action] || false;
    },

    /**
     * Reset all input states
     */
    reset() {
        for (const action of Object.keys(this.state)) {
            this.state[action] = false;
        }
    }
};

export default InputManager;
