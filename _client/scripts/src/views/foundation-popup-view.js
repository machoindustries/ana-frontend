import BaseComponent from 'components/base-component';

class FoundationPopupView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                continueButton: '[data-foundation-popup-continue]',
            },
            destinationUrlDataAttr: 'data-destination-url',
        };
    }

    initChildren() {
        this.$continueButton = this.$el.find(this.options.selectors.continueButton);
        this.destinationUrl = this.$el.attr(this.options.destinationUrlDataAttr);
    }

    addListeners() {
        if (typeof this.destinationUrl === 'undefined') {
            return;
        }

        console.log('Dest', this.destinationUrl);
        this.$continueButton.on('click', (e) => {
            e.preventDefault();

            window.location.href = this.destinationUrl;
        });
    }
}

export default () => {
    return new FoundationPopupView();
};
