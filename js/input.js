// Input module - Keyboard, Touch, and Gamepad support
const Input = {
    keys: { left: false, right: false, up: false },
    touch: { startX: 0, startY: 0 },
    gamepadIndex: null,
    deadzone: 0.3,

    init(canvas) {
        this.canvas = canvas;
        this.bindKeyboard();
        this.bindTouch();
        this.bindGamepad();
        return this;
    },

    bindKeyboard() {
        const keyMap = {
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right',
            'ArrowUp': 'up', 'w': 'up', 'W': 'up', ' ': 'up'
        };

        document.addEventListener('keydown', e => {
            const action = keyMap[e.key];
            if (action) {
                this.keys[action] = true;
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', e => {
            const action = keyMap[e.key];
            if (action) this.keys[action] = false;
        });
    },

    bindTouch() {
        const opts = { passive: false };

        this.canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0];
            this.touch.startX = t.clientX;
            this.touch.startY = t.clientY;
            this.keys.up = true;
        }, opts);

        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const dx = e.touches[0].clientX - this.touch.startX;
            this.keys.left = dx < -20;
            this.keys.right = dx > 20;
        }, opts);

        this.canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.keys.up = this.keys.left = this.keys.right = false;
        }, opts);
    },

    bindGamepad() {
        window.addEventListener('gamepadconnected', e => {
            this.gamepadIndex = e.gamepad.index;
            console.log('Gamepad connected:', e.gamepad.id);
        });

        window.addEventListener('gamepaddisconnected', e => {
            if (e.gamepad.index === this.gamepadIndex) {
                this.gamepadIndex = null;
                console.log('Gamepad disconnected');
            }
        });
    },

    // Poll gamepad state (call each frame)
    pollGamepad() {
        if (this.gamepadIndex === null) return;

        const gp = navigator.getGamepads()[this.gamepadIndex];
        if (!gp) return;

        // Left stick X-axis (axis 0) or D-pad
        const lx = gp.axes[0] || 0;
        const dpadLeft = gp.buttons[14]?.pressed;  // D-pad left
        const dpadRight = gp.buttons[15]?.pressed; // D-pad right
        const dpadUp = gp.buttons[12]?.pressed;    // D-pad up

        // A button (0), B button (1), X (2), Y (3), bumpers (4,5), triggers (6,7)
        const aButton = gp.buttons[0]?.pressed;
        const bButton = gp.buttons[1]?.pressed;
        const rbButton = gp.buttons[5]?.pressed;
        const rtTrigger = gp.buttons[7]?.value > 0.5;

        // Apply deadzone for stick
        this.keys.left = lx < -this.deadzone || dpadLeft;
        this.keys.right = lx > this.deadzone || dpadRight;
        this.keys.up = aButton || bButton || rbButton || rtTrigger || dpadUp;
    },

    // Get current input state (combines all sources)
    getState() {
        this.pollGamepad();
        return { ...this.keys };
    },

    // Check if any action button pressed (for menu navigation)
    anyAction() {
        this.pollGamepad();
        if (this.keys.up) return true;

        if (this.gamepadIndex !== null) {
            const gp = navigator.getGamepads()[this.gamepadIndex];
            if (gp) {
                // Start button (9) or any face button
                return gp.buttons[9]?.pressed ||
                       gp.buttons[0]?.pressed ||
                       gp.buttons[1]?.pressed;
            }
        }
        return false;
    },

    // Reset all keys
    reset() {
        this.keys = { left: false, right: false, up: false };
    }
};

export default Input;
