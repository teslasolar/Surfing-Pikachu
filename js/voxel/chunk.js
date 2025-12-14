// Chunk - A 16x64x16 section of the voxel world
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { BlockTypes, BlockColors, BlockProperties } from './blocks.js';

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 64;

class Chunk {
    constructor(chunkX, chunkZ, terrain) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.terrain = terrain;

        // 3D array of block types
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);

        // Three.js mesh
        this.mesh = null;
        this.needsUpdate = true;

        // Generate terrain for this chunk
        this.generate();
    }

    // Get index in flat array
    getIndex(x, y, z) {
        return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
    }

    // Get block at local coordinates
    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return BlockTypes.AIR;
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    // Set block at local coordinates
    setBlock(x, y, z, type) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return;
        }
        this.blocks[this.getIndex(x, y, z)] = type;
        this.needsUpdate = true;
    }

    // Generate terrain for this chunk
    generate() {
        const worldX = this.chunkX * CHUNK_SIZE;
        const worldZ = this.chunkZ * CHUNK_SIZE;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = worldX + x;
                const wz = worldZ + z;

                // Get terrain height using noise
                const height = this.terrain.getHeight(wx, wz);
                const biome = this.terrain.getBiome(wx, wz);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let blockType = BlockTypes.AIR;

                    if (y < height - 4) {
                        blockType = BlockTypes.STONE;
                    } else if (y < height - 1) {
                        blockType = biome === 'desert' ? BlockTypes.SAND : BlockTypes.DIRT;
                    } else if (y < height) {
                        if (biome === 'desert') {
                            blockType = BlockTypes.SAND;
                        } else if (biome === 'snow') {
                            blockType = BlockTypes.SNOW;
                        } else {
                            blockType = BlockTypes.GRASS;
                        }
                    } else if (y < this.terrain.waterLevel) {
                        blockType = BlockTypes.WATER;
                    }

                    this.setBlock(x, y, z, blockType);
                }

                // Add trees in forest biome
                if (biome === 'forest' && height > this.terrain.waterLevel) {
                    if (this.terrain.shouldPlaceTree(wx, wz)) {
                        this.placeTree(x, Math.floor(height), z);
                    }
                }
            }
        }
    }

    // Place a tree at position
    placeTree(x, y, z) {
        const trunkHeight = 4 + Math.floor(Math.random() * 3);

        // Trunk
        for (let ty = 0; ty < trunkHeight; ty++) {
            this.setBlock(x, y + ty, z, BlockTypes.WOOD);
        }

        // Leaves (sphere-ish shape)
        const leafRadius = 2;
        for (let lx = -leafRadius; lx <= leafRadius; lx++) {
            for (let ly = -1; ly <= leafRadius; ly++) {
                for (let lz = -leafRadius; lz <= leafRadius; lz++) {
                    const dist = Math.sqrt(lx*lx + ly*ly + lz*lz);
                    if (dist <= leafRadius + 0.5) {
                        const px = x + lx;
                        const py = y + trunkHeight + ly;
                        const pz = z + lz;
                        if (this.getBlock(px, py, pz) === BlockTypes.AIR) {
                            this.setBlock(px, py, pz, BlockTypes.LEAVES);
                        }
                    }
                }
            }
        }
    }

    // Build mesh from blocks (greedy meshing for performance)
    buildMesh() {
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

        let vertexCount = 0;

        // Face directions
        const faces = [
            { dir: [0, 1, 0], corners: [[0,1,0], [1,1,0], [1,1,1], [0,1,1]], normal: [0,1,0] },  // Top
            { dir: [0, -1, 0], corners: [[0,0,1], [1,0,1], [1,0,0], [0,0,0]], normal: [0,-1,0] }, // Bottom
            { dir: [1, 0, 0], corners: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]], normal: [1,0,0] },  // Right
            { dir: [-1, 0, 0], corners: [[0,0,1], [0,0,0], [0,1,0], [0,1,1]], normal: [-1,0,0] }, // Left
            { dir: [0, 0, 1], corners: [[0,0,1], [0,1,1], [1,1,1], [1,0,1]], normal: [0,0,1] },  // Front
            { dir: [0, 0, -1], corners: [[1,0,0], [1,1,0], [0,1,0], [0,0,0]], normal: [0,0,-1] }  // Back
        ];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const block = this.getBlock(x, y, z);
                    if (block === BlockTypes.AIR) continue;

                    const color = new THREE.Color(BlockColors[block]);
                    const props = BlockProperties[block];

                    // Check each face
                    for (const face of faces) {
                        const nx = x + face.dir[0];
                        const ny = y + face.dir[1];
                        const nz = z + face.dir[2];

                        const neighbor = this.getBlock(nx, ny, nz);
                        const neighborProps = BlockProperties[neighbor];

                        // Only render face if neighbor is transparent
                        if (neighborProps.transparent && (neighbor !== block || !props.transparent)) {
                            // Add vertices for this face
                            for (const corner of face.corners) {
                                positions.push(x + corner[0], y + corner[1], z + corner[2]);

                                // Ambient occlusion - darken bottom faces
                                const ao = face.dir[1] === -1 ? 0.6 : (face.dir[1] === 1 ? 1.0 : 0.8);
                                colors.push(color.r * ao, color.g * ao, color.b * ao);

                                normals.push(...face.normal);
                            }

                            // Add indices for two triangles
                            indices.push(
                                vertexCount, vertexCount + 1, vertexCount + 2,
                                vertexCount, vertexCount + 2, vertexCount + 3
                            );
                            vertexCount += 4;
                        }
                    }
                }
            }
        }

        if (positions.length === 0) {
            this.mesh = null;
            return;
        }

        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setIndex(indices);

        // Create material
        const material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            side: THREE.FrontSide
        });

        // Create mesh
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.geometry = geometry;
        } else {
            this.mesh = new THREE.Mesh(geometry, material);
        }

        // Position mesh in world
        this.mesh.position.set(
            this.chunkX * CHUNK_SIZE,
            0,
            this.chunkZ * CHUNK_SIZE
        );

        this.needsUpdate = false;
    }

    // Dispose of resources
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

export { Chunk, CHUNK_SIZE, CHUNK_HEIGHT };
