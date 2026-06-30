import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import DiscountComponent from 'components/discount-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import GTMHelper from 'modules/gtm-helper';
import APIProxy from 'modules/api-proxy';
import DeleteDonationComponent from 'components/delete-donation-component';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';

class CartSummaryView extends BaseComponent {
    constructor() {

        super();

        this.defaultOptions = {
            selectors: {
                addDiscountCode: '[data-add-discount-code]',
                addDiscountCodePanel: '[data-add-discount-code-panel]',
                addDiscountCodeInput: '[data-add-discount-code-input]',
                applyDiscountCode: '[data-apply-discount-code]',
                appliedDiscountsList: '[data-applied-discounts-list]',
                appliedDiscountRemove: '[data-applied-discount-remove]',
                appliedDiscountTotalOutput: '[data-applied-discounts-total]',
                appliedDonationTotalOutput: '[data-applied-donation-total]',
                subtotalOutput: '[data-cart-summary-subtotal]',
                lineItems: '[data-cart-line-items]',
                donationsRemove: '[remove-data-donation-code]',
                pacdonationsRemove: '[remove-data-pacdonation-code]',
                lightboxDeclineButton: '[data-decline-terms]',
                pacTermsAndConditionsReadOnlyButton: '[data-click-here-button]',
            },
            appliedDiscountCodeAttr: 'data-applied-discount-code',
            addDiscountPanelAnimDuration: 500,
            modalAdditionalClass: 'mfp-fade',
            lightboxPactermsSrcName: 'pactermsconditions',
            lightboxPactermsReadOnlySrcName: 'pactermsconditionsreadonly',
            clientServerKeyMappings: {
                summary: 'Summary',
                couponDiscounts: 'CouponDiscounts',
                discount: 'Discount',
                discountCode: 'DiscountCode',
                displayName: 'DisplayName',
                donationTotal: 'DonationTotal',
                subTotal: 'SubTotal',
                isPacDonationAvailable: 'IsPacDonationAvailable',
                appliedDiscountTotal: 'AppliedDiscountTotal',
            },
            itemLineOutputAttrs: {
                donationCode: 'data-donation-code',
            },
        };

        this.state = {
            addPanelOpen: false,
        };

        this.firstclick = 0;
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.discountComponent = new DiscountComponent();
        this.discountComponent.init(this.$el);

        this.$addDiscountCodeButton = this.$el.find(this.options.selectors.addDiscountCode);
        this.$addDiscountCodePanel = this.$el.find(this.options.selectors.addDiscountCodePanel);
        this.$addDiscountCodeInput = this.$el.find(this.options.selectors.addDiscountCodeInput);
        this.$applyDiscountCodeButton = this.$el.find(this.options.selectors.applyDiscountCode);
        this.$appliedDiscountsList = this.$el.find(this.options.selectors.appliedDiscountsList);
        this.$appliedDonationTotalOutput = this.$el.find(this.options.selectors.appliedDonationTotalOutput);
        this.$appliedDiscountTotalOutput = this.$el.find(this.options.selectors.appliedDiscountTotalOutput);
        this.$subtotalOutput = this.$el.find(this.options.selectors.subtotalOutput);
        this.$lineItems = this.$el.find(this.options.selectors.lineItems);

        this.$pacTermsAndConditionsReadOnly = this.$el.find(this.options.selectors.pacTermsAndConditionsReadOnlyButton);

        this.deleteComponent = new DeleteDonationComponent();
        this.deleteComponent.init(this.$el.find(this.options.selectors.donationsRemove), {});

        this.deletepacComponent = new DeleteDonationComponent();
        this.deletepacComponent.init(this.$el.find(this.options.selectors.pacdonationsRemove), {});

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.loadingSpinner = new LoadingSpinner();

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$addDiscountCodeButton.on('click', this._addDiscountCodeButtonClick.bind(this));
        this.$applyDiscountCodeButton.on('click', this._applyDiscountCodeButtonClick.bind(this));

        this.$pacTermsAndConditionsReadOnly.on('click', this._triggerPACTermsReadOnlyClick.bind(this));

        globalEmitter.on('orderitem:changed', this._handleCartItemsChanged.bind(this));
        globalEmitter.on('orderitem:removed', this._handleCartItemsRemoved.bind(this));
        globalEmitter.on('donation:selected', this._handleDonationSelected.bind(this));
        globalEmitter.on('donation:deselected', this._handleDonationDeselected.bind(this));

        this._bindAppliedDiscountEventListeners();
        this._closeAddDiscountPanel(0);
    }

    _triggerPACTermsReadOnlyClick(e) {
        e.preventDefault();
        this._openPACTermsReadModal();
    }

    _openPACTermsReadModal() {
        const self = this;

        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxPactermsReadOnlySrcName]),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open() {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _triggerDonationClick() {
        this.firstclick = 1;
        this._openDeclineModal();
    }

    _openDeclineModal() {
        const self = this;

        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxPactermsSrcName]),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open() {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();

                        self._onDeclineModalOpened($(this.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onDeclineModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        $modalContent.find(this.options.selectors.lightboxDeclineButton).on('click', this._onDeclineClick.bind(this));
    }

    _onDeclineClick(e) {
        e.preventDefault();

        $.magnificPopup.instance.close();

        this._deletepacdonation();
    }

    _deletepacdonation() {
        this.loadingSpinner.request(`${this.guid}-_deleteItem`);

        APIProxy.request({
            api: 'deleteDonation',
            queryData: {
                donationCode: this.donationcodetoremove,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                globalEmitter.emit('donations:removed', this.donationcodetoremove);

                this._updateCartSummaryHtml();

                this.loadingSpinner.release(`${this.guid}-_deleteItem`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_deleteItem`);

                console.log(`ERROR: cart-summary-view : failed to delete donation. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _bindAppliedDiscountEventListeners() {
        setTimeout(() => {
            this.$el.find(this.options.selectors.appliedDiscountRemove).on('click', this._removeAppliedDiscount.bind(this));
        }, 0);
    }

    _openAddDiscountPanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideDown';

        animate(this.$addDiscountCodePanel[0], direction, { duration, easing, display: 'inline-block' }, this);

        this.state.addPanelOpen = true;
        this.$addDiscountCodePanel.attr('aria-expanded', this.state.addPanelOpen);
    }

    _closeAddDiscountPanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideUp';

        animate(this.$addDiscountCodePanel[0], direction, { duration, easing }, this);

        this.state.addPanelOpen = false;
        this.$addDiscountCodePanel.attr('aria-expanded', this.state.addPanelOpen);
    }

    _addDiscountCodeButtonClick(e) {
        e.preventDefault();

        if (this.state.addPanelOpen) {
            this._closeAddDiscountPanel(this.options.addDiscountPanelAnimDuration);
        } else {
            this._openAddDiscountPanel(this.options.addDiscountPanelAnimDuration);
        }
    }

    _applyDiscountCodeButtonClick(e) {
        e.preventDefault();

        this.discountComponent.addDiscount(
            this.$addDiscountCodeInput.val(),
            this._onApplyDiscountSuccess.bind(this),
            this._onApplyDiscountFailure.bind(this)
        );
    }

    _onApplyDiscountSuccess() {
        this.gtmHelper.customUserData();

        globalEmitter.emit('gtm.checkout-discountcodeaccepted');

        this._closeAddDiscountPanel(this.options.addDiscountPanelAnimDuration);
        this._updateCartSummaryHtml();
    }

    _onApplyDiscountFailure() {
        this.gtmHelper.customUserData();

        globalEmitter.emit('gtm.checkout-discountcoderejected');
    }

    _removeAppliedDiscount(e) {
        e.preventDefault();

        const $appliedDiscount = $(e.target).closest(`[${this.options.appliedDiscountCodeAttr}]`);

        this.discountComponent.removeDiscount(
            $appliedDiscount.attr(this.options.appliedDiscountCodeAttr),
            this._onRemoveDiscountSuccess.bind(this)
        );
    }

    _onRemoveDiscountSuccess() {
        this._updateCartSummaryHtml();
    }

    _updateCartSummaryHtml() {
        this.loadingSpinner.request(`${this.guid}-_updateCartSummaryHtml`);

        APIProxy.request({
            api: 'getCart',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_updateCartSummaryHtml`);

                const convertedData = JSON.parse(Utils.convertJSONKeysServerToClient(JSON.stringify(data), this.options.clientServerKeyMappings));

                this._updateAppliedDiscountsHtml(convertedData);
                this._updateAppliedDonationsHtml(convertedData);
                this._updateSubtotalHtml(convertedData);
                this._updateDonationsVisibility(convertedData);
                this._updateLineItemsHtml(convertedData);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateCartSummaryHtml`);

                console.log(`ERROR: cart-summary-view : failed to get cart data. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _updateAppliedDiscountsHtml(data) {
        let appliedDiscountsHtml = '';
        appliedDiscountsHtml = `${appliedDiscountsHtml }<p class="c-cart-summary__discount-line">
                                            <em>Applied Promotion(s)</em>: <span>-${data.summary.appliedDiscountTotal}</span>
                                        </p>`;

        for (let d = 0; d < data.summary.couponDiscounts.length; d++) {
            const discount = data.summary.couponDiscounts[d];
            if (discount.discountCode) {
                appliedDiscountsHtml = `${appliedDiscountsHtml }<li class="c-cart-summary__discount" ${this.options.appliedDiscountCodeAttr}="${discount.discountCode}">                                        
                                        <p class="c-cart-summary__discount-caveat">
                                            ${discount.displayName}                                            
                                            <a href="/cart-page/RemoveDiscount/?DiscountCode=BD2" class="c-cart-summary__discount-remove" data-applied-discount-remove>Remove</a>
                                        </p>
                                    </li>`;
            } else {
                appliedDiscountsHtml = `${appliedDiscountsHtml }<li class="c-cart-summary__discount" ${this.options.appliedDiscountCodeAttr}="${discount.discountCode}">                                        
                                        <p class="c-cart-summary__discount-caveat">
                                            ${discount.displayName}                                            
                                            <span class="c-cart-summary__discount-remove"></span>
                                        </p>
                                    </li>`;
            }
        }

        this.$appliedDiscountsList.html(appliedDiscountsHtml);
        this.$appliedDiscountTotalOutput.text(`-${data.summary.appliedDiscountTotal}`);

        this._bindAppliedDiscountEventListeners();
    }

    _updateLineItemsHtml(data) {
        let LineItemsHtml = '';
        let nametodisplay;
        let icontodisplay;
        let deletetriggerthis;

        let style = '';

        for (let d = 0; d < data.summary.Donations.length; d++) {
            if ((data.Items.length & 1) === 0 && (d & 1) === 0) {
                style = 'even';
            }
            const donation = data.summary.Donations[d];
            // if (!data.summary.IsPacDonationAvailable) continue;
            nametodisplay = donation.Code.includes('44215') ? 'American Nurses Foundation Donation' : 'ANA Political Action Committee (PAC) Donation';
            icontodisplay = donation.Code.includes('44215') ? '/globalassets/logos/logo_anf_svg_new.svg' : '/assets/img/logos/ANA-logo-flame-portrait.png';
            deletetriggerthis = donation.Code.includes('44215') ? 'remove-data-donation-code' : 'remove-data-pacdonation-code';
            LineItemsHtml = `${LineItemsHtml }<li class="c-order-detail__items-row ${style}" data-order-item-row>
    <div class="c-cart-summary__donation-total">
    </div>
    <div class="grid c-order-item" data-require="./src/views/order-item-view">
        <div class="grid__item one-whole medium--six-twelfths">
            <div class="c-order-item__content c-order-item__content--figure-title">
<figure class="c-order-item__figure" c-order-item__figure--icon"
                            style="background-color:#fff;">
                        <img src="${icontodisplay}" title="" alt="" class="c-order-item__image" style="max-height: 4.25rem;" />
                    </figure>
                <div class="c-order-item__title">
                    <span class="c-order-item__author">${nametodisplay}:</span>
                </div>
            </div>
        </div>
        <div class="grid__item one-whole medium--two-twelfths">
            <dl class="c-order-item__content c-order-item__content--item-price">
                <dt class="c-order-item__row-label">Item price:</dt>
                <dd class="c-order-item__pricing" data-order-item-pricing=""><span class="c-order-item__pricing-price">${donation.Amount}</span></dd>
            </dl>
        </div>
        <div class="grid__item one-whole medium--two-twelfths">
            <dd class="c-order-item__quantity">
                <div class="e-quantity-selector">
                    <a class="e-quantity-selector__remove" ${deletetriggerthis} ${this.options.itemLineOutputAttrs.donationCode}=${donation.Code} data-quantity-selector-remove="" href="#">Remove</a>
                </div>
            </dd>
        </div>
        <div class="grid__item one-whole medium--two-twelfths">
            <dl class="c-order-item__content c-order-item__content--right c-order-item__content--item-total">
                <dt class="c-order-item__row-label">Item Total:</dt>
                <dd class="c-order-item__pricing">
                    <div class="c-order-item__pricing-price" data-item-row-price>${donation.Amount}</div>
                </dd>
            </dl>
        </div>
    </div>
</li>
`;
        }

        this.$lineItems.html(LineItemsHtml);

        setTimeout(() => {
            this.deleteComponent.init(this.$el.find(this.options.selectors.donationsRemove), {});
            this.deletepacComponent.init(this.$el.find(this.options.selectors.pacdonationsRemove), {});
        }, 0);
    }

    _updateAppliedDonationsHtml(data) {
        this.$appliedDonationTotalOutput.text(data.summary.donationTotal);
    }

    _updateSubtotalHtml(data) {
        this.$subtotalOutput.text(data.summary.subTotal);
    }

    _updateDonationsVisibility(data) {
        if (data.summary.isPacDonationAvailable === false) {
            globalEmitter.emit('donations:hidepac', this);
        }
    }

    _handleCartItemsChanged() {
        this._updateCartSummaryHtml();
    }

    _handleCartItemsRemoved() {
        this._updateCartSummaryHtml();
    }

    _handleDonationSelected(donationCode) {
        if ($('#sessionvalue').val() !== '') {
            this.firstclick = $('#sessionvalue').val();
        }

        this._updateDonation(true, donationCode);
        this.donationcodetoremove = `${donationCode}`;
        if (this.firstclick === 0 && (this.donationcodetoremove.includes('78820010') || this.donationcodetoremove.includes('78818728') ||
            this.donationcodetoremove.includes('78820002') || this.donationcodetoremove.includes('78820011'))) {
            this._triggerDonationClick();
        }
    }

    _handleDonationDeselected(donationCode) {
        this._updateDonation(false, donationCode);
    }

    _updateDonation(add, donationCode) {
        this.loadingSpinner.request(`${this.guid}-_updateDonation`);

        APIProxy.request({
            api: !add || donationCode.length === 0 ? 'removeDonation' : 'addDonation',
            queryString: `?donationCode=${donationCode}`,
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_updateDonation`);

                this._updateCartSummaryHtml();
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateDonation`);

                console.log(`ERROR: cart-summary-view : failed to remove donation code "${donationCode}". Status: ${status}, Error: ${err}`);
            },
        });
    }
}

export default () => {
    return new CartSummaryView();
};
