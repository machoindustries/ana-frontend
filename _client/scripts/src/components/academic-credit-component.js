import BaseComponent from 'components/base-component';

class AcademicCreditComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                output: '[data-academic-credit-output]',
                lineOutputs: {
                    subject: '[data-academic-credit-subject]',
                    sponsor: '[data-academic-credit-sponsor]',
                    credits: '[data-academic-credit-credits]',
                    specialtyFocus: '[data-academic-credit-specialty-focus]',
                    formattedDate: '[data-academic-credit-formatted-date]',
                },
            },
            outputAttrs: {
                subject: 'data-academic-credit-subject',
                sponsors: 'data-academic-credit-sponsor',
                academicCredits: 'data-academic-credit-credits',
                specialtyFocus: 'data-academic-credit-specialty-focus',
                formattedDate: 'data-academic-credit-formatted-date',
            },
        };
    }

    initChildren() {
        this.$output = this.$el.find(this.options.selectors.output);
        this.$lineOutputs = {};

        this.data = {};

        this._getLineOutputs();
    }

    _getLineOutputs() {
        const keys = Object.keys(this.options.selectors.lineOutputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];

            this.$lineOutputs[key] = this.$el.find(this.options.selectors.lineOutputs[key]);

            if (this.$lineOutputs[key].length === 0) {
                console.log(`ERROR: academic-credit-component.js : no line output found for data key "${key}"`);
            }
        }
    }

    _outputData() {
        this._clearOutputs();

        const keys = Object.keys(this.$lineOutputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];

            if (Object.hasOwn(this.data, key)) {
                this.$lineOutputs[key].html(this.data[key]);

                if (Object.hasOwn(this.options.outputAttrs, key)) {
                    this.$el.attr(this.options.outputAttrs[key], this.data[key]);
                }
            } else {
                this.$lineOutputs[key].html('');
            }
        }
    }

    _clearOutputs() {
        const keys = Object.keys(this.$lineOutputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];

            this.$lineOutputs[key].html('');
        }
    }

    setData(data) {
        this.data = data;

        this._outputData();
    }

    getData() {
        return this.data;
    }
}

export default () => {
    return new AcademicCreditComponent();
};
