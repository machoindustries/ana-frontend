import BaseComponent from './base-component';
import globalEmitter from '../modules/global-emitter';
import * as gtmConfig from './gtm-config';

class GoogleTagManagerComponent extends BaseComponent {
    constructor() {
        super();

        this.state = { };

        this.defaultOptions = {
        };

        window.dataLayer = window.dataLayer || [];
    }

    initChildren() {
    }

    addListeners() {
        if (!window.dataLayer) {
            return;
        }


        // Bind Checkout page events
        for (const eventType of gtmConfig.checkout) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendEvent, { eventName });
        }

        // Bind Global page events
        for (const eventType of gtmConfig.site) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendEvent, { eventName });
        }

        // Bind Social events
        for (const eventType of gtmConfig.social) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendEvent, { eventName });
        }

        // Bind Enhanced eCommerce events
        for (const eventType of gtmConfig.eCommerce) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendEnhancedEcommerceEvent, { eventName });
        }

        // Bind custom dimensions events
        for (const eventType of gtmConfig.customDimensions) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendCustomDimensionEvent, { eventName });
        }

        // Bind taxonomy events
        for (const eventType of gtmConfig.taxonomy) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendCustomDimensionEvent, { eventName });
        }

        // Bind purchaseDetails events
        for (const eventType of gtmConfig.purchaseDetails) {
            const eventName = eventType.eventName;
            globalEmitter.on(`gtm.${ eventName }`, this._sendCustomDimensionEvent, { eventName });
        }
    }

    _sendEvent(data) {
        // console.log(`_sendEvent - data: ${data}`);

        const eventName = this.eventName;
        let pageName = eventName.split('-');
        let eventDetails = '';
        const lowDataLayer = {
            url: window.location.href,
            pagename: document.title,
        };

        if (pageName.length <= 0) {
            console.error(`event name not found for ${ eventName }`);
            return;
        }

        pageName = pageName[0];

        for (const eventType of gtmConfig[pageName]) {
            const currentEventName = eventType.eventName;

            if (eventName === currentEventName) {
                eventDetails = eventType.eventDetails;
            }
        }

        if (typeof eventDetails === 'undefined') {
            console.error(`event details not found for ${ eventName }`);
            return;
        }

        if (pageName === 'social') {
            lowDataLayer.event = eventDetails.event;
            lowDataLayer.gaSocialNetwork = data.gaSocialNetwork;
            lowDataLayer.gaSocialTarget = data.gaSocialTarget;
            lowDataLayer.gaSocialAction = data.gaSocialAction;
        } else {
            lowDataLayer.event = eventDetails.eventClass === '$dynamic$' ? data.eventClass : eventDetails.eventClass;
            lowDataLayer.category = eventDetails.category === '$dynamic$' ? data.category : eventDetails.category;
            lowDataLayer.action = eventDetails.action === '$dynamic$' ? data.action : eventDetails.action;
            lowDataLayer.label = eventDetails.label === '$dynamic$' ? data.label : eventDetails.label;
        }

        window.dataLayer.push(lowDataLayer);
    }

    _sendEnhancedEcommerceEvent(data) {
        window.dataLayer.push(data);
    }

    _sendCustomDimensionEvent(data) {
        window.dataLayer.push(data);
    }
}

export default () => {
    return new GoogleTagManagerComponent();
};
