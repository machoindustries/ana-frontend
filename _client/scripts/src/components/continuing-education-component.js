import BaseComponent from 'components/base-component';

class ContinuingEducationComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                output: '[data-continuing-education-output]',
                lineOutputs: {
                    subject: '[data-continuing-education-subject]',
                    description: '[data-continuing-education-description]',
                    sponsor: '[data-continuing-education-sponsor]',
                    formattedDate: '[data-continuing-education-offered-date]',
                    contactHours: '[data-continuing-education-contact-hours]',
                    approved: '[data-continuing-education-approved]',
                    pharmHrs: '[data-continuing-education-pharm-hours]',
                },
            },
            outputAttrs: {
                subject: 'data-continuing-education-subject',
                description: 'data-continuing-education-description',
                sponsor: 'data-continuing-education-sponsor',
                formattedDate: 'data-continuing-education-offered-date',
                contactHours: 'data-continuing-education-contact-hours',
                approved: 'data-continuing-education-approved',
                pharmHrs: 'data-continuing-education-pharm-hours',
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
                console.log(`ERROR: continuing-education-component.js : no line output found for data key "${key}"`);
            }
        }
    }

    _outputData() {
        this._clearOutputs();

        const keys = Object.keys(this.$lineOutputs);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];

            if (Object.hasOwn(this.data, key)) {
                let val = this.data[key];

                if (key === 'approved' || key === 'pharmacoTheraputics') {
                    switch (val) {
                    case true:
                        val = 'Yes';
                        break;
                    case false:
                        val = 'No';
                        break;
                    default:
                        break;
                    }
                }

                this.$lineOutputs[key].html(val);

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
    return new ContinuingEducationComponent();
};
