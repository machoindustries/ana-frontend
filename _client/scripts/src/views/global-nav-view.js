import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import $ from 'jquery';
import GTMHelper from 'modules/gtm-helper';

class GlobalNavView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            linkSelector: '[data-global-nav-link]',
        };
    }

    initChildren() {
        this.$links = this.$el.find(this.options.linkSelector);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$links.on('click', (e) => {
            const $elem = $(e.currentTarget);

            this.gtmHelper.customUserData();

            const label = GTMUtils.getGtmValueFromElement($elem, 'label');

            globalEmitter.emit('gtm.site-mainnav', { action: 'Header Navigation', label });
        });
    }
}

export default () => {
    return new GlobalNavView();
};
