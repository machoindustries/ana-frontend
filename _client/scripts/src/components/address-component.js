import BaseComponent from 'components/base-component';

class AddressComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                output: '[data-address-output]',
                lineOutputs: {
                    name: '[data-address-output-name]',
                    address1: '[data-address-output-address-1]',
                    address2: '[data-address-output-address-2]',
                    address3: '[data-address-output-address-3]',
                    city: '[data-address-output-city]',
                    state: '[data-address-output-state]',
                    country: '[data-address-output-country]',
                    zipCode: '[data-address-output-zipcode]',
                    phone1: '[data-address-output-phone-1]',
                    phone2: '[data-address-output-phone-2]',
                },
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
                console.log(`ERROR: address-component.js : no line output found for address data key "${key}"`);
            }
        }
    }

    _outputData() {
        this._clearOutputs();

        const keys = Object.keys(this.$lineOutputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];

            if (Object.hasOwn(this.data, key)) {
                this.$lineOutputs[key].html(this.data[key]).show();
            } else {
                this.$lineOutputs[key].html('').hide();
            }
        }

        this.$output.show();
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
    return new AddressComponent();
};
