// jQuery is loaded as a classic global <script> in the Razor layout
// (see Layout.cshtml: <script src="/bundles/jquery"></script>), not as a
// bundled or ES module. This shim lets application code keep writing
// `import $ from 'jquery'` — Vite resolves those imports to this file
// (see resolve.alias in vite.config.js) and, since it's a real local
// module rather than an external package, Rollup inlines it directly
// into the output at build time. No `import` statement for "jquery"
// survives into the compiled bundle, so entry.js and its chunks stay
// loadable as plain classic scripts via loadjs, exactly as before.
export default window.jQuery;
