import BaseComponent from 'components/base-component';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddressComponent from 'components/address-component';
import AddUpdateAddressComponent from 'components/add-update-address-component';
import APIProxy from 'modules/api-proxy';

class CheckoutAddressView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                addressComponent: '[data-address-panel]',
                form: 'form',
                formField: '[data-formfield]',
                addAddressComponent: '[data-address-add]',
                editAddressComponent: '[data-address-edit]',
                editAddressConfirmComponent: '[data-address-edit-confirm]',
                editAddressConfirmComponentyes: '[data-address-edit-confirm-yes]',
                addressDropdown: '[data-address-select]',
                addressesSame: '[data-addresses-same]',
                addressPanel: '[data-address-panel]',
                inputContainer: '[data-formfield]',
                addressOutput: '[data-address-output]',
                lightboxHeading: '[data-lightbox-heading]',
                addressLineInputs: {
                    addressId: '[data-address-input-address-id]',
                    name: '[data-address-input-name]',
                    address1: '[data-address-input-address-1]',
                    address2: '[data-address-input-address-2]',
                    address3: '[data-address-input-address-3]',
                    city: '[data-address-input-city]',
                    state: '[data-address-input-state]',
                    country: '[data-address-input-country]',
                    zipCode: '[data-address-input-zipcode]',
                    phone1: '[data-address-input-phone-1]',
                    phone2: '[data-address-input-phone-2]',
                    defaultBillingAddress: '[data-address-input-default-billing]',
                    defaultShippingAddress: '[data-address-input-default-shipping]',
                },
            },
            modalInnerClass: 'e-modal__content',
            modalAdditionalClass: '',
            addressIdentifierProp: 'addressId', // name of clientside key in address lines data which is used to identify the address
            addressSummaryProp: 'name', // name of clientside key in address lines data which is displayed in the dropdown
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
            booleanAddressLineInputs: [
                'defaultBillingAddress',
                'defaultShippingAddress',
            ],
            lightboxEditSrcName: 'addressedit',
            lightboxHeadingSourceAttr: 'data-lightbox-title',
            lightboxEditConfirmSrcName: 'editaddressconfirm',
            disabledClass: 'is--disabled',
            addressTypeAttr: 'data-address-type',
            addressTypes: {
                billing: 'billing',
                shipping: 'shipping',
            },
            defaultAddressType: 'billing',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.actingShippingAddress = false; // Only applies in Billing address instances

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.$addressDropdown = this.$el.find(this.options.selectors.addressDropdown);
        this.$addressDropdownContainer = this.$addressDropdown.closest(this.options.selectors.inputContainer);
        this.$addressesSame = this.$el.find(this.options.selectors.addressesSame);
        this.$addressPanel = this.$el.find(this.options.selectors.addressPanel);
        this.storedAddresses = [];
        this.mostRecentNewlyAddedAddressData = { addressId: null, addedFromType: null };

        this._assignAddressType();

        this.addressComponent = new AddressComponent();
        this.addressComponent.init(this.$el.find(this.options.selectors.addressComponent), {});
        this.addAddressComponent = new AddUpdateAddressComponent('add', this.addressType, this.options.lightboxEditSrcName);
        this.editAddressComponent = new AddUpdateAddressComponent('edit', this.addressType, this.options.lightboxEditSrcName);
        this.addAddressComponent.init(this.$el.find(this.options.selectors.addAddressComponent), {});
        this.editAddressComponent.init(this.$el.find(this.options.selectors.editAddressComponent), {});

        this.isbillingandshippingaddresssame = false;

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        this.$addressDropdown.on('change', this._dropdownSelect.bind(this));
        this.$addressesSame.on('change', this._addressesSameChange.bind(this));
        this.$el.find('[data-address-edit-confirm]').on('click', this._triggerClick.bind(this));
        // DEBUG
        this.$el.find('[data-debug-resend-current-address]').on('click', () => {
            this._sendShippingAddressToServer();
        });

        globalEmitter.on('addupdateaddress:dataupdated', this._onAddressDataUpdated.bind(this));
        globalEmitter.on('addupdateaddress:addednew', this._onNewAddressAdded.bind(this));
        globalEmitter.on('checkoutaddress:addressessame', this._onAddressesSame.bind(this));
        globalEmitter.on('checkoutaddress:addressesdifferent', this._onAddressesDifferent.bind(this));

        this._getSavedAddresses();
    }
    _triggerClick(e) {
        e.preventDefault();
        this._openModal();
    }


    _openModal() {
        const self = this;

        $.magnificPopup.instance.close();


        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxEditConfirmSrcName]),
                type: 'inline',
            },
            callbacks: {

                open() {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');
                        lightboxUtils.bindOpenModalButtons();
                        self._onModalOpened($(this.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        $modalContent.find('[data-address-edit-confirm-yes]').on('click', this._onconfirmyesclick.bind(this));
        $modalContent.find('[data-address-edit-confirm-no]').on('click', this._onconfirmynoclick.bind(this));
    }
    _onconfirmyesclick(e) {
        e.preventDefault();
        $.magnificPopup.instance.close();
        this.editAddressComponent._openModal();
    }

    _onconfirmynoclick(e) {
        e.preventDefault();
        $.magnificPopup.instance.close();
        console.log(`_IsSameAddressBillingAndShipping : ${ this.isbillingandshippingaddresssame}`);
        if (this.isbillingandshippingaddresssame === true) {
            this.addAddressComponent._openModal();
        } else {
            this.editAddressComponent._openModal();
        }
    }


    _assignAddressType() {
        this.addressType = this.options.defaultAddressType;

        const addressTypeKey = this.$el.attr(this.options.addressTypeAttr);

        if (Object.hasOwn(this.options.addressTypes, addressTypeKey)) {
            this.addressType = this.options.addressTypes[addressTypeKey];
        }
    }

    _storeAddress(addressObjectFromServer) {
        const convertedJSON = Utils.convertJSONKeysServerToClient(JSON.stringify(addressObjectFromServer), this.options.clientServerKeyMappings);

        this.storedAddresses.push(JSON.parse(convertedJSON));
    }

    _addressesSameChange() {
        if (this.$addressesSame.is(':checked')) {
            this.$addressPanel.hide();
            globalEmitter.emit('checkoutaddress:addressessame', this);
        } else {
            this.$addressPanel.show();
            globalEmitter.emit('checkoutaddress:addressesdifferent', this);
            this._outputSelectedAddressDetails();
        }
    }

    _onAddressDataUpdated() {
        this._getSavedAddresses();
    }

    _onNewAddressAdded(addedAddressData) {
        this.mostRecentNewlyAddedAddressData.addressId = addedAddressData.addressId.toString();
        this.mostRecentNewlyAddedAddressData.addedFromType = addedAddressData.addedFromType.toString();
    }

    _onAddressesSame() {
        if (this.addressType === this.options.addressTypes.billing) { // Assumes exactly 1x shipping and 1x billing instance on page
            this.actingShippingAddress = true;
            this._sendShippingAddressToServer();
        }
    }

    _onAddressesDifferent() {
        if (this.addressType === this.options.addressTypes.billing) { // Assumes exactly 1x shipping and 1x billing instance on page
            this.actingShippingAddress = false;
        }
    }

    _getSavedAddresses() {
        this.loadingSpinner.request(`${this.guid}-_getSavedAddresses`);

        const self = this;

        APIProxy.request({
            api: 'getAddresses',
            success: (data) => {
                self.addAddressComponent.setCountryData(data.Countries);
                self.editAddressComponent.setCountryData(data.Countries);

                self._populateSavedAddresses(data.Addresses);
                self._IsSameAddressBillingAndShipping(data.Addresses);
                this.loadingSpinner.release(`${this.guid}-_getSavedAddresses`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getSavedAddresses`);
            },
        });
    }

    _populateSavedAddresses(addressesData) {
        let savedAddressesHtml = '';
        this.storedAddresses.length = 0;

        for (let a = 0; a < addressesData.length; a++) {
            this._storeAddress(addressesData[a]);
        }

        for (let sa = 0; sa < this.storedAddresses.length; sa++) {
            const address = this.storedAddresses[sa];
            const addressId = address[this.options.addressIdentifierProp];
            const addressSummary = address[this.options.addressSummaryProp];
            let selectedAttr = '';

            if (this.addressType === this.options.addressTypes.billing && address.defaultBillingAddress) {
                selectedAttr = ' selected=""';
            }

            if (this.addressType === this.options.addressTypes.shipping && address.defaultShippingAddress) {
                selectedAttr = ' selected=""';
            }

            savedAddressesHtml = `${savedAddressesHtml }<option class="e-form__input e-form__input--option" value="${addressId}"${selectedAttr}>${addressSummary}, ${this.storedAddresses[sa].address1}, ${this.storedAddresses[sa].city}, ${this.storedAddresses[sa].state}, ${this.storedAddresses[sa].zipCode}</option>`;
        }

        this.$addressDropdown.html(savedAddressesHtml);
        
        if (this.storedAddresses.length > 0) {
            this.$addressDropdownContainer.show();
        } else {
            this.$addressDropdownContainer.hide();
        }

        this._outputSelectedAddressDetails();
        this._autoSelectNewlyAddedAddress();
    }

    _IsSameAddressBillingAndShipping(addressesData) {
        this.storedAddresses.length = 0;

        for (let a = 0; a < addressesData.length; a++) {
            this._storeAddress(addressesData[a]);
        }
        let billAddress = '';
        let shipAddress = '';
        for (let sa = 0; sa < this.storedAddresses.length; sa++) {
            const address = this.storedAddresses[sa];
            if (address.defaultBillingAddress) {
                billAddress = address;
            }

            if (address.defaultShippingAddress) {
                shipAddress = address;
            }
        }

        if (billAddress !== null && billAddress !== undefined && shipAddress !== null && shipAddress !== undefined) {
            if (billAddress[this.options.addressIdentifierProp] === shipAddress[this.options.addressIdentifierProp]) {
                this.isbillingandshippingaddresssame = true;
            }
        }
    }

    _clearAddressOutputs() {
        const keys = Object.keys(this.$addressLineOutputs);

        for (let k = 0; k < keys.length; k++) {
            this.$addressLineOutputs[keys[k]].html('').hide();
        }

        const hKeys = Object.keys(this.$addressLineHiddenOutputs);

        for (let hk = 0; hk < hKeys.length; hk++) {
            this.$addressLineHiddenOutputs[hKeys[hk]].html('').hide();
        }
    }

    _outputSelectedAddressDetails() {
        const $selectedOption = this.$addressDropdown.find('option:selected');

        for (let sa = 0; sa < this.storedAddresses.length; sa++) {
            const address = this.storedAddresses[sa];

            if (address[this.options.addressIdentifierProp].toString() === $selectedOption.val()) {
                this.addressComponent.setData(address);

                this._updateChildComponentAddressData(address);
            }
        }

        this._sendShippingAddressToServer();
    }

    _autoSelectNewlyAddedAddress() {
        setTimeout(() => {
            if (this.mostRecentNewlyAddedAddressData.addressId !== null && this.mostRecentNewlyAddedAddressData.addedFromType === this.addressType) {
                this.$dropdownItems = this.$addressDropdown.find('option');

                this.$dropdownItems.each((idx, elem) => {
                    const $elem = $(elem);

                    if ($elem.val() === this.mostRecentNewlyAddedAddressData.addressId) {
                        this.$addressDropdown.val(this.mostRecentNewlyAddedAddressData.addressId);

                        this._outputSelectedAddressDetails();

                        return;
                    }
                });
            }
        }, 0);
    }

    _sendShippingAddressToServer() {
        if (this.addressType === this.options.addressTypes.shipping || this.actingShippingAddress) {
            const addressJSON = this.addressComponent.getData();

            this.loadingSpinner.request(`${this.guid}-_sendShippingAddressToServer`);

            if (!Object.hasOwn(addressJSON, 'addressId')) {
                return;
            }

            APIProxy.request({
                api: 'applyShippingAddress',
                queryData: {
                    shippingAddressId: addressJSON.addressId,
                },
                success: () => {
                    globalEmitter.emit('shippingaddress:applied', this);

                    this.loadingSpinner.release(`${this.guid}-_sendShippingAddressToServer`);
                },
                error: () => {
                    this.loadingSpinner.release(`${this.guid}-_sendShippingAddressToServer`);
                },
            });
        }
    }

    _updateChildComponentAddressData(data) {
        this.editAddressComponent.setData(data);
    }

    _dropdownSelect() {
        this._outputSelectedAddressDetails();
    }
}

export default () => {
    return new CheckoutAddressView();
};
