import BaseComponent from 'components/base-component';
import GTMHelper from 'modules/gtm-helper';
import globalEmitter from 'modules/global-emitter';

class ProductDetailView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {};
    }

    initChildren() {
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this._sendGTM();
    }

    addListeners() {


    }

    _sendGTM() {
        this.gtmHelper.customUserData();

        const data = this.gtmHelper.ecommercePdpImpression(this.$el);

        globalEmitter.emit('gtm.ecommerce-pdpimpression', data);
    }
}

export default () => {
    return new ProductDetailView();
};
