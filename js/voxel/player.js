// Player controller for voxel world
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createSurfingCharacter } from '../models.js';
import Characters from '../characters/index.js';

class Player {
    constructor(world) {
        this.world = world;

        // Position and physics
        this.position = new THREE.Vector3(0, 40, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0; // Y rotation
        this.pitch = 0; // Camera pitch

        // Movement settings
        this.moveSpeed = 0.15;
        this.jumpSpeed = 0.3;
        this.gravity = 0.015;
        this.friction = 0.85;
        this.airFriction = 0.98;

        // State
        this.isGrounded = false;
        this.isFlying = false; // Toggle fly mode

        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            down: false
        };

        // Mouse look
        this.mouseSensitivity = 0.002;

        // 3D model
        this.mesh = null;
        this.currentCharacterId = null;

        // Initialize input handlers
        this.initInput();
    }

    // Create player mesh
    createMesh() {
        const characterId = Characters.currentId;

        if (this.mesh && this.currentCharacterId === characterId) {
            return this.mesh;
        }

        // Remove old mesh
        if (this.mesh) {
            this.mesh.parent?.remove(this.mesh);
        }

        // Create new character mesh
        this.mesh = createSurfingCharacter(characterId);
        this.mesh.scale.set(1.5, 1.5, 1.5); // Bigger in voxel world
        this.currentCharacterId = characterId;

        return this.mesh;
    }

    // Initialize input handlers
    initInput() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                e.preventDefault();
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.down = true;
                break;
            case 'KeyF':
                // Toggle fly mode
                this.isFlying = !this.isFlying;
                this.velocity.y = 0;
                break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.down = false;
                break;
        }
    }

    // Handle mouse movement
    onMouseMove(movementX, movementY) {
        this.rotation -= movementX * this.mouseSensitivity;
        this.pitch -= movementY * this.mouseSensitivity;

        // Clamp pitch
        this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
    }

    // Update player position and physics
    update() {
        // Calculate movement direction based on rotation
        const moveDir = new THREE.Vector3();

        if (this.keys.forward) {
            moveDir.x -= Math.sin(this.rotation);
            moveDir.z -= Math.cos(this.rotation);
        }
        if (this.keys.backward) {
            moveDir.x += Math.sin(this.rotation);
            moveDir.z += Math.cos(this.rotation);
        }
        if (this.keys.left) {
            moveDir.x -= Math.cos(this.rotation);
            moveDir.z += Math.sin(this.rotation);
        }
        if (this.keys.right) {
            moveDir.x += Math.cos(this.rotation);
            moveDir.z -= Math.sin(this.rotation);
        }

        // Normalize and apply speed
        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(this.moveSpeed);
        }

        if (this.isFlying) {
            // Fly mode
            this.velocity.x = moveDir.x;
            this.velocity.z = moveDir.z;

            if (this.keys.jump) {
                this.velocity.y = this.moveSpeed;
            } else if (this.keys.down) {
                this.velocity.y = -this.moveSpeed;
            } else {
                this.velocity.y = 0;
            }
        } else {
            // Normal mode with gravity
            this.velocity.x += moveDir.x;
            this.velocity.z += moveDir.z;

            // Jumping
            if (this.keys.jump && this.isGrounded) {
                this.velocity.y = this.jumpSpeed;
                this.isGrounded = false;
            }

            // Gravity
            this.velocity.y -= this.gravity;

            // Friction
            const fric = this.isGrounded ? this.friction : this.airFriction;
            this.velocity.x *= fric;
            this.velocity.z *= fric;
        }

        // Apply velocity with collision detection
        this.moveWithCollision();

        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.position.y -= 1; // Offset so player stands on ground
            this.mesh.rotation.y = this.rotation + Math.PI; // Face movement direction
        }
    }

    // Move with simple collision detection
    moveWithCollision() {
        const playerRadius = 0.4;
        const playerHeight = 2;

        // Check X movement
        const newX = this.position.x + this.velocity.x;
        if (!this.checkCollision(newX, this.position.y, this.position.z, playerRadius, playerHeight)) {
            this.position.x = newX;
        } else {
            this.velocity.x = 0;
        }

        // Check Z movement
        const newZ = this.position.z + this.velocity.z;
        if (!this.checkCollision(this.position.x, this.position.y, newZ, playerRadius, playerHeight)) {
            this.position.z = newZ;
        } else {
            this.velocity.z = 0;
        }

        // Check Y movement
        const newY = this.position.y + this.velocity.y;
        if (!this.checkCollision(this.position.x, newY, this.position.z, playerRadius, playerHeight)) {
            this.position.y = newY;
            this.isGrounded = false;
        } else {
            if (this.velocity.y < 0) {
                this.isGrounded = true;
            }
            this.velocity.y = 0;
        }

        // Keep above void
        if (this.position.y < -10) {
            this.position.y = 50;
            this.velocity.y = 0;
        }
    }

    // Simple AABB collision check
    checkCollision(x, y, z, radius, height) {
        // Check a few points around the player
        const checkPoints = [
            [x - radius, y, z - radius],
            [x + radius, y, z - radius],
            [x - radius, y, z + radius],
            [x + radius, y, z + radius],
            [x, y, z],
            // Head level
            [x, y + height - 0.5, z]
        ];

        for (const [px, py, pz] of checkPoints) {
            const block = this.world.getBlock(Math.floor(px), Math.floor(py), Math.floor(pz));
            if (block !== 0 && block !== 5) { // Not air or water
                return true;
            }
        }

        return false;
    }

    // Get spawn position
    getSpawnPosition() {
        const height = this.world.getHeightAt(0, 0);
        return new THREE.Vector3(0, height + 5, 0);
    }
}

export default Player;
