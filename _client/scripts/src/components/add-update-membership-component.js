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

class AddUpdateMembershipComponent extends BaseComponent {
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
                    membershipId: '[data-membership-input-id]',
                    association: '[data-membership-input-association]',
                    startDate: '[data-membership-input-start-date]',
                    endDate: '[data-membership-input-end-date]',
                },
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add a membership',
                edit: 'Update a membership',
            },
            clientServerKeyMappings: {
                membershipId: 'MembershipId',
                association: 'Association',
                description: 'Description',
                startDate: 'StartDate',
                endDate: 'EndDate',
                formattedStartDate: 'FormattedStartDate',
                formattedEndDate: 'FormattedEndDate',
                membershipPortalUrl: 'MembershipPortalUrl',
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-membership-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
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

            if (tt[0].type === 'dropdown') {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).prop('selected', this.data[key]);
            } else {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).val(this.data[key]);
            }
        }
    }

    _addUpdateAction(e, $modalContent, $modalContentInner) {
        e.preventDefault();

        const model = {};

        for (const key in this.options.clientServerKeyMappings) {
            if (Object.hasOwn(this.options.clientServerKeyMappings, key)) {
                if (key === this.options.clientServerKeyMappings.association) {
                    model[this.options.clientServerKeyMappings.description] = $modalContentInner.find(this.options.selectors.lineInputs[key]).text();
                    model[this.options.clientServerKeyMappings.association] = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
                } else {
                    model[this.options.clientServerKeyMappings[key]] = $modalContentInner.find(this.options.selectors.lineInputs[key]).val();
                }
            }
        }

        this.gtmHelper.customUserData();

        switch (this.options.instanceType) {
        case this.options.instanceTypes.add:

            globalEmitter.emit('gtm.site-accountmembershipadd');

            break;

        case this.options.instanceTypes.edit:

            globalEmitter.emit('gtm.site-accountmembershipupdate');

            break;

        default:
            break;
        }

        this.loadingSpinner.request(`${this.guid}-_addUpdateAction`);

        APIProxy.request({
            api: 'addUpdateMembership',
            queryData: {
                membershipModel: model,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                globalEmitter.emit('addupdatemembership:dataupdated', this);

                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContentInner.find(this.options.selectors.errorText),
                    context: 'AddUpdateMembershipComponent._addUpdateAction',
                });
            },
        });
    }

    setData(data) {
        this.data = data;
    }
}

export default (instanceType, lightboxSrcName) => {
    return new AddUpdateMembershipComponent(instanceType, lightboxSrcName);
};
