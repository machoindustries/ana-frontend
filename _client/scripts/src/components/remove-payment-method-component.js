import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class RemovePaymentMethodComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                lightboxConfirmButton: '[data-payment-confirm-removal]',
            },
            lightboxConfirmSrcName: 'removepaymentconfirmation',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();

        this.data = {};
        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        this.$el.on('click', this._triggerClick.bind(this)); // NB - root element needs to be the button clicked to trigger the action
    }

    _triggerClick(e) {
        e.preventDefault();

        this._openConfirmModal();
    }

    _openConfirmModal() {
        const self = this;

        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmSrcName]),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open() {
                    setTimeout(() => {
                        self._onConfirmModalOpened($(this.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onConfirmModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        $modalContent.find(this.options.selectors.lightboxConfirmButton).on('click', this._onConfirmClick.bind(this));
    }

    _onConfirmClick(e) {
        e.preventDefault();

        this._deleteAction(e);
    }

    _deleteAction(e) {
        e.preventDefault();

        const self = this;

        this.loadingSpinner.request(`${this.guid}-_deleteAction`);

        APIProxy.request({
            api: 'removePaymentMethod',
            queryData: {
                token: this.data.id,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                this.loadingSpinner.release(`${this.guid}-_deleteAction`);

                globalEmitter.emit('removepayment:dataupdated', self);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_deleteAction`);
            },
        });
    }

    setData(data) {
        this.data = data;
    }

    deactivate() {
        this.$el.remove();
    }
}

export default () => {
    return new RemovePaymentMethodComponent();
};
