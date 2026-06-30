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

class AddUpdateProfessionalServiceComponent extends BaseComponent {
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
                    professionalServiceId: '[data-pd-service-input-id]',
                    organization: '[data-pd-service-input-organization]',
                    serviceType: '[data-pd-service-input-service-type]',
                    startDate: '[data-pd-service-input-start-date]',
                    endDate: '[data-pd-service-input-end-date]',
                },
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add a professional service',
                edit: 'Update a professional service',
            },
            clientServerKeyMappings: {
                professionalServiceId: 'ProfessionalDevProServicesId',
                organization: 'Organization',
                serviceType: 'TypeOfService',
                startDate: 'StartDate',
                endDate: 'EndDate',
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-professional-service-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
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
        this.$el.on('click', this._triggerClick.bind(this)); // NB - root element needs to be the button clicked to trigger the action
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

                        lightboxUtils.bindOpenModalButtons();

                        self._onModalOpened($(this.content[0]));
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

    _populateEdit($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);

        const keys = Object.keys(this.options.selectors.lineInputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];

            $modalContentInner.find(this.options.selectors.lineInputs[key]).val(this.data[key]);
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

        if (model[this.options.clientServerKeyMappings.professionalServiceId].length === 0) {
            model[this.options.clientServerKeyMappings.professionalServiceId] = '0';
        }

        this.gtmHelper.customUserData();

        if (model[this.options.clientServerKeyMappings.professionalServiceId] === '0') {
            globalEmitter.emit('gtm.site-accountpdserviceadd');
        } else {
            globalEmitter.emit('gtm.site-accountpdserviceupdate');
        }

        this.loadingSpinner.request(`${this.guid}-_addUpdateAction`);

        APIProxy.request({
            api: 'addUpdateProfessionalService',
            queryData: model,
            success: (data) => {
                $.magnificPopup.instance.close();

                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                globalEmitter.emit('addupdateprofessionalservice:dataupdated', self);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContentInner.find(this.options.selectors.errorText),
                    context: 'AddUpdateProfessionalServiceComponent._addUpdateAction',
                });
            },
        });
    }

    setData(data) {
        this.data = data;
    }
}

export default (instanceType, lightboxSrcName) => {
    return new AddUpdateProfessionalServiceComponent(instanceType, lightboxSrcName);
};
