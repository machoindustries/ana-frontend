import BaseComponent from 'components/base-component';

class EnrollmentComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                output: '[data-enrollment-output]',
                lineOutputs: {
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
                    labelIntInputState: '[data-label-int-state]',
                },
            },
            outputAttrs: {
                firstName: 'data-first-name',
                lastName: 'data-last-name',
                email: 'data-email',
                addressline1: 'data-address-line1',
                addressline2: 'data-address-line2',
                city: 'data-city',
                state: 'data-select-state',
                zipcode: 'data-zipcode',
                country: 'data-country',
                labelState: 'data-label-state',
                canState: 'data-input-can-state',
                labelCanState: 'data-label-can-state',
                intState: 'data-input-int-state',
                labelIntState: 'data-label-int-state',
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
                console.log(`ERROR: enrollment-component.js : no line output found for data key "${key}"`);
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
    return new EnrollmentComponent();
};
