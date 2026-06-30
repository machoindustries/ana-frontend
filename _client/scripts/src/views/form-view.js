import BaseComponent from 'components/base-component';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import moment from 'moment';
import GTMHelper from 'modules/gtm-helper';

class FormView extends BaseComponent {
    constructor() {
        super();

        const dateFormat = 'MM-DD-YYYY';

        this.defaultOptions = {
            selectors: {
                textField: '[data-formfield-text]',
                inputLabel: '[data-fake-placeholder]',
                submitButton: '[data-form-submit]',
                ajaxForm: '[data-ajax-form]',
                epiForm: '[data-epi-content-form]',
                epiFormTitle: '[data-epi-content-form-title]',
                title: '[data-form-title]',
            },
            hasContentClass: 'has--content',
            hasErrorClass: 'has--error',
            fieldUpdateInitialPollDuration: 250,
            fieldUpdatePollDuration: 2000, // Should not be set too high, or performance may suffer
            fieldUpdatePollInterval: null,
            validSubmitEvent: 'validsubmit',
            dateFormat,
            validation: {
                errorElement: 'div',
                errorClass: 'error-msg',
                errorContainerSelector: '[data-validation-error]',
                validateInputSelectorAttr: 'data-validate',
                validationMessageAttr: 'data-validate-message', // NOTE - only used for elements implementing regex validation rule
                ignoreSelector: '[data-validate-ignore]',
                getFallbackMessage: (inputLabel) => {
                    return `${inputLabel} is missing or invalid`;
                },
                // NOTE - this is designed to be extended with new rules as required (see https://jqueryvalidation.org/validate/#rules)
                rules: {
                    required: {
                        getMsg: (inputLabel) => {
                            return `${inputLabel} is required`;
                        },
                    },
                    minlength: {
                        getMsg: (inputLabel, val) => {
                            return `${inputLabel} must have at least ${val} characters`;
                        },
                    },
                    maxlength: {
                        getMsg: (inputLabel, val) => {
                            return `${inputLabel} cannot have more than ${val} characters`;
                        },
                    },
                    email: {
                        getMsg: (inputLabel) => {
                            return `${inputLabel} must be a valid email address`;
                        },
                    },
                    digits: {
                        getMsg: (inputLabel) => {
                            return `${inputLabel} must contain only digits`;
                        },
                    },
                    regex: {},
                    realdate: {
                        getMsg: (inputLabel) => {
                            return `${inputLabel} must be a valid date in the format ${dateFormat}`;
                        },
                    },
                },
            },
        };
    }

    initChildren() {
        this.$textFields = this.$el.find(this.options.selectors.textField);
        this.$submit = this.$el.find(this.options.selectors.submitButton);

        this.validator = null;
        this._rebindValidation();

        if (this.$el.is(this.options.selectors.epiForm)) {
            this.$title = this.$el.find(this.options.selectors.epiFormTitle);

            this.$el.on(this.options.validSubmitEvent, this._sendEpiFormsGtm.bind(this));
        }

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$textFields.on('change keyup focusin focusout', (e) => {
            const $target = $(e.currentTarget);

            this._updateFakePlaceholderState($target);
        });

        // Delay for configurable duration before checking for auto-completed fields (to ensure autofilled data correctly shows/hides fake placeholder)
        setTimeout(() => {
            this.$textFields.each((idx, elem) => {
                this._updateFakePlaceholderState($(elem));
            });
        }, this.options.fieldUpdateInitialPollDuration);

        this.fieldUpdatePollInterval = setInterval(() => {
            this.$textFields.each((idx, elem) => {
                const $elem = $(elem);

                if ($elem.is('[type="password"]')) {
                    this._updateFakePlaceholderState($elem);
                }
            });
        }, this.options.fieldUpdatePollDuration);

        globalEmitter.on('forms:validation:rebind', this._rebindValidation.bind(this));
    }

    _sendEpiFormsGtm() {
        this.gtmHelper.customUserData();

        const category = window.location.pathname;
        const action = GTMUtils.valueOrFallback(this.$title.text().trim());

        globalEmitter.emit('gtm.site-epiformsubmit', { category, action });
    }

    _rebindValidation() {
        if (this.validator !== null && document.body.contains(this.$el[0])) {
            this.validator.destroy();
        }

        // Construct validation rules object dynamically based on data attributes (for each element with data-validate)
        const valCfgRules = {};
        const valCfgMessages = {};
        const ruleTypeKeys = Object.keys(this.options.validation.rules);

        $.validator.addMethod(
            'regex',
            function(val, elem, regexp) {
                const re = new RegExp(regexp);
                /* eslint-disable-next-line no-invalid-this */
                return this.optional(elem) || re.test(val);
            }
        );

        const self = this;

        $.validator.addMethod(
            'realdate',
            function(val, elem) {
                /* eslint-disable-next-line no-invalid-this */
                return this.optional(elem) || moment(val, self.options.dateFormat).isValid();
            }
        );

        this.$el.find(`[${this.options.validation.validateInputSelectorAttr}]:not(${this.options.validation.ignoreSelector})`).each((idx, elem) => {
            const $elem = $(elem);
            const elName = $elem.attr('name');

            if (typeof elName !== 'undefined' && elName !== false) {
                valCfgRules[elName] = {};
                valCfgMessages[elName] = {};

                const cfgRule = valCfgRules[elName];
                const cfgMessage = valCfgMessages[elName];

                for (let rtk = 0; rtk < ruleTypeKeys.length; rtk++) {
                    const ruleKey = ruleTypeKeys[rtk];
                    const attrName = `${this.options.validation.validateInputSelectorAttr}-${ruleKey}`;

                    // If the element has the associated data attribute (it implements this rule)
                    const attrVal = $elem.attr(attrName);

                    if (typeof attrVal !== 'undefined' && attrVal !== false) {
                        // If the input has a valid title attribute, use it as the field name in error messages for the field.
                        // Otherwise if the label text of the form field is set, use it as the field name.
                        let inputLabel = $elem.attr('title');

                        if (!inputLabel) {
                            inputLabel = $elem.next(this.options.selectors.inputLabel).text();
                        }

                        if (ruleKey === 'regex') {
                            cfgRule[ruleKey] = attrVal;
                            const msgAttrVal = $elem.attr(this.options.validation.validationMessageAttr);
                            cfgMessage[ruleKey] = typeof msgAttrVal !== 'undefined' ? `${msgAttrVal}` : this.options.validation.getFallbackMessage(inputLabel);
                        } else {
                            const ruleVal = attrVal !== '' && attrVal !== 'true' ? parseInt(attrVal, 10) : true;

                            cfgRule[ruleKey] = ruleVal;
                            cfgMessage[ruleKey] = this.options.validation.rules[ruleKey].getMsg(inputLabel, ruleVal);
                        }
                    }
                }
            }
        });

        this.validator = this.$el.validate({
            ignore: '',
            rules: valCfgRules,
            messages: valCfgMessages,
            errorElement: this.options.validation.errorElement,
            errorClass: this.options.validation.errorClass,
            errorPlacement: ($err, $elem) => {
                $err.appendTo($elem.closest('form').find(`[data-validation-for="${$elem.attr('name')}"]`));
            },
            highlight: (elem) => {
                $(elem).addClass(this.options.hasErrorClass);
            },
            unhighlight: (elem) => {
                $(elem).removeClass(this.options.hasErrorClass);
            },
            submitHandler: (form) => {
                console.log('form valid, submitting...');

                const $form = $(form);

                $form.trigger(this.options.validSubmitEvent);

                if ($form.is(this.options.selectors.ajaxForm) === false) {
                    form.submit();
                }
            },
        });

        this.$el.data('validator').settings.ignore = '';
    }

    _updateFakePlaceholderState($elem) {
        console.log($elem);

        // Ensure text input fake placeholders (label-text elems) are hidden when they have content.
        if ($elem.val().length > 0) {
            $elem.addClass(this.options.hasContentClass);
        } else {
            $elem.removeClass(this.options.hasContentClass);
        }
    }
}

export default () => {
    return new FormView();
};
