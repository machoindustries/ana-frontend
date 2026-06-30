// scripts/build-preview.mjs
//
// Compiles views/components/*.hbs and views/elements/*.hbs into static
// preview HTML pages under _client/preview/components/, using fixture
// data from data/*.json where available.
//
// This is a one-time, dev-only build step — Handlebars is NOT shipped to
// the browser. Output is plain HTML + the already-built CSS/JS bundles.
//
// Run manually: npm run preview:build
//
// Scope (v1):
//   - views/components/*.hbs
//   - views/elements/*.hbs
// Explicitly excluded (requires #extend/#block/#content layout
// inheritance, which this script does not implement):
//   - views/templates/*.hbs
//   - views/checkout_templates/*.hbs
//   - views/styleguide/*.hbs
//   - any individual component/element that itself defines a {{#block}}
//     (e.g. c-container-block, c-static-section, e-accordion__item) —
//     these are meant to be extended, not previewed standalone.

import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const VIEWS_COMPONENTS_DIR = path.join(ROOT, 'views/components');
const VIEWS_ELEMENTS_DIR = path.join(ROOT, 'views/elements');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_DIR = path.join(ROOT, '_client/preview/components');
const PREVIEW_DIR = path.join(ROOT, '_client/preview');

// Source dirs to scan for partials AND for previewable templates.
const PARTIAL_SOURCE_DIRS = [VIEWS_COMPONENTS_DIR, VIEWS_ELEMENTS_DIR];

// Components/elements that define their own {{#block}} — these are
// layout-style templates meant to be {{#extend}}ed, not rendered on
// their own. Previewing them standalone would just show empty blocks.
const SKIP_STANDALONE = new Set([
    'c-container-block',
    'c-static-section',
    'e-accordion__item',
]);

// Named-variant fixtures (top-level keys are alternate brands/styles
// rather than a single instance) need a human to pick the canonical
// default — shape alone can't tell us which key represents "the"
// preview. Confirmed defaults, by component name -> fixture key:
const DEFAULT_VARIANT_KEY = {
    'c-header': 'ana',
    'c-video': 'youtube-dark',
    'c-hero': 'single',
};

// Templates using owl-carousel (grep for the literal class name) need
// their full collection preserved for the preview, not unwrapped to a
// single item — the carousel's own JS iterates the whole set at
// runtime. The exact SHAPE needed differs per template though:
//
//   'array': context is the raw array itself (e.g. c-promo-block.hbs
//            does {{#each this}} directly on the fixture array)
//   'object': the fixture's own wrapping object is already correct
//             (e.g. c-hero-carousel.hbs does {{#each items}}, and
//             hero.json's { items: [...], single: {...} } shape
//             already has the right "items" property)
//
// Confirmed by hand per-component; not inferable from the owl-carousel
// marker alone since the two existing cases need different handling.
const CAROUSEL_FIXTURE_MODE = {
    'c-hero-carousel': 'object',
    'c-promo-block': 'array',
};

// ─── Custom Handlebars helpers ────────────────────────────────────────────
//
// These mirror helpers that existed in the old Grunt/assemble-handlebars
// styleguide tooling (not present in this extracted repo). Hand-written
// here to match observed usage patterns in the .hbs source.

Handlebars.registerHelper('ifCond', function (a, operator, b, options) {
    switch (operator) {
        case '==': return (a == b) ? options.fn(this) : options.inverse(this); // eslint-disable-line eqeqeq
        case '===': return (a === b) ? options.fn(this) : options.inverse(this);
        case '!=': return (a != b) ? options.fn(this) : options.inverse(this); // eslint-disable-line eqeqeq
        case '!==': return (a !== b) ? options.fn(this) : options.inverse(this);
        case '||': return (a || b) ? options.fn(this) : options.inverse(this);
        case '&&': return (a && b) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
    }
});

Handlebars.registerHelper('ifEqual', function (a, b, options) {
    return (a === b) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifGreaterThan', function (a, b, options) {
    return (a > b) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifLessThan', function (a, b, options) {
    return (a < b) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('eachIndex', function (items, options) {
    if (!Array.isArray(items)) {
        return '';
    }

    return items.map((item, index) => {
        return options.fn(item, { data: { index } });
    }).join('');
});

Handlebars.registerHelper('default', function (value, fallback) {
    return (value === undefined || value === null || value === '') ? fallback : value;
});

// ─── Placeholder-aware override of the built-in #each ─────────────────────
//
// Handlebars' native #each expects a real Array (or plain object) and
// breaks on our placeholder Proxy (which reports a "length" but isn't a
// real Array). When #each is called on something that looks like our
// placeholder (no Symbol.iterator, not a real Array, not a plain object
// with real keys), wrap it in a one-item real Array of placeholder
// proxies before delegating to the original helper. Real fixture data
// passes through untouched.
const originalEach = Handlebars.helpers.each;

Handlebars.registerHelper('each', function (context, options) {
    const isRealArray = Array.isArray(context);
    const isPlainObject = context !== null && typeof context === 'object' && !isRealArray
        && Object.getPrototypeOf(context) === Object.prototype;

    if (context !== null && typeof context === 'object' && !isRealArray && !isPlainObject) {
        // Looks like our placeholder Proxy — give #each a real array.
        context = [context];
    }

    return originalEach.call(this, context, options);
});

// ─── Register all .hbs files as partials, keyed by filename ──────────────

function registerPartials() {
    for (const dir of PARTIAL_SOURCE_DIRS) {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.hbs'));

        for (const file of files) {
            const name = file.replace(/\.hbs$/, '');
            const source = fs.readFileSync(path.join(dir, file), 'utf-8');

            Handlebars.registerPartial(name, source);
        }
    }
}

// ─── Placeholder proxy for components with no matching fixture ───────────
//
// Returns "[fieldName]" for any property access, so it's obvious in the
// rendered preview that this is stand-in content, not real fixture data.
// Array-style access (for {{#each}}) returns a single-item array so loop
// bodies render once, rather than not rendering at all.

function createPlaceholderProxy(labelPrefix = '') {
    const str = labelPrefix ? `[${labelPrefix}]` : '[placeholder]';

    const handler = {
        get(target, prop) {
            if (typeof prop === 'symbol') {
                if (prop === Symbol.toPrimitive) {
                    return () => str;
                }
                return undefined;
            }

            // Handlebars internals / template metadata access — pass through.
            if (prop.startsWith('__') || prop === 'constructor' || prop === 'then' || prop === 'toHTML') {
                return undefined;
            }

            // Coercion methods: any intermediate node in a path (e.g. the
            // "data" in "data.link") may get coerced to a primitive by
            // Handlebars before — or instead of — having its leaf
            // property read. Every level needs to resolve to a sensible
            // string, not just leaves.
            if (prop === 'toString' || prop === 'valueOf') {
                return () => str;
            }

            const label = labelPrefix ? `${labelPrefix}.${prop}` : prop;

            return createPlaceholderProxy(label);
        },
        has() {
            return true;
        },
    };

    return new Proxy({}, handler);
}

// ─── Per-component build ──────────────────────────────────────────────────

// Some components don't have their own data/*.json — they legitimately
// reuse another component's fixture under a different shape. Confirmed
// by hand, since this can't be inferred from naming alone:
const FIXTURE_NAME_OVERRIDE = {
    'c-hero-carousel': 'hero',
};

function findFixture(name) {
    // Strip c-/e- prefix to match data/*.json naming convention.
    const bareName = FIXTURE_NAME_OVERRIDE[name] ?? name.replace(/^[ce]-/, '');
    const fixturePath = path.join(DATA_DIR, `${bareName}.json`);

    if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    }

    return null;
}

function getTopLevelFieldRefs(templateSource) {
    // Only consider references in the OUTER scope — i.e. before the
    // first {{#each}} block opens. Inside an #each, the iteration
    // context shifts, so field names like "title" or "htmlContent"
    // belong to the loop item, not the top-level fixture, and would
    // otherwise dilute the data-namespace ratio check below.
    //
    // Deliberately NOT capturing the #each tag's own argument (e.g.
    // "items" in {{#each items}}) as a field reference — tried this and
    // it caused more harm than good: many templates use {{#each this}}
    // or {{#each search-results}} where the array IS the context after
    // stage-1 unwrapping, so the loop variable doesn't exist as a field
    // on the resolved instance, and isn't supposed to.
    //
    // Also excludes hyphenated HTML attribute names that happen to
    // start with "data-" (e.g. data-language="...") which are plain
    // HTML, not Handlebars — the regex below only matches inside
    // {{ }} delimiters so this is naturally excluded, but kept as an
    // explicit comment since it caused a real false positive.
    const firstEachIndex = templateSource.search(/\{\{#each\b/);
    const outerScope = firstEachIndex === -1 ? templateSource : templateSource.slice(0, firstEachIndex);

    const KNOWN_HELPERS = new Set(['if', 'unless', 'each', 'with', 'else', 'ifCond', 'ifEqual', 'ifGreaterThan', 'ifLessThan', 'eachIndex', 'default']);

    return [...outerScope.matchAll(/\{\{\{?\s*#?([a-zA-Z_][a-zA-Z0-9_.-]*)(?:\s+([a-zA-Z_][a-zA-Z0-9_.-]*))?/g)]
        .map((m) => (KNOWN_HELPERS.has(m[1]) ? m[2] : m[1]))
        .filter((ref) => ref && !KNOWN_HELPERS.has(ref));
}

function resolveInstance(fixture) {
    // Stage 1: figure out which single "instance" of the fixture to use,
    // independent of whether that instance needs data.* wrapping.
    if (Array.isArray(fixture)) {
        if (fixture.length === 0) {
            return { instance: null, note: 'fixture is an empty array' };
        }

        return {
            instance: fixture[0],
            note: `fixture was a top-level array (${fixture.length} variants) — using first element`,
        };
    }

    return { instance: fixture, note: null };
}

function looksLikeNamedVariantObject(instance, fieldRefs) {
    // An object whose top-level keys don't include "data" and don't
    // overlap with any field the template actually references in its
    // outer scope is very likely a named-variant fixture (one key per
    // brand/style/example) rather than a single render-ready instance.
    if (instance === null || typeof instance !== 'object' || Array.isArray(instance)) {
        return false;
    }

    const topLevelKeys = Object.keys(instance);

    if (topLevelKeys.length === 0 || fieldRefs.length === 0) {
        return false;
    }

    // Normalize "this.title" -> "title": once the render context is
    // already the resolved instance (post stage-1 unwrap), {{this.x}}
    // and {{x}} are equivalent references to the same top-level key.
    const normalizedRefs = fieldRefs.map((ref) => ref.replace(/^this\./, ''));

    const keysUsedInTemplate = topLevelKeys.filter((key) => {
        return normalizedRefs.includes(key)
            || normalizedRefs.includes(`data.${key}`)
            || normalizedRefs.some((ref) => ref.startsWith(`${key}.`));
    });

    return keysUsedInTemplate.length === 0 && !topLevelKeys.includes('data');
}

function normalizeFixture(name, fixture, templateSource) {
    if (fixture === null) {
        return { data: fixture, note: null };
    }

    // Stage 0: owl-carousel templates need their full collection
    // preserved — short-circuit the rest of normalization entirely,
    // since unwrapping to a single instance would break the carousel.
    const carouselMode = CAROUSEL_FIXTURE_MODE[name];

    if (carouselMode === 'array') {
        return { data: fixture, note: 'owl-carousel template — using full fixture array as-is for the carousel' };
    }

    if (carouselMode === 'object') {
        return { data: fixture, note: 'owl-carousel template — using fixture object as-is (already shaped correctly)' };
    }

    const fieldRefs = getTopLevelFieldRefs(templateSource);
    const notes = [];

    // Stage 1: resolve which instance to use (handles top-level arrays).
    let { instance, note: instanceNote } = resolveInstance(fixture);

    if (instanceNote) {
        notes.push(instanceNote);
    }

    if (instance === null) {
        return { data: null, note: notes.join('; ') || null };
    }

    // Stage 3: named-variant object, e.g. header.json's ana/ancc/anf,
    // video.json's default-dark/default-light/etc. Ambiguous from shape
    // alone — use a confirmed default if one exists, otherwise flag for
    // manual review rather than guessing which variant to render. If
    // flagged for review, return immediately — stage 2 wrapping doesn't
    // apply to an unresolved ambiguous fixture.
    if (looksLikeNamedVariantObject(instance, fieldRefs)) {
        const topLevelKeys = Object.keys(instance);
        const defaultKey = DEFAULT_VARIANT_KEY[name];

        if (defaultKey && Object.hasOwn(instance, defaultKey)) {
            instance = instance[defaultKey];
            notes.push(`fixture has named variants (${topLevelKeys.join(', ')}) — using confirmed default "${defaultKey}"`);
        } else {
            return {
                data: instance,
                note: `⚠️  none of the fixture's top-level keys (${topLevelKeys.join(', ')}) match template fields — `
                    + 'this may be a named-variant fixture (e.g. one key per brand/style) rather than a single instance. '
                    + 'Needs manual review.',
            };
        }
    }

    // Stage 2: does the resolved instance need wrapping under "data" to
    // match a template that reads {{data.heading}}, {{#each data.items}}
    // etc., rather than {{heading}}/{{#each items}} directly? Runs on
    // whatever instance resolved from stages 1 and 3 above — a
    // confirmed-default variant can still need data.* wrapping
    // (e.g. video.json's "youtube-dark" instance needs this).
    if (typeof instance === 'object' && !Array.isArray(instance)) {
        const topLevelKeys = Object.keys(instance);
        const dataNamespaced = fieldRefs.filter((ref) => ref.startsWith('data.') || ref === 'data');
        // Majority (not unanimous) of outer-scope refs being data.*-prefixed
        // is a strong enough signal — some templates legitimately mix a
        // few top-level fields (e.g. c-video.hbs's "variant") alongside
        // data.* fields without it meaning the fixture is unrelated.
        const looksDataNamespaced = fieldRefs.length > 0 && dataNamespaced.length / fieldRefs.length >= 0.5;

        if (looksDataNamespaced && !topLevelKeys.includes('data')) {
            instance = { data: instance };
            notes.push('template reads fields under "data.*" — wrapped fixture as { data: fixture }');
        }
    }

    return { data: instance, note: notes.join('; ') || null };
}

function findJsBundle(name) {
    // Best-effort: most components have a matching view/component JS file
    // referenced via data-require in the markup itself, so the preview
    // shell just needs jit-require + the entry bundle — not a 1:1 guess
    // of which JS file to load directly.
    return null;
}

function buildPreviewPage(name, html, fixtureStatus) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Preview: ${name}</title>
    <link rel="shortcut icon" href="/_client/preview/dist/img/_client/images/logos/favicon.ico" type="image/x-icon" />
    <link href="/_client/preview/dist/css/screen.css" rel="stylesheet" media="screen" />
    <style>
        body { padding: 2rem; }
        .preview-meta {
            font-family: monospace;
            font-size: 0.8rem;
            background: #f4f4f4;
            border: 1px solid #ddd;
            padding: 0.5rem 1rem;
            margin-bottom: 2rem;
        }
        .preview-meta a { color: #193E4B; }
    </style>
</head>
<body>
    <div class="preview-meta">
        <strong>${name}</strong> — ${fixtureStatus}
        &nbsp;|&nbsp; <a href="/_client/preview/index.html">&larr; all previews</a>
    </div>

    ${html}

    <!--
        jQuery is loaded as a global script tag here, matching the real
        Razor layout pattern — Rollup treats jquery as external
        (vite.config.js: external: ['jquery'], globals: { jquery: '$' }),
        so it's never bundled into entry.js or any view chunk. Same
        approach for every other "legacy lib" file copied as-is by
        viteStaticCopy (see vite.config.js SCRIPTS_LIB targets).
    -->
    <script src="/_client/preview/dist/js/jquery.js"></script>
    <script type="module" src="/_client/preview/dist/js/entry.js"></script>
</body>
</html>
`;
}

function buildIndexPage(entries) {
    const items = entries
        .map((e) => {
            return `<li><a href="components/${e.name}.html">${e.name}</a> — ${e.status}</li>`;
        })
        .join('\n        ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Component Previews</title>
    <style>
        body { font-family: sans-serif; padding: 2rem; max-width: 720px; }
        li { margin-bottom: 0.4rem; }
        .skip { color: #999; }
    </style>
</head>
<body>
    <h1>Component Previews</h1>
    <p>Generated by <code>npm run preview:build</code>. Run again after changing
       a .hbs file or its matching data/*.json fixture.</p>
    <ul>
        ${items}
    </ul>
</body>
</html>
`;
}

// ─── Main ──────────────────────────────────────────────────────────────────

function run() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    registerPartials();

    const results = [];

    for (const dir of PARTIAL_SOURCE_DIRS) {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.hbs'));

        for (const file of files) {
            const name = file.replace(/\.hbs$/, '');

            if (SKIP_STANDALONE.has(name)) {
                console.log(`⏭️  ${name} — skipped (requires #extend, not previewable standalone)`);
                results.push({ name, status: 'skipped (requires extend)', skipped: true });
                continue;
            }

            const source = fs.readFileSync(path.join(dir, file), 'utf-8');

            let template;

            try {
                template = Handlebars.compile(source);
            } catch (err) {
                console.warn(`⚠️  ${name} — failed to compile: ${err.message}`);
                results.push({ name, status: `compile error: ${err.message}`, skipped: true });
                continue;
            }

            const rawFixture = findFixture(name);
            const { data: normalizedFixture, note } = normalizeFixture(name, rawFixture, source);
            const data = normalizedFixture ?? createPlaceholderProxy(name);
            const fixtureFileName = `${FIXTURE_NAME_OVERRIDE[name] ?? name.replace(/^[ce]-/, '')}.json`;

            const needsReview = note && note.startsWith('⚠️');
            let statusLabel;

            if (!rawFixture) {
                statusLabel = '⚠️ no fixture found — placeholder content shown';
            } else if (needsReview) {
                statusLabel = `${note} (data/${fixtureFileName})`;
            } else if (note) {
                statusLabel = `✅ fixture: data/${fixtureFileName} — ${note}`;
            } else {
                statusLabel = `✅ fixture: data/${fixtureFileName}`;
            }

            let html;

            try {
                // allowProtoPropertiesByDefault/allowProtoMethodsByDefault:
                // Handlebars 4.7's prototype-access guard rejects property
                // reads on our placeholder Proxy objects since they aren't
                // "own properties". Safe to disable here — this only runs
                // against our own static fixtures/placeholders, never
                // user input.
                html = template(data, {
                    allowProtoPropertiesByDefault: true,
                    allowProtoMethodsByDefault: true,
                });
            } catch (err) {
                console.warn(`⚠️  ${name} — failed to render: ${err.message}`);
                results.push({ name, status: `render error: ${err.message}`, skipped: true });
                continue;
            }

            const page = buildPreviewPage(name, html, statusLabel);

            fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.html`), page, 'utf-8');

            console.log(`${needsReview ? '🔶' : (rawFixture ? '✅' : '⚠️ ')} ${name} — ${statusLabel}`);
            results.push({ name, status: statusLabel, skipped: false, needsReview: !!needsReview });
        }
    }

    fs.writeFileSync(
        path.join(PREVIEW_DIR, 'index.html'),
        buildIndexPage(results),
        'utf-8'
    );

    const built = results.filter((r) => !r.skipped).length;
    const withFixture = results.filter((r) => r.status.startsWith('✅')).length;
    const skipped = results.filter((r) => r.skipped).length;
    const needsReview = results.filter((r) => r.needsReview).length;

    console.log('');
    console.log(`Built ${built} preview page(s) (${withFixture} with real fixture data, ${built - withFixture - needsReview} with placeholders, ${needsReview} flagged for manual review).`);
    console.log(`Skipped ${skipped} (require #extend or failed to compile/render).`);
    console.log(`Output: ${path.relative(ROOT, PREVIEW_DIR)}/`);
}

run();
