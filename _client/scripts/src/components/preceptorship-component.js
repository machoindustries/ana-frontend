import BaseComponent from 'components/base-component';

class PreceptorshipComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                output: '[data-preceptorship-output]',
                lineOutputs: {
                    sponsor: '[data-preceptorship-sponsor]',
                    studentType: '[data-preceptorship-student-type]',
                    formattedDate: '[data-preceptorship-end-date]',
                    totalHours: '[data-preceptorship-total-hours]',
                },
            },
            outputAttrs: {
                sponsor: 'data-preceptorship-sponsor',
                studentType: 'data-preceptorship-student-type',
                formattedDate: 'data-preceptorship-end-date',
                totalHours: 'data-preceptorship-total-hours',
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
                console.log(`ERROR: preceptorship-component.js : no line output found for data key "${key}"`);
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
    return new PreceptorshipComponent();
};
