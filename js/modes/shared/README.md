# Shared Game Modules

Reusable modules to reduce code duplication across game modes.

## Modules

### `gameEngine.js`
Core game lifecycle and state management.

```javascript
import { createGame } from '../shared/gameEngine.js';
import Config from './config.js';
import Renderer from './renderer.js';

const MyGame = createGame(Config, Renderer, {
    // Customize input mappings
    getInputMappings: () => ({
        jump: ['Space', 'ArrowUp'],
        blast: ['KeyX', 'KeyK']
    }),

    // Add extra player state
    getExtraPlayerState: () => ({ ki: 0 }),

    // Custom update logic
    onUpdate(game, input) {
        // Your game-specific logic
    },

    // Custom draw
    onDraw(game) {
        // Your rendering code
    }
});

MyGame.init();
```

### `physics.js`
Wave generation and character physics.

- `generateWaves(courseLength, options)` - Create wave patterns
- `getWaveHeightAt(x, distance, time)` - Calculate wave height
- `createPlayerState(config)` - Initialize player
- `applyGravity(player, gravity)` - Apply gravity
- `jump(player, force)` - Handle jumping
- `applyRotation(player, direction, maxSpeed)` - Handle spinning
- `checkLanding(player, waterY, callback)` - Detect landings

### `input.js`
Keyboard, mouse, and touch input handling.

```javascript
import InputManager from '../shared/input.js';

InputManager.init({
    jump: ['Space', 'ArrowUp', 'KeyW'],
    blast: ['KeyX']
});

InputManager.bindCanvas(canvas, { default: 'jump' });

// In game loop
const input = InputManager.getState();
if (input.jump) { /* jump */ }
```

### `particles.js`
Particle effects and score popups.

```javascript
import { createParticleSystem } from '../shared/particles.js';

const particles = createParticleSystem();
particles.createSplash(x, y, { count: 15 });
particles.createPopup(x, y, score, { flips: 2 });
particles.update();
```

## Code Savings

| Original | Refactored | Savings |
|----------|------------|---------|
| 645 lines (Sonic) | ~280 lines | 57% |
| 604 lines (SSJ) | ~320 lines | 47% |
| 438 lines (Silver) | ~250 lines | 43% |

## Migration

See `sonic/game-refactored.js` for a complete migration example.

### Key differences:
1. Import shared modules instead of duplicating code
2. Use hooks for game-specific behavior
3. Let the engine handle common tasks (input, physics, UI)
4. Focus only on what's unique to your game mode
