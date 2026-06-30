import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateEnrollmentComponent from 'components/add-update-enrollment-component';
import ConfirmEnrollmentComponent from 'components/confirm-enrollment-component';
import AccountEnrollmentsItemView from 'views/account-enrollments-item-view';
import DeleteEnrollmentComponent from 'components/delete-enrollment-component';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import APIProxy from 'modules/api-proxy';

class AccountEnrollmentsView extends BaseComponent {
    constructor() {
        super();
        this.defaultOptions = {
            productCode: 'product-code',
            orderEnrollmentLimit: 'order-enrollment-limit',
            uploadFileSizeLimit: 'upload-file-size-limit',
            uploadRegisteredRecipientsLimit: 'upload-registered-recipients-limit',
            fileData: 'file-data',
            endpointUrls: {
                uploadEnrollmentFromExcel: `${window.location.origin}/userdata/UploadEnrollmenListExcelAsync/`,
            },
            notification: {
                incorrectUpload: {
                    message: 'Upload Error',
                },
                fileExtension: {
                    message: 'Only Excel file (.xls/.xlsx) format is supported. Please download and use excel template by using the \'Download Template\' button.',
                },
                fileFormat: {
                    message: 'Uploaded file is not in the required format. Please download and use the Excel template by using \'Download Template\' button.',
                },
                fileInvalidQuantity: {
                    heading: 'Upload Error',
                    message: 'Quantity added for some records in the Excel file is not valid. Please enter a valid Quantity and try again.',
                },
                fileDuplicateRecords: {
                    message: 'Uploaded file has duplicate records. Please check.',
                },
                fileSize: {
                    heading: 'File Size Limit Exceeded',
                    message: 'Uploaded file size is more than {UploadFileSizeLimit} Kb, please reduce the file size and re-upload it.',
                },
                EnrollmentColumnsEmpty: {
                    heading: 'Upload Error',
                    message: 'Some mandatory fields in the uploaded Excel file are missing. Please check and upload it again.',
                },
                fileWorkheet: {
                    heading: 'Incorrect Excel Worksheet',
                    message: 'System is unable to find the required worksheet. Please download and use Excel template by using \'Download Template\' button',
                },
                downloadTemplate: {
                    heading: 'Bulk Purchase.xlsx is downloaded in Downloads folder',
                    message: 'Please use this template to upload recipients',
                },
                uploadSuccessful: {
                    message: 'Upload successful',
                },
                uploadError: {
                    message: 'An error occurred while attempting to upload the enrollment file. Please download the template and try again. If you receive this error again, please contact sales@ana.org for further assistance.',
                },
                EmptyAddress: {
                    heading: 'Unable to create address',
                    message: '{enrollments} </br> </br> Please correct them to proceed further.',
                },
                orderEnrollmentlimitExceeded: {
                    heading: 'Order Size Limit Exceeded',
                    message: 'Maximum limit of Recipients per order reached. You need to make a separate order for additional Recipients.',
                },
            },
            selectors: {
                table: '[data-account-enrollments-table]',
                list: '[data-account-enrollment-list]',
                noResults: '[data-account-enrollments-no-results]',
                addComponent: '[data-account-enrollment-add]',
                deleteComponent: '[data-account-enrollment-delete]',
                enrollmentNotFound: '[data-account-enrollments-not-found]',
                enrollmentFound: '[data-account-enrollments-found]',
                uploadFile: '[data-account-enrollment-uploadfile]',
                addEnrollment: '[data-account-enrollment-add]',
                browseUpload: '[data-account-enrollment-browseupload]',
                uploadFileFormatError: '[data-account-enrollment-uploadfilemessage-fileformaterror]',
                uploadFileSuccess: '[data-account-enrollment-uploadfilemessage-success]',
                uploadFileExtensionError: '[data-account-enrollment-uploadfilemessage-fileextensionerror]',
                uploadFileSizeError: '[data-account-enrollment-uploadfilemessage-filesizeerror]',
                confirmComponent: '[data-account-enrollment-confirm]',
                downloadSample: '[data-account-enrollment-download-sample]',
                addToCartBtnDisabled: '[data-account-enrollments-addtocart-button-disabled]',
                addToCartBtn: '[data-account-enrollments-addtocart-button]',
                lightboxHeading: '[data-lightbox-heading]',
                lightboxContent: '[data-lightbox-text]',
                subTotal: '[data-enrollment-summary-subtotal]',
            },
            clientServerKeyMappings: {
                id: 'Id',
                firstName: 'FirstName',
                lastName: 'LastName',
                email: 'Email',
                addressline1: 'Addressline1',
                addressline2: 'Addressline2',
                city: 'City',
                state: 'State',
                zipcode: 'ZipCode',
                country: 'Country',
                countryCode: 'CountryCode',
                productPrice: 'ProductPrice',
                quantity: 'Quantity',
                isAddressValidated: 'IsAddressValidated'
            },
            itemLineOutputAttrs: {
                id: 'data-id',
                firstName: 'data-first-name',
                lastName: 'data-last-name',
                email: 'data-email',
                addressline1: 'data-address-line1',
                addressline2: 'data-address-line2',
                city: 'data-city',
                state: 'data-state',
                zipcode: 'data-zipcode',
                country: 'data-country',
                countryCode: 'data-country-code',
                productPrice: 'data-product-price',
                itemTotal: 'data-item-total',
                quantity: 'data-quantity'
            },
            lightboxEditSrcName: 'enrollmentedit',
            lightboxCancelSrcName: 'enrollmentconfirm',
            lightboxConfirmSrcName: 'enrollmentconfirmoverwrite',
            lightboxPreviouslyEnrolledSrcName: 'enrollmentspreviouslyenrolled',
            lightboxUnRegisteredEnrollmentsSrcName: 'unregisteredenrollments',
            lightboxDownloadSample: 'enrollmentdownloadsample',
            lightboxEnrollmentPopup: 'enrollmentpopup',
            lightboxAddToCartConfirmation: 'addedtocartfromenrollment',
            modalInnerClass: 'e-modal__content',
            editText: 'Edit',
            editTriggerAttr: 'data-account-enrollment-edit',
            idAttr: 'data-id',
            deleteText: 'Remove',
            deleteTriggerAttr: 'data-account-enrollment-delete',
            itemAttr: 'data-account-enrollments-item',
            inputTriggerAttr: '[data-quantity-selector-input]',
            decreaseTriggerAttr: 'data-quantity-enrollment-selector-decrease',
            increaseTriggerAttr: 'data-quantity-enrollment-selector-increase',
            bookFormat: 'data-product-format',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.$isMember = false;
        this.$list = this.$el.find(this.options.selectors.list);
        this.$table = this.$el.find(this.options.selectors.table);
        this.$noResults = this.$el.find(this.options.selectors.noResults);
        this.$uploadFileMessage = this.$el.find(this.options.selectors.uploadFileMessage);
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.emailList = [];
        this.data = [];
        this.itemViewInstances = [];
        this.$quantity = '0';
        this.isValidated = true;
        this.$uploadFile = this.$el.find(this.options.selectors.uploadFile);
        this.$addEnrollment = this.$el.find(this.options.selectors.addEnrollment);
        this.$browseUpload = this.$el.find(this.options.selectors.browseUpload);
        this.$downloadSample = this.$el.find(this.options.selectors.downloadSample);
        this.$addToCartBtn = this.$el.find(this.options.selectors.addToCartBtn);
        this.$addToCartBtnDisabled = this.$el.find(this.options.selectors.addToCartBtnDisabled);

        this.$enrollmentNotFound = this.$el.find(this.options.selectors.enrollmentNotFound);
        this.$enrollmentFound = this.$el.find(this.options.selectors.enrollmentFound);
        this.$enrollmentFound.hide();
        this.$enrollmentNotFound.show();

        this.addComponent = new AddUpdateEnrollmentComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.deleteComponent = new DeleteEnrollmentComponent('delete', this.options.lightboxEditSrcName);
        this.deleteComponent.init(this.$el.find(this.options.selectors.deleteComponent), {});

        this.confirmComponent = new ConfirmEnrollmentComponent('confirm', this.options.lightboxConfirmSrcName);
        this.confirmComponent.init(this.$el.find(this.options.selectors.confirmComponent), {});

        this.previouslyEnrolledComponent = new ConfirmEnrollmentComponent('enrolled', this.options.lightboxPreviouslyEnrolledSrcName);
        this.previouslyEnrolledComponent.init(this.$el.find(this.options.selectors.confirmComponent), {});


        this.unRegisteredEnrollmentsComponent = new ConfirmEnrollmentComponent('unregistered', this.options.lightboxUnRegisteredEnrollmentsSrcName);
        this.unRegisteredEnrollmentsComponent.init(this.$el.find(this.options.selectors.confirmComponent), {});

        this.$textUploadFileFormatErrorHeading = this.options.notification.incorrectUpload.message;
        this.$textUploadFileFormatError = this.options.notification.fileFormat.message;

        this.$textUploadFileWorksheetErrorHeading = this.options.notification.fileWorkheet.heading;
        this.$textUploadFileWorksheetError = this.options.notification.fileWorkheet.message;
        this.$fileDuplicateRecords = this.options.notification.fileDuplicateRecords.message;

        this.$textUploadFileExtensionErrorHeading = this.options.notification.incorrectUpload.message;
        this.$textUploadFileExtensionError = this.options.notification.fileExtension.message;

        this.uploadFileSizeLimit = this.$el.attr(this.options.uploadFileSizeLimit) / 1000;
        this.$textUploadFileSizeErrorHeading = this.options.notification.fileSize.heading;
        let messageUploadFile = this.options.notification.fileSize.message;
        this.$textUploadFileSizeError = messageUploadFile.replace('{UploadFileSizeLimit}', this.uploadFileSizeLimit);


        this.$textEnrollmentColumnsEmptyHeading = this.options.notification.EnrollmentColumnsEmpty.heading;
        this.$textEnrollmentColumnsEmptyError = this.options.notification.EnrollmentColumnsEmpty.message;

        this.$textEmptyAddressErrorHeading = this.options.notification.EmptyAddress.heading;
        this.$textEmptyAddressError = this.options.notification.EmptyAddress.message;


        this.$textInvalidQuantityHeading = this.options.notification.fileInvalidQuantity.heading;
        this.$textInvalidQuantityError = this.options.notification.fileInvalidQuantity.message;

        this.$textDownloadTemplateHeading = this.options.notification.downloadTemplate.heading;
        this.$textDownloadTemplate = this.options.notification.downloadTemplate.message;

        this.$textUploadSuccess = this.options.notification.uploadSuccessful.message;
        this.$textUploadError = this.options.notification.uploadError.message;

        this.loadingSpinner = new LoadingSpinner();
        this.$subTotal = this.$el.find(this.options.selectors.subTotal);
        this.$productFormat = this.$el.attr(this.options.bookFormat);

        this.orderEnrollmentLimit = this.$el.attr(this.options.orderEnrollmentLimit);
        this.$textorderEnrollmentLimitExceededErrorHeading = this.options.notification.orderEnrollmentlimitExceeded.heading;
        let messageorderEnrollmentLimitExceeded = this.options.notification.orderEnrollmentlimitExceeded.message;
        this.$textorderEnrollmentLimitExceededError = messageorderEnrollmentLimitExceeded.replace('{OrderEnrollmentLimit}', this.orderEnrollmentLimit);

    }

    addListeners() {
        globalEmitter.on('addupdateenrollment:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deleteenrollment:deleted', this._onDataDeleted.bind(this));
        globalEmitter.on('updatequantity:dataupdated', this._onDataQuantityUpdated.bind(this));
        this._getDataFromServer();
        this.orderEnrollmentLimit = this.$el.attr(this.options.orderEnrollmentLimit);
        this.$uploadFile.on('click', (e) => {
            if (this.$orderEnrollmentCount >= this.orderEnrollmentLimit) {
                this._IsReachedEnrollmentLimitPopup();
            }
            return this._uploadFileProcess(e);
        });
        this.$addEnrollment.on('click', (e) => {
            if (this.$orderEnrollmentCountWithCurrentProduct >= this.orderEnrollmentLimit) {
                this._IsReachedEnrollmentLimitPopup();
            }
        });
        this.uploadFileSizeLimit = this.$el.attr(this.options.uploadFileSizeLimit);
        this.$downloadSample.on('click', (e) => { return this._downloadSample(e); });

        this.$browseUpload.on('change', (e) => {
            this.$fileData = e.target.files[0];
            this.$filesize = e.target.files[0].size;
            let validExtensions = ['xls', 'xlsx'];
            let fileName = this.$fileData.name.toLowerCase();
            let fileExtension = fileName.split('.').pop().toLowerCase();
            if (validExtensions.includes(fileExtension)) {
                if (this.$filesize <= this.uploadFileSizeLimit) {
                    this._validateNameAndExtractData();
                }
                else {
                    this.$browseUpload.val('');
                    this._openPopup(this.$textUploadFileSizeErrorHeading, this.$textUploadFileSizeError);
                }
            }
            else {
                this.$browseUpload.val('');
                this._openPopup(this.$textUploadFileExtensionErrorHeading, this.$textUploadFileExtensionError);
            }
        });

        this.$addToCartBtn.on('click', (e) => {
            return this._addToCartButtonClick(e);
        });
    }

    _uploadFileProcess(e) {
        this.$browseUpload.click();
    }

    _downloadSample(e) {
        this.loadingSpinner.request(`${this.guid}-_downloadSample`);

        APIProxy.request({
            api: 'downloadSample',
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_downloadSample`);



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
                this._openPopup(this.$textDownloadTemplateHeading, this.$textDownloadTemplate);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_downloadSample`);
                let responseStatus = '(no response JSON found; cannot display error details)';
                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                let errText = `${status } ${ responseStatus}`;
                if (err.length > 0) {
                    errText += ` ${err}`;
                }
                let errMessage = `An error occurred while attempting to download sample file:${ errText}`;

                this._openPopup("", errMessage);
            },
        });
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

                        self._onConfirmModalOpened($(this.content[0]), errorMsg, errorHeading);
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onConfirmModalOpened($modalContent, errorMsg, errorHeading) {

        lightboxUtils.bindOpenModalButtons();
        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(errorHeading);
        $modalContentInner.find(this.options.selectors.lightboxContent).html(errorMsg);
    }

    _validateNameAndExtractData() {
        this.emailList = [];
        this.loadingSpinner.request(`${this.guid}-_validateNameAndExtractData`);
        let fileData = new FormData();
        fileData.append(this.$fileData.name, this.$fileData);
        $.ajax({
            method: 'POST',
            url: `${this.options.endpointUrls.uploadEnrollmentFromExcel}`,
            data: fileData,
            processData: false,
            contentType: false,
            success: (data) => {
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_validateNameAndExtractData`);
                this.$browseUpload.val('');
                this._openPopup("", this.$textUploadError);
            },
        }).done((data) => {
            let response = data;
            this.$browseUpload.val('');
            if (response.Success) {
                if (data.IfAnyRecordsUploaded === true) {
                    this._openPopup(this.$textUploadSuccess, "");
                } else {
                    this._openPopup("", this.$textNoRecordsUploaded);
                }
                this._onDataUpload();
            }
            else {
                this._fileFormatValidationErrorMessages(response);
                this._fileContentValidationErrorMessages(response);
            }

            this.loadingSpinner.release(`${this.guid}-_validateNameAndExtractData`);
        });
    }

    _fileContentValidationErrorMessages(response) {
        this.orderEnrollmentLimit = this.$el.attr(this.options.orderEnrollmentLimit);
        if (response.IsExistingEnrollment) {
            this.confirmComponent._openModal();
        }
        else if (response.unRegisteredEnrollments.length > 0) {
            for (let d = 0; d < response.unRegisteredEnrollments.length; d++) {
                this.emailList.push(`${response.unRegisteredEnrollments[d].FirstName } ${ response.unRegisteredEnrollments[d].LastName }, ${ response.unRegisteredEnrollments[d].Email}`);
            }
            this.emails = this.emailList.map((email) => {
                return email;
            }).join(`</br>`);
            this.unRegisteredEnrollmentsComponent.unRegisteredEnrollmentsOnUpload(this.emails);
            this._onDataUpload();
        }
        else if (response.IsExcelEnrollmentsLimitExceeded) {
            this.confirmComponent._openPopupExcelRecipientsLimitExceeded(this.orderEnrollmentLimit);
        }
        else if (response.IsProductEnrollmentsLimitExceeded) {
            this.confirmComponent._openPopupProductRecipeintsLimitExceeded();
        }
        else if (response.IsOrderEnrollmentsLimitExceeded) {
            this.confirmComponent._openPopupOrderRecipeintsLimitExceeded();
        }
        else if (response.previouslyEnrolledEnrollments.length > 0) {
            for (let d = 0; d < response.previouslyEnrolledEnrollments.length; d++) {
                this.emailList.push(response.previouslyEnrolledEnrollments[d].Email);
            }
            this.emails = this.emailList.map((email) => {
                return email;
            }).join(`</br>`);
            this.previouslyEnrolledComponent.previouslyEnrolledInfoFromNewFile(this.emails);
            this._onDataUpload();
        }
    }
    _fileFormatValidationErrorMessages(response) {
        if (!response.IsWorksheetValid) {
            this._openPopup(this.$textUploadFileWorksheetErrorHeading, this.$textUploadFileWorksheetError);
        }
        else if (!response.IsColumnFormatValid) {
            this._openPopup(this.$textUploadFileFormatErrorHeading, this.$textUploadFileFormatError);
        }
        else if (response.IsEnrollmentColumnsEmpty) {
            this._openPopup(this.$textEnrollmentColumnsEmptyHeading, this.$textEnrollmentColumnsEmptyError);
        }
        else if (response.InvalidQuantity) {
            this._openPopup(this.$textInvalidQuantityHeading, this.$textInvalidQuantityError);
        }
        else if (response.IsDuplicateRecords) {
            this._openPopup(this.$textUploadFileFormatErrorHeading, this.$fileDuplicateRecords);
        }
    }
    _onDataUpdated() {

        this._getDataFromServer();
    }
    _onDataDeleted() {

        this._getDataFromServer();
    }
    _onDataQuantityUpdated() {
        this._getDataFromServer();
    }
    _onDataUpload() {
        this.loadingSpinner.request(`${this.guid}-_onDataUpload`);
        APIProxy.request({
            api: 'uploadRefresh',
            success: (data) => {
                this._getDataFromServer();
                this.loadingSpinner.release(`${this.guid}-_onDataUpload`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_onDataUpload`);
            },
        });
    }


    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);
        const self = this;
        this.$orderReceipentEnrollmentLimit = 0;
        APIProxy.request({
            api: 'GetEnrollmentByProductCode',
            success: (data) => {
                this.$orderEnrollmentCount = data.orderEnrollmentCount;
                this.$orderEnrollmentCountWithCurrentProduct = data.orderEnrollmentCountWithCurrentProduct;
                console.log(this.$orderEnrollmentCountWithCurrentProduct);
                this._storeData(data.data);
                this._createList();
                this._disableQuantity();
                this._showHide();
                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);

                let responseStatus = '(no response JSON found; cannot display error details)';

                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }
                $.magnificPopup.instance.close();
                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContent('enrollment', 'get', `${status} ${responseStatus}`, err),
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
                }).magnificPopup('open');
            },
        });
    }

    _storeData(data) {
        this.data.length = 0;
        for (let d = 0; d < data.length; d++) {
            this._storeDataItem(data[d]);
        }
    }

    _storeDataItem(dataItem) {
        const convertedJSON = Utils.convertJSONKeysServerToClient(JSON.stringify(dataItem), this.options.clientServerKeyMappings);
        this.data.push(JSON.parse(convertedJSON));
    }
    _disableQuantity() {
        if (this.$productFormat === 'Paperback') {
            $('.e-quantity-selector__nav--dec').each(function () {
                /* eslint-disable-next-line no-invalid-this */
                $(this).removeClass('c-enrollment__disablequantity');
            });
            $('.e-quantity-selector__nav--inc').each(function () {
                /* eslint-disable-next-line no-invalid-this */
                $(this).removeClass('c-enrollment__disablequantity');
            });
            $('.c-enrollment__quantity').each(function () {
                /* eslint-disable-next-line no-invalid-this */
                $(this).removeClass('c-enrollment__quantity');
            });
        }
    }
    _createList() {
        let listHtml = '';
        for (let d = 0; d < this.data.length; d++) {
            listHtml = listHtml + this._getPopulatedItemHtml(this.data[d]);
        }
        this.$list.html(listHtml);
        setTimeout(() => {
            this._instantiateItemViews();

            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
        this._updateTotal();
    }

    _showHide() {
        if (this.data.length > 0) {
            this.$noResults.hide();
            this.$enrollmentFound.show();
            this.$enrollmentNotFound.hide();
            this.$subTotal.show();
        } else {
            this.$noResults.show();
            this.$enrollmentFound.hide();
            this.$enrollmentNotFound.show();
            this.$subTotal.hide();
        }
    }

    _instantiateItemViews() {

        this.itemViewInstances.length = 0;
        const $itemViews = this.$list.find(`[${this.options.itemAttr}]`);
        if ($itemViews.length !== this.data.length) {
            console.log('ERROR: account-enrollments-view.js : number of views in DOM does not reflect number of stored enrollments.');
            return;
        }
        for (let d = 0; d < this.data.length; d++) {
            const instance = new AccountEnrollmentsItemView();
            instance.init($($itemViews[d]), {});
            instance.setData(this.data[d]);
            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {

        let total = parseFloat(parseFloat(data.quantity, 0) * parseFloat(data.productPrice, 5)).toFixed(2);
        let addressValid = true;
        if (data.country === "USA" && data.ValidationIssues !== null) {
            addressValid = false;
        }
        if (data.addressline2 === null) {
            data.addressline2 = '';
        }
        let rowClass = "";
        if (data.IsValidated === false) {
            rowClass = "c-enrollment__changerowcolor";
        }
        return `<tr ${this.options.itemAttr} class=${rowClass}>
                    <td><div>
                    ${data.IsMember ? `<span class="c-enrollment__displayicon--star" title="ANA Member"></span>` : ``}
                    ${addressValid ? `` : `<span class="c-enrollment__displayicon--x-cross" title="Unverified Address"></span>`}
                       </div></td>
                    <td ${this.options.itemLineOutputAttrs.id} style="display:none;">${data.id}</td>
                    <td ${this.options.itemLineOutputAttrs.email}>${data.email}</td>
                    <td ${this.options.itemLineOutputAttrs.firstName}>${data.firstName}</td>
                    <td ${this.options.itemLineOutputAttrs.lastName}>${data.lastName}</td>
                    <td ${this.options.itemLineOutputAttrs.addressline1}>${data.addressline1} ${data.addressline2}, ${data.city} ${data.state !== null && data.state !== "" ? `, ${ data.state}` : ''}, ${data.country}, ${data.zipcode}</td>
                    <td ${this.options.itemLineOutputAttrs.productPrice}>$${parseFloat(data.productPrice, 5).toFixed(2)}</td>
                    <td class = "c-enrollment__quantity"><a class="e-quantity-selector__nav--dec c-enrollment__disablequantity" ${this.options.decreaseTriggerAttr} ${this.options.idAttr}="${data.id}"></a></td>
                    <td ${this.options.itemLineOutputAttrs.quantity}><input class="e-form__input e-form__input--text c-enrollment__input" data-quantity-selector-input="" data-val="true" data-val-number="The field Quantity must be a number." data-val-required="The Quantity field is required." id="Quantity" min="1" name="Quantity" readonly="readonly" type="number" value="${data.quantity}"></td>
                    <td class = "c-enrollment__quantity"><a class="e-quantity-selector__nav--inc c-enrollment__disablequantity" ${this.options.increaseTriggerAttr} ${this.options.idAttr}="${data.id}"></a></td>
                    <td ${this.options.itemLineOutputAttrs.itemTotal}>$${total}</td>
                    <td>
                        <div>
                            <a href='#' ${this.options.editTriggerAttr}> <span class="c-enrollment__displayicon--edit" title="Edit"></span></a>
                            <a href='#' ${this.options.deleteTriggerAttr} ${this.options.idAttr}="${data.id}">
                                <span class="c-enrollment__displayicon--delete" title="Delete"></span>
                            </a>

                        </td>
                    </div>
                    </td></tr>`;
    }

    _CheckIsValidatedOrNot() {
        for (let i = 0; i < this.data.length; i++) {
            console.log("this.data[i].isValidated", this.data[i].IsValidated);
            if (this.data[i].IsValidated === false) {
                return false;
            }
        }
        return true;
    }

    _IsReachedEnrollmentLimitPopup() {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {

                src: lightboxUtils.getErrorContentCustom(`<h4>${ this.$textorderEnrollmentLimitExceededErrorHeading }</h4><p>${ this.$textorderEnrollmentLimitExceededError }</p>`),
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
    _IsNotValidatedPopup() {
        const self = this;
        $.magnificPopup.instance.close();
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getErrorContentCustom('<h4>Incorrect Format</h4><p>Some Mandatory fields are not in the correct format/missing. Please click the edit button for each Recipient highlighted in red to verify and try again.</p>'),
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

    _addToCartButtonClick(e) {
        this._addToCart(e);
    }
    _updateTotal() {
        let price = 0;
        if (this.data.length > 0) {
            for (let i = 0; i < this.data.length; i++) {
                price = price + this.data[i].quantity * this.data[i].productPrice;
            }
        }
        this.$subTotal.text(`Subtotal: $${parseFloat(price).toFixed(2)}`);
    }

    _addToCart(e) {
        this.productCode = this.$el.attr(this.options.productCode);
        this.orderEnrollmentLimit = this.$el.attr(this.options.orderEnrollmentLimit);
        this.emailList = [];
        if (this.$orderEnrollmentCountWithCurrentProduct > this.orderEnrollmentLimit) {
            this._IsReachedEnrollmentLimitPopup();
        }
        else {
            const popup = this;
            const self = this;
            this.isValidated = this._CheckIsValidatedOrNot();
            if (this.isValidated === false) {
                this._IsNotValidatedPopup();
            }
            else {
                this._getEnrollmentProductQuantity();
                this.loadingSpinner.request(`${this.guid}-_addToCart`);

                APIProxy.request({
                    api: 'addToCartFromEnrollment',
                    queryData: {
                        code: this.productCode,
                        quantity: this.$quantity,
                    },
                    success: (data) => {
                        let response = data;
                        if (response.Success) {
                            if (data.allEnrollmentsHasAddress) {
                                globalEmitter.emit('orderitem:updated', this);
                                $.magnificPopup.instance.close();
                                this.loadingSpinner.release(`${this.guid}-_addToCart`);
                                popup.$el.magnificPopup({
                                    items: {
                                        src: lightboxUtils.getLightboxMarkupForContent(popup.lightboxSrcHtml[popup.options.lightboxAddToCartConfirmation]),
                                        type: 'inline',
                                    },
                                    preloader: false,
                                    mainClass: popup.options.modalAdditionalClass,
                                    callbacks: {
                                        open () {
                                            setTimeout(() => {
                                                self.$el.off('click.magnificPopup');
                                                self._onAddToCartConfirmModalOpened($(popup.content[0]));
                                            }, 0);
                                        },
                                    },
                                }).magnificPopup('open');
                            }
                            else {
                                if (data.emptyAddressEnrollments.length > 0) {
                                    for (let d = 0; d < data.emptyAddressEnrollments.length; d++) {
                                        this.emailList.push(`${data.emptyAddressEnrollments[d].FirstName } ${ data.emptyAddressEnrollments[d].LastName }, ${ data.emptyAddressEnrollments[d].Email }: ${ data.emptyAddressEnrollments[d].ValidationIssues}`);
                                    }
                                    //// Join the emails into a single string separated by line breaks
                                    this.emails = this.emailList.map((email) => {
                                        return email;
                                    }).join(`</br> </br>`);
                                    this.message = this.$textEmptyAddressError;
                                    this.message = this.message.replace('{enrollments}', `</br>${ this.emails}`);

                                    this._openPopup(this.$textEmptyAddressErrorHeading, this.message);
                                }
                                this.loadingSpinner.release(`${this.guid}-_addToCart`);
                            }
                        }
                        this._getDataFromServer();

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
                                src: lightboxUtils.getErrorContent('enrollment', 'addToCart', `${status} ${responseStatus}`, err),
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
        }
    }

    _getEnrollmentProductQuantity() {
        if (this.data.length > 0) {
            this.$quantity = 0;
            for (let i = 0; i < this.data.length; i++) {
                this.$quantity = this.$quantity + this.data[i].quantity;
            }
        }
    }

    _onAddToCartConfirmModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();
    }


}

export default () => {
    return new AccountEnrollmentsView();
};
