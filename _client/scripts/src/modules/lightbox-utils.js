import $ from 'jquery';

const lightboxUtilsOptions = {
    lightboxSrcAttr: 'data-lightbox-src',
    modalParentClass: 'e-modal',
    modalInnerClass: 'e-modal__content',
    openModalSelector: '.mfp-content',
    modalAdditionalCloseButtonSelector: '[data-modal-close]',
    activeClass: 'is--active'
};

class LightboxUtils {

    static getResultContent (subject, action, result) {

        return result !== false ?
            `<h3>Success</h3><p>The ${subject} has been successfully ${action}.</p><a href="#" class="e-button e-button--anchor e-button--blue e-button" data-modal-close>OK</a>` :
            `<h3>Failed</h3><p>The ${subject} could not be ${action}.</p><a href="#" class="e-button e-button--anchor e-button--blue e-button" data-modal-close>OK</a>`;
    }

    static getErrorContent (subject, action, status, errMsg) {

        let errText = status;

        if (errMsg.length > 0) {
            errText += ` ${errMsg}`;
        }

        return `<div class="e-modal"><div class="e-modal__content"><p>An error occurred while attempting to ${action} ${subject}: ${errText}</p><a href="#" class="e-button e-button--anchor e-button--blue e-button" data-modal-close="">OK</a></div></div>`;
    }

    static getErrorContentCustom (messageHtml) {

        return `<div class="e-modal"><div class="e-modal__content">${messageHtml}<p><a href="#" class="e-button e-button--anchor e-button--blue e-button" data-modal-close="">OK</a></p></div></div>`;
    }

    static getLightboxSources () {

        const lightboxSrcHtml = {};

        $(`[${lightboxUtilsOptions.lightboxSrcAttr}]`).each((idx, elem) => {

            const $elem = $(elem);
            const lightboxType = $elem.attr(lightboxUtilsOptions.lightboxSrcAttr);

            lightboxSrcHtml[lightboxType] = $elem.html();
        });

        return lightboxSrcHtml;
    }

    static getLightboxMarkupForContent (content) {

        return `<div class="${lightboxUtilsOptions.modalParentClass}">
                    <div class="${lightboxUtilsOptions.modalInnerClass}">
                       ${content}
                    </div>
                </div>`;
    }

    static bindOpenModalButtons () {

        setTimeout(() => {

            $(lightboxUtilsOptions.openModalSelector).find(lightboxUtilsOptions.modalAdditionalCloseButtonSelector).on('click', (evt) => {

                evt.preventDefault();

                $.fn.magnificPopup('close');
            });

        }, 0);
    }
}

export default LightboxUtils;