// Pikachu character
import { Character } from './base.js';

class Pikachu extends Character {
    constructor() {
        super('pikachu', 'Pikachu', '#FFD700', 'The classic surfer!');
    }

    draw(ctx) {
        this.drawSurfboard(ctx, this.color);

        // Body
        ctx.fillStyle = this.color;
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

        // Ear tips (black)
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.moveTo(-10, -48); ctx.lineTo(-12, -55); ctx.lineTo(-7, -50);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -48); ctx.lineTo(12, -55); ctx.lineTo(7, -50);
        ctx.closePath(); ctx.fill();

        // Red cheeks
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

        // Nose
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.arc(0, -24, 2, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -20, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Tail (lightning bolt)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(10, 5); ctx.lineTo(25, -5); ctx.lineTo(20, 5);
        ctx.lineTo(35, 0); ctx.lineTo(22, 12); ctx.lineTo(26, 8); ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

export default new Pikachu();
