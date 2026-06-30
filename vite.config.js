import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

// ─── Path constants (mirrors Gruntproject.js) ────────────────────────────────

const CLIENT_DIR        = '_client';
const RESOURCES_DIR     = normalizePath(path.resolve(__dirname, '../wwwroot/assets'));

const SCRIPTS_MAIN      = `${CLIENT_DIR}/scripts`;
const SCRIPTS_LIB       = `${CLIENT_DIR}/scripts/lib`;
const STYLES_DIR        = `${CLIENT_DIR}/styles`;
const IMAGES_DIR        = `${CLIENT_DIR}/images`;
const FONTS_DIR         = `${CLIENT_DIR}/fonts`;

// ─── Dynamic entry points from browserify-mapping.json ───────────────────────
//
// The data-require pattern on Razor views loads individual JS files at runtime
// via loadjs. Each module in the mapping must compile to its own output file,
// preserving directory structure so loadjs can fetch:
//   /assets/js/src/views/order-confirmation-page-view.js
//   /assets/js/src/components/base-component.js
//   etc.

function buildEntryPoints() {
    const mappingPath = path.resolve(__dirname, `${SCRIPTS_MAIN}/browserify-mapping.json`);
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

    const entries = {
        // Bootstrap — main.js compiles to wwwroot/assets/js/entry.js
        'js/entry': path.resolve(__dirname, `${SCRIPTS_MAIN}/main.js`),
    };

    // All modules in the mapping become individual output files.
    // Skip './main' — covered by the entry above.
    const modules = mapping['entry.js'].filter((m) => m !== './main');

    for (const mod of modules) {
        // mod is e.g. './src/views/order-confirmation-page-view'
        // Strip './' → 'src/views/order-confirmation-page-view'
        const relativePath = mod.replace(/^\.\//, '');

        // Entry key → 'js/src/views/order-confirmation-page-view'
        // Rollup uses this as the output path under outDir
        const entryKey = `js/${relativePath}`;

        // Absolute path under _client/scripts/
        const absolutePath = path.resolve(__dirname, `${SCRIPTS_MAIN}/${relativePath}.js`);

        entries[entryKey] = absolutePath;
    }

    return entries;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export default defineConfig(({ command, mode }) => {
    const isDeploy = mode === 'production';

    return {
        root: __dirname,
        appType: 'custom',

        css: {
            preprocessorOptions: {
                scss: {
                    loadPaths: [
                        path.resolve(__dirname, STYLES_DIR),
                    ],
                },
            },
            devSourcemap: !isDeploy,
        },

        resolve: {
            alias: {
                'src':        path.resolve(__dirname, `${CLIENT_DIR}/scripts/src`),
                'components': path.resolve(__dirname, `${CLIENT_DIR}/scripts/src/components`),
                'modules':    path.resolve(__dirname, `${CLIENT_DIR}/scripts/src/modules`),
                'services':   path.resolve(__dirname, `${CLIENT_DIR}/scripts/src/services`),
                'views':      path.resolve(__dirname, `${CLIENT_DIR}/scripts/src/views`),
                'values':     path.resolve(__dirname, `${CLIENT_DIR}/scripts/src/values`),
                'templates':  path.resolve(__dirname, `${CLIENT_DIR}/scripts/src/templates`),
            },
        },

        define: {
            global: 'globalThis',
        },

        build: {
            outDir: RESOURCES_DIR,
            emptyOutDir: false,
            sourcemap: !isDeploy,

            rollupOptions: {
                input: {
                    ...buildEntryPoints(),

                    // CSS entry points
                    'css/screen':     path.resolve(__dirname, `${STYLES_DIR}/screen.scss`),
                    'css/print':      path.resolve(__dirname, `${STYLES_DIR}/print.scss`),
                    'css/editor':     path.resolve(__dirname, `${STYLES_DIR}/editor.scss`),
                    'css/editor-fix': path.resolve(__dirname, `${STYLES_DIR}/editor-fix.scss`),
                },

                output: {
                    // Preserve entry key as output path — critical for loadjs
                    // runtime fetching to resolve the correct file paths
                    entryFileNames: '[name].js',

                    // Shared chunks extracted by Rollup land in js/chunks/
                    // and are loaded automatically as needed
                    chunkFileNames: 'js/chunks/[name]-[hash].js',

                    assetFileNames: (assetInfo) => {
                        if (assetInfo.name?.endsWith('.css')) {
                            return '[name][extname]';
                        }
                        if (/\.(png|jpe?g|gif|svg|ico|webp)$/.test(assetInfo.name ?? '')) {
                            return 'img/[name][extname]';
                        }
                        if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name ?? '')) {
                            return 'fonts/[name][extname]';
                        }
                        return '[name][extname]';
                    },
                },

                // jQuery is loaded as a global script tag in the Razor layout.
                // Rollup will not bundle it — modules that import jquery
                // receive the global $ at runtime instead.
                // TODO: revisit once jQuery audit is complete.
                external: ['jquery'],
                globals: {
                    jquery: '$',
                },
            },

            minify: isDeploy ? 'terser' : false,
            terserOptions: isDeploy ? {
                compress: { drop_console: true },
                format:   { comments: false },
            } : undefined,
        },

        plugins: [
            viteStaticCopy({
                targets: [
                    // Images (excluding icons/ which fed the now-dropped webfont task)
                    {
                        src: normalizePath(path.resolve(__dirname, `${IMAGES_DIR}/**/*.{png,jpg,gif,svg,ico,webp}`)),
                        dest: 'img',
                        filter: (filePath) => !filePath.includes('/icons/'),
                    },

                    // Fonts
                    {
                        src: normalizePath(path.resolve(__dirname, `${FONTS_DIR}/**/*.{eot,svg,ttf,woff,woff2}`)),
                        dest: 'fonts',
                    },

                    // Legacy lib files — copied as-is pending jQuery audit
                    // TODO: migrate to npm imports after audit
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/jquery.js`)),         dest: 'js' },
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/jquery.min.js`)),     dest: 'js' },
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/jquery-ui.js`)),      dest: 'js' },
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/jquery-ui.min.js`)),  dest: 'js' },
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/cdc.js`)),            dest: 'js' },
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/entry.js`)),          dest: 'js' },
                    { src: normalizePath(path.resolve(__dirname, `${SCRIPTS_LIB}/StringList.js`)),     dest: 'js' },

{ src: normalizePath(path.resolve(__dirname, `${CLIENT_DIR}/styles/lib/cdc.css`)),        dest: 'css', rename: 'cdc.css' },
{ src: normalizePath(path.resolve(__dirname, `${CLIENT_DIR}/styles/lib/system.css`)),     dest: 'css', rename: 'system.css' },
{ src: normalizePath(path.resolve(__dirname, `${CLIENT_DIR}/styles/lib/ToolButton.css`)), dest: 'css', rename: 'ToolButton.css' },
                ],
            }),
        ],

        server: {
            proxy: {
                '/': {
                    target: 'https://localhost:44300',
                    changeOrigin: true,
                    secure: false,
                },
            },
            watch: {
                include: [`${CLIENT_DIR}/**`],
            },
        },
    };
});