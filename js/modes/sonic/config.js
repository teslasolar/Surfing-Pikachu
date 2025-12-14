// Sonic Speedrun Mode Configuration
export default {
    // Game dimensions
    GAME_WIDTH: 500,
    GAME_HEIGHT: 400,

    // Physics (Sonic-style - faster and bouncier)
    WATER_LEVEL: 300,
    GRAVITY: 0.5,
    JUMP_FORCE: -14,
    MAX_ROTATION_SPEED: 0.35,
    SPIN_DASH_SPEED: 8,

    // Game settings
    MAX_HP: 100, // Rings act as HP
    COURSE_LENGTH: 25000,
    BASE_SPEED: 5,
    MAX_SPEED_BONUS: 6,
    BOOST_SPEED: 12,

    // Pikachu position
    PIKACHU_X: 100,

    // Ring system
    RING_SPAWN_RATE: 80,
    RING_VALUE: 1,
    RING_BOUNCE_HEIGHT: 15,

    // Obstacles
    SPIKE_SPAWN_RATE: 400,
    SPRING_SPAWN_RATE: 600,
    BOOST_PAD_SPAWN_RATE: 500,

    // Speed zones
    LOOP_SPAWN_RATE: 1500,

    // Sonic Color palette
    colors: {
        // Green Hill Zone sky
        sky_top: '#87ceeb',
        sky_mid: '#98d8f0',
        sky_bottom: '#c8e8f8',

        // Checkerboard ground
        ground_light: '#c87820',
        ground_dark: '#904810',
        grass: '#40b830',
        grass_dark: '#308020',

        // Water (less prominent in Sonic mode)
        water_deep: '#2060a0',
        water_surface: '#40a0e0',
        highlight: 'rgba(255, 255, 255, 0.5)',

        // Sonic Pikachu
        sonic_blue: '#0066ff',
        sonic_belly: '#d4a06a',
        sonic_spikes: '#0044aa',

        // Rings
        ring_gold: '#ffd700',
        ring_shine: '#ffff88',
        ring_inner: '#cc9900',

        // Objects
        spring_red: '#ff0000',
        spring_yellow: '#ffff00',
        spike_silver: '#c0c0c0',
        boost_blue: '#00aaff',
        boost_glow: '#00ffff',

        // Effects
        speed_lines: 'rgba(255, 255, 255, 0.5)',
        ring_sparkle: '#ffff00',
        score_popup: '#ffd700'
    }
};
