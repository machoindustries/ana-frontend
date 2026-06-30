import BaseComponent from 'components/base-component';
import AddressComponent from 'components/address-component';
import AddUpdateAddressComponent from 'components/add-update-address-component';
import RemoveAddressComponent from 'components/remove-address-component';

class AccountAddressView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                displayComponent: '[data-address-panel]',
                editComponent: '[data-address-edit]',
                removeComponent: '[data-address-remove]',
                addressLineOutputs: {
                    name: '[data-address-output-name]',
                    address1: '[data-address-output-address-1]',
                    address2: '[data-address-output-address-2]',
                    address3: '[data-address-output-address-3]',
                    city: '[data-address-output-city]',
                    state: '[data-address-output-state]',
                    country: '[data-address-output-country]',
                    zipCode: '[data-address-output-zipcode]',
                    phone1: '[data-address-output-phone-1]',
                    phone2: '[data-address-output-phone-2]',
                },
            },
            lightboxEditSrcName: 'addressedit',
        };
    }

    initChildren() {
        this.displayComponent = new AddressComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdateAddressComponent('edit', '', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.removeComponent = new RemoveAddressComponent();
        this.removeComponent.init(this.$el.find(this.options.selectors.removeComponent), {});
    }

    _populateData() {
        this.displayComponent.setData(this.data);
        this.editComponent.setData(this.data);
        this.editComponent.setCountryData(this.countryData);

        if (this.data.defaultBillingAddress || this.data.defaultShippingAddress) {
            this.removeComponent.deactivate();
        }
    }

    setData(addressData, countryData) {
        this.data = addressData;
        this.countryData = countryData;

        this._populateData();

        this.removeComponent.setData(addressData);
    }
}

export default (addressData) => {
    return new AccountAddressView(addressData);
};
