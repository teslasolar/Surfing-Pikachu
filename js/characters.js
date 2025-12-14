// Character definitions for 2D and 3D rendering
import Config from './config.js';

// Character data with draw functions for 2D
const Characters = {
    current: 'pikachu',
    list: ['pikachu', 'squirtle', 'charmander', 'konomimon'],

    // Character metadata
    data: {
        pikachu: {
            name: 'Pikachu',
            color: '#FFD700',
            description: 'The classic surfer!'
        },
        squirtle: {
            name: 'Squirtle',
            color: '#6890F0',
            description: 'Water type natural!'
        },
        charmander: {
            name: 'Charmander',
            color: '#F08030',
            description: 'Brave fire surfer!'
        },
        konomimon: {
            name: 'Konomimon',
            color: '#9B59B6',
            description: 'AI-powered 3D printing mascot!'
        }
    },

    select(name) {
        if (this.list.includes(name)) {
            this.current = name;
            return true;
        }
        return false;
    },

    next() {
        const idx = this.list.indexOf(this.current);
        this.current = this.list[(idx + 1) % this.list.length];
        return this.current;
    },

    prev() {
        const idx = this.list.indexOf(this.current);
        this.current = this.list[(idx - 1 + this.list.length) % this.list.length];
        return this.current;
    },

    // 2D Draw functions
    draw(ctx, x, y, rotation) {
        const drawFn = this[`draw_${this.current}`];
        if (drawFn) {
            drawFn.call(this, ctx, x, y, rotation);
        }
    },

    // Draw surfboard (shared)
    drawSurfboard(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    // Pikachu
    draw_pikachu(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        this.drawSurfboard(ctx);

        // Surfboard stripe
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-20, 10, 40, 4);

        // Body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, -5, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -25, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(-8, -35); ctx.lineTo(-12, -55); ctx.lineTo(-3, -40);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, -35); ctx.lineTo(12, -55); ctx.lineTo(3, -40);
        ctx.closePath(); ctx.fill();

        // Ear tips
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.moveTo(-10, -48); ctx.lineTo(-12, -55); ctx.lineTo(-7, -50);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -48); ctx.lineTo(12, -55); ctx.lineTo(7, -50);
        ctx.closePath(); ctx.fill();

        // Cheeks
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(-10, -22, 4, 0, Math.PI * 2);
        ctx.arc(10, -22, 4, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(-5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -28, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -29, 1.5, 0, Math.PI * 2);
        ctx.arc(6, -29, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose & mouth
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(0, -24, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -20, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Tail
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(10, 5); ctx.lineTo(25, -5); ctx.lineTo(20, 5);
        ctx.lineTo(35, 0); ctx.lineTo(22, 12); ctx.lineTo(26, 8); ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    },

    // Squirtle
    draw_squirtle(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        this.drawSurfboard(ctx);
        ctx.fillStyle = '#6890F0';
        ctx.fillRect(-20, 10, 40, 4);

        // Shell
        ctx.fillStyle = '#C4A484';
        ctx.beginPath();
        ctx.ellipse(0, -3, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8B7355';
        ctx.beginPath();
        ctx.ellipse(0, -3, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell pattern
        ctx.strokeStyle = '#6B5344';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -13); ctx.lineTo(0, 7);
        ctx.moveTo(-10, -3); ctx.lineTo(10, -3);
        ctx.stroke();

        // Body front
        ctx.fillStyle = '#6890F0';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 12, 0, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(0, -22, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly
        ctx.fillStyle = '#F8F8D8';
        ctx.beginPath();
        ctx.ellipse(0, 2, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-5, -24, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -24, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(-5, -23, 2.5, 0, Math.PI * 2);
        ctx.arc(5, -23, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -24, 1, 0, Math.PI * 2);
        ctx.arc(6, -24, 1, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -18, 4, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Tail (curly)
        ctx.fillStyle = '#6890F0';
        ctx.beginPath();
        ctx.moveTo(12, 5);
        ctx.quadraticCurveTo(25, 0, 22, -10);
        ctx.quadraticCurveTo(18, -5, 15, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    // Charmander
    draw_charmander(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        this.drawSurfboard(ctx);
        ctx.fillStyle = '#F08030';
        ctx.fillRect(-20, 10, 40, 4);

        // Body
        ctx.fillStyle = '#F08030';
        ctx.beginPath();
        ctx.ellipse(0, -5, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly
        ctx.fillStyle = '#F8E8A0';
        ctx.beginPath();
        ctx.ellipse(0, -2, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#F08030';
        ctx.beginPath();
        ctx.ellipse(0, -26, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-5, -28, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -28, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(-5, -27, 2, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -27, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -28, 1, 0, Math.PI * 2);
        ctx.arc(6, -28, 1, 0, Math.PI * 2);
        ctx.fill();

        // Nostrils
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(-3, -22, 1, 0, Math.PI * 2);
        ctx.arc(3, -22, 1, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -19, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Tail with flame
        ctx.fillStyle = '#F08030';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.quadraticCurveTo(30, -5, 35, -15);
        ctx.quadraticCurveTo(25, -10, 15, 5);
        ctx.closePath();
        ctx.fill();

        // Flame
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(35, -15);
        ctx.quadraticCurveTo(40, -25, 38, -35);
        ctx.quadraticCurveTo(35, -25, 32, -20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.moveTo(35, -18);
        ctx.quadraticCurveTo(38, -25, 36, -30);
        ctx.quadraticCurveTo(34, -24, 33, -20);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    },

    // Konomimon - Custom AI/3D printing mascot
    draw_konomimon(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        this.drawSurfboard(ctx);

        // Surfboard stripe (purple gradient look)
        ctx.fillStyle = '#9B59B6';
        ctx.fillRect(-20, 10, 40, 4);

        // Body - robotic/geometric style
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath();
        ctx.roundRect(-12, -20, 24, 30, 5);
        ctx.fill();

        // Circuit pattern on body
        ctx.strokeStyle = '#E8D5F2';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -15); ctx.lineTo(-8, 5);
        ctx.moveTo(8, -15); ctx.lineTo(8, 5);
        ctx.moveTo(-8, -5); ctx.lineTo(8, -5);
        ctx.stroke();

        // Glowing nodes
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(-8, -15, 2, 0, Math.PI * 2);
        ctx.arc(8, -15, 2, 0, Math.PI * 2);
        ctx.arc(-8, 5, 2, 0, Math.PI * 2);
        ctx.arc(8, 5, 2, 0, Math.PI * 2);
        ctx.arc(0, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Head - hexagonal/crystalline
        ctx.fillStyle = '#8E44AD';
        ctx.beginPath();
        ctx.moveTo(0, -45);
        ctx.lineTo(12, -38);
        ctx.lineTo(12, -25);
        ctx.lineTo(0, -18);
        ctx.lineTo(-12, -25);
        ctx.lineTo(-12, -38);
        ctx.closePath();
        ctx.fill();

        // Face plate
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.moveTo(0, -42);
        ctx.lineTo(8, -37);
        ctx.lineTo(8, -27);
        ctx.lineTo(0, -22);
        ctx.lineTo(-8, -27);
        ctx.lineTo(-8, -37);
        ctx.closePath();
        ctx.fill();

        // LED eyes
        ctx.fillStyle = '#00FFFF';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(-4, -32, 3, 0, Math.PI * 2);
        ctx.arc(4, -32, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eye details
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -33, 1, 0, Math.PI * 2);
        ctx.arc(5, -33, 1, 0, Math.PI * 2);
        ctx.fill();

        // Smile (LED strip)
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -28, 4, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Antenna
        ctx.fillStyle = '#9B59B6';
        ctx.fillRect(-2, -50, 4, 8);
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(0, -52, 4, 0, Math.PI * 2);
        ctx.fill();

        // 3D printer nozzle tail
        ctx.fillStyle = '#7D8A8A';
        ctx.beginPath();
        ctx.moveTo(12, -5);
        ctx.lineTo(30, -10);
        ctx.lineTo(32, -5);
        ctx.lineTo(30, 0);
        ctx.lineTo(12, 5);
        ctx.closePath();
        ctx.fill();

        // Extruding filament
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath();
        ctx.arc(34, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#E8D5F2';
        ctx.beginPath();
        ctx.arc(38, -3, 2, 0, Math.PI * 2);
        ctx.arc(41, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
};

export default Characters;
