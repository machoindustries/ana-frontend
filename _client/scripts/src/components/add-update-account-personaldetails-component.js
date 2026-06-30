import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import jitRequire from 'modules/jit-require';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class AddUpdateCusCommunication extends BaseComponent {
    constructor(instanceType, lightboxSrcName) {
        super();

        this.defaultOptions = {
            instanceType,
            instanceTypes: {
                add: 'add',
                edit: 'edit',
            },
            selectors: {
                form: 'form',
                lightboxHeading: '[data-lightbox-heading]',
                lineInputs: {
                    phoneType: '[data-account-personaldetails-type]',
                    locationType: '[data-account-personaldetails-location-type]',
                    countryCode: '[data-account-personaldetails-country]',
                    phoneExtension: '[data-account-personaldetails-phone-extension]',
                    phoneAreaCode: '[data-account-personaldetails-phone-area-code]',
                    phoneNumber: '[data-account-personaldetails-phone-number]',
                    isPrimary: '[data-account-personaldetails-primary]',
                    isActive: '[data-account-personaldetails-active]',
                },
                errorText: '[data-error-text]',
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxHeadingText: {
                add: 'Add a phone number',
                edit: 'Update a phone number',
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-personaldetails-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
        }
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.data = {};
        this.lightboxHeadingText = this.options.lightboxHeadingText[this.options.instanceType];

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        this.$el.on('click', this._triggerClick.bind(this));
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
                open: () => {
                    setTimeout(() => {
                        this.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();

                        this._onModalOpened($($.magnificPopup.instance.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onModalOpened($modalContent) {
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);

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
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
    }

    setData(data) {
        this.data = data;
    }

    _populateEdit($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
        $modalContentInner.find(this.options.selectors.lineInputs.locationType).val(this.data.CommLocationCode);
        $modalContentInner.find(this.options.selectors.lineInputs.countryCode).val(this.data.CountryCode);
        $modalContentInner.find(this.options.selectors.lineInputs.phoneExtension).val(this.data.PhoneExtension);
        $modalContentInner.find(this.options.selectors.lineInputs.phoneAreaCode).val(this.data.PhoneAreaCode);
        $modalContentInner.find(this.options.selectors.lineInputs.phoneNumber).val(this.data.PhoneNumber);
        $modalContentInner.find(this.options.selectors.lineInputs.isPrimary).prop('checked', this.data.PrimaryFlag);
    }

    _addUpdateAction(e, $modalContent, $modalContentInner) {
        e.preventDefault();

        const model = {};

        model.CommTypeCode = 'PHONE';
        model.CommLocationCode = $modalContentInner.find(this.options.selectors.lineInputs.locationType).val();
        model.CountryCode = $modalContentInner.find(this.options.selectors.lineInputs.countryCode).val();
        model.PhoneExtension = $modalContentInner.find(this.options.selectors.lineInputs.phoneExtension).val();
        model.PhoneAreaCode = $modalContentInner.find(this.options.selectors.lineInputs.phoneAreaCode).val();
        model.PhoneNumber = $modalContentInner.find(this.options.selectors.lineInputs.phoneNumber).val();
        model.PrimaryFlag = $modalContentInner.find(this.options.selectors.lineInputs.isPrimary).val();
        model.ActiveFlag = true;
        model.FormattedPhoneAddress = '';

        this.loadingSpinner.request(`${this.guid}-_addUpdateAction`);

        APIProxy.request({
            api: 'addUpdatePersonalDetails',
            queryData: model,
            success: (data) => {
                $.magnificPopup.instance.close();

                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                globalEmitter.emit('addupdatecuscommunication:dataupdated', self);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContentInner.find(this.options.selectors.errorText),
                    context: 'AddUpdateCusCommunication._addUpdateAction',
                });
            },
        });
    }
}

export default (instanceType, lightboxSrcName) => {
    return new AddUpdateCusCommunication(instanceType, lightboxSrcName);
};
