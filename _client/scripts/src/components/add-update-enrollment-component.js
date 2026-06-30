import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import jitRequire from 'modules/jit-require';
import LoadingSpinner from 'modules/loading-spinner';
import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import GTMHelper from 'modules/gtm-helper';
import APIProxy from 'modules/api-proxy';

class AddUpdateEnrollmentComponent extends BaseComponent {
    constructor(instanceType, lightboxSrcName) {
        super();

        this.defaultOptions = {
            instanceType,
            instanceTypes: {
                add: 'add',
                edit: 'edit',
            },
            selectors: {
                form: 'form',
                formField: '[data-formfield]',
                errorText: '[data-error-text]',
                lightboxHeading: '[data-lightbox-heading]',
                lightboxEmailExistsVeribage: '[data-email-exists-verbiage]',
                lightboxANAAccountNotExistsVeribage: '[data-ana-account-not-exists-verbiage]',
                lightboxCourseEnrolledInPastVeribage: '[data-course-enrolled-in-past-verbiage]',
                lightboxStateVeribage: '[data-state-verbiage]',
                lightboxFirstNameVerbiage: '[data-first-name-verbiage]',
                lightboxLastNameVerbiage: '[data-last-name-verbiage]',
                lightboxZipcodeVerbiage: '[data-zipcode-verbiage]',
                lightboxPersonifyVeribage: '[data-lightbox-personify-verbiage]',
                lightboxValidationIssuesVerbiage: '[data-lightbox-validation-issues-verbiage]',
                submitButton: '[data-submit-enrollment]',
                saveButton: '[data-save-enrollment]',
                lineInputs: {
                    id: '[data-id]',
                    firstName: '[data-first-name]',
                    lastName: '[data-last-name]',
                    email: '[data-email]',
                    addressline1: '[data-address-line1]',
                    addressline2: '[data-address-line2]',
                    city: '[data-city]',
                    state: '[data-select-state]',
                    zipcode: '[data-zipcode]',
                    country: '[data-country]',
                    labelState: '[data-label-state]',
                    canState: '[data-select-can-state]',
                    labelCanState: '[data-label-can-state]',
                    intState: '[data-input-int-state]',
                    labelIntState: '[data-label-int-state]',
                },

            },
            modalInnerClass: 'e-modal__content',
            hasErrorClass: 'has--error',
            lightboxSrcName,
            lightboxHeadingText: { // NB - key names must match instanceTypes
                add: 'Add a Recipient',
                edit: 'Edit a Recipient',
            },
            lightboxEmailExistsVeribageText: { // NB - key names must match instanceTypes
                inPersonify: 'Add a Recipient',
                inNursingWorldDB: 'Edit a Recipient',
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
                quantity: 'Quantity',
                zipcode: 'ZipCode',
                country: 'Country'
            },
            notification: {
                courseEnrolledNotification: {
                    message: 'The email address was previously used to enroll for the same product.'
                },
                lightboxEmailExistsVeribage: {
                    message: 'This email address already exists in the Recipient list.'
                },
                lightboxEmailFormatVeribage: {
                    message: 'Invalid Email Address.'
                },
                lightboxStateVeribage: {
                    message: 'Invalid State.'
                },
                lightboxFirstNameVerbiage: {
                    message: 'First Name is required.'
                },
                lightboxLastNameVerbiage: {
                    message: 'Last Name is required.'
                },
                lightboxOneNameRequired: {
                    message: 'For Registered User in Personify, First Name and Last Name field are auto-fetched. Please update the information in Personify and try again.'
                },
                lightboxPersonifyVeribage: {
                    message: 'First Name and Last Name of an individual will be auto-populated based on ANA records.'
                },
            },
        };

        if (!Object.hasOwn(this.defaultOptions.instanceTypes, instanceType)) {
            console.log(`ERROR: add-update-enrollment-component.js : unrecognized instanceType "${instanceType}" supplied. This instance will not function correctly.`);
        }
    }

    initChildren() {
        this.guid = Utils.generateGUID();
        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.data = {};
        this.existsInDBFlag = false;
        this.$el.find(this.options.selectors.lightboxANAAccountNotExistsVeribage).hide();
        this.lightboxHeadingText = this.options.lightboxHeadingText[this.options.instanceType];
        this.lightboxEmailExistsVeribageText = this.options.notification.lightboxEmailExistsVeribage.message;
        this.lightboxEmailFormatVeribageText = this.options.notification.lightboxEmailFormatVeribage.message;
        this.lightboxStateVeribageText = this.options.notification.lightboxStateVeribage.message;
        this.lightboxFirstNameVerbiageText = this.options.notification.lightboxFirstNameVerbiage.message;
        this.lightboxLastNameVerbiageText = this.options.notification.lightboxLastNameVerbiage.message;
        this.lightboxOneNameRequired = this.options.notification.lightboxOneNameRequired.message;
        this.lightboxPersonifyVeribageText = this.options.notification.lightboxPersonifyVeribage.message;
        this.lightboxCourseEnrolledNotificationMessage = this.options.notification.courseEnrolledNotification.message;
        this.loadingSpinner = new LoadingSpinner();
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

    }

    addListeners() {
        this.$el.on('click', this._triggerClick.bind(this)); // NB - root element needs to be the button clicked to trigger the action
    }

    _triggerClick(e) {

        e.preventDefault();
        this._openModal();
    }
    populateCountryOptions($dropdown) {
        let optionsHtml = '';
        for (const key in this.countryData) {
            if (Object.hasOwn(this.countryData, key)) {
                optionsHtml = `${optionsHtml}<option class="e-form__input e-form__input--option" value="${key}">${this.countryData[key]}</option>`;
            }
        }
        $dropdown.html(optionsHtml);
    }

    _onFilterState(e, label, $modalContentInner) {
        e.preventDefault();
        const val = e.target.options[e.currentTarget.selectedIndex].value;
        const country = $modalContentInner.find(this.options.selectors.lineInputs.country).value;
        if (country === 'USA' && val === '') {
            $modalContentInner.find(this.options.selectors.lightboxStateVeribage).text(this.lightboxStateVeribageText);
        } else {
            $modalContentInner.find(this.options.selectors.lightboxStateVeribage).text('');
        }
    }

    _onFilterCountry(e, label, canlabel, intlabel, $modalContentInner) {
        e.preventDefault();
        const val = e.target.options[e.currentTarget.selectedIndex].value;

        $modalContentInner.find(this.options.selectors.lineInputs.state).val('');
        $modalContentInner.find(this.options.selectors.lineInputs.canState).val('');
        $modalContentInner.find(this.options.selectors.lineInputs.intState).val('');
        $modalContentInner.find(this.options.selectors.lightboxStateVeribage).text('');
        if (val === 'USA') {
            label.show();
            canlabel.hide();
            intlabel.hide();
        } else if (val === 'CAN') {
            label.hide();
            canlabel.show();
            intlabel.hide();
        } else {
            label.hide();
            canlabel.hide();
            intlabel.show();
        }
    }

    _openModal() {
        $.magnificPopup.instance.close();

        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxSrcName]),
                type: 'inline',
            },
            callbacks: {
                open: () => {
                    setTimeout(() => {
                        this.$el.off('click.magnificPopup');

                        this._onModalOpened($($.magnificPopup.instance.content[0]));
                    }, 0);
                },
            },
        }).magnificPopup('open');
    }

    _onModalOpened($modalContent) {

        const $modalContentInner = $modalContent.find(`.${this.options.modalInnerClass}`);
        const label = $modalContentInner.find(this.options.selectors.lineInputs.labelState);
        const canlabel = $modalContentInner.find(this.options.selectors.lineInputs.labelCanState);
        const intLabel = $modalContentInner.find(this.options.selectors.lineInputs.labelIntState);
        $modalContentInner.find(this.options.selectors.lightboxPersonifyVeribage).text(this.lightboxPersonifyVeribageText);
        $modalContentInner.find(this.options.selectors.lightboxCourseEnrolledInPastVeribage).text('');
        $modalContentInner.find(this.options.selectors.lineInputs.country).on('change', (e) => {
            this._onFilterCountry(e, label, canlabel, intLabel, $modalContentInner);
        });

        $modalContentInner.find(this.options.selectors.lineInputs.state).on('change', (e) => {
            this._onFilterState(e, label, $modalContentInner);
        });
        $modalContentInner.find(this.options.selectors.lightboxANAAccountNotExistsVeribage).hide();
        lightboxUtils.bindOpenModalButtons();
        switch (this.options.instanceType) {
            case this.options.instanceTypes.add:
                this._populateAdd($modalContentInner);
                this._showOnPopupOpen($modalContentInner);
                break;
            case this.options.instanceTypes.edit:
                this._showOnPopupOpen($modalContentInner);
                this._populateEdit($modalContentInner);
                break;
            default:
                break;
        }

        jitRequire($modalContentInner[0]);
        $modalContentInner.find(this.options.selectors.lineInputs.email).on('keydown', (e) => {
            this._onkeyup(e, $modalContentInner);
        });

        $modalContentInner.find(this.options.selectors.form).on('validsubmit', (e) => {
            this._addUpdateAction(e, $modalContent, $modalContentInner);
        });

    }
    _showSaveSubmit($modalContentInner) {
        console.log(this.options.instanceType);
        if (this.options.instanceType === this.options.instanceTypes.edit) {
            $modalContentInner.find(this.options.selectors.saveButton).show();
            $modalContentInner.find(this.options.selectors.submitButton).hide();
        }
        else {
            $modalContentInner.find(this.options.selectors.submitButton).show();
            $modalContentInner.find(this.options.selectors.saveButton).hide();
        }
    }
    _onfocusoutZipcode($modalContentInner) {
        let zipcode = $modalContentInner.find(this.options.selectors.lineInputs.zipcode).val();
        $modalContentInner.find(this.options.selectors.lightboxZipcodeVerbiage).hide();
        this._showSaveSubmit($modalContentInner);
        let regex = /^\d+$/;
        if (zipcode.length > 0) {
            if (!regex.test(zipcode)) {
                $modalContentInner.find(this.options.selectors.lightboxZipcodeVerbiage).show();
                this._hideButtons($modalContentInner);
            }
        }
    }
    _showNameWithValidation($modalContentInner) {
        let firstname = $modalContentInner.find(this.options.selectors.lineInputs.firstName).val();
        let lastname = $modalContentInner.find(this.options.selectors.lineInputs.lastName).val();
        this._hideNameValidations($modalContentInner);
        if (firstname === "" && lastname === "") {
            $modalContentInner.find(this.options.selectors.lightboxLastNameVerbiage).show();

        }
    }

    _hideNameValidations($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxFirstNameVerbiage).text('');
        $modalContentInner.find(this.options.selectors.lightboxFirstNameVerbiage).hide();
        $modalContentInner.find(this.options.selectors.lightboxLastNameVerbiage).text('');
        $modalContentInner.find(this.options.selectors.lightboxLastNameVerbiage).hide();
    }
    _hideButtons($modalContentInner) {
        $modalContentInner.find(this.options.selectors.submitButton).hide();
        $modalContentInner.find(this.options.selectors.saveButton).hide();
    }
    _onkeyup(e, $modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxANAAccountNotExistsVeribage).hide();
        clearTimeout(this.timer); //clear any running timeout on key up
        this.timer = setTimeout(() => {
            this._showOnPopupOpen($modalContentInner);
            let email = e.target.value;
            let id = this.data.id;
            this._hideNameValidations($modalContentInner);
            $modalContentInner.find(this.options.selectors.lightboxCourseEnrolledInPastVeribage).text('');
            if (email.length > 0) {
                if (this._isValidEmail(email)) {
                    this.loadingSpinner.request(`${this.guid}-_verifyEnrollmentEmail`);

                    APIProxy.request({
                        api: 'verifyEnrollmentEmail',
                        queryData: {
                            email,
                            id,
                        },
                        success: (data) => {
                            if (data.Success) {
                                if (data.ExistsInEnrollmentList) {
                                    this._showVerbiageIfEmailExistsInList($modalContentInner);
                                    this._hideNameValidations($modalContentInner);
                                    this._hideButtons($modalContentInner);
                                    this.existsInDBFlag = true;
                                }
                                else {
                                    this.existsInDBFlag = false;
                                    this._showOnPopupOpen($modalContentInner);
                                    $modalContentInner.find(this.options.selectors.lineInputs.email).val(data.Result.Email);
                                    $modalContentInner.find(this.options.selectors.lineInputs.firstName).val(data.Result.FirstName);
                                    $modalContentInner.find(this.options.selectors.lineInputs.lastName).val(data.Result.LastName);
                                    this._showNameWithValidation($modalContentInner);
                                    if (data.Result.IsCourseEnrolled) {
                                        $modalContentInner.find(this.options.selectors.lightboxCourseEnrolledInPastVeribage).text(this.lightboxCourseEnrolledNotificationMessage);
                                    }
                                }
                            }
                            else {
                                this.existsInDBFlag = false;
                                this._showIfNotExistsInPersonify($modalContentInner);
                                this._hideNameValidations($modalContentInner);
                                this._hideButtons($modalContentInner);
                            }

                            this.loadingSpinner.release(`${this.guid}-_verifyEnrollmentEmail`);

                        },
                        error: (jqxhr) => {
                            this.loadingSpinner.release(`${this.guid}-_verifyEnrollmentEmail`);

                            Utils.handleAjaxError(jqxhr, {
                                displayEl: $modalContentInner.find(this.options.selectors.lightboxEmailExistsVeribage),
                                context: 'AddUpdateEnrollmentComponent._verifyEnrollmentEmail',
                            });
                        },
                    });
                }
                else {
                    this._emailNotInCorrectFormat($modalContentInner);
                }
            }
        }, 1500);
    }
    _emailNotInCorrectFormat($modalContentInner) {
        this._hideButtons($modalContentInner);
        $modalContentInner.find(this.options.selectors.lightboxEmailExistsVeribage).text(this.lightboxEmailFormatVeribageText);
    }

    _isNameValid($modalContentInner) {
        if ($modalContentInner.find(this.options.selectors.lineInputs.firstName).val() === "" &&
            $modalContentInner.find(this.options.selectors.lineInputs.lastName).val() === "") {
            return false;
        }
        return true;
    }
    _showOnPopupOpen($modalContentInner) {
        if (this.options.instanceType === this.options.instanceTypes.edit) {
            $modalContentInner.find(this.options.selectors.saveButton).show();
            $modalContentInner.find(this.options.selectors.submitButton).hide();
        }
        else {
            $modalContentInner.find(this.options.selectors.submitButton).show();
            $modalContentInner.find(this.options.selectors.saveButton).hide();
        }
        $modalContentInner.find(this.options.selectors.lightboxEmailExistsVeribage).text("");
    }
    _showIfNotExistsInPersonify($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxANAAccountNotExistsVeribage).show();
        $modalContentInner.find(this.options.selectors.lineInputs.firstName).val('');
        $modalContentInner.find(this.options.selectors.lineInputs.lastName).val('');

    }
    _showVerbiageIfEmailExistsInList($modalContentInner) {
        $modalContentInner.find(this.options.selectors.lightboxEmailExistsVeribage).text(this.lightboxEmailExistsVeribageText);
    }
    _isValidEmail(email) {
        if (!email) {
            return false;
        }

        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        return pattern.test(email.trim());
    }
    _populateAdd($modalContentInner) {
        $modalContentInner.find(this.options.selectors.submitButton).show();
        $modalContentInner.find(this.options.selectors.saveButton).hide();
        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
        $modalContentInner.find(this.options.selectors.lineInputs.labelState).show();
        $modalContentInner.find(this.options.selectors.lineInputs.labelCanState).hide();
        $modalContentInner.find(this.options.selectors.lineInputs.labelIntState).hide();
    }
    _populateEdit($modalContentInner) {

        $modalContentInner.find(this.options.selectors.lightboxHeading).text(this.lightboxHeadingText);
        $modalContentInner.find(this.options.selectors.lightboxValidationIssuesVerbiage).hide();
        if (this.data.isAddressValidated === false && (this.data.ValidationIssues !== null && this.data.ValidationIssues !== "")) {

            $modalContentInner.find(this.options.selectors.lightboxValidationIssuesVerbiage).show();
            $modalContentInner.find(this.options.selectors.lightboxValidationIssuesVerbiage).text(this.data.ValidationIssues);
        }

        $modalContentInner.find(this.options.selectors.submitButton).hide();
        $modalContentInner.find(this.options.selectors.saveButton).show();
        for (const key in this.options.selectors.lineInputs) {
            if (Object.hasOwn(this.options.selectors.lineInputs, key) && Object.hasOwn(this.data, key)) {
                $modalContentInner.find(this.options.selectors.lineInputs[key]).val(this.data[key]);
            }
        }
        $modalContentInner.find(this.options.selectors.lineInputs.id).val(this.data.id);

        const country = this.data.country;

        if (this.data.firstname === "" || this.data.lastName === "") {
            this._showNameWithValidation($modalContentInner);
            $modalContentInner.find(this.options.selectors.saveButton).hide();
        }

        if (country) {
            if (country === 'USA') {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).show();
                $modalContentInner.find(this.options.selectors.lineInputs.labelCanState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.labelIntState).hide();
                let valForState = $modalContentInner.find(this.options.selectors.lineInputs.state).val();
                if (valForState === undefined || valForState === null || valForState === "") {
                    $modalContentInner.find(this.options.selectors.lightboxStateVeribage).text(this.lightboxStateVeribageText);
                }
            } else if (country === 'CAN') {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.labelCanState).show();
                $modalContentInner.find(this.options.selectors.lineInputs.labelIntState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.canState).val(this.data.state);
            } else {
                $modalContentInner.find(this.options.selectors.lineInputs.labelState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.labelCanState).hide();
                $modalContentInner.find(this.options.selectors.lineInputs.labelIntState).show();
                $modalContentInner.find(this.options.selectors.lineInputs.intState).val(this.data.state);
            }
        }

    }

    _addUpdateAction(e, $modalContent, $modalContentInner) {

        e.preventDefault();
        const model = {};
        model.email = $modalContentInner.find(this.options.selectors.lineInputs.email).val();
        if (model.email.length > 0) {
            if (this._isValidEmail(model.email)) {
                let returnFlag = false;
                model.id = $modalContentInner.find(this.options.selectors.lineInputs.id).val();
                model.firstName = $modalContentInner.find(this.options.selectors.lineInputs.firstName).val();
                model.lastName = $modalContentInner.find(this.options.selectors.lineInputs.lastName).val();
                model.addressline1 = $modalContentInner.find(this.options.selectors.lineInputs.addressline1).val();
                model.addressline2 = $modalContentInner.find(this.options.selectors.lineInputs.addressline2).val();
                model.city = $modalContentInner.find(this.options.selectors.lineInputs.city).val();
                model.country = $modalContentInner.find(this.options.selectors.lineInputs.country).val();
                model.zipcode = $modalContentInner.find(this.options.selectors.lineInputs.zipcode).val();

                if (model.firstName === "" && model.lastName === "") {
                    $modalContentInner.find(this.options.selectors.lightboxFirstNameVerbiage).text('');
                    $modalContentInner.find(this.options.selectors.lightboxFirstNameVerbiage).hide();
                    $modalContentInner.find(this.options.selectors.lightboxLastNameVerbiage).text(this.lightboxOneNameRequired);
                    $modalContentInner.find(this.options.selectors.lightboxLastNameVerbiage).show();
                    returnFlag = true;
                }

                if (model.country === "USA") {
                    model.state = $modalContentInner.find(this.options.selectors.lineInputs.state).val();
                }
                else if (model.country === "CAN") {
                    model.state = $modalContentInner.find(this.options.selectors.lineInputs.canState).val();
                } else {
                    model.state = $modalContentInner.find(this.options.selectors.lineInputs.intState).val();
                }

                if (model.country === "USA" && (model.state === "" || model.state === undefined || model.state === null)) {
                    $modalContentInner.find(this.options.selectors.lightboxStateVeribage).text(this.lightboxStateVeribageText);
                    returnFlag = true;
                }
                else {
                    $modalContentInner.find(this.options.selectors.lightboxStateVeribage).text('');
                }
                if (returnFlag === true) {
                    return;
                }

                model.ActiveFlag = true;

                this.gtmHelper.customUserData();
                switch (this.options.instanceType) {
                    case this.options.instanceTypes.add:
                        globalEmitter.emit('gtm.site-accountenrollmentadd');
                        break;
                    case this.options.instanceTypes.edit:
                        globalEmitter.emit('gtm.site-accountenrollmentupdate');
                        break;
                    default:
                        break;
                }

                this.loadingSpinner.request(`${this.guid}-_addUpdateAction`);

                APIProxy.request({
                    api: 'AddUpdateBulkPurchaseDetails',
                    queryData: {
                        enrollment: model,
                    },
                    success: (data) => {
                        $.magnificPopup.instance.close();
                        globalEmitter.emit('addupdateenrollment:dataupdated', this);
                        this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);
                    },
                    error: (jqxhr) => {
                        this.loadingSpinner.release(`${this.guid}-_addUpdateAction`);

                        Utils.handleAjaxError(jqxhr, {
                            displayEl: $modalContentInner.find(this.options.selectors.errorText),
                            context: 'AddUpdateEnrollmentComponent._addUpdateAction',
                        });
                    },
                });
            }
            else {
                this._emailNotInCorrectFormat($modalContentInner);
            }
        }

    }

    setData(data) {
        this.data = data;
    }
}

export default (instanceType, lightboxSrcName) => {
    return new AddUpdateEnrollmentComponent(instanceType, lightboxSrcName);
};
