// Base character utilities and shared drawing functions

// Polyfill for roundRect (not supported in all browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') {
            r = { tl: r, tr: r, br: r, bl: r };
        }
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
    };
}

// Base character class
export class Character {
    constructor(id, name, color, description) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.description = description;
    }

    // Override in subclasses
    draw(ctx, x, y, rotation) {
        throw new Error('draw() must be implemented');
    }

    // Shared surfboard drawing
    drawSurfboard(ctx, stripeColor = '#FFD700') {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(0, 12, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Stripe
        ctx.fillStyle = stripeColor;
        ctx.fillRect(-20, 10, 40, 4);
    }

    // Draw wrapper that handles transform
    render(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        this.draw(ctx);
        ctx.restore();
    }
}

export default Character;
