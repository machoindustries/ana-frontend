// Removed IE-era polyfills (core-js v2, babel-polyfill, whatwg-fetch,
// match-media, picturefill) — fetch, Promise, Object.assign, responsive
// images, and matchMedia are all baseline in supported browsers.

import windowEventProxy from 'modules/window-event-proxy';
import userAgentDetection from 'modules/user-agent-detection';
import jitRequire from 'modules/jit-require';
import './lib/xhr';

jitRequire(document);
windowEventProxy.init();
userAgentDetection.init();