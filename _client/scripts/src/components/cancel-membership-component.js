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

class CancelMembershipComponent extends BaseComponent {
    constructor(instanceType, lightboxSrcName) {
        super();

        this.defaultOptions = {
            instanceType,
            instanceTypes: {
                cancel: 'cancel',
            },
            selectors: {
                form: 'form',
                lightboxHeading: '[data-lightbox-heading]',
                lightboxConfirmCancelNoConfirmButton: '[data-confirm-cancel-no]',
                lightboxConfirmCancelYesConfirmButton: '[data-confirm-cancel-yes]',
                lineInputs: {
                    description: '[data_membership_description]',
                    nextPaymentDate: '[data_membership_renewaldate]',
                    orderTotal: '[data_membership_renewalamount]',
                    cancelreason: '[data_membership_input_cancelreason]',
                    cancelreasonErrorDiv: [ 'data-validation-error-cancelreason' ],
                },
                submitbutton: '[data-submit-membership-cancel]',
            },
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
            lightboxSrcNameCancelConfirm: 'membershipconfirmcancel',
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add a membership',
                edit: 'Update a membership',
                cancel: 'Cancel My Membership',
            },
            clientServerKeyMappings: {
                description: 'Description',
                membershipId: 'MembershipId',
                endDate: 'EndDate',
                nextPaymentDate: 'NextPaymentDate',
                orderTotal: 'OrderTotal',
                customerId: 'CustomerId',
                orderNumber: 'OrderNumber',
                formattedEndDate: 'FormattedEndDate',
                membershipPortalUrl: 'MembershipPortalUrl',
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: cancel-membership-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
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
        // this.reasoncode = '';
    }

    addListeners() {
        this.$el.on('click', this._triggerClick.bind(this)); // NB - root element needs to be the button clicked to trigger the action
    }

    _triggerClick(e) {
        e.preventDefault();

        this._confirmAndCancel();
        // this._openModal();
    }

    _openModal(e) {
        const self = this;

        e.preventDefault();

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
        this._populateCancel($modalContentInner);

        jitRequire($modalContentInner[0]);

        $modalContentInner.find(this.options.selectors.form).on('validsubmit', (e) => {
            // this._confirmAndCancel(e);
            this._cancelmembershipaction(e);
        });
    }

    _populateCancel($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);

        const keys = Object.keys(this.options.selectors.lineInputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            if (key === 'orderTotal') {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).text(`$${ this.data[key].toFixed(2)}`);
            } else {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).text(this.data[key]);
            }
        }
    }

    _confirmAndCancel() {
        // e.preventDefault();

        const self = this;

        // this.reasoncode = $("input[name='LightboxMembership.cancelreason']:radio:checked").val();

        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxSrcNameCancelConfirm]),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open() {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();

                        self._onConfirmModalOpened($(this.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onConfirmModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        $modalContent.find(this.options.selectors.lightboxConfirmCancelNoConfirmButton).on('click', this._onConfirmNoCancelClick.bind(this));
        $modalContent.find(this.options.selectors.lightboxConfirmCancelYesConfirmButton).on('click', this._onConfirmYesCancelClick.bind(this));
    }

    _onConfirmNoCancelClick(e) {
        e.preventDefault();

        $.magnificPopup.instance.close();
    }

    _onConfirmYesCancelClick(e) {
        e.preventDefault();

        $.magnificPopup.instance.close();

        this._openModal(e);
        // this._cancelmembershipaction(e);
    }

    _cancelmembershipaction(e) {
        e.preventDefault();

        const model = {};
        const orderNumber = this.data.orderNumber;

        const reasoncode = $('input[name=\'LightboxMembership.cancelreason\']:radio:checked').val();
        this.gtmHelper.customUserData();

        globalEmitter.emit('gtm.site-cancelmembershipaction');

        const self = this;

        this.loadingSpinner.request(`${this.guid}-_cancelmembershipaction`);

        APIProxy.request({
            api: 'cancelMembership',
            queryData: {
                membershipModel: model,
                reasonCode: reasoncode,
                orderNumber,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                this.loadingSpinner.release(`${this.guid}-_cancelmembershipaction`);

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContentCustom('Cancellation Success : Your monthly membership is cancelled successfully'),
                        type: 'inline',
                    },
                    callbacks: {
                        open() {
                            setTimeout(() => {
                                self.$el.off('click.magnificPopup');

                                lightboxUtils.bindOpenModalButtons();

                                self._onOkModalOpened($(this.content[0]));
                            }, 0);
                        },
                    },
                }).magnificPopup('open');

                // globalEmitter.emit('cancelmembershipaction:cancelled', self);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_cancelmembershipaction`);

                let responseStatus = '(no response JSON found; cannot display error details)';

                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }

                $.magnificPopup.instance.close();

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContent('membership', 'cancel', `${status} ${responseStatus}`, err),
                        type: 'inline',
                    },
                    callbacks: {
                        open() {
                            setTimeout(() => {
                                self.$el.off('click.magnificPopup');

                                lightboxUtils.bindOpenModalButtons();
                            }, 0);
                        },
                    },
                }).magnificPopup('open');
            },
        });
    }

    _onOkModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        $modalContent.find('[data-modal-close]').on('click', globalEmitter.emit('cancelmembershipaction:cancelled', this));
    }


    setData(data) {
        this.data = data;
    }
}

export default (instanceType, lightboxSrcName) => {
    return new CancelMembershipComponent(instanceType, lightboxSrcName);
};
