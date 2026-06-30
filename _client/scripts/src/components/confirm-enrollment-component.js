import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import APIProxy from 'modules/api-proxy';
import AccountEnrollmentsView from 'views/account-enrollments-view';


class ConfirmEnrollmentComponent extends BaseComponent {
    constructor(instanceType, lightboxSrcName) {
        super();

        this.defaultOptions = {
            yesConfirmOverwrite: 'Yes',
            noConfirmOverwrite: 'No',
            instanceType,
            fileData: 'file-data',
            selectors: {
                lightboxConfirmOverwriteYesButton: '[data-confirm-enrollmentoverwrite-yes]',
                lightboxConfirmOverwriteNoButton: '[data-confirm-enrollmentoverwrite-no]',
                lightboxPreviouslyEnrolledDeleteButton: '[data-previously-enrolled-enrollment-delete]',
                lightboxPreviouslyEnrolledContinueNoButton: '[data-previously-enrolled-enrollment-continue]',
                lightboxUnRegisteredEnrollmentsExportToCSVButton: '[data-unregistered-enrollments-export]',
                lightboxUnRegisteredEnrollmentsOkButton: '[data-unregistered-enrollment-ok]',
                uploadFileFormatError: '[data-account-enrollment-uploadfilemessage-fileformaterror]',
                uploadFileSuccess: '[data-account-enrollment-uploadfilemessage-success]',
                uploadFileExtensionError: '[data-account-enrollment-uploadfilemessage-fileextensionerror]',
                uploadFile: '[data-account-enrollment-uploadfile]',
                browseUpload: '[data-account-enrollment-browseupload]',
                lightboxHeading: '[data-lightbox-heading]',
                lightboxContent: '[data-lightbox-text]'
            },
            notification: {
                uploadSuccessful: {
                    message: 'Upload successful',
                },
                noRecordsUploaded: {
                    heading: 'Upload Error',
                    message: 'No recipients found.',
                },
                exportSuccess: {
                    message: 'Export successful, file is downloaded in Downloads folder',
                },
                previouslyEnrolled: {
                    heading: 'Alert',
                    message: 'Some Recipients included in the uploaded list are already enrolled for the product/course.</br> {enrollments}',
                },
                unRegisteredEnrollments: {
                    heading: 'Recipients not found',
                    message: 'Uploaded file includes Recipients that do not have a NursingWorld.org user account. They will be removed: </br> </br> {enrollments}',
                },
                fileMaxRow: {
                    heading: 'Recipients limit exceeded.',
                    message: 'Uploaded file has more than {UploadFileRowsLimit} Recipients. Please limit to {UploadFileRowsLimit1} or less and then reupload the file.',
                },
                fileMaxRowWithCartEnrollmentCount: {
                    heading: 'Recipients limit exceeded.',
                    message: 'Maximum limit of Recipients per order reached. You need to make a separate order for additional Recipients.',
                },
                fileMaxRowWithListEnrollmentCount: {
                    heading: 'Recipients limit exceeded.',
                    message: 'Maximum limit of Recipients per order reached. You need to make a separate order for additional Recipients.',
                }
            },
            lightboxConfirmSrcName: 'enrollmentconfirmoverwrite',
            lightboxEnrollmentPopup: 'enrollmentpopup',
            lightboxPreviouslyEnrolledSrcName: 'enrollmentspreviouslyenrolled',
            lightboxUnRegisteredEnrollmentsSrcName: 'unregisteredenrollments',
            modalInnerClass: 'e-modal__content',
            lightboxSrcName,
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.$uploadFile = this.$el.find(this.options.selectors.uploadFile);
        this.$browseUpload = this.$el.find(this.options.selectors.browseUpload);
        this.$textUploadSuccess = this.options.notification.uploadSuccessful.message;

        this.$textNoRecordsUploadedHeading = this.options.notification.noRecordsUploaded.heading;
        this.$textNoRecordsUploadedMessage = this.options.notification.noRecordsUploaded.message;
        this.$textExportComplete = this.options.notification.exportSuccess.message;
        this.$textPreviouslyEnrolledError = this.options.notification.previouslyEnrolled.message;
        this.$textPreviouslyEnrolledHeading = this.options.notification.previouslyEnrolled.heading;
        this.$textUnRegisteredEnrollmentsHeading = this.options.notification.unRegisteredEnrollments.heading;
        this.$textUnRegisteredEnrollmentsError = this.options.notification.unRegisteredEnrollments.message;

        this.$textfileMaxRowWithCartEnrollmentCountHeading = this.options.notification.fileMaxRowWithCartEnrollmentCount.heading;
        this.$textfileMaxRowWithCartEnrollmentCountError = this.options.notification.fileMaxRowWithCartEnrollmentCount.message;
        this.$textfileMaxRowWithListEnrollmentCountHeading = this.options.notification.fileMaxRowWithListEnrollmentCount.heading;
        this.$textfileMaxRowWithListEnrollmentCountError = this.options.notification.fileMaxRowWithListEnrollmentCount.message;

        this.$textUploadFileMaxRowErrorHeading = this.options.notification.fileMaxRow.heading;
        this.$textUploadFileMaxRowError = this.options.notification.fileMaxRow.message;


        this.instance = new AccountEnrollmentsView();
        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
    }

    _onMaxRowLimitExceededModalOpened($modalContent, errorMsg, errorHeading) {

        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(errorHeading);
        $modalContentInner.find(this.options.selectors.lightboxContent).html(errorMsg);
    }
    _onConfirmModalOpened($modalContent, errorMsg, errorHeading) {

        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(errorHeading);
        $modalContentInner.find(this.options.selectors.lightboxContent).html(errorMsg);
        $modalContent.find(this.options.selectors.lightboxConfirmOverwriteYesButton).on('click', this._onYesOverwriteClick.bind(this));
        $modalContent.find(this.options.selectors.lightboxConfirmOverwriteNoButton).on('click', this._onNoOverwriteClick.bind(this));

    }
    _onPreviouslyEnrolledModalOpened($modalContent, errorMsg, errorHeading) {

        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(errorHeading);
        $modalContentInner.find(this.options.selectors.lightboxContent).html(errorMsg);
        $modalContent.find(this.options.selectors.lightboxPreviouslyEnrolledDeleteButton).on('click', this._onPreviouslyEnrolledDeleteClick.bind(this));
        $modalContent.find(this.options.selectors.lightboxPreviouslyEnrolledContinueNoButton).on('click', this._onPreviuoslyEnrolledContinueClick.bind(this));
    }
    _onYesOverwriteClick(e) {
        e.preventDefault();
        this.details = [];
        this.emailList = [];
        $.magnificPopup.instance.close();
        this.loadingSpinner.request(`${this.guid}-_onYesOverwriteClick`);
        APIProxy.request({
            api: 'OverwriteEnrollmentFromExcelAsync',
            queryString: `?IsConfirmOverwrite=yes`,
            processData: false,
            contentType: false,
            success: (data) => {
                globalEmitter.emit('addupdateenrollment:dataupdated', self);
                let response = data;
                if (response.Success === true) {
                    globalEmitter.emit('addupdateenrollment:dataupdated', self);
                    if (data.IfAnyRecordsUploaded === true) {
                        this._openPopup(this.$textUploadSuccess, "");
                    } else {
                        this._openPopup(this.$textNoRecordsUploadedHeading, this.$textNoRecordsUploadedMessage);
                    }
                }
                else {
                    this._fileContentValidationErrorMessages(response);
                }
                this.loadingSpinner.release(`${this.guid}-_onYesOverwriteClick`);

            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onYesOverwriteClick`);
                this.$browseUpload.val('');
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let message = `An error occurred while attempting to enrollment upload file:${ errText}`;

                this._openErrorPopup(message);
            },
        });
    }
    _onNoOverwriteClick(e) {
        e.preventDefault();
        this.details = [];
        this.emailList = [];
        $.magnificPopup.instance.close();
        this.loadingSpinner.request(`${this.guid}-_onNoOverwriteClick`);

        APIProxy.request({
            api: 'OverwriteEnrollmentFromExcelAsync',
            queryString: `?IsConfirmOverwrite=no`,
            processData: false,
            contentType: false,
            success: (data) => {
                globalEmitter.emit('addupdateenrollment:dataupdated', self);
                let response = data;
                if (response.Success === true) {
                    globalEmitter.emit('addupdateenrollment:dataupdated', self);
                    if (data.IfAnyRecordsUploaded === true) {
                        this._openPopup(this.$textUploadSuccess, "");
                    } else {
                        this._openPopup(this.$textNoRecordsUploadedHeading, this.$textNoRecordsUploadedMessage);
                    }
                }
                else {
                    this._fileContentValidationErrorMessages(response);
                }
                this.loadingSpinner.release(`${this.guid}-_onNoOverwriteClick`);

            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onNoOverwriteClick`);
                this.$browseUpload.val('');
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let message = `An error occurred while attempting to enrollment upload file:${ errText}`;

                this._openErrorPopup(message);
            },
        });
    }
    _onPreviouslyEnrolledDeleteClick(e) {
        e.preventDefault();
        this.emailList = [];
        $.magnificPopup.instance.close();
        this.loadingSpinner.request(`${this.guid}-_onPreviouslyEnrolledDeleteClick`);
        APIProxy.request({
            api: 'DeleteUnRegisteredEnrollmentsAsync',
            queryData: {
                IsPreviouslyEnrollmentsToDelete: true,
                HasUnRegisteredEnrollmentsToDelete: true,
                type: "PreviouslyEnrolledEnrollment",
            },
            processData: false,
            contentType: false,
            success: (data) => {
                if (data.Success === true) {
                    globalEmitter.emit('addupdateenrollment:dataupdated', self);
                    if (data.IfAnyRecordsUploaded === true) {
                        this._openPopup(this.$textUploadSuccess, "");
                    } else {
                        this._openPopup(this.$textNoRecordsUploadedHeading, this.$textNoRecordsUploadedMessage);
                    }
                }
                this.loadingSpinner.release(`${this.guid}-_onPreviouslyEnrolledDeleteClick`);

            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onPreviouslyEnrolledDeleteClick`);
                this.$browseUpload.val('');
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let message = `An error occurred while attempting to enrollment upload file:${ errText}`;

                this._openErrorPopup(message);
            },
        });
    }
    _onPreviuoslyEnrolledContinueClick(e) {
        e.preventDefault();
        this.emailList = [];

        $.magnificPopup.instance.close();
        this.loadingSpinner.request(`${this.guid}-_onPreviuoslyEnrolledContinueClick`);

        APIProxy.request({
            api: 'DeleteUnRegisteredEnrollmentsAsync',
            queryData: {
                IsPreviouslyEnrollmentsToDelete: false,
                HasUnRegisteredEnrollmentsToDelete: true,
                type: "PreviouslyEnrolledEnrollment",
            },
            processData: false,
            contentType: false,
            success: (data) => {
                if (data.Success === true) {
                    globalEmitter.emit('addupdateenrollment:dataupdated', self);
                    if (data.IfAnyRecordsUploaded === true) {
                        this._openPopup(this.$textUploadSuccess, "");
                    } else {
                        this._openPopup(this.$textNoRecordsUploadedHeading, this.$textNoRecordsUploadedMessage);
                    }
                }
                this.loadingSpinner.release(`${this.guid}-_onPreviuoslyEnrolledContinueClick`);

            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onPreviuoslyEnrolledContinueClick`);
                this.$browseUpload.val('');
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let message = `An error occurred while attempting to enrollment upload file:${ errText}`;

                this._openErrorPopup(message);
            },
        });
    }
    previouslyEnrolledInfoFromNewFile(enrollmentDetails) {
        this.openPopupPreviouslyEnrolledInfo(this.$textPreviouslyEnrolledHeading, this.$textPreviouslyEnrolledError, enrollmentDetails);

    }
    openPopupPreviouslyEnrolledInfo(errorHeading, errorMsg, enrollmentDetails) {
        let message = errorMsg;
        message = message.replace('{enrollments}', enrollmentDetails);
        //  message = message.replace('{Email}', email.replace(/\n/g, '\n'));
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxSrcName]),
                type: 'inline',
            },
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');
                        lightboxUtils.bindOpenModalButtons();
                        self._onPreviouslyEnrolledModalOpened($(this.content[0]), message, errorHeading);
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }
    _openModal(e) {
        const self = this;

        $.magnificPopup.instance.close();
        this.options.lightboxSrcName = this.options.lightboxConfirmSrcName;
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxSrcName]),
                type: 'inline',
            },
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
    _openPopup(errorHeading, errorMsg) {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxEnrollmentPopup]),
                type: 'inline',
            },
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        self._onMaxRowLimitExceededModalOpened($(this.content[0]), errorMsg, errorHeading);
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onUnRegisteredEnrollmentsOkClick(e) {
        e.preventDefault();
        this.emailList = [];
        $.magnificPopup.instance.close();
        this.loadingSpinner.request(`${this.guid}-_onUnRegisteredEnrollmentsOkClick`);
        APIProxy.request({
            api: 'DeleteUnRegisteredEnrollmentsAsync',
            queryData: {
                HasUnRegisteredEnrollmentsToDelete: true,
                IsPreviouslyEnrollmentsToDelete: false,
                type: "UnRegisteredEnrollments",
            },
            processData: false,
            contentType: false,
            success: (data) => {
                let response = data;
                if (response.Success) {
                    globalEmitter.emit('addupdateenrollment:dataupdated', self);
                    if (data.IfAnyRecordsUploaded === true) {
                        this._openPopup(this.$textUploadSuccess, "");
                    } else {
                        this._openPopup(this.$textNoRecordsUploadedHeading, this.$textNoRecordsUploadedMessage);
                    }
                }
                else {
                    this._fileContentValidationErrorMessages(response);
                }

                this.loadingSpinner.release(`${this.guid}-_onUnRegisteredEnrollmentsOkClick`);

            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onUnRegisteredEnrollmentsOkClick`);
                this.$browseUpload.val('');
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let message = `An error occurred while attempting to enrollment upload file:${ errText}`;

                this._openErrorPopup(message);
            },
        });
    }

    _onUnRegisteredEnrollmentsExportToCsvClick(e) {
        e.preventDefault();
        this.emailList = [];
        this.loadingSpinner.request(`${this.guid}-_onUnRegisteredEnrollmentsExportToCsvClick`);
        APIProxy.request({
            api: 'exportUnRegisteredEnrollmentsToCSV',
            processData: false,
            contentType: false,
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_onUnRegisteredEnrollmentsExportToCsvClick`);
                const binaryData = atob(data.FileContentBase64);
                // Create a Blob object from binary data
                const arrayBuffer = new ArrayBuffer(binaryData.length);
                const uint8Array = new Uint8Array(arrayBuffer);
                for (let i = 0; i < binaryData.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                }

                const blob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                // Create a link element and trigger a click event to initiate the download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = data.FileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                globalEmitter.emit('addupdateenrollment:dataupdated', self);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onUnRegisteredEnrollmentsExportToCsvClick`);
                this.$browseUpload.val('');
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let message = `An error occurred while attempting to enrollment upload file:${ errText}`;

                this._openErrorPopup(message);
            },
        });
    }

    unRegisteredEnrollmentsOnUpload(enrollmentDetails) {
        this.openPopupUnRegisteredEnrollments(this.$textUnRegisteredEnrollmentsHeading, this.$textUnRegisteredEnrollmentsError, enrollmentDetails);

    }
    _openPopupExcelRecipientsLimitExceeded(limit) {
        let messageMaxRow = this.$textUploadFileMaxRowError;
        this.$textUploadFileMaxRowError = messageMaxRow.replace('{UploadFileRowsLimit}', limit).replace('{UploadFileRowsLimit1}', limit);
        this._openPopup(this.$textUploadFileMaxRowErrorHeading, this.$textUploadFileMaxRowError);

    }
    _openPopupOrderRecipeintsLimitExceeded() {
        this._openPopup(this.$textfileMaxRowWithCartEnrollmentCountHeading, this.$textfileMaxRowWithCartEnrollmentCountError);
    }
    _openPopupProductRecipeintsLimitExceeded() {
        this._openPopup(this.$textfileMaxRowWithListEnrollmentCountHeading, this.$textfileMaxRowWithListEnrollmentCountError);
    }
    openPopupUnRegisteredEnrollments(errorHeading, errorMsg, enrollmentDetails) {
        let message = errorMsg;
        message = message.replace('{enrollments}', enrollmentDetails);
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxUnRegisteredEnrollmentsSrcName]),
                type: 'inline',
            },
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');
                        lightboxUtils.bindOpenModalButtons();
                        self._onUnRegisteredEnrollmentsPopupModalOpened($(this.content[0]), message, errorHeading);
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }


    _onUnRegisteredEnrollmentsPopupModalOpened($modalContent, errorMsg, errorHeading) {

        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(errorHeading);
        $modalContentInner.find(this.options.selectors.lightboxContent).html(errorMsg);
        $modalContent.find(this.options.selectors.lightboxUnRegisteredEnrollmentsExportToCSVButton).on('click', this._onUnRegisteredEnrollmentsExportToCsvClick.bind(this));
        $modalContent.find(this.options.selectors.lightboxUnRegisteredEnrollmentsOkButton).on('click', this._onUnRegisteredEnrollmentsOkClick.bind(this));
    }
    _openErrorPopup(errorMsg) {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxEnrollmentPopup]),
                type: 'inline',
            },
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        self._onErrorModalOpened($(this.content[0]), errorMsg);
                    }, 0);
                },
            },
        }).magnificPopup('open');

    }
    _onErrorModalOpened($modalContent, errorMsg) {
        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxContent).text(errorMsg);
    }
    _onSuccessModalOpened($modalContent, successMessage) {
        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(successMessage);
    }
    setData(data) {
        this.data = data;
    }
    _fileContentValidationErrorMessages(response) {
        if (response.unRegisteredEnrollments.length > 0) {
            for (let d = 0; d < response.unRegisteredEnrollments.length; d++) {
                this.emailList.push(`${response.unRegisteredEnrollments[d].FirstName } ${ response.unRegisteredEnrollments[d].LastName }, ${ response.unRegisteredEnrollments[d].Email}`);
            }
            this.emails = this.emailList.map((email) => {
                return email;
            }).join(`</br>`);
            this.unRegisteredEnrollmentsOnUpload(this.emails);
        }
        if (response.IsExcelEnrollmentsLimitExceeded) {
            this._openPopupExcelRecipientsLimitExceeded(response.OrderEnrollmentLimit);
        }
        if (response.IsProductEnrollmentsLimitExceeded) {
            this._openPopupProductRecipeintsLimitExceeded();
        }
        else if (response.IsOrderEnrollmentsLimitExceeded) {
            this._openPopupOrderRecipeintsLimitExceeded();
        }
        else if (response.previouslyEnrolledEnrollments.length > 0) {
            for (let d = 0; d < response.previouslyEnrolledEnrollments.length; d++) {
                this.emailList.push(`${response.previouslyEnrolledEnrollments[d].FirstName } ${ response.previouslyEnrolledEnrollments[d].LastName }, ${ response.previouslyEnrolledEnrollments[d].Email}`);
            }
            this.emails = this.emailList.map((email) => {
                return email;
            }).join(`</br>`);
            this.options.lightboxSrcName = this.options.lightboxPreviouslyEnrolledSrcName;
            this.previouslyEnrolledInfoFromNewFile(this.emails);
        }
    }

}

export default (instanceType, lightboxSrcName) => {
    return new ConfirmEnrollmentComponent(instanceType, lightboxSrcName);
};
