import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import $ from 'jquery';
import GTMHelper from 'modules/gtm-helper';

class HeaderToolsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                ctas: '[data-header-tools-cta]',
            },
        };
    }

    initChildren() {
        this.$ctas = this.$el.find(this.options.selectors.ctas);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this._bindGtm();
    }

    _bindGtm() {
        this.$ctas.on('click', (e) => {
            const $elem = $(e.currentTarget);

            this.gtmHelper.customUserData();

            let label = GTMUtils.getGtmValueFromElement($elem, 'label');

            if (label === GTMUtils.getFallbackValue()) {
                label = $elem.text().trim();
            }

            globalEmitter.emit('gtm.site-headerctaclick', { label });
        });
    }
}

export default () => {
    return new HeaderToolsView();
};
