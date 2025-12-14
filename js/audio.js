// Audio module - Web Audio API sound effects
import Config from './config.js';

const Audio = {
    ctx: null,
    soundMap: {},

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Build lookup map from CSV data
            Config.sounds.forEach(s => this.soundMap[s.name] = s);
        }
        return this;
    },

    resume() {
        if (this.ctx?.state === 'suspended') this.ctx.resume();
    },

    play(name) {
        if (!this.ctx) return;
        const s = this.soundMap[name];
        if (!s) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;

        osc.type = s.waveform;
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Frequency envelope
        osc.frequency.setValueAtTime(s.freqStart, t);
        osc.frequency.exponentialRampToValueAtTime(s.freqEnd, t + s.freqTime);

        // For 'score' and 'win', add musical notes
        if (name === 'score') {
            osc.frequency.setValueAtTime(523, t);
            osc.frequency.setValueAtTime(659, t + 0.1);
            osc.frequency.setValueAtTime(784, t + 0.2);
        } else if (name === 'win') {
            osc.frequency.setValueAtTime(523, t);
            osc.frequency.setValueAtTime(659, t + 0.15);
            osc.frequency.setValueAtTime(784, t + 0.3);
            osc.frequency.setValueAtTime(1047, t + 0.45);
        }

        // Gain envelope
        gain.gain.setValueAtTime(s.gainStart, t);
        gain.gain.exponentialRampToValueAtTime(s.gainEnd, t + s.duration);

        osc.start(t);
        osc.stop(t + s.duration);
    }
};

export default Audio;
