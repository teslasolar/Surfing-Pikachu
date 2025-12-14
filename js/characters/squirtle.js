// Squirtle character
import { Character } from './base.js';

class Squirtle extends Character {
    constructor() {
        super('squirtle', 'Squirtle', '#6890F0', 'Water type natural!');
    }

    draw(ctx) {
        this.drawSurfboard(ctx, this.color);

        // Shell back
        ctx.fillStyle = '#C4A484';
        ctx.beginPath();
        ctx.ellipse(0, -3, 16, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shell inner
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
        ctx.fillStyle = this.color;
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

        // Eyes - white
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-5, -24, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -24, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes - pupils
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(-5, -23, 2.5, 0, Math.PI * 2);
        ctx.arc(5, -23, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(12, 5);
        ctx.quadraticCurveTo(25, 0, 22, -10);
        ctx.quadraticCurveTo(18, -5, 15, 0);
        ctx.closePath();
        ctx.fill();
    }
}

export default new Squirtle();
