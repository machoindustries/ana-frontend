import BaseComponent from 'components/base-component';
import 'magnific-popup';
import $ from 'jquery';
import animate from 'modules/animate';
import DiscountComponent from 'components/discount-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class OrderSummaryView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            contentSelector: '[data-order-summary-content]',
            selectors: {
                addDiscountButton: '[data-order-summary-discount-add]',
                removeDiscountButton: '[data-order-summary-discount-remove]',
                addDiscountPanel: '[data-order-summary-add-discount-panel]',
                applyDiscountButton: '[data-order-summary-apply-discount-code]',
                addDiscountField: '[data-order-summary-add-discount-field]',
                appliedDiscountCode: '[data-order-summary-applied-discount]',
                outputs: {
                    items: '[data-order-summary-output-items]',
                    tax: '[data-order-summary-output-tax]',
                    shipping: '[data-order-summary-output-shipping]',
                    shippingdiscount: '[data-order-summary-output-shippingdiscount]',
                    donations: '[data-order-summary-output-donations]',
                    total: '[data-order-summary-output-total]',
                    couponDiscounts: '[data-order-summary-output-coupon-discounts]',
                    couponDiscount: '[data-order-summary-output-coupon-discount]',
                    appliedDiscount: '[data-order-summary-output-applied-discount]',
                },
            },
            attrs: {
                appliedDiscountCode: 'data-discount-code',
                appliedDiscount: 'data-order-summary-applied-discount',
                removeDiscountButton: 'data-order-summary-discount-remove',
            },
            animDuration: 250,
            defaultDiscountName: 'Customer discount',
            currencySymbol: '$',
            modalAdditionalClass: 'mfp-fade',
            clientServerKeyMappings: {
                itemTotal: 'ItemTotal',
                subTotal: 'SubTotal',
                taxTotal: 'TaxTotal',
                shippingDiscountTotal: 'ShippingDiscountTotal',
                shippingSubtotal: 'ShippingSubtotal',
                shippingTaxTotal: 'ShippingTaxTotal',
                shippingTotal: 'ShippingTotal',
                shippingDiscount: 'ShippingDiscount',
                donationTotal: 'DonationTotal',
                cartTotal: 'CartTotal',
                discountTotal: 'DiscountTotal',
                appliedDiscountTotal: 'AppliedDiscountTotal',
                couponDiscountTotal: 'CouponDiscountTotal',
                couponDiscounts: 'CouponDiscounts',
                discount: 'Discount',
                discountCode: 'DiscountCode',
                displayName: 'DisplayName',
                donations: 'Donations',
                taxText: 'TaxText',
                amount: 'Amount',
                code: 'Code',
            },
            clientKeysWithCurrencyValue: [
                'subTotal',
                'taxTotal',
                'shippingTotal',
                'donationTotal',
                'cartTotal',
                'couponDiscountTotal',
                'appliedDiscountTotal',
            ],
            enabledClass: 'is--enabled',
        };

        this.summaryData = {
            subTotal: 0,
            taxTotal: 0,
            shippingTotal: 0,
            shippingDiscount: 0,
            donationTotal: 0,
            cartTotal: 0,
            couponDiscountTotal: 0,
            couponDiscounts: [],
            appliedDiscountTotal: 0,
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.discountComponent = new DiscountComponent();
        this.discountComponent.init(this.$el);

        this.$contentPanel = this.$el.find(this.options.contentSelector);
        this.$addDiscountButton = this.$el.find(this.options.selectors.addDiscountButton);
        this.$applyDiscountButton = this.$el.find(this.options.selectors.applyDiscountButton);
        this.$addDiscountPanel = this.$el.find(this.options.selectors.addDiscountPanel);
        this.$addDiscountField = this.$el.find(this.options.selectors.addDiscountField);

        this.$outputItems = this.$el.find(this.options.selectors.outputs.items);
        this.$outputTax = this.$el.find(this.options.selectors.outputs.tax);
        this.$outputShipping = this.$el.find(this.options.selectors.outputs.shipping);
        this.$outputShippingDiscount = this.$el.find(this.options.selectors.outputs.shippingdiscount);
        this.$outputDonations = this.$el.find(this.options.selectors.outputs.donations);
        this.$outputTotal = this.$el.find(this.options.selectors.outputs.total);
        this.$outputCouponDiscount = this.$el.find(this.options.selectors.outputs.couponDiscount);
        this.$outputCouponDiscounts = this.$el.find(this.options.selectors.outputs.couponDiscounts);
        this.$outputAppliedDiscount = this.$el.find(this.options.selectors.outputs.appliedDiscount);

        this.loadingSpinner = new LoadingSpinner();

        this.initialLoadEventSent = false;
    }

    addListeners() {
        this.$addDiscountButton.on('click', this._addDiscountButtonClick.bind(this));
        this.$applyDiscountButton.on('click', this._applyDiscountButtonClick.bind(this));

        globalEmitter.on('shippingaddress:applied', this._handleShippingAddressApplied.bind(this));
        globalEmitter.on('shippingmethod:updated', this._handleShippingMethodUpdated.bind(this));

        setTimeout(() => {
            this._closeAddDiscountPanel(0);
        }, 0);
    }

    _addDiscountButtonClick(e) {
        e.preventDefault();

        this._openAddDiscountPanel();
    }

    _applyDiscountButtonClick(e) {
        e.preventDefault();

        this._closeAddDiscountPanel();
        this._applyDiscount();
    }

    _applyDiscount() {
        this.discountComponent.addDiscount(
            this.$addDiscountField.val(),
            this._onApplyDiscountSuccess.bind(this)
        );
    }

    _onApplyDiscountSuccess() {
        this._getUpdatedSummary();
    }

    _handleShippingAddressApplied() {
        this._getUpdatedSummary();
        this._sendInitialSummaryData();
    }

    _handleShippingMethodUpdated() {
        this._getUpdatedSummary();
    }

    _sendInitialSummaryData() {
        if (this.initialLoadEventSent) {
            return;
        }

        globalEmitter.emit('checkoutordersummary:initialised', this);

        this.initialLoadEventSent = true;
    }

    _getUpdatedSummary() {
        this.loadingSpinner.request(`${this.guid}-_getUpdatedSummary`);

        APIProxy.request({
            api: 'getCartSummary',
            success: (data) => {
                this._applySummary(data);

                this.loadingSpinner.release(`${this.guid}-_getUpdatedSummary`);

                this._enable();
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getUpdatedSummary`);

                globalEmitter.emit('ajaxerror', this);
            },
        });
    }

    _enable() {
        this.$el.addClass(this.options.enabledClass);
    }

    _applySummary(summaryObjectFromServer) {
        this.summaryData = JSON.parse(Utils.convertJSONKeysServerToClient(JSON.stringify(summaryObjectFromServer), this.options.clientServerKeyMappings));

        // Fill any empty currency props with appropriate zero value
        for (const key in this.summaryData) {
            if (this.summaryData[key]) {
                if (Object.hasOwn(this.summaryData, key) && this.summaryData[key].length === 0) {
                    if (this.options.clientKeysWithCurrencyValue.indexOf(key) !== -1) {
                        this.summaryData[key] = '$0.00';
                    }
                }
            }
        }

        this._populateSummary();

        if (parseFloat(this.summaryData.cartTotal.replace('$', '')) > 0.0) {
            globalEmitter.emit('checkout:carttotalnonzero', this);
        } else {
            globalEmitter.emit('checkout:carttotalzero', this);
        }
    }

    _populateSummary() {
        this.$outputItems.html(`${this.summaryData.itemTotal}`);
        this.$outputTax.html(`${this.summaryData.taxTotal}`);
        this.$outputShipping.html(`${this.summaryData.shippingTotal}`);
        this.$outputShippingDiscount.html(`-${this.summaryData.shippingDiscount}`);
        this.$outputTotal.html(`${this.summaryData.cartTotal}`);
        this.$outputCouponDiscount.html(`-${this.summaryData.couponDiscountTotal}`);
        this.$outputCouponDiscounts.html(this._getCouponDiscountsHTML());
        this.$outputAppliedDiscount.html(`-${this.summaryData.appliedDiscountTotal}`);

        this._getDonations();

        this._bindRemoveDiscountButtonHandlers();
    }

    _getDonations() {
        if (this.summaryData.donations && this.summaryData.donations.length > 0) {
            this.$outputDonations.html(this.summaryData.donations.map((d) => {
                return `
                <div class="c-order-summary__section">
                    <dl class="c-order-summary__row">
                        <dt class="c-order-summary__item c-order-summary__item--label">
                            ${ d.displayName}:
                            <span class="c-order-summary__item--discount">${ d.taxText}</span>
                        </dt>
                        <dd class="c-order-summary__item c-order-summary__item--value">${ d.amount}</dd>
                    </dl>
                </div>
                `;
            }
            ));
            this.$outputDonations.show();
        } else {
            this.$outputDonations.hide();
        }
    }

    _getCouponDiscountsHTML() {
        let discountsHtml = '';

        if (this.summaryData.couponDiscounts) {
            for (let d = 0; d < this.summaryData.couponDiscounts.length; d++) {
                const discount = this.summaryData.couponDiscounts[d];
                if (discount.discountCode) {
                    discountsHtml = `${discountsHtml }<dl class="c-order-summary__row-dl c-order-summary__applied-discount grid" ${this.options.attrs.appliedDiscount} ${this.options.attrs.appliedDiscountCode}="${discount.discountCode}">
                                <dt class="c-order-summary__item--discount grid__item one-half">${discount.displayName}</dt>
                                <dd class="c-order-summary__item c-order-summary__item--value grid__item one-half">
                                    <a class="c-order-summary__remove-discount" href="#" ${this.options.attrs.removeDiscountButton}>Remove</a>
                                </dd>
                            </dl>`;
                } else {
                    discountsHtml = `${discountsHtml }<dl class="c-order-summary__row-dl c-order-summary__applied-discount grid" ${this.options.attrs.appliedDiscount} ${this.options.attrs.appliedDiscountCode}="${discount.discountCode}">
                                <dt class="c-order-summary__item--discount grid__item one-half">${discount.displayName}</dt>
                                <dd class="c-order-summary__item c-order-summary__item--value grid__item one-half">
                                </dd>
                            </dl>`;
                }
            }
        }

        return discountsHtml;
    }

    _bindRemoveDiscountButtonHandlers() {
        setTimeout(() => {
            const self = this;

            this.$outputCouponDiscounts.find(this.options.selectors.removeDiscountButton).on('click', function(e) {
                e.preventDefault();

                self._removeAppliedDiscount($(this)); // eslint-disable-line no-invalid-this
            });
        }, 0);
    }

    _removeAppliedDiscount($removeBtn) {
        const $discount = $removeBtn.closest(this.options.selectors.appliedDiscountCode);
        const discountCode = $discount.attr(this.options.attrs.appliedDiscountCode);

        this.loadingSpinner.request(`${this.guid}-_removeAppliedDiscount`);

        APIProxy.request({
            api: 'removeDiscountCode',
            queryString: `?DiscountCode=${discountCode}`,
            success: (data) => {
                $discount.remove();

                this._getUpdatedSummary();

                this.loadingSpinner.release(`${this.guid}-_removeAppliedDiscount`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_removeAppliedDiscount`);

                globalEmitter.emit('ajaxerror', this);
            },
        });
    }

    _openAddDiscountPanel(duration) {
        let theDuration = duration;

        const easing = 'ease-in-out',
            dir = 'slideDown';

        if (typeof theDuration === 'undefined') {
            theDuration = this.options.animDuration;
        }

        animate(this.$addDiscountPanel[0], dir, { theDuration, easing }, this);
        this.$addDiscountPanel.attr('aria-expanded', false);
        this.$addDiscountButton.hide();
    }

    _closeAddDiscountPanel(duration) {
        let theDuration = duration;

        const easing = 'ease-in-out',
            dir = 'slideUp';

        if (typeof theDuration === 'undefined') {
            theDuration = this.options.animDuration;
        }

        animate(this.$addDiscountPanel[0], dir, { theDuration, easing }, this);
        this.$addDiscountPanel.attr('aria-expanded', false);
        this.$addDiscountButton.show();
    }
}

export default () => {
    return new OrderSummaryView();
};
