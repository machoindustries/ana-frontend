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

class AddUpdateContinuingEducationComponent extends BaseComponent {
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
                    continuingEducationItemId: '[data-pd-education-input-id]',
                    subject: '[data-pd-education-input-subject]',
                    sponsor: '[data-pd-education-input-sponsor]',
                    description: '[data-pd-education-input-description]',
                    offeredDate: '[data-pd-education-input-date]',
                    contactHours: '[data-pd-education-input-contact-hours]',
                    pharmHrs: '[data-pd-education-input-pharma-hours]',
                    approved: '[data-pd-education-input-approved]',
                    contactHoursErrorDiv: '[data-validation-contacthours]',
                    pharmHrsErrorDiv: '[data-validation-pharmhrs]',
                },
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add new continuing education',
                edit: 'Update continuing education',
            },
            clientServerKeyMappings: {
                continuingEducationItemId: 'ProfessionalDevContiEdusId',
                subject: 'Subject',
                sponsor: 'Sponsor',
                description: 'Description',
                offeredDate: 'DateOfOffering',
                contactHours: 'ContactHours',
                pharmHrs: 'PharmHrs',
                approved: 'ANCCApproved',
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-continuing-education-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
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

    _onchange(e) {
        let twoPlacedFloat;
        if ($.isNumeric(e.target.value)) {
            twoPlacedFloat = parseFloat(e.target.value).toFixed(2);
            e.target.value = twoPlacedFloat;
        }
    }
    _openModal() {
        const self = this;

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
        $modalContentInner.find(this.options.selectors.lineInputs.pharmHrs).on('change', this._onchange.bind($modalContentInner.find(this.options.selectors.lineInputs.pharmHrs)));
        $modalContentInner.find(this.options.selectors.lineInputs.contactHours).on('change', this._onchange.bind($modalContentInner.find(this.options.selectors.lineInputs.contactHours)));
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

            const tt = $modalContentInner.find(this.options.selectors.lineInputs[key]);

            if (tt[0].type === 'checkbox') {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).prop('checked', this.data[key]);
            } else {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).val(this.data[key]);
            }
        }
    }

    _addUpdateAction(e, $modalContent, $modalContentInner) {
        e.preventDefault();

        const model = {};
        let contacthrs = 0;
        let pharmhours = 0;
        for (const key in this.options.clientServerKeyMappings) {
            if (Object.hasOwn(this.options.clientServerKeyMappings, key)) {
                if (key === 'approved' || key === 'pharmacoTheraputics') {
                    model[this.options.clientServerKeyMappings[key]] = $modalContentInner.find(this.options.selectors.lineInputs[key]).prop('checked');
                } else {
                    model[this.options.clientServerKeyMappings[key]] = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
                }
                if (key === 'contactHours') {
                    contacthrs = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
                    if (Number(contacthrs) === 0) {
                        model[this.options.clientServerKeyMappings[key]] = 0;
                    }
                }
                if (key === 'pharmHrs') {
                    pharmhours = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
                    if (Number(pharmhours) === 0) {
                        model[this.options.clientServerKeyMappings[key]] = 0;
                    }
                }
            }
        }

        if (model[this.options.clientServerKeyMappings.continuingEducationItemId].length === 0) {
            model[this.options.clientServerKeyMappings.continuingEducationItemId] = '0';
        }

        this.gtmHelper.customUserData();


        let totalhrs = Number(pharmhours) + Number(contacthrs);
        if (Number(totalhrs) <= 0) {
            $modalContentInner.find(this.options.selectors.lineInputs.contactHoursErrorDiv).text('Please enter at least one record for Contact Hours.');
            $modalContentInner.find(this.options.selectors.lineInputs.pharmHrsErrorDiv).text('Please enter at least one record for Contact Hours.');
            $modalContentInner.find(this.options.selectors.lineInputs.contactHoursErrorDiv).css({ color: 'red' });
            $modalContentInner.find(this.options.selectors.lineInputs.pharmHrsErrorDiv).css({ color: 'red' });
        } else {
            $modalContentInner.find(this.options.selectors.lineInputs.contactHoursErrorDiv).empty();
            $modalContentInner.find(this.options.selectors.lineInputs.pharmHrsErrorDiv).empty();

            if (model[this.options.clientServerKeyMappings.continuingEducationItemId] === '0') {
                globalEmitter.emit('gtm.site-accountpdceadd');
            } else {
                globalEmitter.emit('gtm.site-accountpdceupdate');
            }

            this.loadingSpinner.request(`${this.guid}-_addUpdateAction`);

            APIProxy.request({
                api: 'addUpdateContinuingEducation',
                queryData: model,
                success: (data) => {
                    $.magnificPopup.instance.close();

                    this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                    globalEmitter.emit('addupdatecontinuingeducation:dataupdated', this);
                },
                error: (jqxhr) => {
                    this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                    Utils.handleAjaxError(jqxhr, {
                        displayEl: $modalContentInner.find(this.options.selectors.errorText),
                        context: 'AddUpdateContinuingEducationComponent._addUpdateAction',
                    });
                },
            });
        }
    }

    setData(data) {
        this.data = data;
    }
}

export default (instanceType, lightboxSrcName) => {
    return new AddUpdateContinuingEducationComponent(instanceType, lightboxSrcName);
};
