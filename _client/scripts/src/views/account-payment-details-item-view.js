import BaseComponent from 'components/base-component';
import LoadingSpinner from 'modules/loading-spinner';
import RemovePaymentMethodComponent from 'components/remove-payment-method-component';

class AccountPaymentDetailsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                removeComponent: '[data-account-payment-details-item-remove]',
                outputType: '[data-payment-details-item-output-type]',
                outputDescription: '[data-payment-details-item-output-description]',
            },
        };
    }

    initChildren() {
        this.$outputType = this.$el.find(this.options.selectors.outputType);
        this.$outputDescription = this.$el.find(this.options.selectors.outputDescription);

        this.data = [];

        this.loadingSpinner = new LoadingSpinner();

        this.removeComponent = new RemovePaymentMethodComponent();
        this.removeComponent.init(this.$el.find(this.options.selectors.removeComponent), {});
    }

    addListeners() {

    }

    _populateData() {
        this.$outputDescription.text(this.data.displayText);
    }

    setData(data) {
        this.data = data;

        this.removeComponent.setData(data);

        this._populateData();
    }
}

export default () => {
    return new AccountPaymentDetailsItemView();
};
