const GTMUtilsOptions = {
    gtmProps: {
        attrs: {
            name: 'data-gtm-event-name',
            category: 'data-gtm-event-category',
            action: 'data-gtm-event-action',
            label: 'data-gtm-event-label'
        },
        fallbackValue: '(not set)'
    }
};

class GTMUtils {

    static getGtmValueFromElement ($elem, propType) {

        let propVal = '';

        if (Object.hasOwn(GTMUtilsOptions.gtmProps.attrs, propType)) {

            propVal = $elem.attr(GTMUtilsOptions.gtmProps.attrs[propType]);
        }

        return typeof propVal !== 'string' || propVal.trim().length === 0 ? GTMUtilsOptions.gtmProps.fallbackValue : propVal.trim();
    }

    static getFallbackValue () {

        return GTMUtilsOptions.gtmProps.fallbackValue;
    }

    static valueOrFallback (val) {

        return typeof val !== 'string' || val.length === 0 ? GTMUtilsOptions.gtmProps.fallbackValue : val;
    }
}

export default GTMUtils;