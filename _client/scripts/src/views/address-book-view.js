import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateAddressComponent from 'components/add-update-address-component';
import AccountAddressView from 'views/account-address-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AddressBookView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                addressList: '[data-address-book-list]',
                addComponent: '[data-address-book-add]',
                accountAddressAttr: 'data-account-address',
            },
            clientServerKeyMappings: {
                addressId: 'AddressId',
                name: 'Name',
                address1: 'Address1',
                address2: 'Address2',
                address3: 'Address3',
                city: 'City',
                state: 'State',
                country: 'Country',
                zipCode: 'ZipCode',
                phone1: 'Phone1',
                phone2: 'Phone2',
                defaultBillingAddress: 'DefaultBillingAddress',
                defaultShippingAddress: 'DefaultShippingAddress',
            },
            lightboxEditSrcName: 'addressedit',
            defaultAddressTitle: {
                billing: 'Default Billing Address',
                shipping: 'Default Shipping Address',
            },
        };

        this.state = {
            defaultShown: {
                billing: false,
                shipping: false,
            },
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$addressList = this.$el.find(this.options.selectors.addressList);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateAddressComponent('add', '', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdateaddress:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('removeaddress:dataupdated', this._onDataUpdated.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        const self = this;

        APIProxy.request({
            api: 'getAddresses',
            success: (data) => {
                this.countryData = data.Countries;

                self.addComponent.setCountryData(this.countryData);

                this._storeData(data.Addresses);
                this._processData();
                this._createList();

                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
        });
    }

    _processData() {
        const tempList = [];
        let defaultBilling = null;
        let defaultShipping = null;

        for (let d = 0; d < this.data.length; d++) {
            const dataItem = this.data[d];

            if (!dataItem.defaultBillingAddress && !dataItem.defaultShippingAddress) {
                tempList.push(dataItem);
            }

            if (dataItem.defaultBillingAddress) {
                defaultBilling = dataItem;
            }

            if (dataItem.defaultShippingAddress) {
                defaultShipping = dataItem;
            }
        }

        this.data.length = 0;

        if (defaultBilling !== null) {
            this.data.push(defaultBilling);
        }

        if (defaultShipping !== null) {
            this.data.push(defaultShipping);
        }

        for (let ti = 0; ti < tempList.length; ti++) {
            this.data.push(tempList[ti]);
        }
    }

    _storeData(data) {
        this.data.length = 0;

        for (let d = 0; d < data.length; d++) {
            this._storeDataItem(data[d]);
        }
    }

    _storeDataItem(dataItem) {
        const convertedJSON = Utils.convertJSONKeysServerToClient(JSON.stringify(dataItem), this.options.clientServerKeyMappings);

        this.data.push(JSON.parse(convertedJSON));
    }

    _createList() {
        this.state.defaultShown.billing = false;
        this.state.defaultShown.shipping = false;

        let addressListHtml = '';

        for (let sa = 0; sa < this.data.length; sa++) {
            addressListHtml = addressListHtml + this._getListItemHtml(this.data[sa]);
        }

        this.$addressList.html(addressListHtml);

        setTimeout(() => {
            this._instantiateItemViews();

            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
    }

    _getListItemHtml(dataItem) {
        return `<div class="grid__item one-whole medium--one-half">
                    ${this._getPopulatedItemHtml(dataItem)}
                </div>`;
    }

    _instantiateItemViews() {
        this.itemViewInstances.length = 0;

        const $itemViews = this.$addressList.find(`[${this.options.selectors.accountAddressAttr}]`);

        if ($itemViews.length !== this.data.length) {
            console.log('ERROR: address-book-view.js : number of views in DOM does not reflect number of stored addresses.');
            return;
        }

        for (let d = 0; d < this.data.length; d++) {
            const instance = new AccountAddressView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data[d], this.countryData);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(details) {
        const additionalClass = details.defaultBillingAddress || details.defaultShippingAddress ? ' c-account__address--default' : '';
        let title = '';

        if (details.defaultBillingAddress && !this.state.defaultShown.billing) {
            title = title + this.options.defaultAddressTitle.billing;
            this.state.defaultShown.billing = true;
        } else if (details.defaultShippingAddress && !this.state.defaultShown.shipping) {
            title = title + this.options.defaultAddressTitle.shipping;
            this.state.defaultShown.shipping = true;
        }

        const titleHtml = title !== '' ? `<h4 class="c-account__subtitle">${title}</h4>` : '';

        return `<div class="c-account__address${additionalClass}" ${this.options.selectors.accountAddressAttr}>
                    <div class="c-account__address-content">
                        ${titleHtml}
                        <div class="c-account-address">
                            <div data-address-output="">
                                <div class="c-address">
                                    <ul class="c-address__address">
                                        <li class="c-address__address-item" data-address-output-name=""></li>
                                        <li class="c-address__address-item" data-address-output-address-1=""></li>
                                        <li class="c-address__address-item" data-address-output-address-2=""></li>
                                        <li class="c-address__address-item" data-address-output-address-3=""></li>
                                        <li class="c-address__address-item" data-address-output-city=""></li>
                                        <li class="c-address__address-item" data-address-output-state=""></li>
                                        <li class="c-address__address-item" data-address-output-country=""></li>
                                        <li class="c-address__address-item" data-address-output-zipcode=""></li>
                                        <li class="c-address__address-item c-address__address-item--push" data-address-output-phone-1=""></li>
                                        <li class="c-address__address-item" data-address-output-phone-2=""></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="c-account-address__controls">
                                <a href="#" class="c-account-address__control" data-address-remove="">Remove</a>
                                <a href="#" class="c-account-address__control" data-address-edit="">edit</a>
                            </div>
                        </div>
                    </div>
                </div>`;
    }
}

export default () => {
    return new AddressBookView();
};
