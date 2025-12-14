// Silver Surfer Mode Configuration
export default {
    // Game dimensions
    GAME_WIDTH: 500,
    GAME_HEIGHT: 400,

    // Cosmic physics
    WATER_LEVEL: 280,
    GRAVITY: 0.35,
    JUMP_FORCE: -12,
    MAX_ROTATION_SPEED: 0.25,

    // Game settings
    MAX_HP: 2000,
    COURSE_LENGTH: 15000,
    BASE_SPEED: 4,
    MAX_SPEED_BONUS: 3,

    // Pikachu position
    PIKACHU_X: 100,

    // Galactus settings
    GALACTUS_START_DISTANCE: -500,
    GALACTUS_SPEED: 2.5,
    GALACTUS_CATCH_DISTANCE: 50,

    // Cosmic debris from tricks
    DEBRIS_PER_FLIP: 3,

    // Cosmic color palette
    colors: {
        // Space background
        space_top: '#0a0015',
        space_mid: '#1a0a2e',
        space_bottom: '#2d1b4e',

        // Cosmic waves (energy streams)
        cosmic_deep: '#1a0a3a',
        cosmic_surface: '#4a2080',
        cosmic_glow: '#9932cc',
        highlight: 'rgba(200, 150, 255, 0.6)',
        foam: 'rgba(255, 200, 255, 0.8)',

        // Nebula colors
        nebula1: 'rgba(255, 100, 200, 0.3)',
        nebula2: 'rgba(100, 200, 255, 0.3)',
        nebula3: 'rgba(200, 100, 255, 0.3)',

        // Silver Pikachu
        silver_body: '#c0c0c0',
        silver_shine: '#e8e8e8',
        silver_dark: '#808080',
        silver_glow: '#a0d0ff',

        // Cosmic surfboard
        surfboard: '#1a1a2e',
        surfboard_stroke: '#4a4a6e',
        surfboard_energy: '#00ffff',

        // Galactus
        galactus_body: '#4a0080',
        galactus_helmet: '#8b008b',
        galactus_glow: '#ff00ff',

        // Effects
        star: '#ffffff',
        cosmic_debris: '#ff69b4',
        score_popup: '#00ffff'
    }
};
