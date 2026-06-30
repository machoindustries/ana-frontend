import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMHelper from 'modules/gtm-helper';

class JoinPromoView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                cta: '[data-join-promo-cta]',
            },
        };
    }

    initChildren() {
        this.$window = $(window);
        this.$cta = this.$el.find(this.options.selectors.cta);
        this.userHasSeen = false;

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        globalEmitter.on('windowevents:throttledscroll', this._onScroll.bind(this));

        this._checkAndSendInViewGtm();
    }

    addListeners() {
        this.$cta.on('click', this._sendGTM_Click.bind(this));
    }

    _sendGTM_Impression() {
        this.gtmHelper.customUserData();

        const data = this.gtmHelper.ecommercePromoImpression(this.$el);

        globalEmitter.emit('gtm.ecommerce-promoimpression', data);
    }

    _sendGTM_Click() {
        this.gtmHelper.customUserData();

        const data = this.gtmHelper.ecommercePromoClick(this.$el);

        globalEmitter.emit('gtm.ecommerce-promoclick', data);
    }

    _checkAndSendInViewGtm() {
        const scrollTop = this.$window.scrollTop();
        const wndHeight = this.$window.height();
        const elTop = this.$el.offset().top;
        const halfElHeight = this.$el.outerHeight() / 2;

        if (!this.userHasSeen) {
            let seen;

            if (scrollTop > elTop + halfElHeight - wndHeight && scrollTop < elTop + halfElHeight) {
                seen = true;
                this.userHasSeen = true;

                this._sendGTM_Impression();

                const data = this.gtmHelper.customJoinPromoView(seen);

                globalEmitter.emit('gtm.custom-joinpromoview', data);
            }
        }
    }

    _onScroll(e) {
        this._checkAndSendInViewGtm(e);
    }
}

export default () => {
    return new JoinPromoView();
};
