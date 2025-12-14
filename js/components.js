// Component Loader - Loads HTML components from dock directories
const Components = {
    basePath: 'components',
    docks: ['north', 'east', 'west', 'south', 'body'],
    loaded: {},
    cache: {},

    // Fetch a single HTML component
    async fetchComponent(dock, file) {
        const path = `${this.basePath}/${dock}/${file}`;

        if (this.cache[path]) {
            return this.cache[path];
        }

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            const html = await response.text();
            this.cache[path] = html;
            return html;
        } catch (e) {
            console.error(`Component load error: ${path}`, e);
            return '';
        }
    },

    // Load dock index and all its components
    async loadDock(dock) {
        try {
            const indexPath = `${this.basePath}/${dock}/index.json`;
            const response = await fetch(indexPath);
            if (!response.ok) throw new Error(`No index for ${dock}`);

            const manifest = await response.json();
            const components = await Promise.all(
                manifest.components.map(file => this.fetchComponent(dock, file))
            );

            this.loaded[dock] = {
                manifest,
                html: components.join('\n')
            };

            return this.loaded[dock];
        } catch (e) {
            console.error(`Dock load error: ${dock}`, e);
            return { manifest: { components: [] }, html: '' };
        }
    },

    // Load all docks
    async loadAll() {
        await Promise.all(this.docks.map(dock => this.loadDock(dock)));
        return this.loaded;
    },

    // Inject components into containers
    inject(containerId, dockName) {
        const container = document.getElementById(containerId);
        if (container && this.loaded[dockName]) {
            container.innerHTML = this.loaded[dockName].html;
        }
    },

    // Build the title screen from north, west, east, south docks
    buildTitleScreen(container) {
        const html = `
            <div class="dock-north">
                ${this.loaded.north?.html || ''}
            </div>
            <div class="dock-center">
                <div class="dock-west">
                    ${this.loaded.west?.html || ''}
                </div>
                <div class="dock-east">
                    ${this.loaded.east?.html || ''}
                </div>
            </div>
            <div class="dock-south">
                ${this.loaded.south?.html || ''}
            </div>
        `;

        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (container) {
            container.innerHTML = html;
        }
        return html;
    },

    // Build the game area from body dock
    buildGameArea(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (container && this.loaded.body) {
            container.innerHTML = this.loaded.body.html;
        }
        return this.loaded.body?.html || '';
    },

    // Get a specific loaded dock
    getDock(name) {
        return this.loaded[name];
    },

    // Reload a specific component
    async reloadComponent(dock, file) {
        const path = `${this.basePath}/${dock}/${file}`;
        delete this.cache[path];
        return this.fetchComponent(dock, file);
    }
};

export default Components;
