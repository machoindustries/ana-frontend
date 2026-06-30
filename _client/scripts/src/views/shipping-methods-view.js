import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import LoadingSpinner from 'modules/loading-spinner';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class ShippingMethodsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                shippingMethodButton: '[data-shipping-method-button]',
                shippingMethodContainer: '[data-shipping-method-container]',
            },
            clientServerKeyMappings: {
                id: 'Id',
                isRestricted: 'IsRestricted',
                isFreeShipping: 'IsFreeShipping',
                isSelected: 'IsSelected',
                selectedShippingMethodId: 'SelectedShippingMethodId',
                isBulkPurchaseShipping: 'IsBulkPurchaseShipping'
            },
            restrictedShippingMessageAttr: 'data-restricted-shipping-message',
            freeShippingMessageAttr: 'data-free-shipping-message',
            bulkPurchaseShippingMessageAttr: 'data-bulk-purchase-shipping-message',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.freeShippingMsgShown = false;

        this.$shippingMethodButton = this.$el.find(this.options.selectors.shippingMethodButton);
        this.$shippingMethodContainer = this.$el.find(this.options.selectors.shippingMethodContainer);

        this.loadingSpinner = new LoadingSpinner();

        this.bulkPurchaseMsgShown = false;
    }

    addListeners() {
        globalEmitter.on('shippingaddress:applied', this._handleShippingAddressApplied.bind(this));

        this._rebindShippingMethodButtonClick();
    }

    _rebindShippingMethodButtonClick() {
        this.$shippingMethodButton = this.$el.find(this.options.selectors.shippingMethodButton);

        this.$shippingMethodButton.on('click', (e) => {
            this._shippingMethodButtonClick(e);
        });
    }

    _handleShippingAddressApplied() {
        this._getShippingMethods();
    }

    _updateSelectedShippingMethodId() {
        this.selectedShippingMethodId = this.$shippingMethodButton.filter(':checked').val();
    }

    _shippingMethodButtonClick(e) {
        this._updateSelectedShippingMethodId();
        this._updateShippingMethod();
    }

    _getShippingMethods() {
        this.loadingSpinner.request(`${this.guid}-_getShippingMethods`);

        APIProxy.request({
            api: 'getShippingMethods',
            success: (data) => {
                this._storeData(data);
                this._createShippingMethods();

                this.loadingSpinner.release(`${this.guid}-_getShippingMethods`);

                setTimeout(() => {
                    this._rebindShippingMethodButtonClick();
                }, 0);
            },
            error: (jqxhr, status, err) => {
                console.log('Error', err);
            },
        });
    }

    _storeData(data) {
        const convertedJson = Utils.convertJSONKeysServerToClient(JSON.stringify(data), this.options.clientServerKeyMappings);
        this.data = JSON.parse(convertedJson);
    }

    _allShippingMethodsRestricted() {
        for (const item of this.data) {
            if (!item.isRestricted) {
                return false;
            }
        }

        return true;
    }

    _createShippingMethods() {
        this.freeShippingMsgShown = false;
        this.bulkPurchaseMsgShown = false;
        let html = '';
        this.restrictedCountriesFromData = "";
        if (this._allShippingMethodsRestricted()) {
            const restrictedMsg = this.$el.attr(this.options.restrictedShippingMessageAttr);

            if (this.data[0].isBulkPurchaseShipping && this.data[0].isRestricted) {
                const countriesCount = this.data[0].RestrictedCountries.length;

                console.log(countriesCount);
                if (countriesCount > 0) {
                    for (let d = 0; d < countriesCount; d++) {
                        if (d === 0) {
                            this.restrictedCountriesFromData = this.data[0].RestrictedCountries[d];
                        } else {
                            this.restrictedCountriesFromData = `${this.restrictedCountriesFromData }, ${ this.data[0].RestrictedCountries[d]}`;
                        }
                    }
                }

                console.log(this.restrictedCountriesFromData);
                this.$shippingMethodContainer.html(`<div class="e-shipping-methods__item e-shipping-methods__item--message grid__item one-whole">${restrictedMsg} : ${this.restrictedCountriesFromData} </div>`);

            } else {
                this.$shippingMethodContainer.html(`<div class="e-shipping-methods__item e-shipping-methods__item--message grid__item one-whole">${restrictedMsg}</div>`);
            }
            globalEmitter.emit('shippingmethods:invalid', this);

            return;
        }

        globalEmitter.emit('shippingmethods:valid', this);

        for (const item of this.data) {
            html = html + this._getPopulatedItemHtml(item);
        }

        this.$shippingMethodContainer.html(html);
    }

    _getPopulatedItemHtml(item) {
        let checkedValue = '';

        if (item.isSelected) {
            checkedValue = 'checked';
        }

        const id = item.selectedShippingMethodId + item.id;

        if (item.isRestricted) {
            return '';
        }
        if (item.isRestricted && item.isFreeShipping) {
            return '';
        }
        if (item.isFreeShipping) {
            const freeShippingMsg = this.$el.attr(this.options.freeShippingMessageAttr);

            if (this.freeShippingMsgShown) {
                return '';
            }

            this.freeShippingMsgShown = true;

            return `<div class="e-shipping-methods__item e-shipping-methods__item--message grid__item one-whole">${freeShippingMsg}</div>`;
        }
        if (item.isBulkPurchaseShipping) {
            const bulkPurchaseShippingMsg = this.$el.attr(this.options.bulkPurchaseShippingMessageAttr);

            if (this.bulkPurchaseMsgShown) {
                return '';
            }
            this.bulkPurchaseMsgShown = true;
            return `<div class="e-shipping-methods__item e-shipping-methods__item--message grid__item one-whole">${bulkPurchaseShippingMsg}</div>`;
        }
        return `<div class="e-shipping-methods__item grid__item one-whole small--one-half">
                    <input type="radio" class="e-form__input e-form__input--radio" id="${id}" name="${item.selectedShippingMethodId}" value="${item.id}" title="${item.DisplayName} - ${item.FormattedPrice}" data-validate="" data-validate-required="" data-shipping-method-button ${checkedValue}>
                    <label class="e-form__label e-form__label--radio e-button" for="${id}" data-formfield="" data-shipping-method="${item.id}">
                        <span class="e-form__fake-radio"></span>
                        <span class="e-form__label-text">${item.DisplayName} - ${item.FormattedPrice}</span>
                    </label>
                </div>`;
    }

    _updateShippingMethod() {
        const self = this;

        this.loadingSpinner.request(this);

        APIProxy.request({
            api: 'updateShippingMethod',
            queryString: `?shippingMethodId=${this.selectedShippingMethodId}`,
            success: (data) => {
                this.loadingSpinner.release(this);

                globalEmitter.emit('shippingmethod:updated', self);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(this);
            },
        });
    }
}

export default () => {
    return new ShippingMethodsView();
};
