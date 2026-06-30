import BaseComponent from 'components/base-component';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import GTMHelper from 'modules/gtm-helper';
import APIProxy from 'modules/api-proxy';

class OrderItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                increaseQuantity: '[data-quantity-selector-increase]',
                decreaseQuantity: '[data-quantity-selector-decrease]',
                remove: '[data-quantity-selector-remove]',
                quantitySelectorInput: '[data-quantity-selector-input]',
                itemRow: '[data-order-item-row]',
                rowPrice: '[data-item-row-price]',
                itemPricingOutput: '[data-order-item-pricing]',
                lightboxConfirmRemoveConfirmButton: '[data-confirm-remove]',
                lightboxConfirmRemoveCancelButton: '[data-cancel-remove]',
                goToBulkPurchaseButton: '[data-go-to-bulkpurchase]',
                quantityMismatchError: '[data-quantity-mismatch-error]'
                // donationsRemoveTrigger: '[remove-data-donation-code]'
            },
            productCodeAttr: 'data-product-code',
            lightboxConfirmSrcName: 'confirmremoveitem',
            modalAdditionalClass: '',
            quantityMismatchErrorVerbiage: 'data-quantity-mismatch-error-verbiage',
            notification: {
                BulkLineItems: {
                    heading: 'Product Type Mismatch',
                    message: 'For Product Page (If clicked on Buy for Others button, when Individual product is in cart) : Cart contains few products which are not a Bulk Purchase. Please remove it to continue.',
                }
            },
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.removed = false;

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.$increaseQuantityButton = this.$el.find(this.options.selectors.increaseQuantity);
        this.$decreaseQuantityButton = this.$el.find(this.options.selectors.decreaseQuantity);
        this.$removeButton = this.$el.find(this.options.selectors.remove);
        this.$quantitySelectorInput = this.$el.find(this.options.selectors.quantitySelectorInput);
        this.$rowPriceOutput = this.$el.find(this.options.selectors.rowPrice);
        this.$itemPricingOutput = this.$el.find(this.options.selectors.itemPricingOutput);

        this.loadingSpinner = new LoadingSpinner();
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this._getProductCode();

        // this.deleteComponent = new DeleteDonationComponent();
        // this.deleteComponent.init(this.$el.find(this.options.selectors.donationsRemoveTrigger), {});

        this.$textBulkLineItemsItemsHeading = this.options.notification.BulkLineItems.heading;
        this.$textBulkLineItemsItemsError = this.options.notification.BulkLineItems.message;

        this.$quantityMismatchError = this.$el.find(this.options.selectors.quantityMismatchError);
        this.$goToBulkPurchaseButton = this.$el.find(this.options.selectors.goToBulkPurchaseButton);
        this._checkPurchaseType();
    }

    addListeners() {
        this.$increaseQuantityButton.on('click', this._onIncreaseQuantityClick.bind(this));
        this.$decreaseQuantityButton.on('click', this._onDecreaseQuantityClick.bind(this));
        this.$removeButton.on('click', this._onRemoveClick.bind(this));

        globalEmitter.on('discountcomponent:discountapplied', this._handleDiscountApplied.bind(this));
        globalEmitter.on('discountcomponent:discountremoved', this._handleDiscountRemoved.bind(this));
        globalEmitter.on('orderitem:removed', this._handleOrderItemRemoved.bind(this));
        globalEmitter.on('orderitem:quantityadjusted', this._handleOrderItemQuantityAdjusted.bind(this));
    }

    _getProductCode() {
        this.productCode = this.$el.attr(this.options.productCodeAttr);

        if (typeof this.productCode === 'undefined') {
            console.log('ERROR: order-item-view : productCode data attribute missing or incorrect');
        }
    }

    _handleDiscountApplied() {
        this._updateFromCartData();
    }

    _handleDiscountRemoved() {
        this._updateFromCartData();
    }

    _handleOrderItemRemoved(removedInstance) {
        if (this === removedInstance) {
            this.removed = true;

            return;
        }

        this._updateFromCartData();
    }

    _handleOrderItemQuantityAdjusted() {
        this._updateFromCartData();
    }

    _onIncreaseQuantityClick(e) {
        e.preventDefault();

        this._updateItemQuantity(1);
    }

    _onDecreaseQuantityClick(e) {
        e.preventDefault();

        this._updateItemQuantity(-1);
    }

    _onRemoveClick(e) {
        e.preventDefault();
        e.stopPropagation();

        this._confirmAndRemoveItem();
    }

    _sendGTM_Remove() {
        this.gtmHelper.customUserData();

        const data = this.gtmHelper.ecommerceRemoveFromCart(this.$containingProduct);

        globalEmitter.emit('gtm.ecommerce-removefromcart', data);
    }

    _confirmAndRemoveItem() {
        const self = this;

        $.magnificPopup.instance.close();

        this.$removeButton.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmSrcName]),
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

        $modalContent.find(this.options.selectors.lightboxConfirmRemoveConfirmButton).on('click', this._onConfirmRemoveClick.bind(this));
    }

    _onConfirmRemoveClick(e) {
        e.preventDefault();

        $.magnificPopup.instance.close();
        this._removeItem();
    }

    _onCancelRemoveClick(e) {
        e.preventDefault();

        $.magnificPopup.instance.close();
    }

    _updateItemQuantity(increment) {
        const currentQuantity = parseInt(this.$quantitySelectorInput.val(), 10);

        if (currentQuantity + increment <= 0) {
            this._confirmAndRemoveItem();

            return;
        }

        this.loadingSpinner.request(`${this.guid}-_updateItemQuantity`);

        APIProxy.request({
            api: 'updateCartItemQuantity',
            queryString: `?Code=${this.productCode}&Quantity=${currentQuantity + increment}`,
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_updateItemQuantity`);

                globalEmitter.emit('orderitem:quantityadjusted', this);
                globalEmitter.emit('orderitem:changed', this);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateItemQuantity`);

                console.log(`ERROR: order-item-view : failed to update item quantity. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _removeItem() {
        this.loadingSpinner.request(`${this.guid}-_removeItem`);

        APIProxy.request({
            api: 'removeCartItem',
            queryString: `?Code=${this.productCode}`,
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_removeItem`);

                this._remove();
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_removeItem`);

                console.log(`ERROR: order-item-view : failed to remove item. Status: ${status}, Error: ${err}`);
            },
        });
    }


    _updateFromCartData() {
        if (this.removed) {
            return;
        }

        this.loadingSpinner.request(`${this.guid}-_updateFromCartData`);

        APIProxy.request({
            api: 'getCart',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_updateFromCartData`);

                let found = false;

                // Update quantity and total price in dom
                for (let i = 0; i < data.Items.length; i++) {
                    const item = data.Items[i];

                    if (item.Code === this.productCode) {
                        found = true;

                        this.$quantitySelectorInput.val(item.Quantity);
                         
                        if (item.OriginalPlacedPrice && item.OriginalPlacedPrice.length > 0) {
                            //confirming placed price is not null
                        } else {
                            this.$itemPricingOutput.text(item.PlacedPrice);
                        }

                        // If a discount is applied to this item
                        let pricingHtml = `<span class="c-order-item__pricing-price">${item.RowPrice}</span>`;

                        if (item.DiscountedPrice && item.DiscountedPrice.length > 0) {
                            // show discount pricing markup
                            pricingHtml = `<span class="c-order-item__pricing-price c-order-item__pricing-price--old">${item.RowPrice}</span>
                                            <div class="c-order-item__pricing-price c-order-item__pricing-price--new">${item.DiscountedPrice}</div>
                                            <div class="c-order-item__pricing-price-caveat">${item.DiscountText}</div>`;
                        }

                        this.$rowPriceOutput.html(pricingHtml);
                    }
                }

                // If item is no longer in cart, remove it
                if (!found) {
                    this._remove();
                    return;
                }

                globalEmitter.emit('orderitem:updated', this);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateFromCartData`);

                console.log(`ERROR: order-item-view : failed to get cart data. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _checkPurchaseType() {
        const self = this;
        this.loadingSpinner.request(`${this.guid}-_checkPurchaseType`);
        APIProxy.request({
            api: 'checkPurchaseType',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_checkPurchaseType`);
                if (data.SingleLineItems) {
                    this._onCartStatusNotMatched(this.$textBulkLineItemsItemsHeading, this.$textBulkLineItemsItemsError);
                    return;
                }
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_checkPurchaseType`);
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                $.magnificPopup.instance.close();
                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContent('product to cart', 'add', `${status} ${responseStatus}`, err),
                        type: 'inline',
                    },
                    callbacks: {
                        open () {
                            setTimeout(() => {
                                self.$el.off('click.magnificPopup');
                                lightboxUtils.bindOpenModalButtons();
                            }, 0);
                        },
                    },
                    mainClass: this.options.modalAdditionalClass,
                }).magnificPopup('open');
            },
        });
    }

    _getQuantityMismatchProducts() {
        this.loadingSpinner.request(`${this.guid}-_getQuantityMismatchProducts`);
        APIProxy.request({
            api: 'getQuantityMismatchProducts',
            success: (data) => {
                let mismatchElement = document.getElementById('QuantityError');
                if (mismatchElement) {
                    if (data.length !== 0) {
                        let displayQuantityError = `${document.getElementById('QuantityErrorAfterRemove').getAttribute(this.options.quantityMismatchErrorVerbiage) }\n`;
                        data.forEach((item) => {
                            displayQuantityError = `${displayQuantityError + item }\r\n`;
                            console.log(displayQuantityError);
                        }, this);
                        document.getElementById('QuantityError').textContent = displayQuantityError;
                        mismatchElement.style.display = 'block';

                    } else {
                        mismatchElement.style.display = 'none';
                    }
                }

                this.loadingSpinner.release(`${this.guid}-_getQuantityMismatchProducts`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getQuantityMismatchProducts`);
                console.log(`ERROR: order-item-view : failed to remove quantity error. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _onCartStatusNotMatched(errorHeading, errorMsg) {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getErrorContentCustom(`<h4>${ errorHeading }</h4><p>${ errorMsg }</p>`),
                type: 'inline',
            },
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();
                    }, 0);
                },
            },
            mainClass: this.options.modalAdditionalClass,
        }).magnificPopup('open');
    }

    _remove() {
        this.$el.closest(this.options.selectors.itemRow).remove();
        this._sendGTM_Remove();
        this._getQuantityMismatchProducts();
        this._checkCartStatus();
        this._getEmptyAddressIdEnrollments();
        this._checkOrderEnrollmentsLimitExceeded();
        globalEmitter.emit('orderitem:removed', this);
    }

    _checkCartStatus() {
        this.loadingSpinner.request(`${this.guid}-_checkCartStatus`);
        APIProxy.request({
            api: 'checkPurchaseType',
            success: (data) => {
                let mismatchElement = document.getElementById('bulkSingleLineItemsMisMatch');
                if (mismatchElement) {
                    if (data.SingleLineItems && data.BulkLineItems) {
                        mismatchElement.style.display = 'block';
                    } else {
                        mismatchElement.style.display = 'none';
                    }
                }
                this.loadingSpinner.release(`${this.guid}-_checkCartStatus`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_checkCartStatus`);
                console.log(`ERROR: order-item-view : failed to check Cart Status error. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _getEmptyAddressIdEnrollments() {
        this.loadingSpinner.request(`${this.guid}-_getEmptyAddressIdEnrollments`);
        APIProxy.request({
            api: 'getEmptyAddressIdEnrollments',
            success: (data) => {
                let mismatchElement = document.getElementById('errorAllAddressNotExistsInPersonify');
                if (mismatchElement) {
                    if (data.emptyAddressEnrollments !== undefined && data.emptyAddressEnrollments.length !== 0) {

                        mismatchElement.style.display = 'block';
                    }
                    else {
                        mismatchElement.style.display = 'none';

                    }
                }
                this.loadingSpinner.release(`${this.guid}-_getEmptyAddressIdEnrollments`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getEmptyAddressIdEnrollments`);
                console.log(`ERROR: order-item-view : failed to get Empty AddressId Enrollments error. Status: ${status}, Error: ${err}`);
            },
        });
    }

    _checkOrderEnrollmentsLimitExceeded() {
        this.loadingSpinner.request(`${this.guid}-_checkOrderEnrollmentsLimitExceeded`);
        APIProxy.request({
            api: 'CheckOrderEnrollmentsLimitExceeded',
            success: (data) => {
                let mismatchElement = document.getElementById('errorLimitExceeded');
                if (mismatchElement) {
                    if (data) {

                        mismatchElement.style.display = 'block';
                    }
                    else {
                        mismatchElement.style.display = 'none';

                    }
                }
                this.loadingSpinner.release(`${this.guid}-_checkOrderEnrollmentsLimitExceeded`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_checkOrderEnrollmentsLimitExceeded`);
                console.log(`ERROR: order-item-view : failed to check Order Enrollments Limit Exceeded error. Status: ${status}, Error: ${err}`);
            },
        });
    }
}

export default () => {
    return new OrderItemView();
};
