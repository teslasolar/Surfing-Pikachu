// Voxel World Game - Main module
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import World from './world.js';
import Player from './player.js';
import Characters from '../characters/index.js';

const VoxelGame = {
    scene: null,
    camera: null,
    renderer: null,
    world: null,
    player: null,
    clock: null,

    isRunning: false,
    isPointerLocked: false,

    // UI elements
    els: {},

    async init() {
        // Cache DOM elements
        this.els = {
            container: document.getElementById('gameContainer'),
            canvas: document.getElementById('voxelCanvas'),
            hud: document.getElementById('hud'),
            coords: document.getElementById('coords'),
            charName: document.getElementById('charName'),
            charPrev: document.getElementById('charPrev'),
            charNext: document.getElementById('charNext'),
            startOverlay: document.getElementById('startOverlay'),
            startBtn: document.getElementById('startBtn'),
            instructions: document.getElementById('instructions')
        };

        // Set up Three.js
        this.setupRenderer();
        this.setupScene();
        this.setupLighting();

        // Create world with random seed
        const seed = Date.now();
        this.world = new World(this.scene, seed);

        // Create player
        this.player = new Player(this.world);
        const playerMesh = this.player.createMesh();
        this.scene.add(playerMesh);

        // Set spawn position
        setTimeout(() => {
            this.player.position.copy(this.player.getSpawnPosition());
        }, 100);

        // Set up controls
        this.setupControls();

        // Update character display
        this.updateCharacterUI();

        // Start game loop
        this.clock = new THREE.Clock();
        this.loop();
    },

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.els.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x87CEEB); // Sky blue

        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },

    setupScene() {
        this.scene = new THREE.Scene();

        // Fog for distance fade
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
    },

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // Directional light (sun)
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(100, 100, 50);
        this.scene.add(sun);

        // Hemisphere light for sky/ground color
        const hemi = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.4);
        this.scene.add(hemi);
    },

    setupControls() {
        // Character selection
        if (this.els.charPrev) {
            this.els.charPrev.addEventListener('click', () => {
                Characters.prev();
                this.updateCharacterUI();
                this.player.createMesh();
                if (!this.player.mesh.parent) {
                    this.scene.add(this.player.mesh);
                }
            });
        }

        if (this.els.charNext) {
            this.els.charNext.addEventListener('click', () => {
                Characters.next();
                this.updateCharacterUI();
                this.player.createMesh();
                if (!this.player.mesh.parent) {
                    this.scene.add(this.player.mesh);
                }
            });
        }

        // Start button - lock pointer
        if (this.els.startBtn) {
            this.els.startBtn.addEventListener('click', () => {
                this.els.canvas.requestPointerLock();
            });
        }

        // Click to lock pointer
        this.els.canvas.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.els.canvas.requestPointerLock();
            }
        });

        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.els.canvas;
            this.isRunning = this.isPointerLocked;

            if (this.els.startOverlay) {
                this.els.startOverlay.style.display = this.isPointerLocked ? 'none' : 'flex';
            }
            if (this.els.hud) {
                this.els.hud.style.display = this.isPointerLocked ? 'block' : 'none';
            }
        });

        // Mouse movement for camera
        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.player.onMouseMove(e.movementX, e.movementY);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                document.exitPointerLock();
            }

            // Character switch with [ ]
            if (!this.isPointerLocked) {
                if (e.key === '[') {
                    Characters.prev();
                    this.updateCharacterUI();
                    this.player.createMesh();
                }
                if (e.key === ']') {
                    Characters.next();
                    this.updateCharacterUI();
                    this.player.createMesh();
                }
            }
        });
    },

    updateCharacterUI() {
        if (this.els.charName) {
            this.els.charName.textContent = Characters.current.name;
        }
    },

    updateHUD() {
        if (this.els.coords) {
            const p = this.player.position;
            const mode = this.player.isFlying ? ' [FLYING]' : '';
            this.els.coords.textContent = `X: ${p.x.toFixed(1)} Y: ${p.y.toFixed(1)} Z: ${p.z.toFixed(1)}${mode}`;
        }
    },

    update() {
        if (!this.isRunning) return;

        // Update player
        this.player.update();

        // Update world chunks around player
        this.world.update(this.player.position.x, this.player.position.z);

        // Update camera to follow player (third person)
        const cameraDistance = 8;
        const cameraHeight = 4;

        const targetX = this.player.position.x + Math.sin(this.player.rotation) * cameraDistance;
        const targetZ = this.player.position.z + Math.cos(this.player.rotation) * cameraDistance;
        const targetY = this.player.position.y + cameraHeight - this.player.pitch * 3;

        this.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);

        // Look at player
        const lookTarget = this.player.position.clone();
        lookTarget.y += 1;
        this.camera.lookAt(lookTarget);

        // Update HUD
        this.updateHUD();
    },

    render() {
        this.renderer.render(this.scene, this.camera);
    },

    loop() {
        requestAnimationFrame(() => this.loop());

        this.update();
        this.render();
    }
};

// Start when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VoxelGame.init());
} else {
    VoxelGame.init();
}

export default VoxelGame;
