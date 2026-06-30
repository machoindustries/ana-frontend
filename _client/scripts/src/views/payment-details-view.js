import BaseComponent from 'components/base-component';
import 'magnific-popup';
import jitRequire from 'modules/jit-require';
import lightboxUtils from 'modules/lightbox-utils';
import $ from 'jquery';
import animate from 'modules/animate';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class PaymentDetailsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                addButton: '[data-checkout-payment-method-add]',
                savedButton: '[data-checkout-payment-method-saved]',
                addPanel: '[data-checkout-payment-method-panel-add]',
                savedPanel: '[data-checkout-payment-method-panel-saved]',
                methodDropdown: '[data-checkout-payment-method-select]',
                securityCodeInfoButton: '[data-payment-details-security-info]',
                parentSection: '.c-checkout__section',
                hasValidation: '[data-validate]',
                ddlexpirymonth: '[data-expiry-month]',
                ddlexpiryyear: '[data-expiry-year]',
                expirydateError: '[data-expiry-error]',
            },
            methodIdentifierProp1: 'cardType',
            methodIdentifierProp2: 'cardNumber',
            animDuration: 250,
            lightboxSecurityInfoSrcName: 'securityInfo',
            modalAdditionalClass: 'mfp-fade',
            ignoreValidationAttr: 'data-validate-ignore',
            numCardDigitsToShow: 4,
            clientServerKeyMappings: {
                id: 'Id',
                displayText: 'DisplayText',
            },
        };

        this.state = {
            savedPanelOpen: true,
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.loadingSpinner = new LoadingSpinner();

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.$parentSection = this.$el.closest(this.options.selectors.parentSection);
        this.$methodDropdown = this.$el.find(this.options.selectors.methodDropdown);
        this.$addButton = this.$el.find(this.options.selectors.addButton);
        this.$savedButton = this.$el.find(this.options.selectors.savedButton);
        this.$savedPanel = this.$el.find(this.options.selectors.savedPanel);
        this.$addPanel = this.$el.find(this.options.selectors.addPanel);
        this.$securityCodeInfoButton = this.$el.find(this.options.selectors.securityCodeInfoButton);
        this.dropdownExpiryMonth = this.$el.find(this.options.selectors.ddlexpirymonth);
        this.dropdownExpiryyear = this.$el.find(this.options.selectors.ddlexpiryyear);
        this.errormessagedivExpiryMonth = this.$el.find(this.options.selectors.expirydateError);
        this.storedMethods = [];
    }

    addListeners() {
        this.$addButton.on('click', this._addSavedButtonClick.bind(this));
        this.$savedButton.on('click', this._addSavedButtonClick.bind(this));
        this.$securityCodeInfoButton.on('click', this._securityCodeInfoModal.bind(this));

      
        if (this.$savedPanel.length && this.$addPanel.length) {
            this._getSavedPaymentMethods();
            this._closeAddPanel(0);
        }
        else if (this.$addPanel.length && !this.$savedPanel.length) {
            this.$addPanel.show();
            this.$addPanel.attr('aria-expanded', true);
            this.state.savedPanelOpen = false; // add panel is "open"
            this.$addPanel.find(this.options.selectors.hasValidation).removeAttr(this.options.ignoreValidationAttr);
            globalEmitter.emit('forms:validation:rebind', this);
        }
        else if (this.$savedPanel.length && !this.$addPanel.length) {
            this.$savedPanel.show();
            this.$savedPanel.attr('aria-expanded', true);
            this.state.savedPanelOpen = true;
            this.$savedPanel.find(this.options.selectors.hasValidation).removeAttr(this.options.ignoreValidationAttr);
            globalEmitter.emit('forms:validation:rebind', this);
            this._getSavedPaymentMethods();
        }

        globalEmitter.on('checkout:carttotalzero', this._onCartTotalZero.bind(this));
        globalEmitter.on('checkout:carttotalnonzero', this._onCartTotalNonZero.bind(this));

        this.dropdownExpiryMonth.on('change', this._OnddlExpiryMonthChange.bind(this));
        this.dropdownExpiryyear.on('change', this._OnddlExpiryyearChange.bind(this));
    }

    _OnddlExpiryMonthChange() {
        this._CalculateCurrentExpirationDate();
    }
    _OnddlExpiryyearChange() {
        this._CalculateCurrentExpirationDate();
    }
    _CalculateCurrentExpirationDate() {
        let d = new Date(),

            m = d.getMonth(),

            y = d.getFullYear();
        let selectedmonth = $('#data-expiry-month1').children('option:selected').val();
        let selectedyear = $('#data-expiry-year1').children('option:selected').val();
        let message = '';
        if (Number(selectedyear) < y) {
            message = 'CC Date cannot be less than current date';
        } else if (Number(selectedyear) === y && Number(selectedmonth) <= m) {
            message = 'CC Date cannot be less than current date';
        }
        if (message === '') {
            this.errormessagedivExpiryMonth.empty();
            $('#data-expiry-month1').css('border-color', '');
            $('#data-expiry-year1').css('border-color', '');
        } else {
            this.errormessagedivExpiryMonth.text(message);
            this.errormessagedivExpiryMonth.css({ 'color': 'red', 'font-size': 'small' });
            $('#data-expiry-month1').css('border-color', 'red');
            $('#data-expiry-year1').css('border-color', 'red');
        }
    }
    _onCartTotalZero() {
        this.$parentSection.hide();
        this.$addPanel.find(this.options.selectors.hasValidation).attr(this.options.ignoreValidationAttr, '');
        this.$savedPanel.find(this.options.selectors.hasValidation).attr(this.options.ignoreValidationAttr, '');

        globalEmitter.emit('forms:validation:rebind', this);
    }

    _onCartTotalNonZero() {
        this.$parentSection.show();
        this.$addPanel.find(this.options.selectors.hasValidation).removeAttr(this.options.ignoreValidationAttr);
        this.$savedPanel.find(this.options.selectors.hasValidation).removeAttr(this.options.ignoreValidationAttr);

        this._updateValidationStates();
    }

    _getSavedPaymentMethods() {
        const self = this;

        
        if (!this.$savedPanel.length && !this.$methodDropdown.length) {
            return;
        }

        this.loadingSpinner.request(`${this.guid}-_getSavedPaymentMethods`);

        APIProxy.request({
            api: 'getPaymentDetails',
            success: (data) => {
                self._populateSavedPaymentMethods(data);

                this.loadingSpinner.release(`${this.guid}-_getSavedPaymentMethods`);
            },
            error: (jqxhr, status) => {
                console.log('No payment methods were found.');

                this.loadingSpinner.release(`${this.guid}-_getSavedPaymentMethods`);
            },
        });
    }

    _populateSavedPaymentMethods(methodsData) {
        this.storedMethods.length = 0;

        if (methodsData.length === 0) {
            if (this.state.savedPanelOpen) {
                this._togglePanels(0);

                this.$savedButton.hide();
            }

            return;
        }

        let savedMethodsHtml = '';

        const convertedJSON = JSON.parse(Utils.convertJSONKeysServerToClient(JSON.stringify(methodsData), this.options.clientServerKeyMappings));

        for (let a = 0; a < convertedJSON.length; a++) {
            const method = convertedJSON[a];
            const selectedAttr = a === 0 ? ' selected' : '';

            savedMethodsHtml = `${savedMethodsHtml}<option class="e-form__input e-form__input--option" value="${method.id}"${selectedAttr}>${method.displayText}</option>`;

            this.storedMethods.push(method);
        }

        
        if (this.$methodDropdown.length) {
            this.$methodDropdown.html(savedMethodsHtml);
        }
    }

    _addSavedButtonClick(e) {
        e.preventDefault();

        this._togglePanels(this.options.animDuration);
    }

    _togglePanels(duration) {
        const $openPanel = this.state.savedPanelOpen ? this.$savedPanel : this.$addPanel;
        const $closedPanel = this.state.savedPanelOpen ? this.$addPanel : this.$savedPanel;

        const easing = 'ease-in-out',
            openDir = 'slideDown',
            closeDir = 'slideUp';

        animate($closedPanel[0], openDir, { duration, easing }, this);
        animate($openPanel[0], closeDir, { duration, easing }, this);

        $closedPanel.attr('aria-expanded', true);
        $openPanel.attr('aria-expanded', false);

        this.state.savedPanelOpen = !this.state.savedPanelOpen;

        this._updateValidationStates();
    }

    _updateValidationStates() {
        if (this.state.savedPanelOpen) {
            this.$addPanel.find(this.options.selectors.hasValidation).attr(this.options.ignoreValidationAttr, '');
            this.$savedPanel.find(this.options.selectors.hasValidation).removeAttr(this.options.ignoreValidationAttr);
        } else {
            this.$savedPanel.find(this.options.selectors.hasValidation).attr(this.options.ignoreValidationAttr, '');
            this.$addPanel.find(this.options.selectors.hasValidation).removeAttr(this.options.ignoreValidationAttr);
        }

        globalEmitter.emit('forms:validation:rebind', this);
    }

    _closeAddPanel(duration) {
        const easing = 'ease-in-out',
            closeDir = 'slideUp';

        animate(this.$addPanel[0], closeDir, { duration, easing }, this);
        this.$addPanel.attr('aria-expanded', false);
    }

    _onModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);

        jitRequire($modalContentInner[0]);
    }

    _securityCodeInfoModal(e) {
        e.preventDefault();

        const self = this;

        $.magnificPopup.instance.close();

        this.$securityCodeInfoButton.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxSecurityInfoSrcName], true),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();

                        self._onModalOpened($(this.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }
}

export default () => {
    return new PaymentDetailsView();
};