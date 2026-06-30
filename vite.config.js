import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

// ─── Path constants (mirrors Gruntproject.js) ────────────────────────────────

const CLIENT_DIR        = '_client';
const RESOURCES_DIR     = normalizePath(path.resolve(__dirname, '../wwwroot/assets'));

// Used only when running `vite build --mode preview` (npm run
// preview:build:assets). The real ANA solution's wwwroot doesn't exist
// in this extracted repo, so component previews need a self-contained
// build output that doesn't depend on the full .NET solution being
// checked out alongside this folder. Never used for the real
// dev/production build — RESOURCES_DIR above is untouched.
const PREVIEW_RESOURCES_DIR = normalizePath(path.resolve(__dirname, '_client/preview/dist'));

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

// ─── Preview harness static file server (dev only) ──────────────────────────
//
// appType: 'custom' (below) disables Vite's built-in HTML-serving
// middleware entirely — by design, since in production the .NET/Razor
// app serves all HTML and Vite only provides the proxy-forwarded dev
// experience. That means there's no middleware anywhere that will serve
// a plain .html file from disk, which is exactly what the component
// preview harness (npm run preview:build) needs for
// _client/preview/index.html and _client/preview/components/*.html.
//
// This plugin fills that one specific gap: a minimal static file server
// scoped ONLY to /_client/preview/, active only in `vite dev` (not
// `vite build`). It runs before the proxy is ever consulted, has zero
// effect on any other route, and never runs during a real build or
// production deploy.
function previewStaticServer() {
    const PREVIEW_ROOT = path.resolve(__dirname, '_client/preview');

    const MIME_TYPES = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.mjs': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.map': 'application/json; charset=utf-8',
    };

    return {
        name: 'preview-static-server',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (!req.url || !req.url.startsWith('/_client/preview/')) {
                    next();
                    return;
                }

                const urlPath = req.url.split('?')[0];
                const relativePath = urlPath.replace('/_client/preview/', '');
                const filePath = path.join(PREVIEW_ROOT, relativePath);

                // Guard against path traversal outside the preview root.
                if (!normalizePath(filePath).startsWith(normalizePath(PREVIEW_ROOT))) {
                    next();
                    return;
                }

                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        next();
                        return;
                    }

                    const ext = path.extname(filePath);

                    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
                    res.statusCode = 200;
                    res.end(data);
                });
            });
        },
    };
}

// ─── Config ──────────────────────────────────────────────────────────────────

export default defineConfig(({ command, mode }) => {
    const isDeploy = mode === 'production';
    const isPreview = mode === 'preview';
    const outDir = isPreview ? PREVIEW_RESOURCES_DIR : RESOURCES_DIR;

    return {
        root: __dirname,
        appType: 'custom',

        css: {
            preprocessorOptions: {
                scss: {
                    loadPaths: [
                        path.resolve(__dirname, STYLES_DIR),
                    ],
                    // In preview mode, fonts/images are served from
                    // _client/preview/dist/ (this self-contained repo),
                    // not the .NET app's wwwroot/assets/ -- override the
                    // !default path variables before any other .scss is
                    // loaded. No-op in dev/production: additionalData is
                    // simply empty, and the !default values in
                    // _settings-helpers.scss apply as before.
                    additionalData: isPreview
                        ? `$s-fonts-path: '/_client/preview/dist/fonts/_client/fonts/'; $s-image-path: '/_client/preview/dist/img/_client/images/';`
                        : '',
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
            outDir: outDir,
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
            previewStaticServer(),
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
                // Catch-all forwards everything to the local .NET app —
                // EXCEPT /_client/preview/, which needs to be served as
                // static files by Vite directly for the component
                // preview harness (npm run preview:build) to work.
                // Without this bypass, every preview request 502s since
                // it gets forwarded to the .NET app, which has no route
                // for it.
                '^/(?!_client/preview/)': {
                    target: 'https://localhost:54809',
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