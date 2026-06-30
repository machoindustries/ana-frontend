import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';

class EpiserverFormsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                formStepSelector: '[data-step-behaviour]',
                nextStepBehaviourSelector: '[data-next-step-behaviour]',
                datepickerSelector: '.hasDatepicker',
                episerverFormsSelector: '.EPiServerForms',
            },
            waitInterval: 1000,
            intervalCount: 5,
            activeBreadcrumbCssClass: 'Form__Breadcrumb-Item--Active',
            dateFormat: 'dd/mm/yy',
            scrollDuration: 0,
            scrollDelay: 0,
            scrollEasing: 'easeOutCirc',
        };
    }

    initChildren() {
        if ($('.lt-ie9').size() > 0) {
            return;
        }
        this.interval = setInterval(this._checkAndInitialise.bind(this), this.options.waitInterval);

        this.currentStepIndex = parseInt(this.$el.find('[name="__FormCurrentStepIndex"]').val(), 10);
    }

    addListeners() {
        if ($('.lt-ie9').size() > 0) {
            return;
        }
        this._addNextStepBehaviourEvents();

        this._configureDatepickers();
    }

    _configureDatepickers() {
        const self = this;

        this.$el.find(this.options.selectors.datepicker).each((idx, element) => {
            const $this = $(element);

            console.log($this);

            self.$$epiforms(`#${$this.attr('id')}`).data('datepicker').settings.dateFormat = self.options.dateFormat;
        });
    }

    _scrollToError() {
        const self = this;

        this.$$epiforms(this.options.selectors.episerverForms).on('formsStepValidating', (evt) => {
            if (evt.isValid) {
                return;
            }

            const $firstInvalidEl = self.$el.find('.ValidationFail').first();

            animate($firstInvalidEl, 'scroll',
                { offset: -100,
                    mobileHA: false,
                    duration: self.options.scrollDuration,
                    easing: self.options.scrollEasing,
                }, self)
                .then(() => {
                // Find our first label element and trigger click event to focus on input
                    $firstInvalidEl.find('label').first().trigger('click');
                });
        });
    }

    _addNextStepBehaviourEvents() {
        const self = this,
            $nextStepsBehaviour = this.$el.find(this.options.selectors.nextStepBehaviour);

        $nextStepsBehaviour.on('click', (evt) => {
            evt.preventDefault();

            self.currentStepIndex++;

            $('.Form__NavigationBar__Action.btnNext').trigger('click');
        });
    }

    _checkAndInitialise() {
        console.log('_checkAndInitialise.EpiserverFormsView');

        this.$$epiforms = window.$$epiforms;

        if (this.$$epiforms === null) {
            console.log('Warning: episerver-forms-view.js : no $$epiforms global found!');

            this.options.intervalCount--;
        } else {
            clearInterval(this.interval);

            this.addListeners();
        }

        if (this.options.intervalCount === 0) {
            clearInterval(this.interval);
        }

        this._scrollToError();

        this._logAllEPiServerFormsEvents();
    }

    _logAllEPiServerFormsEvents() {
        this.$$epiforms(this.options.selectors.episerverForms).on(`formsNavigationNextStep
            formsNavigationPrevStep formsSetupCompleted formsReset formsStartSubmitting
            formsSubmitted formsSubmittedError formsNavigateToStep formsStepValidating`, function(event) {
                /* eslint-disable-next-line no-invalid-this */
            console.log($(this).get(0), event);

            globalEmitter.emit('state.FormsEvents', event);
        });
    }
}

export default () => {
    return new EpiserverFormsView();
};
