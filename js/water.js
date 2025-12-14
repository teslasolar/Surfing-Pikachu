// Dynamic Water with Ripple Effects using Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Custom water shader with ripple dynamics
const WaterShader = {
    uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 1.0 },
        uWaveFrequency: { value: 0.5 },
        uRipples: { value: [] }, // Array of vec4(x, z, time, intensity)
        uRippleCount: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3) },
        uWaterColor: { value: new THREE.Color(0x1e90ff) },
        uFoamColor: { value: new THREE.Color(0xffffff) },
        uSkyColor: { value: new THREE.Color(0x87ceeb) }
    },

    vertexShader: `
        uniform float uTime;
        uniform float uWaveHeight;
        uniform float uWaveFrequency;
        uniform vec4 uRipples[10];
        uniform int uRippleCount;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vWaveHeight;
        varying float vFoam;

        // Simplex noise for natural waves
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;

            i = mod289(i);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);

            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);

            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        float getWaveHeight(vec3 pos) {
            float height = 0.0;

            // Main ocean waves
            height += snoise(vec3(pos.x * 0.02 + uTime * 0.3, pos.z * 0.02, uTime * 0.1)) * uWaveHeight * 2.0;
            height += snoise(vec3(pos.x * 0.05 + uTime * 0.2, pos.z * 0.03, uTime * 0.15)) * uWaveHeight;
            height += snoise(vec3(pos.x * 0.1 + uTime * 0.4, pos.z * 0.08, uTime * 0.2)) * uWaveHeight * 0.5;

            // Surfable wave peaks
            float waveX = pos.x + uTime * 30.0;
            float wavePeak = sin(waveX * 0.03) * 3.0;
            wavePeak += sin(waveX * 0.05 + 1.0) * 2.0;
            wavePeak = max(0.0, wavePeak);
            height += wavePeak * uWaveHeight;

            return height;
        }

        float getRippleHeight(vec3 pos) {
            float rippleHeight = 0.0;

            for (int i = 0; i < 10; i++) {
                if (i >= uRippleCount) break;

                vec4 ripple = uRipples[i];
                float dist = distance(pos.xz, ripple.xy);
                float age = uTime - ripple.z;
                float speed = 15.0;
                float waveRadius = age * speed;
                float intensity = ripple.w * exp(-age * 2.0); // Decay over time

                // Ring wave
                float ringWidth = 2.0;
                float ring = 1.0 - smoothstep(0.0, ringWidth, abs(dist - waveRadius));
                rippleHeight += sin(dist * 2.0 - age * 10.0) * ring * intensity;
            }

            return rippleHeight;
        }

        void main() {
            vec3 pos = position;

            // Calculate wave height
            float waveH = getWaveHeight(pos);
            float rippleH = getRippleHeight(pos);
            pos.y += waveH + rippleH;

            vWaveHeight = waveH + rippleH;
            vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

            // Calculate normal from nearby heights
            float delta = 0.5;
            float hL = getWaveHeight(position + vec3(-delta, 0, 0)) + getRippleHeight(position + vec3(-delta, 0, 0));
            float hR = getWaveHeight(position + vec3(delta, 0, 0)) + getRippleHeight(position + vec3(delta, 0, 0));
            float hD = getWaveHeight(position + vec3(0, 0, -delta)) + getRippleHeight(position + vec3(0, 0, -delta));
            float hU = getWaveHeight(position + vec3(0, 0, delta)) + getRippleHeight(position + vec3(0, 0, delta));

            vNormal = normalize(vec3(hL - hR, delta * 2.0, hD - hU));

            // Foam on wave peaks
            vFoam = smoothstep(2.0, 4.0, vWaveHeight);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,

    fragmentShader: `
        uniform vec3 uSunDirection;
        uniform vec3 uWaterColor;
        uniform vec3 uFoamColor;
        uniform vec3 uSkyColor;
        uniform float uTime;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vWaveHeight;
        varying float vFoam;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            vec3 sunDir = normalize(uSunDirection);

            // Fresnel effect
            float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

            // Specular highlight
            vec3 halfDir = normalize(sunDir + viewDir);
            float spec = pow(max(dot(normal, halfDir), 0.0), 128.0);

            // Subsurface scattering approximation
            float scatter = pow(max(dot(viewDir, -sunDir), 0.0), 2.0) * 0.3;

            // Base water color with depth variation
            vec3 deepColor = uWaterColor * 0.4;
            vec3 shallowColor = uWaterColor * 1.2;
            float depthFactor = smoothstep(-2.0, 3.0, vWaveHeight);
            vec3 waterCol = mix(deepColor, shallowColor, depthFactor);

            // Add sky reflection
            vec3 reflectDir = reflect(-viewDir, normal);
            vec3 skyReflect = uSkyColor * max(reflectDir.y, 0.0);

            // Combine
            vec3 color = waterCol;
            color = mix(color, skyReflect, fresnel * 0.6);
            color += vec3(1.0, 0.95, 0.8) * spec * 2.0;
            color += uWaterColor * scatter;

            // Add foam
            color = mix(color, uFoamColor, vFoam * 0.8);

            // Slight animation on foam
            float foamNoise = fract(sin(dot(vWorldPos.xz * 0.5 + uTime, vec2(12.9898, 78.233))) * 43758.5453);
            color += uFoamColor * vFoam * foamNoise * 0.2;

            gl_FragColor = vec4(color, 0.95);
        }
    `
};

// Water class
class Water {
    constructor(width = 200, depth = 100, segments = 128) {
        this.ripples = [];
        this.maxRipples = 10;

        // Create geometry
        this.geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
        this.geometry.rotateX(-Math.PI / 2);

        // Create material
        this.material = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(WaterShader.uniforms),
            vertexShader: WaterShader.vertexShader,
            fragmentShader: WaterShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        // Initialize ripples uniform
        this.material.uniforms.uRipples.value = new Array(10).fill(null).map(() =>
            new THREE.Vector4(0, 0, -100, 0)
        );

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.y = 0;
    }

    // Add ripple at world position
    addRipple(x, z, intensity = 1.0, time) {
        const ripple = { x, z, time, intensity };
        this.ripples.push(ripple);

        // Remove old ripples
        if (this.ripples.length > this.maxRipples) {
            this.ripples.shift();
        }

        this.updateRippleUniforms();
    }

    updateRippleUniforms() {
        const uniforms = this.material.uniforms;
        uniforms.uRippleCount.value = this.ripples.length;

        for (let i = 0; i < this.maxRipples; i++) {
            if (i < this.ripples.length) {
                const r = this.ripples[i];
                uniforms.uRipples.value[i].set(r.x, r.z, r.time, r.intensity);
            }
        }
    }

    // Clean up old ripples
    cleanupRipples(currentTime, maxAge = 3.0) {
        this.ripples = this.ripples.filter(r => currentTime - r.time < maxAge);
        this.updateRippleUniforms();
    }

    update(time, waveHeight = 1.0) {
        this.material.uniforms.uTime.value = time;
        this.material.uniforms.uWaveHeight.value = waveHeight;

        // Cleanup old ripples every update
        this.cleanupRipples(time);
    }

    // Get wave height at position (approximation for game logic)
    getHeightAt(x, z, time) {
        // Simplified wave calculation matching shader
        const t = time;
        let height = 0;

        // Main waves
        height += Math.sin(x * 0.02 + t * 0.3) * 2.0;
        height += Math.sin(x * 0.05 + z * 0.03 + t * 0.2) * 1.0;

        // Surfable peaks
        const waveX = x + t * 30.0;
        let peak = Math.sin(waveX * 0.03) * 3.0;
        peak += Math.sin(waveX * 0.05 + 1.0) * 2.0;
        height += Math.max(0, peak);

        return height;
    }
}

export { Water, WaterShader };
export default Water;
