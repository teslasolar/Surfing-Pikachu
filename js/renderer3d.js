// 3D Renderer using Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Water } from './water.js';
import { createSurfingPikachu, createSplashParticles } from './models.js';
import Config from './config.js';

const Renderer3D = {
    scene: null,
    camera: null,
    renderer: null,
    water: null,
    pikachu: null,
    splashParticles: null,
    clock: null,
    scoreSprites: [],
    clouds: [],

    // Camera settings
    cameraOffset: new THREE.Vector3(0, 8, 15),
    cameraLookAhead: 5,

    init(container) {
        this.clock = new THREE.Clock();

        // Scene
        this.scene = new THREE.Scene();

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(Config.GAME_WIDTH, Config.GAME_HEIGHT);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        container.appendChild(this.renderer.domElement);
        this.renderer.domElement.id = 'game3DCanvas';

        // Camera
        this.camera = new THREE.PerspectiveCamera(60, Config.GAME_WIDTH / Config.GAME_HEIGHT, 0.1, 1000);
        this.camera.position.set(0, 10, 20);

        // Lighting
        this.setupLighting();

        // Environment
        this.setupEnvironment();

        // Water
        this.water = new Water(300, 150, 200);
        this.water.mesh.position.set(0, 0, 0);
        this.scene.add(this.water.mesh);

        // Pikachu
        this.pikachu = createSurfingPikachu();
        this.pikachu.position.set(0, 2, 0);
        this.scene.add(this.pikachu);

        // Splash particles
        this.splashParticles = createSplashParticles(100);
        this.scene.add(this.splashParticles);

        return this;
    },

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x87ceeb, 0.6);
        this.scene.add(ambient);

        // Sun light
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(50, 100, 30);
        sun.castShadow = false;
        this.scene.add(sun);

        // Fill light
        const fill = new THREE.DirectionalLight(0x87ceeb, 0.4);
        fill.position.set(-30, 20, -20);
        this.scene.add(fill);

        // Rim light for Pikachu
        const rim = new THREE.DirectionalLight(0xffd700, 0.3);
        rim.position.set(0, 5, -20);
        this.scene.add(rim);
    },

    setupEnvironment() {
        // Sky gradient (large sphere)
        const skyGeo = new THREE.SphereGeometry(400, 32, 32);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0x87ceeb) },
                offset: { value: 20 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);

        // Sun (billboard sprite)
        const sunGeo = new THREE.SphereGeometry(15, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.position.set(100, 80, -150);
        this.scene.add(sunMesh);

        // Sun glow
        const glowGeo = new THREE.SphereGeometry(25, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffdd44,
            transparent: true,
            opacity: 0.3
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.copy(sunMesh.position);
        this.scene.add(glowMesh);

        // Clouds
        this.createClouds();

        // Shore (distant)
        const shoreGeo = new THREE.PlaneGeometry(100, 50);
        const shoreMat = new THREE.MeshToonMaterial({ color: 0xf4a460 });
        const shore = new THREE.Mesh(shoreGeo, shoreMat);
        shore.rotation.x = -Math.PI / 2;
        shore.position.set(150, 0.1, 0);
        this.scene.add(shore);

        // Palm tree
        this.createPalmTree(140, 5);
    },

    createClouds() {
        const cloudMat = new THREE.MeshToonMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        for (let i = 0; i < 8; i++) {
            const cloudGroup = new THREE.Group();

            // Random cluster of spheres
            const numPuffs = 3 + Math.floor(Math.random() * 4);
            for (let j = 0; j < numPuffs; j++) {
                const size = 3 + Math.random() * 5;
                const puffGeo = new THREE.SphereGeometry(size, 8, 8);
                const puff = new THREE.Mesh(puffGeo, cloudMat);
                puff.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 5
                );
                cloudGroup.add(puff);
            }

            cloudGroup.position.set(
                (Math.random() - 0.5) * 200,
                40 + Math.random() * 30,
                -50 - Math.random() * 100
            );

            cloudGroup.userData.speed = 0.02 + Math.random() * 0.03;
            this.clouds.push(cloudGroup);
            this.scene.add(cloudGroup);
        }
    },

    createPalmTree(x, z) {
        const group = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 8, 8);
        const trunkMat = new THREE.MeshToonMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 4;
        group.add(trunk);

        // Leaves
        const leafMat = new THREE.MeshToonMaterial({ color: 0x228b22, side: THREE.DoubleSide });

        for (let i = 0; i < 7; i++) {
            const leafGeo = new THREE.PlaneGeometry(6, 1.5);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = 8;
            leaf.rotation.y = (i / 7) * Math.PI * 2;
            leaf.rotation.x = 0.5;
            leaf.rotation.z = 0.3;
            group.add(leaf);
        }

        group.position.set(x, 0, z);
        this.scene.add(group);
    },

    // Update pikachu position and rotation
    updatePikachu(x, y, rotation, distance) {
        if (!this.pikachu) return;

        // Convert 2D coords to 3D
        const worldX = (x - Config.GAME_WIDTH / 2) * 0.1;
        const worldY = y * 0.05 + 2;
        const worldZ = 0;

        this.pikachu.position.set(worldX, worldY, worldZ);
        this.pikachu.rotation.z = -rotation;

        // Slight forward tilt when moving
        this.pikachu.rotation.x = 0.1;

        // Update camera to follow
        const targetCamPos = new THREE.Vector3(
            worldX + this.cameraOffset.x,
            this.cameraOffset.y,
            this.cameraOffset.z
        );
        this.camera.position.lerp(targetCamPos, 0.05);
        this.camera.lookAt(worldX + this.cameraLookAhead, worldY, worldZ);

        // Move water with distance
        this.water.mesh.position.x = -distance * 0.05;
    },

    // Add ripple effect at pikachu position
    addRipple(intensity = 1.0) {
        if (!this.water) return;

        const time = this.clock.getElapsedTime();
        const x = this.pikachu.position.x;
        const z = this.pikachu.position.z;

        this.water.addRipple(x, z, intensity, time);
    },

    // Create splash effect
    createSplash(intensity = 1) {
        this.addRipple(intensity);

        // Activate particle burst
        if (this.splashParticles) {
            const positions = this.splashParticles.geometry.attributes.position.array;
            const count = positions.length / 3;

            for (let i = 0; i < count; i++) {
                positions[i * 3] = this.pikachu.position.x + (Math.random() - 0.5) * 2;
                positions[i * 3 + 1] = this.pikachu.position.y;
                positions[i * 3 + 2] = this.pikachu.position.z + (Math.random() - 0.5) * 2;
            }

            this.splashParticles.geometry.attributes.position.needsUpdate = true;
            this.splashParticles.userData.active = true;
            this.splashParticles.userData.startTime = this.clock.getElapsedTime();
        }
    },

    // Create score popup (3D text sprite)
    createScorePopup(score, flips) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffcb05';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${score}`, 128, 50);

        if (flips) {
            ctx.font = '24px Arial';
            ctx.fillText(`${flips} FLIP${flips > 1 ? 'S' : ''}!`, 128, 90);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(this.pikachu.position);
        sprite.position.y += 3;
        sprite.scale.set(4, 2, 1);
        sprite.userData.startTime = this.clock.getElapsedTime();
        sprite.userData.startY = sprite.position.y;

        this.scene.add(sprite);
        this.scoreSprites.push(sprite);
    },

    // Update particles and effects
    updateEffects() {
        const time = this.clock.getElapsedTime();

        // Update splash particles
        if (this.splashParticles?.userData.active) {
            const positions = this.splashParticles.geometry.attributes.position.array;
            const age = time - this.splashParticles.userData.startTime;

            if (age > 1.5) {
                this.splashParticles.userData.active = false;
            } else {
                for (let i = 0; i < positions.length / 3; i++) {
                    positions[i * 3 + 1] += 0.1 - age * 0.15; // Gravity
                    positions[i * 3] += (Math.random() - 0.5) * 0.1;
                }
                this.splashParticles.geometry.attributes.position.needsUpdate = true;
                this.splashParticles.material.opacity = 1 - age / 1.5;
            }
        }

        // Update score sprites
        for (let i = this.scoreSprites.length - 1; i >= 0; i--) {
            const sprite = this.scoreSprites[i];
            const age = time - sprite.userData.startTime;

            if (age > 2) {
                this.scene.remove(sprite);
                this.scoreSprites.splice(i, 1);
            } else {
                sprite.position.y = sprite.userData.startY + age * 2;
                sprite.material.opacity = 1 - age / 2;
            }
        }

        // Animate clouds
        for (const cloud of this.clouds) {
            cloud.position.x -= cloud.userData.speed;
            if (cloud.position.x < -150) {
                cloud.position.x = 150;
            }
        }
    },

    // Main render
    render(distance) {
        if (!this.renderer) return;

        const time = this.clock.getElapsedTime();

        // Update water
        this.water.update(time, 1.0);

        // Update effects
        this.updateEffects();

        // Render
        this.renderer.render(this.scene, this.camera);
    },

    // Get wave height at position (for game logic)
    getWaveHeightAt(x, distance) {
        if (!this.water) return 0;
        const time = this.clock?.getElapsedTime() || 0;
        const worldX = (x - Config.GAME_WIDTH / 2) * 0.1 - distance * 0.05;
        return this.water.getHeightAt(worldX, 0, time) * 10;
    },

    // Show/hide
    show() {
        if (this.renderer?.domElement) {
            this.renderer.domElement.style.display = 'block';
        }
    },

    hide() {
        if (this.renderer?.domElement) {
            this.renderer.domElement.style.display = 'none';
        }
    },

    // Cleanup
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
};

export default Renderer3D;
