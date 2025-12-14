// Pikachu's Beach - Surfing Pikachu Game
// A browser recreation of the Pokemon Yellow minigame

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GAME_WIDTH = 480;
const GAME_HEIGHT = 320;
const WATER_LEVEL = 230;
const GRAVITY = 0.4;
const MAX_HP = 6000;
const COURSE_LENGTH = 10000;

// Game state
let gameState = 'title'; // title, playing, gameOver
let hp = MAX_HP;
let radness = 0;
let distance = 0;
let gameSpeed = 2;

// Pikachu state
let pikachu = {
    x: 100,
    y: WATER_LEVEL - 30,
    vy: 0,
    rotation: 0,
    rotationSpeed: 0,
    isAirborne: false,
    flipCount: 0,
    flipDirection: 0, // Track last flip direction for bonus
    totalRotation: 0,
    lastFlipDir: 0
};

// Waves
let waves = [];
let waveOffset = 0;

// Visual effects
let particles = [];
let scorePopups = [];

// Input state
let keys = {
    left: false,
    right: false,
    up: false
};

// Audio context for sound effects
let audioCtx = null;

// Initialize audio
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Simple sound effect generator
function playSound(type) {
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch(type) {
        case 'jump':
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;
        case 'flip':
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
        case 'splash':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        case 'land':
            oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.12);
            break;
        case 'score':
            oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;
        case 'win':
            oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(659, audioCtx.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(784, audioCtx.currentTime + 0.3);
            oscillator.frequency.setValueAtTime(1047, audioCtx.currentTime + 0.45);
            gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.6);
            break;
    }
}

// Generate waves
function generateWaves() {
    waves = [];
    let x = 200;
    while (x < COURSE_LENGTH + 500) {
        // Random wave size (small, medium, large)
        const sizeRoll = Math.random();
        let size;
        if (sizeRoll < 0.4) size = 'small';
        else if (sizeRoll < 0.75) size = 'medium';
        else size = 'large';

        const wave = {
            x: x,
            size: size,
            height: size === 'small' ? 40 : size === 'medium' ? 70 : 100,
            width: size === 'small' ? 80 : size === 'medium' ? 120 : 160
        };
        waves.push(wave);

        // Gap between waves
        x += wave.width + 100 + Math.random() * 150;
    }
}

// Get wave height at a given x position
function getWaveHeightAt(x) {
    let baseHeight = 0;

    for (const wave of waves) {
        const relX = x - wave.x + distance;
        if (relX >= 0 && relX <= wave.width) {
            // Sine curve for wave shape
            const progress = relX / wave.width;
            const waveHeight = Math.sin(progress * Math.PI) * wave.height;
            baseHeight = Math.max(baseHeight, waveHeight);
        }
    }

    // Add subtle ocean waves
    baseHeight += Math.sin((x + distance) * 0.05) * 5;
    baseHeight += Math.sin((x + distance) * 0.02 + 1) * 3;

    return baseHeight;
}

// Draw Pikachu on surfboard
function drawPikachu(x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Surfboard
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5D3A1A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Surfboard stripe
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-20, 10, 40, 4);

    // Pikachu body
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, -5, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pikachu head
    ctx.beginPath();
    ctx.ellipse(0, -25, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(-8, -35);
    ctx.lineTo(-12, -55);
    ctx.lineTo(-3, -40);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(8, -35);
    ctx.lineTo(12, -55);
    ctx.lineTo(3, -40);
    ctx.closePath();
    ctx.fill();

    // Ear tips (black)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(-10, -48);
    ctx.lineTo(-12, -55);
    ctx.lineTo(-7, -50);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, -48);
    ctx.lineTo(12, -55);
    ctx.lineTo(7, -50);
    ctx.closePath();
    ctx.fill();

    // Red cheeks
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(-10, -22, 4, 0, Math.PI * 2);
    ctx.arc(10, -22, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(-5, -28, 3, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(5, -28, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-4, -29, 1.5, 0, Math.PI * 2);
    ctx.arc(6, -29, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, -24, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (happy)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -20, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Tail (lightning bolt)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(10, 5);
    ctx.lineTo(25, -5);
    ctx.lineTo(20, 5);
    ctx.lineTo(35, 0);
    ctx.lineTo(22, 12);
    ctx.lineTo(26, 8);
    ctx.lineTo(12, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

// Draw water and waves
function drawWater() {
    // Deep water background
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(0, WATER_LEVEL, GAME_WIDTH, GAME_HEIGHT - WATER_LEVEL);

    // Draw wave surfaces
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT);

    for (let x = 0; x <= GAME_WIDTH; x += 5) {
        const waveHeight = getWaveHeightAt(x);
        ctx.lineTo(x, WATER_LEVEL - waveHeight);
    }

    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Draw wave highlights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= GAME_WIDTH; x += 5) {
        const waveHeight = getWaveHeightAt(x);
        if (x === 0) {
            ctx.moveTo(x, WATER_LEVEL - waveHeight - 3);
        } else {
            ctx.lineTo(x, WATER_LEVEL - waveHeight - 3);
        }
    }
    ctx.stroke();

    // Foam effects
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (const wave of waves) {
        const screenX = wave.x - distance;
        if (screenX > -wave.width && screenX < GAME_WIDTH + wave.width) {
            const foamY = WATER_LEVEL - wave.height * 0.7;
            ctx.beginPath();
            ctx.arc(screenX + wave.width * 0.3, foamY + 10, 8, 0, Math.PI * 2);
            ctx.arc(screenX + wave.width * 0.5, foamY + 5, 10, 0, Math.PI * 2);
            ctx.arc(screenX + wave.width * 0.7, foamY + 12, 7, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Draw sky and background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, WATER_LEVEL);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#B0E0E6');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, WATER_LEVEL);

    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(400, 50, 30, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(400, 50, 45, 0, Math.PI * 2);
    ctx.fill();

    // Clouds (parallax)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(100 - (distance * 0.1) % 600, 40, 1);
    drawCloud(300 - (distance * 0.15) % 600, 70, 0.8);
    drawCloud(450 - (distance * 0.12) % 600, 30, 1.2);

    // Shore indicator (appears near end)
    if (distance > COURSE_LENGTH - 2000) {
        const shoreProgress = (distance - (COURSE_LENGTH - 2000)) / 2000;
        ctx.fillStyle = '#F4A460';
        ctx.beginPath();
        ctx.moveTo(GAME_WIDTH - 50 * shoreProgress, WATER_LEVEL);
        ctx.lineTo(GAME_WIDTH, WATER_LEVEL - 50);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
        ctx.lineTo(GAME_WIDTH - 100 * shoreProgress, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Palm tree on shore
        if (shoreProgress > 0.5) {
            const treeX = GAME_WIDTH - 30;
            const treeY = WATER_LEVEL - 60;
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(treeX - 5, treeY, 10, 60);
            ctx.fillStyle = '#228B22';
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.translate(treeX, treeY);
                ctx.rotate((i * Math.PI * 2 / 5) - Math.PI / 2);
                ctx.beginPath();
                ctx.ellipse(20, 0, 25, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.arc(25, -5, 25, 0, Math.PI * 2);
    ctx.arc(50, 0, 20, 0, Math.PI * 2);
    ctx.arc(25, 10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Draw particles (splash effects)
function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 30})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create splash particles
function createSplash(x, y, intensity) {
    for (let i = 0; i < intensity * 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * intensity * 3,
            vy: -Math.random() * intensity * 4,
            size: 2 + Math.random() * 3,
            life: 20 + Math.random() * 20
        });
    }
}

// Draw score popups
function drawScorePopups() {
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        const popup = scorePopups[i];
        popup.y -= 1.5;
        popup.life--;

        if (popup.life <= 0) {
            scorePopups.splice(i, 1);
            continue;
        }

        ctx.fillStyle = `rgba(255, 203, 5, ${popup.life / 60})`;
        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${popup.score}`, popup.x, popup.y);

        // Draw flip count
        if (popup.flips) {
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText(`${popup.flips} FLIP${popup.flips > 1 ? 'S' : ''}!`, popup.x, popup.y + 15);
        }
    }
}

// Create score popup
function createScorePopup(x, y, score, flips) {
    scorePopups.push({
        x: x,
        y: y,
        score: score,
        flips: flips,
        life: 60
    });
}

// Update UI elements
function updateUI() {
    const progressPercent = Math.min(100, (distance / COURSE_LENGTH) * 100);
    document.getElementById('progressFill').style.width = `${progressPercent}%`;

    const hpPercent = (hp / MAX_HP) * 100;
    document.getElementById('hpFill').style.width = `${hpPercent}%`;
    document.getElementById('hpValue').textContent = Math.max(0, Math.floor(hp));

    document.getElementById('radnessValue').textContent = radness;
}

// Calculate score for flips
function calculateFlipScore(flips, hasOppositeFlips) {
    switch(flips) {
        case 1: return 50;
        case 2: return hasOppositeFlips ? 180 : 150;
        case 3: return 500;
        default: return flips > 3 ? 500 + (flips - 3) * 100 : 0;
    }
}

// Check landing
function checkLanding() {
    const waveHeight = getWaveHeightAt(pikachu.x);
    const waterY = WATER_LEVEL - waveHeight;

    if (pikachu.y >= waterY - 15 && pikachu.vy > 0) {
        // Normalize rotation to check landing angle
        let angle = pikachu.rotation % (Math.PI * 2);
        if (angle < 0) angle += Math.PI * 2;

        // Check if roughly upright (within ~45 degrees)
        const isUpright = (angle < Math.PI / 4) || (angle > Math.PI * 7 / 4) ||
                         (angle > Math.PI * 3 / 4 && angle < Math.PI * 5 / 4);

        // Count full flips
        const fullFlips = Math.floor(Math.abs(pikachu.totalRotation) / (Math.PI * 2));

        if (isUpright && fullFlips > 0) {
            // Good landing with flips!
            const hasOpposite = pikachu.flipDirection === 0; // Changed direction during flip
            const score = calculateFlipScore(fullFlips, hasOpposite);
            radness += score;
            createScorePopup(pikachu.x, pikachu.y - 50, score, fullFlips);
            createSplash(pikachu.x, waterY, 2);
            playSound('score');
        } else if (!isUpright && pikachu.isAirborne) {
            // Crash! Bad landing
            hp -= 500;
            createSplash(pikachu.x, waterY, 4);
            playSound('splash');

            // Reset pikachu rotation
            pikachu.rotation = 0;
        } else {
            // Normal landing
            createSplash(pikachu.x, waterY, 1);
            playSound('land');
        }

        // Reset airborne state
        pikachu.y = waterY - 15;
        pikachu.vy = 0;
        pikachu.isAirborne = false;
        pikachu.rotation = 0;
        pikachu.rotationSpeed = 0;
        pikachu.flipCount = 0;
        pikachu.totalRotation = 0;
        pikachu.flipDirection = 0;
    }
}

// Check if on a wave (for jumping)
function isOnWave() {
    const waveHeight = getWaveHeightAt(pikachu.x);
    return waveHeight > 15;
}

// Get wave launch power
function getWaveLaunchPower() {
    let maxHeight = 0;
    for (const wave of waves) {
        const relX = pikachu.x - wave.x + distance;
        if (relX >= 0 && relX <= wave.width) {
            if (wave.height > maxHeight) {
                maxHeight = wave.height;
            }
        }
    }
    return maxHeight;
}

// Game update
function update() {
    if (gameState !== 'playing') return;

    // Decrease HP (acts as timer)
    hp -= 1;

    // Check game over conditions
    if (hp <= 0) {
        endGame(false);
        return;
    }

    // Check win condition
    if (distance >= COURSE_LENGTH) {
        endGame(true);
        return;
    }

    // Move forward
    distance += gameSpeed;

    // Increase speed slightly over time
    gameSpeed = 2 + (distance / COURSE_LENGTH) * 1.5;

    // Handle jumping
    if (keys.up && !pikachu.isAirborne && isOnWave()) {
        const launchPower = getWaveLaunchPower();
        pikachu.vy = -8 - (launchPower / 15);
        pikachu.isAirborne = true;
        playSound('jump');
    }

    // Handle flipping (only in air)
    if (pikachu.isAirborne) {
        if (keys.left) {
            pikachu.rotationSpeed = Math.max(pikachu.rotationSpeed - 0.02, -0.25);
            if (pikachu.flipDirection !== -1) {
                pikachu.flipDirection = pikachu.lastFlipDir === 1 ? 0 : -1;
            }
            pikachu.lastFlipDir = -1;
            playSound('flip');
        } else if (keys.right) {
            pikachu.rotationSpeed = Math.min(pikachu.rotationSpeed + 0.02, 0.25);
            if (pikachu.flipDirection !== 1) {
                pikachu.flipDirection = pikachu.lastFlipDir === -1 ? 0 : 1;
            }
            pikachu.lastFlipDir = 1;
            playSound('flip');
        }

        pikachu.rotation += pikachu.rotationSpeed;
        pikachu.totalRotation += pikachu.rotationSpeed;
    }

    // Apply gravity
    if (pikachu.isAirborne) {
        pikachu.vy += GRAVITY;
        pikachu.y += pikachu.vy;
    } else {
        // Follow wave surface
        const waveHeight = getWaveHeightAt(pikachu.x);
        const targetY = WATER_LEVEL - waveHeight - 15;
        pikachu.y += (targetY - pikachu.y) * 0.3;

        // Slight rotation to match wave
        const waveHeightAhead = getWaveHeightAt(pikachu.x + 20);
        const waveSlopeAngle = Math.atan2(waveHeight - waveHeightAhead, 20);
        pikachu.rotation = waveSlopeAngle * 0.5;
    }

    // Check landing
    checkLanding();

    // Update UI
    updateUI();
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    drawBackground();
    drawWater();
    drawParticles();
    drawPikachu(pikachu.x, pikachu.y, pikachu.rotation);
    drawScorePopups();

    // Draw flip indicator when spinning
    if (pikachu.isAirborne && Math.abs(pikachu.rotationSpeed) > 0.1) {
        const flips = Math.floor(Math.abs(pikachu.totalRotation) / (Math.PI * 2));
        if (flips > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${flips}x`, pikachu.x, pikachu.y - 70);
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// End game
function endGame(won) {
    gameState = 'gameOver';

    const finalHP = won ? Math.floor(hp) : 0;
    const finalScore = radness + finalHP;

    document.getElementById('gameOverTitle').textContent = won ? 'COURSE COMPLETE!' : 'GAME OVER';
    document.getElementById('finalRadness').textContent = radness;
    document.getElementById('finalHP').textContent = finalHP;
    document.getElementById('finalScore').textContent = finalScore;

    document.getElementById('gameOverScreen').style.display = 'flex';

    if (won) {
        playSound('win');
    } else {
        playSound('splash');
    }
}

// Start game
function startGame() {
    initAudio();

    gameState = 'playing';
    hp = MAX_HP;
    radness = 0;
    distance = 0;
    gameSpeed = 2;

    pikachu = {
        x: 100,
        y: WATER_LEVEL - 30,
        vy: 0,
        rotation: 0,
        rotationSpeed: 0,
        isAirborne: false,
        flipCount: 0,
        flipDirection: 0,
        totalRotation: 0,
        lastFlipDir: 0
    };

    particles = [];
    scorePopups = [];

    generateWaves();

    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameUI').style.display = 'flex';

    updateUI();
}

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = true;

    // Prevent scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = false;
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    keys.up = true;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;

    keys.left = deltaX < -20;
    keys.right = deltaX > 20;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.up = false;
    keys.left = false;
    keys.right = false;
}, { passive: false });

// Start game loop
gameLoop();
