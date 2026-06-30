import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import APIProxy from 'modules/api-proxy';

class MiniCartView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                itemCountOutput: '[data-mini-cart-item-count]',
            },
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.loadingSpinner = new LoadingSpinner();

        this.$itemCountOutput = this.$el.find(this.options.selectors.itemCountOutput);
    }

    addListeners() {
        globalEmitter.on('orderitem:updated', this._handleOrderItemUpdated.bind(this));
        globalEmitter.on('orderitem:changed', this._handleOrderItemUpdated.bind(this));
        globalEmitter.on('orderitem:removed', this._handleOrderItemRemoved.bind(this));
    }

    _handleOrderItemUpdated() {
        this._updateItemCount();
    }

    _handleOrderItemRemoved() {
        this._updateItemCount();
    }

    _updateItemCount() {
        this.loadingSpinner.request(`${this.guid}-_updateItemCount`);

        APIProxy.request({
            api: 'getCart',
            success: (data) => {
                this._applyUpdatedItemCount(data);

                this.loadingSpinner.release(`${this.guid}-_updateItemCount`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateItemCount`);
            },
        });
    }

    _applyUpdatedItemCount(data) {
        let count = 0;

        for (let i = 0; i < data.Items.length; i++) {
            count = count + parseInt(data.Items[i].Quantity, 10);
        }

        this.$itemCountOutput.text(count);
        this.$el.attr('title', count.toString());
    }
}

export default () => {
    return new MiniCartView();
};
