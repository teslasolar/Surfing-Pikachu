// Super Saiyan Mode Configuration
export default {
    // Game dimensions
    GAME_WIDTH: 500,
    GAME_HEIGHT: 400,

    // Physics
    WATER_LEVEL: 280,
    GRAVITY: 0.4,
    JUMP_FORCE: -13,
    MAX_ROTATION_SPEED: 0.3,

    // Game settings
    MAX_HP: 2500,
    COURSE_LENGTH: 20000,
    BASE_SPEED: 3.5,
    MAX_SPEED_BONUS: 4,

    // Pikachu position
    PIKACHU_X: 100,

    // Ki system
    MAX_KI: 100,
    KI_PER_FLIP: 15,
    KI_DRAIN_RATE: 0.1,
    KI_BLAST_COST: 20,

    // Transformation thresholds
    SSJ_THRESHOLD: 50,
    SSJ2_THRESHOLD: 75,
    SSJ3_THRESHOLD: 100,

    // Villains
    VILLAIN_SPAWN_RATE: 300,
    VILLAIN_TYPES: ['frieza', 'cell', 'buu'],

    // DBZ Color palette
    colors: {
        // Planet Vegeta sky
        sky_top: '#1a0505',
        sky_mid: '#3d0a0a',
        sky_bottom: '#5c1515',

        // Red landscape
        ground_near: '#4a1010',
        ground_far: '#2d0808',

        // Energy waves
        energy_deep: '#2a0a0a',
        energy_surface: '#6b2020',
        energy_glow: '#ff6600',
        highlight: 'rgba(255, 200, 100, 0.6)',

        // Base Pikachu (for reference)
        pikachu_body: '#ffd700',
        pikachu_dark: '#1a1a2e',
        pikachu_cheeks: '#ff6b6b',

        // Super Saiyan forms
        ssj_aura: '#ffff00',
        ssj_hair: '#ffe135',
        ssj2_aura: '#ffff66',
        ssj2_lightning: '#00ffff',
        ssj3_aura: '#ffffaa',
        ssj3_hair: '#fff8dc',

        // Ki
        ki_blast: '#00ffff',
        ki_wave: '#4169e1',

        // Villains
        frieza_body: '#e8d0ff',
        frieza_purple: '#9370db',
        cell_green: '#228b22',
        cell_spots: '#006400',
        buu_pink: '#ff69b4',
        buu_dark: '#db7093',

        // Effects
        explosion: '#ff4500',
        score_popup: '#ffd700',
        damage: '#ff0000'
    }
};
