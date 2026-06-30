import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import jitRequire from 'modules/jit-require';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import GTMHelper from 'modules/gtm-helper';
import APIProxy from 'modules/api-proxy';

class AddUpdateAddressComponent extends BaseComponent {
    constructor(instanceType, parentAddressType, lightboxSrcName) {
        super();

        this.defaultOptions = {
            instanceType,
            instanceTypes: {
                add: 'add',
                edit: 'edit',
            },
            parentAddressType,
            parentAddressTypes: {
                billing: 'billing',
                shipping: 'shipping',
            },
            selectors: {
                form: 'form',
                formField: '[data-formfield]',
                lightboxHeading: '[data-lightbox-heading]',
                lineInputs: {
                    addressId: '[data-address-input-address-id]',
                    name: '[data-address-input-name]',
                    address1: '[data-address-input-address-1]',
                    address2: '[data-address-input-address-2]',
                    address3: '[data-address-input-address-3]',
                    city: '[data-address-input-city]',
                    state: '[data-address-input-state]',
                    labelState: '[data-address-label-state]',
                    canState: '[data-address-input-can-state]',
                    canLabelState: '[data-address-label-can-state]',
                    country: '[data-address-input-country]',
                    zipCode: '[data-address-input-zipcode]',
                    phone1: '[data-address-input-phone-1]',
                    phone2: '[data-address-input-phone-2]',
                    defaultBillingAddress: '[data-address-input-default-billing]',
                    defaultShippingAddress: '[data-address-input-default-shipping]',
                },
                errorText: '[data-error-text]',
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add new address',
                edit: 'Edit address',
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
            booleanLineInputs: [
                'defaultBillingAddress',
                'defaultShippingAddress',
            ],
            disabledClass: 'is--disabled',
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-address-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
        }
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.data = {};
        this.countryData = {};
        this.loadingSpinner = new LoadingSpinner();

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this.lightboxHeadingText = this.options.lightboxHeadingText[this.options.instanceType];
    }

    addListeners() {
        this.$el.on('click', this._triggerClick.bind(this)); // NB - root element needs to be the button clicked to trigger the action
    }

    _onFilterCountry(e, label, canLabel) {
        const val = e.target.options[e.currentTarget.selectedIndex].value;

        if (val === 'USA') {
            label.show();
            canLabel.hide();
        } else if (val === 'CAN') {
            label.hide();
            canLabel.show();
        } else {
            label.hide();
            canLabel.hide();
        }
    }

    _triggerClick(e) {
        e.preventDefault();

        this._openModal();
    }

    _openModal() {
        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxSrcName]),
                type: 'inline',
            },
            callbacks: {
                open() {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        self._onModalOpened($(this.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onModalOpened($modalContent) {
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        const label = $modalContentInner.find(this.options.selectors.lineInputs.labelState);
        const canLabel = $modalContentInner.find(this.options.selectors.lineInputs.canLabelState);

        $modalContentInner.find(this.options.selectors.lineInputs.country).on('change', (e) => {
            this._onFilterCountry(e, label, canLabel);
        });
        lightboxUtils.bindOpenModalButtons();
        switch (this.options.instanceType) {
        case this.options.instanceTypes.add:

            this._populateAdd($modalContentInner);

            break;

        case this.options.instanceTypes.edit:

            this._populateEdit($modalContentInner);

            break;

        default:
            break;
        }

        jitRequire($modalContentInner[0]);

        $modalContentInner.find(this.options.selectors.form).on('validsubmit', (e) => {
            this._addUpdateAction(e, $modalContent, $modalContentInner);
        });
    }

    _populateAdd($modalContentInner) {
        this._populateCountryOptions($modalContentInner.find(this.options.selectors.lineInputs.country));

        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
        $modalContentInner.find(this.options.selectors.lineInputs.labelState).show();
        $modalContentInner.find(this.options.selectors.lineInputs.canLabelState).hide();
    }

    _populateEdit($modalContentInner) {
        this._populateCountryOptions($modalContentInner.find(this.options.selectors.lineInputs.country));

        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);

        for (const key in this.options.selectors.lineInputs) {
            if (Object.hasOwn(this.options.selectors.lineInputs, key) && Object.hasOwn(this.data, key)) {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).val(this.data[key]);
            }
        }

        $modalContentInner.find(this.options.selectors.lineInputs.addressId).val(this.data.addressId);

        const $defaultBillingAddressInput = $modalContentInner.find(this.options.selectors.lineInputs.defaultBillingAddress);
        const $defaultShippingAddressInput = $modalContentInner.find(this.options.selectors.lineInputs.defaultShippingAddress);

        $defaultBillingAddressInput.prop('checked', this.data.defaultBillingAddress);
        $defaultShippingAddressInput.prop('checked', this.data.defaultShippingAddress);


        $defaultBillingAddressInput.prop('disabled', this.data.defaultBillingAddress);
        $defaultShippingAddressInput.prop('disabled', this.data.defaultShippingAddress);

        if (this.data.defaultBillingAddress) {
            $defaultBillingAddressInput.closest(this.options.selectors.formField).addClass(this.options.disabledClass);
        } else {
            $defaultBillingAddressInput.closest(this.options.selectors.formField).removeClass(this.options.disabledClass);
        }

        if (this.data.defaultShippingAddress) {
            $defaultShippingAddressInput.closest(this.options.selectors.formField).addClass(this.options.disabledClass);
        } else {
            $defaultShippingAddressInput.closest(this.options.selectors.formField).removeClass(this.options.disabledClass);
        }
        const country = this.data.country;

        if (country) {
            if (country === 'USA') {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).show();
                $modalContentInner.find(this.options.selectors.lineInputs.canLabelState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.state).val(this.data.state);
            } else if (country === 'CAN') {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.canLabelState).show();
                $modalContentInner.find(this.options.selectors.lineInputs.canState).val(this.data.state);
            } else {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.canLabelState).hide();
            }
        }
    }

    _populateCountryOptions($dropdown) {
        let optionsHtml = '';

        for (const key in this.countryData) {
            if (Object.hasOwn(this.countryData, key)) {
                optionsHtml = `${optionsHtml }<option class="e-form__input e-form__input--option" value="${key}">${this.countryData[key]}</option>`;
            }
        }

        $dropdown.html(optionsHtml);
    }

    _addUpdateAction(e, $modalContent, $modalContentInner) {
        e.preventDefault();

        const model = {};

        for (const key in this.options.clientServerKeyMappings) {
            if (Object.hasOwn(this.options.clientServerKeyMappings, key)) {
                let inputVal;

                if (this.options.booleanLineInputs.indexOf(key) === -1) {
                    inputVal = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
                } else {
                    inputVal = $modalContentInner.find(this.options.selectors.lineInputs[key]).prop('checked');
                }

                model[this.options.clientServerKeyMappings[key]] = inputVal;
            }
        }

        this.gtmHelper.customUserData();

        if (model.Country !== 'USA' || model.Country !== 'CAN') {
            model.State = null;
        }

        if (model.Country === 'USA') {
            model.State = $modalContentInner.find(this.options.selectors.lineInputs.state).val();
        }

        if (model.Country === 'CAN') {
            model.State = $modalContentInner.find(this.options.selectors.lineInputs.canState).val();
        }

        this.loadingSpinner.request(`${this.guid}-_addUpdateAction`);

        APIProxy.request({
            api: 'addUpdateAddress',
            queryData: {
                addressModel: model,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                if (this.options.instanceType === this.options.instanceTypes.add) {
                    globalEmitter.emit('addupdateaddress:addednew', { addressId: data, addedFromType: this.options.parentAddressType });

                    globalEmitter.emit('gtm.site-accountaddressadd');
                } else {
                    globalEmitter.emit('gtm.site-accountaddressupdate');
                }

                globalEmitter.emit('addupdateaddress:dataupdated', this);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContentInner.find(this.options.selectors.errorText),
                    context: 'AddUpdateAddressComponent._addUpdateAction',
                });
            },
        });
    }

    setData(data) {
        this.data = data;
    }

    setCountryData(data) {
        this.countryData = data;
    }
}

export default (instanceType, parentAddressType, lightboxSrcName) => {
    return new AddUpdateAddressComponent(instanceType, parentAddressType, lightboxSrcName);
};
