// Config loader - parses CSV files into usable config objects
const Config = {
    data: {},
    colors: {},
    sounds: [],
    waves: [],
    scoring: {},

    // Parse CSV text into array of objects
    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
            return obj;
        });
    },

    // Parse config.csv into key-value pairs with type conversion
    parseConfig(text) {
        const rows = this.parseCSV(text);
        const cfg = {};
        rows.forEach(row => {
            const val = row.type === 'int' ? parseInt(row.value) :
                       row.type === 'float' ? parseFloat(row.value) : row.value;
            cfg[row.key] = val;
        });
        return cfg;
    },

    // Parse colors.csv into color map
    parseColors(text) {
        const rows = this.parseCSV(text);
        const colors = {};
        rows.forEach(row => colors[row.name] = row.value);
        return colors;
    },

    // Parse sounds.csv into sound definitions
    parseSounds(text) {
        const rows = this.parseCSV(text);
        return rows.map(row => ({
            name: row.name,
            waveform: row.waveform,
            freqStart: parseFloat(row.freqStart),
            freqEnd: parseFloat(row.freqEnd),
            freqTime: parseFloat(row.freqTime),
            gainStart: parseFloat(row.gainStart),
            gainEnd: parseFloat(row.gainEnd),
            duration: parseFloat(row.duration)
        }));
    },

    // Parse waves.csv into wave type definitions
    parseWaves(text) {
        const rows = this.parseCSV(text);
        return rows.map(row => ({
            size: row.size,
            height: parseInt(row.height),
            width: parseInt(row.width),
            probability: parseFloat(row.probability)
        }));
    },

    // Parse scoring.csv into scoring rules
    parseScoring(text) {
        const rows = this.parseCSV(text);
        const scoring = {};
        rows.forEach(row => {
            scoring[row.flips] = {
                base: parseInt(row.baseScore),
                bonus: parseInt(row.oppositeBonus)
            };
        });
        return scoring;
    },

    // Load all config files
    async load() {
        const files = ['config', 'colors', 'sounds', 'waves', 'scoring'];
        const fetches = files.map(f => fetch(`data/${f}.csv`).then(r => r.text()));
        const [configText, colorsText, soundsText, wavesText, scoringText] = await Promise.all(fetches);

        this.data = this.parseConfig(configText);
        this.colors = this.parseColors(colorsText);
        this.sounds = this.parseSounds(soundsText);
        this.waves = this.parseWaves(wavesText);
        this.scoring = this.parseScoring(scoringText);

        // Expose commonly used values as shortcuts
        Object.assign(this, this.data);
        return this;
    },

    // Get score for flip count
    getFlipScore(flips, hasOpposite) {
        if (flips <= 0) return 0;
        const rule = this.scoring[flips] || this.scoring['bonus'];
        if (flips > 3) return this.scoring['3'].base + (flips - 3) * rule.base;
        return rule.base + (hasOpposite ? rule.bonus : 0);
    },

    // Get wave type by random roll
    getWaveType(roll) {
        let cumulative = 0;
        for (const wave of this.waves) {
            cumulative += wave.probability;
            if (roll < cumulative) return wave;
        }
        return this.waves[0];
    }
};

export default Config;
