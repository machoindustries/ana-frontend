import ThirdPartyUtils from '../../lib/third-party-utils';

class Utils {

    // Returns a min-width media query from supplied min in px
    static getMediaQueryMin (min) {
        return `screen and (min-width: ${ min }px)`;
    }

    // Returns a max-width media query from supplied max in px
    static getMediaQueryMax (max) {
        return `screen and (max-width: ${ max }px)`;
    }

    // Returns a min-width and max-width media query from supplied min and max in px
    static getMediaQueryMinMax (min, max) {
        return `screen and (min-width: ${ min }px) and (max-width: ${ max }px)`;
    }

    static valueOrDefault (val, defaultVal) {
        return typeof val != 'undefined' ? val : defaultVal;
    }

    static capNumberToRange (number, min, max) {
        return Math.max(min, Math.min(number, max));
    }

    static mapServerKeyToClientKey (clientsideKey, serverClientKeyMappings) {

        for (const serverKey in serverClientKeyMappings) {
            if (Object.hasOwn(serverClientKeyMappings, serverKey)) {

                const cKey = serverClientKeyMappings[serverKey];

                if (cKey === clientsideKey) {

                    return serverKey;
                }
            }
        }

        return null;
    }

    static replaceAllInstancesOfSubstring (str, search, replacement) {

        return str.replace(new RegExp(`"${search}":`, 'g'), `"${replacement}":`);
    }

    static mapClientKeyToServerKey (serversideKey, serverClientKeyMappings) {

        if (Object.hasOwn(serverClientKeyMappings, serversideKey)) {

            return serverClientKeyMappings[serversideKey];
        }

        return null;
    }

    static convertJSONKeys (jsonString, keyMappings, fromKeyToProp) {
        let TheJSONString = jsonString;
        for (const key in keyMappings) {
            if (Object.hasOwn(keyMappings, key)) {

                TheJSONString = fromKeyToProp ?
                                this.replaceAllInstancesOfSubstring(TheJSONString, key, keyMappings[key]) :
                                this.replaceAllInstancesOfSubstring(TheJSONString, keyMappings[key], key);
            }
        }

        return TheJSONString;
    }

    // Converts a JSON string's property keys from clientside convention to serverside convention, according to the supplied mapping object
    // NOTE - key mapping properties are always in the format { clientKey: 'serverKey' }
    static convertJSONKeysClientToServer (jsonString, keyMappings) {

        return this.convertJSONKeys(jsonString, keyMappings, true);
    }

    // As above, but converts serverside keys to clientside equivalents.
    static convertJSONKeysServerToClient (jsonString, keyMappings) {

        return this.convertJSONKeys(jsonString, keyMappings, false);
    }

    static getCurrentHref () {

        let href = window.location.href;

        href = href.replace('#', '');

        return href[href.length - 1] !== '/' ? `${href}/` : href;
    }

    // From https://stackoverflow.com/a/2117523/1279816
    static generateGUID () {

        const crypto = window.crypto || window.msCrypto;

        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) => {return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);});
    }

    static getJqxhrErrorContent (jqxhr) {

        let content = '';

        if (Object.hasOwn(jqxhr, 'responseJSON')) {

            if (Object.hasOwn(jqxhr.responseJSON, 'Messages')) {

                jqxhr.responseJSON.Messages.forEach((item) => { content += item; });

            } else {

                content = jqxhr.responseJSON.Status;
            }

            return content;
        }
        else if (Object.hasOwn(jqxhr, 'responseText')) {

            content = jqxhr.responseText;
        }

        return content;
    }
    
    static handleAjaxError(jqxhr, options = {}) {
    const { displayEl = null, context = 'Unknown' } = options;

    const message = Utils.getJqxhrErrorContent(jqxhr);

    // Developer logging — always fires
    console.error(`[ANA] AJAX error in ${context}:`, {
        status: jqxhr.status,
        message,
        url: jqxhr.url || '(unknown)',
    });

    // App Insights — no-op guard until SDK is wired up
    // TODO: CMS 13 — replace window.appInsights check with proper SDK import once App Insights JS SDK is added
    if (window.appInsights) {
        window.appInsights.trackException({
            exception: new Error(`AJAX error in ${context}: ${message}`),
            properties: { status: jqxhr.status, context, message },
        });
    }

    // User-facing display — inject message into supplied element
    if (displayEl && message) {
        $(displayEl).text(message).show();
    }
}
}

Utils.debounce = ThirdPartyUtils.debounce;
Utils.throttle = ThirdPartyUtils.throttle;

export default Utils;