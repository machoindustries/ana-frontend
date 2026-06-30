import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';

class DeleteEnrollmentComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            confirmMessage: {
                deleteRecord: { message: 'Are you sure you want to delete a record from this list?' },
                deleteAll: { message: 'Are you sure you want to delete all the records from the list?' },
            },
            selectors: {
                lightboxConfirmRemoveConfirmButton: '[data-confirm-remove]',
                lightboxConfirmText: '[data-lightbox-text]',
                deleteError: '[data-delete-error]',
            },
            lightboxConfirmSrcName: 'enrollmentconfirmdelete',
            modalInnerClass: 'e-modal__content',
            idAttr: 'data-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.idAttr = this.$el.attr(this.options.idAttr);
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.loadingSpinner = new LoadingSpinner();
        this.$deleteRecordMessage = this.options.confirmMessage.deleteRecord.message;
        this.$deleteAllMessage = this.options.confirmMessage.deleteAll.message;
    }

    addListeners() {
        this.$el.on('click', this._confirmAndDelete.bind(this));
    }

    _confirmAndDelete(e) {
        e.preventDefault();

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

        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);

        if (typeof this.idAttr !== 'undefined') {
            $modalContentInner.find(this.options.selectors.lightboxConfirmText).text(this.$deleteRecordMessage);
        } else {
            $modalContentInner.find(this.options.selectors.lightboxConfirmText).text(this.$deleteAllMessage);
        }
    }

    _onConfirmDeleteClick(e, $modalContent) {
        e.preventDefault();

        const $confirmBtn = $modalContent.find(this.options.selectors.lightboxConfirmRemoveConfirmButton);
        $confirmBtn.prop('disabled', true);

        this._delete($modalContent, $confirmBtn);
    }

    _delete($modalContent, $confirmBtn) {
        this.loadingSpinner.request(`${this.guid}-_delete`);

        APIProxy.request({
            api: 'deleteEnrollment',
            queryData: {
                id: this.idAttr,
            },
            success: () => {
                $.magnificPopup.instance.close();

                globalEmitter.emit('deleteenrollment:deleted', this);

                this.loadingSpinner.release(`${this.guid}-_delete`);
            },
            error: (jqxhr) => {
                this.loadingSpinner.release(`${this.guid}-_delete`);

                $confirmBtn.prop('disabled', false);

                Utils.handleAjaxError(jqxhr, {
                    displayEl: $modalContent.find(this.options.selectors.deleteError),
                    context: 'DeleteEnrollmentComponent._delete',
                });
            },
        });
    }

    setData(data) {
        this.data = data;
    }
}

export default () => {
    return new DeleteEnrollmentComponent();
};