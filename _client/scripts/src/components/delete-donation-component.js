import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class DeleteDonationComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                lightboxConfirmRemoveConfirmButton: '[data-confirm-remove]',
                donationAmountButton: '[data-donation-amount-button]',
                deleteError: '[data-delete-error]',
            },
            lightboxConfirmSrcName: 'confirmremoveitem',
            idAttr: 'data-donation-code',
            activeClass: 'is--active',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.id = this.$el.attr(this.options.idAttr);
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.loadingSpinner = new LoadingSpinner();

        this.$donationAmountButton = this.$el.find(this.options.selectors.donationAmountButton);
    }

    addListeners() {
        this.$el.on('click', this._confirmAndDelete.bind(this));
    }

    _confirmAndDelete(e) {
        e.preventDefault();
        e.stopPropagation();

        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmSrcName]),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open: () => {
                    setTimeout(() => {
                        this.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();

                        this._onConfirmModalOpened($($.magnificPopup.instance.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onConfirmModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();

        $modalContent.find(this.options.selectors.lightboxConfirmRemoveConfirmButton)
            .on('click', (e) => {return this._onConfirmDeleteClick(e, $modalContent);});
    }

    _onConfirmDeleteClick(e, $modalContent) {
        e.preventDefault();

        const $confirmBtn = $modalContent.find(this.options.selectors.lightboxConfirmRemoveConfirmButton);
        $confirmBtn.prop('disabled', true);

        this._delete($modalContent, $confirmBtn);
    }

    _delete($modalContent, $confirmBtn) {
        this.loadingSpinner.request(`${this.guid}-_deleteItem`);

        APIProxy.request({
            api: 'deleteDonation',
            queryData: {
                donationCode: this.id,
            },
            success: () => {
                $.magnificPopup.instance.close();

                globalEmitter.emit('orderitem:removed', this);
                globalEmitter.emit('donations:removed', this.id);

                this.loadingSpinner.release(`${this.guid}-_deleteItem`);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_deleteItem`);

                $confirmBtn.prop('disabled', false);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContent.find(this.options.selectors.deleteError),
                    context: 'DeleteDonationComponent._delete',
                });
            },
        });
    }

    setData(data) {
        this.data = data;
    }
}

export default () => {
    return new DeleteDonationComponent();
};