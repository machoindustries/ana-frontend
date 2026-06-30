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

class AddUpdateLicenseComponent extends BaseComponent {
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
                errorText: '[data-error-text]',
                lightboxHeading: '[data-lightbox-heading]',
                lineInputs: {
                    licenseId: '[data-license-input-id]',
                    licenseType: '[data-license-input-type]',
                    country: '[data-license-input-country]',
                    state: '[data-license-input-state]',
                    labelState: '[data-license-label-state]',
                    canState: '[data-license-input-can-state]',
                    canLabelState: '[data-license-label-can-state]',
                    rnLicenseNumber: '[data-license-input-rn]',
                    beginDate: '[data-license-input-begin-date]',
                    expirationDate: '[data-license-input-expiration-date]',
                },
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add a license',
                edit: 'Update a license',
            },
            clientServerKeyMappings: {
                licenseId: 'LicenseId',
                licenseType: 'LicenseType',
                country: 'Country',
                state: 'State',
                rnLicenseNumber: 'RnLicenseNumber',
                beginDate: 'BeginDate',
                expirationDate: 'ExpirationDate',
                formattedExpirationDate: 'FormattedExpirationDate',
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-license-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
        }
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.data = {};
        this.lightboxHeadingText = this.options.lightboxHeadingText[this.options.instanceType];

        this.loadingSpinner = new LoadingSpinner();

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$el.on('click', this._triggerClick.bind(this));
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
                open: () => {
                    setTimeout(() => {
                        this.$el.off('click.magnificPopup');

                        this._onModalOpened($($.magnificPopup.instance.content[0]));
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
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
        $modalContentInner.find(this.options.selectors.lineInputs.licenseType).text('RN');
        $modalContentInner.find(this.options.selectors.lineInputs.labelState).show();
        $modalContentInner.find(this.options.selectors.lineInputs.canLabelState).hide();
    }

    _populateEdit($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
        $modalContentInner.find(this.options.selectors.lineInputs.licenseId).val(this.data.licenseId);
        $modalContentInner.find(this.options.selectors.lineInputs.country).val(this.data.country);
        $modalContentInner.find(this.options.selectors.lineInputs.rnLicenseNumber).val(this.data.rnLicenseNumber);
        $modalContentInner.find(this.options.selectors.lineInputs.licenseType).val(this.data.licenseType);
        $modalContentInner.find(this.options.selectors.lineInputs.beginDate).val(this.data.beginDate);
        $modalContentInner.find(this.options.selectors.lineInputs.expirationDate).val(this.data.expirationDate);

        const country = this.data.country;

        if (country) {
            if (country === 'USA') {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).show();
                $modalContentInner.find(this.options.selectors.lineInputs.state).val(this.data.state);
                $modalContentInner.find(this.options.selectors.lineInputs.canLabelState).hide();
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


    _addUpdateAction(e, $modalContent, $modalContentInner) {
        e.preventDefault();

        const model = {};

        for (const key in this.options.clientServerKeyMappings) {
            if (Object.hasOwn(this.options.clientServerKeyMappings, key)) {
                model[this.options.clientServerKeyMappings[key]] = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
            }
        }

        if (model[this.options.clientServerKeyMappings.licenseId].length === 0) {
            model[this.options.clientServerKeyMappings.licenseId] = '0';
        }

        this.gtmHelper.customUserData();

        if (model[this.options.clientServerKeyMappings.licenseId] === '0') {
            globalEmitter.emit('gtm.site-accountlicenseadd');
        } else {
            globalEmitter.emit('gtm.site-accountlicenseupdate');
        }

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
            api: 'addUpdateLicense',
            queryData: {
                licenseModel: model,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                globalEmitter.emit('addupdatelicense:dataupdated', this);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContentInner.find(this.options.selectors.errorText),
                    context: 'AddUpdateLicenseComponent._addUpdateAction',
                });
            },
        });
    }

    setData(data) {
        this.data = data;
    }
}

export default (instanceType, lightboxSrcName) => {
    return new AddUpdateLicenseComponent(instanceType, lightboxSrcName);
};
