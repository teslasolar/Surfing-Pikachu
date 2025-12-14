// World - Manages chunks and world generation
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from './chunk.js';
import Terrain from './terrain.js';

class World {
    constructor(scene, seed) {
        this.scene = scene;
        this.terrain = new Terrain(seed);
        this.chunks = new Map();
        this.renderDistance = 4; // Chunks in each direction
        this.loadQueue = [];
        this.maxChunksPerFrame = 2;
    }

    // Get chunk key from chunk coordinates
    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    // Get chunk at chunk coordinates
    getChunk(chunkX, chunkZ) {
        return this.chunks.get(this.getChunkKey(chunkX, chunkZ));
    }

    // Convert world position to chunk coordinates
    worldToChunk(x, z) {
        return {
            chunkX: Math.floor(x / CHUNK_SIZE),
            chunkZ: Math.floor(z / CHUNK_SIZE)
        };
    }

    // Get block at world coordinates
    getBlock(x, y, z) {
        const { chunkX, chunkZ } = this.worldToChunk(x, z);
        const chunk = this.getChunk(chunkX, chunkZ);

        if (!chunk) return 0;

        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        return chunk.getBlock(localX, Math.floor(y), localZ);
    }

    // Get terrain height at world position
    getHeightAt(x, z) {
        return this.terrain.getHeight(x, z);
    }

    // Update chunks based on player position
    update(playerX, playerZ) {
        const { chunkX: playerChunkX, chunkZ: playerChunkZ } = this.worldToChunk(playerX, playerZ);

        // Find chunks that need to be loaded
        const neededChunks = new Set();

        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const cx = playerChunkX + dx;
                const cz = playerChunkZ + dz;
                const key = this.getChunkKey(cx, cz);
                neededChunks.add(key);

                // Queue chunk for loading if not loaded
                if (!this.chunks.has(key) && !this.loadQueue.find(q => q.key === key)) {
                    this.loadQueue.push({ key, chunkX: cx, chunkZ: cz, dist: dx*dx + dz*dz });
                }
            }
        }

        // Sort load queue by distance to player
        this.loadQueue.sort((a, b) => a.dist - b.dist);

        // Load chunks from queue
        let loaded = 0;
        while (this.loadQueue.length > 0 && loaded < this.maxChunksPerFrame) {
            const { key, chunkX, chunkZ } = this.loadQueue.shift();

            if (!this.chunks.has(key)) {
                const chunk = new Chunk(chunkX, chunkZ, this.terrain);
                chunk.buildMesh();

                if (chunk.mesh) {
                    this.scene.add(chunk.mesh);
                }

                this.chunks.set(key, chunk);
                loaded++;
            }
        }

        // Unload distant chunks
        for (const [key, chunk] of this.chunks) {
            if (!neededChunks.has(key)) {
                if (chunk.mesh) {
                    this.scene.remove(chunk.mesh);
                }
                chunk.dispose();
                this.chunks.delete(key);
            }
        }

        // Update dirty chunks
        for (const chunk of this.chunks.values()) {
            if (chunk.needsUpdate) {
                chunk.buildMesh();
                if (chunk.mesh && !chunk.mesh.parent) {
                    this.scene.add(chunk.mesh);
                }
            }
        }
    }

    // Dispose all chunks
    dispose() {
        for (const chunk of this.chunks.values()) {
            if (chunk.mesh) {
                this.scene.remove(chunk.mesh);
            }
            chunk.dispose();
        }
        this.chunks.clear();
    }
}

export default World;
