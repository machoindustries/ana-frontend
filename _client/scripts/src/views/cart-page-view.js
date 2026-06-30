import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import LoadingSpinner from 'modules/loading-spinner';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import $ from 'jquery';
import APIProxy from 'modules/api-proxy';
import GTMHelper from 'modules/gtm-helper';

class CartPageView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                hideWhenEmpty: '[data-hide-when-cart-empty]',
                emptyCartHtml: '[data-empty-cart-html]',
                orderItem: '[data-order-item-row]',
                oneclickHtml: '[oneclick-html]',
            },
            lightboxOneClickSrcName: 'oneclickmembership',
        };
    }

    initChildren() {
        this.$hideWhenEmpty = this.$el.find(this.options.selectors.hideWhenEmpty);
        this.$emptyCartHtml = this.$el.find(this.options.selectors.emptyCartHtml);
        this.loadingSpinner = new LoadingSpinner();
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
        this.$oneclickHtml = this.$el.find(this.options.selectors.oneclickHtml);

        this._checkOneClickMembershipEligibility();
    }

    addListeners() {
        globalEmitter.on('orderitem:removed', this._handleOrderItemRemoved.bind(this));
    }

    _handleOrderItemRemoved() {
        if (this.$el.find(this.options.selectors.orderItem).length === 0) {
            this._showEmptyCart();
        } else {
            this._hideEmptyCart();
        }
    }

    _showEmptyCart() {
        this.$hideWhenEmpty.hide();
        this.$emptyCartHtml.show();
    }

    _hideEmptyCart() {
        this.$emptyCartHtml.hide();
        this.$hideWhenEmpty.show();
    }
    _checkOneClickMembershipEligibility() {
        this.loadingSpinner.request(`${this.guid}-_checkOneClickMembershipEligibility`);
        APIProxy.request({
            api: 'checkOneClickMembershipEligibility',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_checkOneClickMembershipEligibility`);
                if (data) {
                    const self = this;

                    this.$el.magnificPopup({
                        items: {
                            src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxOneClickSrcName]),
                            type: 'inline',
                        },
                        mainClass: this.options.modalAdditionalClass,
                        callbacks: {
                            open () {
                                setTimeout(() => {
                                    self.$el.off('click.magnificPopup');

                                    lightboxUtils.bindOpenModalButtons();

                                    self._onOneClickModalOpened($(this.content[0]));
                                }, 0);
                            },
                        },
                    }).magnificPopup('open');
                }
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_checkOneClickMembershipEligibility`);
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
    _onOneClickModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();
        let html = $modalContent.find(this.options.selectors.oneclickHtml).html();

        // Check if the content is empty or just whitespace
        if (!html || !$.trim(html)) {
            console.warn('No content found in the lightbox. Closing the popup.');

            // Close the popup if no content is found
            $.magnificPopup.close();
            return; // Exit the function
        }
    }
}

export default () => {
    return new CartPageView();
};
