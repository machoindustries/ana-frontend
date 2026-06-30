import BaseComponent from 'components/base-component';
import AddUpdateEnrollmentComponent from 'components/add-update-enrollment-component';
import DeleteEnrollmentComponent from 'components/delete-enrollment-component';
import APIProxy from 'modules/api-proxy';
import globalEmitter from 'modules/global-emitter';
import lightboxUtils from 'modules/lightbox-utils';
import LoadingSpinner from 'modules/loading-spinner';

class AccountEnrollmentsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            confirmMessage: {
                deleteRecord: { message: 'Are you sure you want to delete a record from this list?' },
            },
            selectors: {
                editComponent: '[data-account-enrollment-edit]',
                deleteComponent: '[data-account-enrollment-delete]',
                decreasequantity: '[data-quantity-enrollment-selector-decrease]',
                increasequantity: '[data-quantity-enrollment-selector-increase]',
                inputquantity: '[data-quantity-selector-input]',
                idAttr: '[data-id]',
                lightboxHeading: '[data-lightbox-heading]',
                lightboxContent: '[data-lightbox-text]',
                lightboxConfirmRemoveConfirmButton: '[data-confirm-remove]',
                lightboxConfirmText: '[data-lightbox-text]',
            },
            lightboxEnrollmentPopup: 'enrollmentpopup',
            lightboxEditSrcName: 'enrollmentedit',
            modalInnerClass: 'e-modal__content',
            lightboxConfirmSrcName: 'enrollmentconfirmdelete',
            deleteTriggerAttr: 'data-account-enrollment-delete',
            idAttribute: 'data-id',
        };
    }

    initChildren() {
        this.data = {};
        this.editComponent = new AddUpdateEnrollmentComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});

        this.$deleteRecordMessage = this.options.confirmMessage.deleteRecord.message;

        this.$decreasequantitybtn = this.$el.find(this.options.selectors.decreasequantity);
        this.$increasequantitybtn = this.$el.find(this.options.selectors.increasequantity);

        this.$quantitySelectorInput = this.$el.find(this.options.selectors.inputquantity);
        this.$idAttr = this.$el.find(this.options.selectors.idAttr);

        this.deleteComponent = new DeleteEnrollmentComponent('delete', this.options.lightboxEditSrcName);
        this.deleteComponent.init(this.$el.find(this.options.selectors.deleteComponent), {});

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        this.$decreasequantitybtn.on('click', this._onDecreaseQuantityClick.bind(this));
        this.$increasequantitybtn.on('click', this._onIncreaseQuantityClick.bind(this));
    }

    _onIncreaseQuantityClick(e) {
        e.preventDefault();
        this._updateItemQuantity(1);
    }

    _onDecreaseQuantityClick(e) {
        e.preventDefault();

        this._updateItemQuantity(-1);
    }

    _populateData() {
        this.editComponent.setData(this.data);
    }

    _updateItemQuantity(increment) {
        let currentQuantity = parseInt(this.$quantitySelectorInput.val(), 10);
        let updatedQuantity = currentQuantity + increment;
        if (updatedQuantity <= 0) {
            this._confirmAndRemoveItem();
            return;
        }

        this.loadingSpinner.request(`${this.guid}-_updateItemQuantity`);
        let id = this.$idAttr[0].innerHTML;
        let quantity = updatedQuantity;

        APIProxy.request({
            api: 'updateQuantity',
            queryData: {
                id,
                quantity
            },
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_updateItemQuantity`);
                globalEmitter.emit('updatequantity:dataupdated', this);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateItemQuantity`);

                this._openErrorPopup(
                    'Error Updating Quantity',
                    'There was a problem updating the quantity. Please try again.'
                );
            },
        });
    }

    _confirmAndRemoveItem() {
        const self = this;
        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmSrcName]),
                type: 'inline',
            },
            mainClass: this.options.modalAdditionalClass,
            callbacks: {
                open () {
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
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxConfirmText).text(this.$deleteRecordMessage);
        $modalContent.find(this.options.selectors.lightboxConfirmRemoveConfirmButton).on('click', this._onConfirmDeleteClick.bind(this));
    }

    _onConfirmDeleteClick(e) {
        e.preventDefault();
        $.magnificPopup.instance.close();
        this._delete();
    }

    _openErrorPopup(errorHeading, errorMsg) {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxEnrollmentPopup]),
                type: 'inline',
            },
            callbacks: {
                open() {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        const $modalContentInner = $(this.content[0]).find(`.${self.options.modalInnerClass}`);
                        $modalContentInner.find(self.options.selectors.lightboxHeading).text(errorHeading);
                        $modalContentInner.find(self.options.selectors.lightboxContent).text(errorMsg);

                        lightboxUtils.bindOpenModalButtons();
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _delete() {
        this.loadingSpinner.request(`${this.guid}-_delete`);

        const self = this;
        APIProxy.request({
            api: 'deleteEnrollment',
            queryData: {
                id: this.$idAttr[0].innerHTML,
            },
            success: (data) => {
                $.magnificPopup.instance.close();

                globalEmitter.emit('deleteenrollment:deleted', self);

                this.loadingSpinner.release(`${this.guid}-_delete`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_delete`);

                this._openErrorPopup(
                    'Error Deleting Recipient',
                    'There was a problem deleting this recipient. Please try again.'
                );
            },
        });
    }

    setData(data) {
        this.data = data;
        this._populateData();
    }
}

export default () => {
    return new AccountEnrollmentsItemView();
};
