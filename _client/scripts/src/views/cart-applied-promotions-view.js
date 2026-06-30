import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import APIProxy from 'modules/api-proxy';

class CartAppliedPromotionsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                list: '[data-applied-promotions-list]',
            },
            activeClass: 'is--visible',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.data = [];

        this.$list = this.$el.find(this.options.selectors.list);

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('orderitem:updated', this._handleCartItemUpdated.bind(this));
        globalEmitter.on('orderitem:removed', this._handleOrderItemRemoved.bind(this));
    }

    _handleCartItemUpdated() {
        this._updateFromCartData();
    }

    _handleOrderItemRemoved() {
        this._updateFromCartData();
    }

    _updateFromCartData() {
        this.loadingSpinner.request(`${this.guid}-_updateFromCartData`);

        APIProxy.request({
            api: 'getCart',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_updateFromCartData`);

                this._saveAppliedPromotions(data.PromotionDetails);
                this._updateAppliedPromotionsHtml();
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateFromCartData`);

                this.$el.removeClass(this.options.activeClass);

                console.log(`ERROR: cart-summary-view : failed to get cart data. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _saveAppliedPromotions(promotionsData) {
        this.data = promotionsData;
    }

    _updateAppliedPromotionsHtml() {
        const listHtml = this.data.map((p) => {
            return `<li><span>${p}</span></li>`;
        }).join('');

        this.$list.html(listHtml);

        if (this.data.length > 0) {
            this.$el.addClass(this.options.activeClass);
        } else {
            this.$el.removeClass(this.options.activeClass);
        }
    }
}

export default () => {
    return new CartAppliedPromotionsView();
};
