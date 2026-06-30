import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import GTMHelper from 'modules/gtm-helper';

class FeaturedContentView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                cta: '[data-featured-content-cta]',
            },
        };
    }

    initChildren() {
        this.$cta = this.$el.find(this.options.selectors.cta);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$cta.on('click', this._sendGTM.bind(this));
    }

    _sendGTM() {
        this.gtmHelper.customUserData();

        const label = GTMUtils.getGtmValueFromElement(this.$el, 'label');

        globalEmitter.emit('gtm.site-featuredcontentclick', { label });
    }
}

export default () => {
    return new FeaturedContentView();
};
