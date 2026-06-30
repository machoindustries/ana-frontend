import BaseComponent from 'components/base-component';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import $ from 'jquery';
import GTMHelper from 'modules/gtm-helper';
import APIProxy from 'modules/api-proxy';
import lightboxUtils from 'modules/lightbox-utils';

class CheckoutPageView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                checkoutForm: '[data-checkout-form]',
                agreeTermsCheckbox: '[data-checkout-agree-terms]',
                placeOrderButton: '[data-checkout-place-order]',
                notificationContainer: '[data-checkout-notification-container]',
                donationButtons: '[data-donation-amount-button]',
                shippingInvalidError: '[data-checkout-shipping-invalid-error]',
                recaptchaInvalidError: '[data-checkout-recaptcha-invalid-error]',
                addressesSame: '[data-addresses-same]',
                unableToPlaceOrderError: '[data-checkout-generic-error]',
                orderLimitExceededError: '[data-checkout-order-limit-exceeded]',
            },
            gtmDataKeyMappings: {
                items: 'Items',
                id: 'Code',
                price: 'RowPrice',
                variant: 'Code',
                quantity: 'Quantity',
                summary: 'Summary',
                donations: 'Donations',
                amount: 'Amount',
                displayName: 'DisplayName',
            },
            defaultAddressesSameInputName: 'IsBillingAddressUsedForShipping',
            placeOrderGenericErrorMessageAttr: 'data-placeorder-error-message',
            placeOrderValidationErrorsHeadingAttr: 'data-placeorder-validation-lightbox-heading',
            clientServerKeyMappings: {
                wasOrderCreated: 'WasOrderCreated',
                messages: 'Messages',
                redirectPath: 'RedirectPath',
                validationResult: 'ValidationResult',
                validationIssues: 'PlaceOrderValidationIssue',
                caption: 'Caption',
                key: 'Key',
                message: 'Message',
                name: 'Name',
                value: 'Value',
                text: 'Text',
                responseRequired: 'ResponseRequired',
                validationIssueResponseOptions: 'ValidationIssueResponseOptions',
                validationIssueResponseOptionList: 'ValidationIssueResponseOption',
                isDefault: 'IsDefault',
            },
            lightboxErrorSrcName: 'placeordererror',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$checkoutForm = this.$el.find(this.options.selectors.checkoutForm);
        this.$agreeTermsCheckbox = this.$el.find(this.options.selectors.agreeTermsCheckbox);
        this.$placeOrderButton = this.$el.find(this.options.selectors.placeOrderButton);
        this.$notificationContainer = this.$el.find(this.options.selectors.notificationContainer);
        this.$donationButtons = this.$el.find(this.options.selectors.donationButtons);
        this.$shippingInvalidError = this.$el.find(this.options.selectors.shippingInvalidError);
        this.$recaptchaInvalidError = this.$el.find(this.options.selectors.recaptchaInvalidError);
        this.$addressesSame = this.$el.find(this.options.selectors.addressesSame);

        this.placeOrderGenericErrorMessage = this.$el.attr(this.options.placeOrderGenericErrorMessageAttr);
        this.placeOrderValidationErrorsHeading = this.$el.attr(this.options.placeOrderValidationErrorsHeadingAttr);

        this.loadingSpinner = new LoadingSpinner();
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.canPlaceOrder = false;
        this.validationResponseData = [];

        this.$unableToPlaceOrderError = this.$el.find(this.options.selectors.unableToPlaceOrderError);

    }

    addListeners() {
        this.$checkoutForm.on('validsubmit', (e) => {
            this._placeOrder(e);
        });

        globalEmitter.on('checkoutordersummary:initialised', this._sendGTM.bind(this));
        globalEmitter.on('shippingmethods:invalid', this._shippingMethodsInvalid.bind(this));
        globalEmitter.on('shippingmethods:valid', this._shippingMethodsValid.bind(this));
        this.$placeOrderButton.on('click', this._captchaValidate.bind(this));
    }

    _captchaValidate() {
        let token = $('#g-recaptcha-response').val();
        if (token === '' || token === 'undefined') {
            this.canPlaceOrder = false;
            this.$recaptchaInvalidError.show();
        } else {
            this.canPlaceOrder = true;
            this.$recaptchaInvalidError.hide();
        }
    }

    _sendGTM() {
        APIProxy.request({
            api: 'getCart',
            success: (data) => {
                const convertedData = JSON.parse(Utils.convertJSONKeysServerToClient(JSON.stringify(data), this.options.gtmDataKeyMappings));

                this.gtmHelper.customUserData();

                // GTM - checkout
                const gtmData = this.gtmHelper.ecommerceCheckout(convertedData.items, convertedData.summary.donations, 1);

                globalEmitter.emit('gtm.ecommerce-checkout', gtmData);

                // GTM - donations
                const donations = convertedData.summary.donations;

                if (donations.length > 0) {
                    let label = '';

                    for (let d = 0; d < donations.length; d++) {
                        const donation = donations[d];

                        label = `${label }${donation.displayName}: ${donation.amount}`;

                        if (d < donations.length - 1) {
                            label = `${label }, `;
                        }
                    }

                    globalEmitter.emit('gtm.checkout-donation', { label });
                }
            },
        });
    }

    _shippingMethodsValid() {
        this._enablePurchase();
        this.$shippingInvalidError.hide();
    }

    _shippingMethodsInvalid() {
        this._disablePurchase();
        this.$shippingInvalidError.show();
    }

    _recaptchaValid() {
        this._enablePurchase();
        this.$recaptchaInvalidError.hide();
    }

    _recaptchaInValid() {
        this._disablePurchase();
        this.$recaptchaInvalidError.show();
    }

    _enablePurchase() {
        this.canPlaceOrder = true;

        this.$placeOrderButton.prop('disabled', false);
        this.$placeOrderButton.show();
    }

    _disablePurchase() {
        this.canPlaceOrder = false;

        this.$placeOrderButton.prop('disabled', true);
        this.$placeOrderButton.hide();
    }

    _getSerializedFormData($additionalForm) {
        let formData = this.$checkoutForm.serialize();
        let addressesSameInputName = this.$addressesSame.attr('name');

        if (typeof addressesSameInputName === 'undefined') {
            addressesSameInputName = this.options.defaultAddressesSameInputName;
        }

        if (formData.indexOf(`${addressesSameInputName}=on`) !== -1) {
            formData = formData.replace(`${addressesSameInputName}=on`, `${addressesSameInputName}=true`);
        } else {
            formData = `${formData }&${addressesSameInputName}=false`;
        }

        return formData;
    }

    _appendValidationResponses(serialisedFormData) {
        let serialisedData = serialisedFormData;

        for (let r = 0; r < this.validationResponseData.length; r++) {
            const resp = this.validationResponseData[r];

            serialisedData = `${serialisedData}&ValidationResponses[${r}].Key=${resp.key}&ValidationResponses[${r}].Name=${resp.name}&ValidationResponses[${r}].Response=${resp.response}`;
        }

        return serialisedData;
    }

    _placeOrder(e, $responseForm) {
        e.preventDefault();

        if (!this.canPlaceOrder) {
            return;
        }

        this.loadingSpinner.request(`${this.guid}-_placeOrder`);

        let formData = this._getSerializedFormData();

        formData = this._appendValidationResponses(formData);

        const self = this;

        APIProxy.request({
            api: 'purchase',
            queryData: formData,
            success: (data) => {
                this.$unableToPlaceOrderError.hide();
                this.$el.find(this.options.selectors.orderLimitExceededError).text('');
                const convertedJSON = JSON.parse(Utils.convertJSONKeysServerToClient(JSON.stringify(data), this.options.clientServerKeyMappings));

                if (convertedJSON.BulkOrderLimitExceeded !== undefined && convertedJSON.BulkOrderLimitExceeded) {
                    this.$el.find(this.options.selectors.orderLimitExceededError).text(data.Message);
                    this.$el.find(this.options.selectors.orderLimitExceededError).show();
                    this.loadingSpinner.release(`${this.guid}-_placeOrder`);
                }
                else {
                    if (convertedJSON.wasOrderCreated !== undefined && convertedJSON.wasOrderCreated === false) {
                        // globalEmitter.emit('customnotification:triggered', this.placeOrderGenericErrorMessage);
                        this.loadingSpinner.release(`${this.guid}-_placeOrder`);
                        this.$unableToPlaceOrderError.show();

                        $.magnificPopup.instance.close();
                        // eslint-disable-next-line no-eq-null
                        if (convertedJSON.validationResult != null) {
                              this.$el.magnificPopup({
                                items: {
                                    src: lightboxUtils.getLightboxMarkupForContent(this._getValidationLightboxContent(convertedJSON.validationResult)),
                                    type: 'inline',
                                },
                                callbacks: {
                                    open () {
                                        setTimeout(() => {
                                            self.$el.off('click.magnificPopup');

                                            self._onConfirmModalOpened($(this.content[0]));
                                        }, 0);
                                    },
                                },
                                mainClass: this.options.modalAdditionalClass,
                            }).magnificPopup('open');
                            this.$unableToPlaceOrderError.hide();
                        }
                    }

                    if (convertedJSON.redirectPath.length > 0) {
                        window.location.href = convertedJSON.redirectPath;
                    }
                }
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_placeOrder`);

                globalEmitter.emit('customnotification:triggered', jqxhr.responseText);

                this.$checkoutForm.html(jqxhr.responseText);
            },
        });
    }

    _saveValidationResponseData($responseForm) {
        $responseForm.find('[data-validation-response-fieldset]').each((idx, elem) => {
            const $responseFieldset = $(elem);

            // only allows for radio buttons currently - checkboxes will require further thought.
            this.validationResponseData.push({
                key: $responseFieldset.attr('data-validation-response-key'),
                name: $responseFieldset.attr('data-validation-response-name'),
                response: $responseFieldset.find('input:checked').val(),
            });
        });
    }

    _onConfirmModalOpened($modalContent) {
        let $responseForm = 1;

        lightboxUtils.bindOpenModalButtons();

        // Bind events on any validation response submit buttons in the modal
        $modalContent.find('[data-validation-response-submit]').on('click', (e) => {
            e.preventDefault();

            $responseForm = $(e.target).closest('[data-validation-response-form]');

            if (typeof $responseForm === 'undefined' || $responseForm.length === 0) {
                console.log('ERROR: checkout-page-view.js : _onConfirmModalOpened : validation response form not found.');
                return;
            }

            this._saveValidationResponseData($responseForm);
            this._placeOrder(e);
        });
    }

    _getValidationLightboxContent(validationResult) {
        let numNotRequiringResponse = 0;

        for (let vi = 0; vi < validationResult.validationIssues.length; vi++) {
            if (!validationResult.validationIssues[vi].responseRequired) {
                numNotRequiringResponse++;
            }
        }

        const messagesData = [];
        let html = '';
        let backupTitle = 'Please correct the issue(s) below';
        let note = '<p style="margin-top:24px;color:#ff0000;">If you continue to receive error messages or would like additional assistance, please contact customer service at 1-800-284-2378. Thank you.</p>';

        // If there are any issues which do not require a response (messages), only those should be displayed.
        // Else if there are any issues which require responses, display all the options for each.
        // There should never be a mixture of issues that require responses with those that do not.
        if (numNotRequiringResponse > 0) {
            for (let vi = 0; vi < validationResult.validationIssues.length; vi++) {
                const issue = validationResult.validationIssues[vi];

                if (issue.responseRequired) {
                    continue;
                }

                let sameTitleIdx = -1;

                for (let md = 0; md < messagesData.length; md++) {
                    const msgDatum = messagesData[md];

                    if (msgDatum.title === issue.title) {
                        sameTitleIdx = md;
                        break;
                    }
                }

                if (sameTitleIdx !== -1) {
                    messagesData[sameTitleIdx].messages.push(issue.message);
                } else {
                    messagesData.push({
                        title: issue.caption,
                        messages: [ issue.message ],
                    });
                }
            }

            html = `${html }<h3 data-lightbox-heading="">${typeof this.placeOrderValidationErrorsHeading !== 'undefined' ? this.placeOrderValidationErrorsHeading : backupTitle}:</h3>`;

            for (let md = 0; md < messagesData.length; md++) {
                const msgDatum = messagesData[md];

                for (let msg = 0; msg < msgDatum.messages.length; msg++) {
                    html = `${html }<p><strong>${msgDatum.title}</strong>: ${msgDatum.messages[msg]}</p>`;
                }
            }

            html = `${html }<a href="#" class="e-button e-button--anchor e-button--blue e-button" data-modal-close="">ok</a>${ note}`;
        } else {
            html = `${html }<form data-validation-response-form>`;

            for (let vi = 0; vi < validationResult.validationIssues.length; vi++) {
                const issue = validationResult.validationIssues[vi];

                html = `${html }<fieldset class="e-form__fieldset" data-validation-response-fieldset data-validation-response-key="${issue.key}" data-validation-response-name="${issue.name}">
                            <h3 data-lightbox-heading="">${typeof issue.caption !== 'undefined' ? issue.caption : backupTitle}</h3>
                            <p>${issue.message}</p>`;

                const responseOptions = issue.validationIssueResponseOptions.validationIssueResponseOptionList;

                for (let ro = 0; ro < responseOptions.length; ro++) {
                    const option = responseOptions[ro];
                    let defaultOnlyAttrs = '';

                    if (option.isDefault !== null && option.isDefault) {
                        defaultOnlyAttrs = ' checked="checked"';
                    }

                    html = `${html }<label class="e-form__label e-form__label--radio" for="vro-${vi}-${option.value}">
                                <span class="e-form__label-text">${option.text}</span>
                                <input type="radio" class="e-form__input e-form__input--radio" name="vro-${vi}" value="${option.value}" id="vro-${vi}-${option.value}"${defaultOnlyAttrs} />
                                <span class="e-form__fake-radio"></span>
                            </label>`;
                }

                html = `${html }</fieldset>`;
            }

            html = `${html }<a href="#" class="e-button e-button--anchor e-button--blue e-button" data-validation-response-submit>ok</a>${ note }</form>`;
        }

        return html;
    }
}

export default () => {
    return new CheckoutPageView();
};
