import js from '@eslint/js';

export default [
    // 1. Base recommended ruleset
    js.configs.recommended,

    // 2. Project config
    {
        files: ['_client/scripts/main.js', '_client/scripts/src/**/*.js'],

        languageOptions: {
            ecmaVersion: 2018,
            sourceType: 'module',
            globals: {
                // Browser globals
                atob: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                location: 'readonly',
                navigator: 'readonly',
                FormData: 'readonly',
                requestAnimationFrame: 'readonly',
                matchMedia: 'readonly',
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                Promise: 'readonly',
                fetch: 'readonly',
                self: 'readonly',
                // Project globals
                loadjs: 'readonly',
                jQuery: 'readonly',
                $: 'readonly',
            },
        },

        rules: {
            // --- Possible Errors ---
            'no-extra-parens': 'error',
            'no-unexpected-multiline': 'error',

            // --- Best Practices ---
            'accessor-pairs': ['error', { 'getWithoutSet': false, 'setWithoutGet': true }],
            'block-scoped-var': 'warn',
            'consistent-return': 'error',
            'curly': 'error',
            'default-case': 'warn',
            'dot-location': ['warn', 'property'],
            'dot-notation': 'warn',
            'eqeqeq': ['error', 'smart'],
            'guard-for-in': 'warn',
            'no-alert': 'error',
            'no-caller': 'error',
            'no-case-declarations': 'warn',
            'no-div-regex': 'warn',
            'no-else-return': 'warn',
            'no-labels': 'warn',
            'no-empty-pattern': 'warn',
            'no-eq-null': 'warn',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'warn',
            'no-floating-decimal': 'warn',
            'no-implicit-coercion': ['warn', { 'boolean': true, 'number': true, 'string': true }],
            'no-implied-eval': 'error',
            'no-invalid-this': 'warn',
            'no-iterator': 'error',
            'no-lone-blocks': 'warn',
            'no-loop-func': 'error',
            'no-multi-spaces': 'error',
            'no-multi-str': 'warn',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            'no-new': 'error',
            'no-octal-escape': 'error',
            'no-param-reassign': 'error',
            'no-proto': 'error',
            'no-redeclare': 'error',
            'no-return-assign': 'error',
            'no-script-url': 'error',
            'no-self-compare': 'error',
            'no-throw-literal': 'error',
            'no-unused-expressions': 'error',
            'no-useless-call': 'error',
            'no-useless-concat': 'error',
            'no-void': 'warn',
            'no-with': 'warn',
            'radix': 'warn',
            'wrap-iife': ['error', 'outside'],
            'yoda': 'error',

            // --- Variables ---
            'no-delete-var': 'error',
            'no-label-var': 'error',
            'no-shadow-restricted-names': 'error',
            'no-shadow': 'warn',
            'no-undef': 'error',
            'no-unused-vars': ['warn', {
                'vars': 'all',
                'args': 'none',
                'caughtErrorsIgnorePattern': '^_'
            }],
            'no-use-before-define': 'error',

            // --- ES6 — modern practices enforced ---
            'arrow-body-style': ['error', 'always'],
            'arrow-parens': ['error', 'always'],
            'arrow-spacing': ['error', { 'before': true, 'after': true }],
            'constructor-super': 'error',
            'generator-star-spacing': ['error', 'before'],
            'no-confusing-arrow': 'error',
            'no-class-assign': 'error',
            'no-const-assign': 'error',
            'no-dupe-class-members': 'error',
            'no-this-before-super': 'error',
            'no-var': 'error',           // upgraded WARN → ERROR
            'object-shorthand': 'error', // flipped 'never' → 'error' (always)
            'prefer-arrow-callback': 'error',  // upgraded WARN → ERROR
            'prefer-spread': 'error',          // upgraded WARN → ERROR
            'prefer-template': 'error',        // upgraded WARN → ERROR
            'require-yield': 'error',

            // --- Stylistic ---
            'camelcase': ['warn', { 'properties': 'never' }],
            'comma-spacing': ['warn', { 'before': false, 'after': true }],
            'comma-style': ['warn', 'last'],
            'computed-property-spacing': ['warn', 'never'],
            'keyword-spacing': 'error',
            'lines-around-comment': ['warn', { 'beforeBlockComment': true }],
            'max-depth': ['warn', 8],
            'max-len': ['warn', 300],
            'max-nested-callbacks': ['warn', 8],
            'max-params': ['warn', 8],
            'new-cap': 'warn',
            'new-parens': 'warn',
            'no-array-constructor': 'warn',
            'no-lonely-if': 'warn',
            'no-mixed-spaces-and-tabs': 'warn',
            'no-nested-ternary': 'warn',
            'no-new-object': 'warn',
            'no-unneeded-ternary': 'warn',
            'object-curly-spacing': ['warn', 'always'],
            'operator-linebreak': ['warn', 'after'],
            'quote-props': ['warn', 'consistent-as-needed'],
            'semi-spacing': ['warn', { 'before': false, 'after': true }],
            'semi': ['error', 'always'],
            'space-before-blocks': ['warn', 'always'],
            'space-in-parens': ['warn', 'never'],
            'space-unary-ops': 'error',
        },
    },

    // 3. Node scripts — separate environment
    {
        files: ['scripts/**/*.mjs', '_client/scripts/optimise-images.mjs'],
        languageOptions: {
            globals: {
                console: 'readonly',
                process: 'readonly',
            },
        },
    },

    // 4. Ignore patterns
    {
        ignores: [
            '_client/scripts/lib/**',
            '_client/scripts/modernizr-custom.js',
            'Gruntfile.js',
            'Gruntproject.js',
            'grunt_tasks/**',
            'scripts/**',        // optimise-images.mjs etc — Node scripts, not browser source
            'vite.config.js',
            'postcss.config.js',
            'server.js',
            'node_modules/**',
        ],
    },

];