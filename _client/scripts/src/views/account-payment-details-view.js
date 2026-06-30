import BaseComponent from 'components/base-component';
import AccountPaymentDetailsItemView from 'views/account-payment-details-item-view';
import LoadingSpinner from 'modules/loading-spinner';
import Utils from 'modules/utils';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import APIProxy from 'modules/api-proxy';

class AccountPaymentDetailsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                list: '[data-account-payment-details-items]',
                noResults: '[data-account-payment-details-no-results]',
            },
            clientServerKeyMappings: {
                id: 'Id',
                displayText: 'DisplayText',
                displayNumber: 'DisplayNumber',
                isExpired: 'IsExpired',
            },
            viewAttr: 'data-payment-details-item-view',
            typeOutputAttr: 'data-payment-details-item-output-type',
            descriptionOutputAttr: 'data-payment-details-item-output-description',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);

        this.data = [];
        this.itemViewInstances = [];

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('removepayment:dataupdated', this._onDataUpdated.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        const self = this;

        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        APIProxy.request({
            api: 'getPaymentDetails',
            success: (data) => {
                self._storeData(data);
                self._populateData();
                self._showHide();

                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
            error: (jqxhr, status) => {
                this.data.length = 0;
                this._showHide();

                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);

                console.log('ERROR: account-payment-details-view.js : No payment methods were found.');
            },
        });
    }

    _storeData(data) {
        this.data.length = 0;

        for (let pm = 0; pm < data.length; pm++) {
            const convertedJSON = Utils.convertJSONKeysServerToClient(JSON.stringify(data[pm]), this.options.clientServerKeyMappings);

            this.data.push(JSON.parse(convertedJSON));
        }
    }

    _populateData() {
        let itemsHtml = '';

        for (let pm = 0; pm < this.data.length; pm++) {
            itemsHtml = itemsHtml + this._getItemHtml(this.data[pm]);
        }

        this.$list.html(itemsHtml);

        setTimeout(() => {
            this._instantiateItemViews();

            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
    }

    _showHide() {
        if (this.data.length > 0) {
            this.$noResults.hide();
            this.$list.show();
        } else {
            this.$list.hide();
            this.$noResults.show();
        }
    }

    _instantiateItemViews() {
        this.itemViewInstances.length = 0;

        const $itemViews = this.$list.find(`[${this.options.viewAttr}]`);

        if ($itemViews.length !== this.data.length) {
            console.log('ERROR: account-payment-details-view.js : numnber of views in DOM does not reflect number of stored payment methods.');
            return;
        }

        for (let pm = 0; pm < this.data.length; pm++) {
            const instance = new AccountPaymentDetailsItemView();

            instance.init($($itemViews[pm]), {});

            instance.setData(this.data[pm]);

            this.itemViewInstances.push(instance);
        }
    }

    _getItemHtml(data) {
        return `<div class="grid__item one-whole medium--one-half">
                    <div class="e-account-payment-details-item" ${this.options.viewAttr} data-payment-details-item-id="${data.id}">
                        <div class="e-account-payment-details-item__type" ${this.options.typeOutputAttr}>Credit Card</div>
                        <div class="e-account-payment-details-item__details">
                            <span class="e-account-payment-details-item__details-cardnumber" ${this.options.descriptionOutputAttr}>${data.displayText}</span>
                        </div>
                        <div class="e-account-payment-details-item__controls">
                            <a href="#" class="e-account-payment-details-item__controls-remove" data-account-payment-details-item-remove="">Remove</a>
                        </div>
                    </div>
                </div>`;
    }
}

export default () => {
    return new AccountPaymentDetailsView();
};
