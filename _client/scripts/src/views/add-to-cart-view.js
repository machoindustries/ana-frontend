import BaseComponent from 'components/base-component';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import lightboxUtils from 'modules/lightbox-utils';
import 'magnific-popup';
import $ from 'jquery';
import GTMHelper from 'modules/gtm-helper';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class AddToCartView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                addToCartButton: '[data-add-to-cart]',
                form: '[data-add-to-cart-form]',
                variantDropdownSelector: '[data-add-to-cart-variant]',
                containingProduct: '[data-product]',
                pricing: '[data-product-pricing]',
                parentProduct: '[data-product]',
                gtmPricingInfo: '[data-gtm-pricing-info]',
                goToBulkPurchaseButton: '[data-go-to-bulkpurchase]',
                goToBulkPurchaseLink: '[data-go-to-bulkpurchase-link]',
                quantityTextbox: '[data-quantity-textbox]',
            },
            notification: {
                LineItemsPurchaseRestrictions: {
                    heading: 'Product Type Mismatch',
                    message: 'Please note that if you are making a purchase with multiple recipients, you are not able to make a single purchase for a single recipient at this time.',
                },
            },
            lightboxConfirmSrcName: 'addedtocartconfirmation',
            variantPriceAttr: 'data-variant-price',
            variantFormatAttr: 'data-variant-format',
            pricingPriceAttr: 'data-product-price',
            pricingFormatAttr: 'data-product-format',
            gtmPartialPriceAttr: 'data-gtm-price-normal',
            gtmPartialMemberPriceAttr: 'data-gtm-price-member',
            gtmHasMemberPriceAttr: 'data-gtm-personalisation-hasmembershipprice',
            currencySymbol: '$',
            bulkPurchaseAttr: 'data-variant-bulk-purchase',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$addToCartButton = this.$el.find(this.options.selectors.addToCartButton);
        this.$form = this.$el.find(this.options.selectors.form);
        this.$variantDropdown = this.$el.find(this.options.selectors.variantDropdownSelector);
        this.$containingProduct = this.$el.closest(this.options.selectors.containingProduct);

        this.loadingSpinner = new LoadingSpinner();
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this.$hasMemberPrice = $('body').find(`[${this.options.gtmHasMemberPriceAttr}]`);
        this.hasMemberPrice = this.$hasMemberPrice.length > 0 ? this.$hasMemberPrice.attr(this.options.gtmHasMemberPriceAttr) === 'Yes' : false;
        this.$quantityTextbox = this.$el.find(this.options.selectors.quantityTextbox);

        this.$goToBulkPurchaseButton = this.$el.find(this.options.selectors.goToBulkPurchaseButton);
        this.$goToBulkPurchaseLink = this.$el.find(this.options.selectors.goToBulkPurchaseLink);

        this.$textLineItemsPurchaseRestrictionsHeading = this.options.notification.LineItemsPurchaseRestrictions.heading;
        this.$textLineItemsPurchaseRestrictionsError = this.options.notification.LineItemsPurchaseRestrictions.message;
        this.isBulkPurchase = false;
    }

    addListeners() {
        this.$addToCartButton.on('click', (e) => {
            return this._addToCartButtonClick(e);
        });
        this.$variantDropdown.on('change', (e) => {
            this._onVariantChanged(e);
        });

        this.$goToBulkPurchaseButton.on('click', (e) => {
            return this._goToBulkPurchaseButtonClick(e);
        });
    }
    _onVariantChanged(e) {
        const $variantOption = this.$variantDropdown.find('option:selected');
        let variantFormat = $variantOption.attr(this.options.variantFormatAttr);
        console.log(variantFormat);

        if (variantFormat && variantFormat.toLowerCase() === 'paperback') {
            this.$quantityTextbox.prop('disabled', false);
        } else {
            this.$quantityTextbox.prop('disabled', true);
            this.$quantityTextbox.val(1);
        }
    }

    _addToCartButtonClick(e) {
        this._addToCart(e);
    }

    _goToBulkPurchaseButtonClick(e) {

        this._goToBulkPurchase(e);
    }

    _sendGTM($variantOption, $pricing) {
        this.gtmHelper.customUserData();

        let gtmPrice = $variantOption.attr(this.options.variantPriceAttr);

        let gtmFormat = $variantOption.attr(this.options.variantFormatAttr);

        // If there is no variant option selected, but there is a pricing UI, this is a PDP with no variants (hence no dropdown) - get data from here instead
        if (!gtmPrice && $variantOption.length === 0 && $pricing.length > 0) {
            gtmPrice = $pricing.attr(this.options.pricingPriceAttr);
            gtmFormat = $pricing.attr(this.options.pricingFormatAttr);
        }

        if (!gtmPrice) {
            const $pricingInfo = this.$el.closest(this.options.selectors.parentProduct).find(this.options.selectors.gtmPricingInfo);

            if ($pricingInfo.length === 0) {
                gtmPrice = '';
            } else {
                gtmPrice = this.hasMemberPrice ? $pricingInfo.attr(this.options.gtmPartialMemberPriceAttr) : $pricingInfo.attr(this.options.gtmPartialMemberPriceAttr);
            }
        }

        if (!gtmPrice) {
            gtmPrice = '';
        }

        const data = this.gtmHelper.ecommerceAddToCart(this.$containingProduct, gtmPrice.replace(this.options.currencySymbol, ''), gtmFormat);

        globalEmitter.emit('gtm.ecommerce-addtocart', data);
    }

    _addToCart(e) {
        e.preventDefault();

        const self = this;

        // If no variant is selected, display an error
        const $variantOption = this.$variantDropdown.find('option:selected');

        // Jira Ticket - DT2-859 - Enable Online Book Sales (roll back DT2-855)
        if (this.$variantDropdown.length > 0 && ($variantOption.length === 0 || $variantOption.is(':disabled'))) {
            this._onNoVariantSelected();

            return;
        }

        let $pricing = this.$el.find(this.options.selectors.pricing);

        const formData = this.$form.serialize();
        this.loadingSpinner.request(`${this.guid}-CartBulkSingleStatus`);

        APIProxy.request({
            api: 'CartBulkSingleStatus',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-CartBulkSingleStatus`);
                if (data.BulkLineItems) {
                    this._onCartStatusNotMatched(this.$textLineItemsPurchaseRestrictionsHeading, this.$textLineItemsPurchaseRestrictionsError);
                    return;
                }
                
                this.loadingSpinner.request(`${this.guid}-_addToCart`);

                APIProxy.request({
                    api: 'addToCart',
                    queryData: formData,
                    success: (responseData) => {
                        if ($pricing.length === 0 && data.CartItemMetaData && data.CartItemMetaData.PlacedPrice) {
                            $pricing = $(`<div data-product-pricing="${data.CartItemMetaData.PlacedPrice}" data-product-format="" />`);
                        }

                        this.loadingSpinner.release(`${this.guid}-_addToCart`);

                        this.$containingProduct.attr('data-product-cart-item-metadata', JSON.stringify(data.CartItemMetaData));

                        this._sendGTM($variantOption, $pricing);

                        globalEmitter.emit('orderitem:updated', this);

                        $.magnificPopup.instance.close();

                        this.$el.magnificPopup({
                            items: {
                                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmSrcName]),
                                type: 'inline',
                            },
                            preloader: false,
                            mainClass: this.options.modalAdditionalClass,
                            callbacks: {
                                open () {
                                    setTimeout(() => {
                                        self.$el.off('click.magnificPopup');

                                        self._onConfirmModalOpened($(this.content[0]));
                                    }, 0);
                                },
                            },
                        }).magnificPopup('open');
                    },
                    error: (jqxhr, status, err) => {
                        this.loadingSpinner.release(`${this.guid}-_addToCart`);

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
                
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-CartBulkSingleStatus`);
                this._onAPIError(jqxhr, status, err);
            },
        });
    }

    _onConfirmModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();
    }

    _onNoVariantSelected() {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getErrorContentCustom('<h4>No format selected</h4><p>Please select a product format/variant from the dropdown list and try again.</p>'),
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

    _onNoBulkPurchase() {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getErrorContentCustom('<h4>Buy For Others</h4><p>This option is not available for the selected format. Please select a different variant from the dropdown list and try again.</p>'),
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

    _onAPIError(jqxhr, status, err) {
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
    }

    _gotoBulkPurchasePage() {
        this.loadingSpinner.request(`${this.guid}-_gotoBulkPurchasePage`);
        const formData = this.$form.serialize();
        APIProxy.request({
            api: 'setProductCode',
            queryData: formData,
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_gotoBulkPurchasePage`);
                console.log("success"); console.log(data);
                if (data) {
                    window.location.href = this.$goToBulkPurchaseLink.attr('href');
                }
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_gotoBulkPurchasePage`);
                console.log("error");
            },
        });
    }

    _goToBulkPurchase(e) {
        e.preventDefault();
        const $variantOption = this.$variantDropdown.find('option:selected');

        if (this.$variantDropdown.length > 0 && ($variantOption.length === 0 || $variantOption.is(':disabled'))) {
            this._onNoVariantSelected();
            return;
        }
        if (this.$variantDropdown.length > 0) {
            if ($variantOption.attr(this.options.bulkPurchaseAttr) === "False") {
                this._onNoBulkPurchase();
                return;
            }
        }
        this.loadingSpinner.request(`${this.guid}-CartBulkSingleStatus`);

        APIProxy.request({
            api: 'CartBulkSingleStatus',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-CartBulkSingleStatus`);
                if (data.SingleLineItems) {
                    this._onCartStatusNotMatched(this.$textLineItemsPurchaseRestrictionsHeading, this.$textLineItemsPurchaseRestrictionsError);
                    return;
                }
                
                    this._gotoBulkPurchasePage();
                
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-CartBulkSingleStatus`);
                this._onAPIError(jqxhr, status, err);
            },
        });

    }
}

export default () => {
    return new AddToCartView();
};
