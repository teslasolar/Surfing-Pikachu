// Konomimon - Custom AI/3D Printing Mascot
import { Character } from './base.js';

class Konomimon extends Character {
    constructor() {
        super('konomimon', 'Konomimon', '#9B59B6', 'AI-powered 3D printing mascot!');
    }

    draw(ctx) {
        this.drawSurfboard(ctx, this.color);

        // Body - robotic/geometric style (using basic shapes for compatibility)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-12, -20);
        ctx.lineTo(12, -20);
        ctx.lineTo(14, -18);
        ctx.lineTo(14, 8);
        ctx.lineTo(12, 10);
        ctx.lineTo(-12, 10);
        ctx.lineTo(-14, 8);
        ctx.lineTo(-14, -18);
        ctx.closePath();
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
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, -15, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-8, 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
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

        // LED eyes with glow effect
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(-4, -32, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -32, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -33, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, -33, 1, 0, Math.PI * 2);
        ctx.fill();

        // LED smile
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -28, 4, 0.3, Math.PI - 0.3);
        ctx.stroke();

        // Antenna
        ctx.fillStyle = this.color;
        ctx.fillRect(-2, -52, 4, 8);

        // Antenna tip (glowing)
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(0, -54, 4, 0, Math.PI * 2);
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

        // Nozzle tip
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(30, -8);
        ctx.lineTo(35, -6);
        ctx.lineTo(35, -4);
        ctx.lineTo(30, -2);
        ctx.closePath();
        ctx.fill();

        // Extruding filament
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(37, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E8D5F2';
        ctx.beginPath();
        ctx.arc(41, -3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(44, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default new Konomimon();
