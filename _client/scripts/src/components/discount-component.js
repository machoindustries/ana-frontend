import BaseComponent from 'components/base-component';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import APIProxy from 'modules/api-proxy';

class DiscountComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            modalAdditionalClass: 'mfp-fade',
        };
    }

    addDiscount(discountCode, cbSuccess, cbFailure) {
        const self = this;
        let jsondata = '';

        APIProxy.request({
            api: 'addDiscountCode',
            queryString: `?DiscountCode=${discountCode}`,
            success: (data) => {
                if (typeof cbSuccess === 'function') {
                    cbSuccess(data);
                }

                globalEmitter.emit('discountcomponent:discountapplied', this);

                $.magnificPopup.instance.close();
                jsondata = JSON.parse(data);

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContentCustom(`<h2>${ jsondata.messagediscounttitle }</h2><p>${ jsondata.messagediscounttext }</p>`),
                        type: 'inline',
                    },
                    callbacks: {
                        open() {
                            setTimeout(() => {
                                self.$el.off('click.magnificPopup');

                                lightboxUtils.bindOpenModalButtons();
                            }, 0);
                        },
                        close: function close() {
                            location.reload();
                        },
                    },
                    mainClass: this.options.modalAdditionalClass,
                }).magnificPopup('open');
            },
            error: (jqxhr, status, err) => {
                if (typeof cbFailure === 'function') {
                    cbFailure(jqxhr, status, err);
                }

                $.magnificPopup.instance.close();

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContentCustom('<h2>Sorry</h2><p>The code you entered is invalid.</p>'),
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
                    mainClass: this.options.modalAdditionalClass,
                }).magnificPopup('open');

                console.log(`ERROR: discount-component : failed to add discount code. Status: ${status}, Error: ${err}`);
            },
        });
    }

    removeDiscount(discountCode, cbSuccess, cbFailure) {
        const self = this;

        APIProxy.request({
            api: 'removeDiscountCode',
            queryString: `?DiscountCode=${discountCode}`,
            success: (data) => {
                if (typeof cbSuccess === 'function') {
                    cbSuccess(data);
                }

                globalEmitter.emit('discountcomponent:discountremoved', this);
            },
            error: (jqxhr, status, err) => {
                if (typeof cbFailure === 'function') {
                    cbFailure(jqxhr, status, err);
                }

                $.magnificPopup.instance.close();

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContent('discount', 'remove', status, err),
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
                    mainClass: this.options.modalAdditionalClass,
                }).magnificPopup('open');

                console.log(`ERROR: discount-component : failed to remove discount code. Status: ${status}, Error: ${err}`);
            },
        });
    }
}

export default () => {
    return new DiscountComponent();
};
