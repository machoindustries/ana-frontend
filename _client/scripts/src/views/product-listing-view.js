import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMHelper from 'modules/gtm-helper';

class ProductListingView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                listingItem: '[data-product]',
                itemPDPLink: '[data-product-detail-link]',
            },
        };
    }

    initChildren() {
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this.$listingItems = this.$el.find(this.options.selectors.listingItem);

        globalEmitter.on('productlisting:rebinditems', this._bindEvents.bind(this));
    }

    addListeners() {
        this._bindEvents();
        this._sendGTM();
    }

    _bindEvents() {
        this.$listingItems = this.$el.find(this.options.selectors.listingItem);

        this.$listingItems.each((idx, elem) => {
            const $elem = $(elem);

            $elem.find(this.options.selectors.itemPDPLink).off('click');

            $elem.find(this.options.selectors.itemPDPLink).on('click', (e) => {
                this.gtmHelper.customUserData();

                const data = this.gtmHelper.ecommercePlpClick($elem, document.location.pathname);

                globalEmitter.emit('gtm.ecommerce-plpclick', data);
            });
        });
    }

    _sendGTM() {
        this.gtmHelper.customUserData();

        const data = this.gtmHelper.ecommercePlpImpression(this.$el);

        globalEmitter.emit('gtm.ecommerce-plpimpression', data);
    }
}

export default () => {
    return new ProductListingView();
};
