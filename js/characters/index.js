// Character Manager - Auto-loads all characters from this directory
import './base.js'; // Load polyfills first

// Import all characters
import pikachu from './pikachu.js';
import squirtle from './squirtle.js';
import charmander from './charmander.js';
import konomimon from './konomimon.js';

// Character registry
const CharacterManager = {
    // All available characters
    characters: {
        pikachu,
        squirtle,
        charmander,
        konomimon
    },

    // Character order for selection
    order: ['pikachu', 'squirtle', 'charmander', 'konomimon'],

    // Currently selected character
    currentId: 'pikachu',

    // Get current character object
    get current() {
        return this.characters[this.currentId];
    },

    // Get character list with metadata
    get list() {
        return this.order.map(id => this.characters[id]);
    },

    // Select a character by ID
    select(id) {
        if (this.characters[id]) {
            this.currentId = id;
            return true;
        }
        return false;
    },

    // Select next character
    next() {
        const idx = this.order.indexOf(this.currentId);
        const nextIdx = (idx + 1) % this.order.length;
        this.currentId = this.order[nextIdx];
        return this.current;
    },

    // Select previous character
    prev() {
        const idx = this.order.indexOf(this.currentId);
        const prevIdx = (idx - 1 + this.order.length) % this.order.length;
        this.currentId = this.order[prevIdx];
        return this.current;
    },

    // Draw current character
    draw(ctx, x, y, rotation) {
        this.current.render(ctx, x, y, rotation);
    },

    // Get character by ID
    get(id) {
        return this.characters[id];
    },

    // Register a new character dynamically
    register(character) {
        if (character && character.id) {
            this.characters[character.id] = character;
            if (!this.order.includes(character.id)) {
                this.order.push(character.id);
            }
            return true;
        }
        return false;
    }
};

export default CharacterManager;
