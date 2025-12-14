// Block types and their properties
const BlockTypes = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    SAND: 4,
    WATER: 5,
    WOOD: 6,
    LEAVES: 7,
    SNOW: 8,
    BRICK: 9
};

const BlockColors = {
    [BlockTypes.AIR]: null,
    [BlockTypes.GRASS]: 0x4CAF50,
    [BlockTypes.DIRT]: 0x8B4513,
    [BlockTypes.STONE]: 0x808080,
    [BlockTypes.SAND]: 0xF4D03F,
    [BlockTypes.WATER]: 0x3498DB,
    [BlockTypes.WOOD]: 0x6B4423,
    [BlockTypes.LEAVES]: 0x228B22,
    [BlockTypes.SNOW]: 0xFFFFFF,
    [BlockTypes.BRICK]: 0xB22222
};

const BlockProperties = {
    [BlockTypes.AIR]: { solid: false, transparent: true },
    [BlockTypes.GRASS]: { solid: true, transparent: false },
    [BlockTypes.DIRT]: { solid: true, transparent: false },
    [BlockTypes.STONE]: { solid: true, transparent: false },
    [BlockTypes.SAND]: { solid: true, transparent: false },
    [BlockTypes.WATER]: { solid: false, transparent: true },
    [BlockTypes.WOOD]: { solid: true, transparent: false },
    [BlockTypes.LEAVES]: { solid: true, transparent: true },
    [BlockTypes.SNOW]: { solid: true, transparent: false },
    [BlockTypes.BRICK]: { solid: true, transparent: false }
};

export { BlockTypes, BlockColors, BlockProperties };
