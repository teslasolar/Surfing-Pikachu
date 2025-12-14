// Charmander character
import { Character } from './base.js';

class Charmander extends Character {
    constructor() {
        super('charmander', 'Charmander', '#F08030', 'Brave fire surfer!');
    }

    draw(ctx) {
        this.drawSurfboard(ctx, this.color);

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, -5, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly
        ctx.fillStyle = '#F8E8A0';
        ctx.beginPath();
        ctx.ellipse(0, -2, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, -26, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes - white
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-5, -28, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -28, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes - pupils
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.ellipse(-5, -27, 2, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -27, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.quadraticCurveTo(30, -5, 35, -15);
        ctx.quadraticCurveTo(25, -10, 15, 5);
        ctx.closePath();
        ctx.fill();

        // Flame outer
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(35, -15);
        ctx.quadraticCurveTo(40, -25, 38, -35);
        ctx.quadraticCurveTo(35, -25, 32, -20);
        ctx.closePath();
        ctx.fill();

        // Flame inner
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.moveTo(35, -18);
        ctx.quadraticCurveTo(38, -25, 36, -30);
        ctx.quadraticCurveTo(34, -24, 33, -20);
        ctx.closePath();
        ctx.fill();
    }
}

export default new Charmander();
