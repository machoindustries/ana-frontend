import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';

class DonationsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            donationTypes: {
                foundation: 'foundation',
                pac: 'pac',
            },
            selectors: {
                donationAmountButton: '[data-donation-amount-button]',
            },
            donationCodeAttr: 'data-donation-code',
            donationTypeAttr: 'data-donation-type',
            activeClass: 'is--active',
        };
    }

    initChildren() {
        this.donationType === null; // eslint-disable-line no-unused-expressions

        const donationType = this.$el.attr(this.options.donationTypeAttr);

        if (Object.keys(this.options.donationTypes).indexOf(donationType) !== -1) {
            this.donationType = donationType;
        }

        this.$donationAmountButtons = this.$el.find(this.options.selectors.donationAmountButton);
    }

    addListeners() {
        this.$donationAmountButtons.on('click', this._onDonationAmountButtonClick.bind(this));

        globalEmitter.on('donations:hidepac', this._handleHidePacDonations.bind(this));
        globalEmitter.on('donations:removed', this._onDonationRemoved.bind(this));
    }

    _onDonationAmountButtonClick(e) {
        e.preventDefault();

        const $target = $(e.target);

        if ($target.hasClass(this.options.activeClass)) {
            this.$donationAmountButtons.removeClass(this.options.activeClass);

            globalEmitter.emit('donation:deselected', $target.attr(this.options.donationCodeAttr));
        } else {
            this.$donationAmountButtons.removeClass(this.options.activeClass);

            $target.addClass(this.options.activeClass);

            globalEmitter.emit('donation:selected', $target.attr(this.options.donationCodeAttr));
        }
    }

    _handleHidePacDonations() {
        if (this.donationType === this.options.donationTypes.pac) {
            this.$donationAmountButtons.removeClass(this.options.activeClass);

            this.$el.hide();
        }
    }

    _onDonationRemoved(donationCode) {
        $(`[data-donation-code="${donationCode}"]`).removeClass(this.options.activeClass);
    }
}

export default () => {
    return new DonationsView();
};
