// Terrain generator using Simplex Noise
import SimplexNoise from './noise.js';

class Terrain {
    constructor(seed = Date.now()) {
        this.seed = seed;
        this.noise = new SimplexNoise(seed);
        this.biomeNoise = new SimplexNoise(seed + 1000);
        this.treeNoise = new SimplexNoise(seed + 2000);

        // Terrain settings
        this.baseHeight = 20;
        this.heightScale = 25;
        this.waterLevel = 18;

        // Biome thresholds
        this.biomeScale = 0.005;
    }

    // Get terrain height at world position
    getHeight(x, z) {
        // Multiple octaves of noise for varied terrain
        const scale1 = 0.01;
        const scale2 = 0.03;
        const scale3 = 0.08;

        let height = this.baseHeight;

        // Large features (hills/valleys)
        height += this.noise.fbm(x * scale1, z * scale1, 4) * this.heightScale;

        // Medium details
        height += this.noise.fbm(x * scale2, z * scale2, 3) * (this.heightScale * 0.3);

        // Small details
        height += this.noise.noise2D(x * scale3, z * scale3) * 3;

        // Biome influence on height
        const biome = this.getBiome(x, z);
        if (biome === 'desert') {
            // Flatter deserts with dunes
            const dunes = this.noise.noise2D(x * 0.05, z * 0.05);
            height = height * 0.6 + this.baseHeight * 0.4 + dunes * 4;
        } else if (biome === 'mountains') {
            // Exaggerate mountains
            height = height * 1.5;
        }

        return Math.max(1, height);
    }

    // Get biome at world position
    getBiome(x, z) {
        const temp = this.biomeNoise.noise2D(x * this.biomeScale, z * this.biomeScale);
        const moisture = this.biomeNoise.noise2D(x * this.biomeScale + 1000, z * this.biomeScale + 1000);

        if (temp > 0.4) {
            return moisture > 0 ? 'forest' : 'desert';
        } else if (temp < -0.4) {
            return 'snow';
        } else {
            return moisture > 0.3 ? 'forest' : 'plains';
        }
    }

    // Check if a tree should be placed
    shouldPlaceTree(x, z) {
        // Use noise for natural distribution
        const treeChance = this.treeNoise.noise2D(x * 0.3, z * 0.3);
        const spacing = this.treeNoise.noise2D(x * 0.1, z * 0.1);

        return treeChance > 0.6 && spacing > 0.3;
    }
}

export default Terrain;
