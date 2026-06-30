// postcss.config.js
//
// Replaces the grunt-postcss task from grunt_tasks/styles.js.
//
// Plugin changes from the Grunt config:
//   REMOVED  pixrem             — IE rem fallback, not needed without IE8/9
//   REMOVED  postcss-unmq       — was imported in styles.js but never used
//   REPLACED css-mqpacker       — unmaintained; replaced with
//            postcss-sort-media-queries (actively maintained, same behaviour)
//   KEPT     autoprefixer       — vendor prefixes, still relevant
//   KEPT     cssnano            — minification in production
//
// Previously cssnano ran unconditionally on print/editor/editor-fix even in
// dev mode. Now it only runs in production, consistent with screen.css.

const isProduction = process.env.NODE_ENV === 'production';

export default {
    plugins: [
        // Sort and combine duplicate media queries.
        // Replaces css-mqpacker({ sort: true }).
        // 'desktop-first' mirrors the sort:true behaviour of css-mqpacker
        // which sorted max-width queries largest-to-smallest.
        // Change to 'mobile-first' if your SCSS is mobile-first.
        (await import('postcss-sort-media-queries')).default({
            sort: 'desktop-first',
        }),

        // Add vendor prefixes based on Browserslist config (see package.json)
        (await import('autoprefixer')).default(),

        // Minify — production only (was incorrectly always-on for print/editor
        // in the old Grunt config)
        ...(isProduction
            ? [
                (await import('cssnano')).default({
                    preset: ['default', {
                        discardComments: { removeAll: true },
                    }],
                }),
            ]
            : []),
    ],
};
