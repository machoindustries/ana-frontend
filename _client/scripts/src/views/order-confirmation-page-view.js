import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMHelper from 'modules/gtm-helper';

class OrderConfirmationPageView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                productList: '[data-purchased-products]',
            },
            attrs: {
                gtm: {
                    donationAmount: 'data-gtm-donation-amount',
                    donationsInfo: 'data-gtm-donations',
                },
            },
        };
    }

    initChildren() {
        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this.$productList = this.$el.find(this.options.selectors.productList);

        this._sendGTM();
    }

    _sendGTM() {
        this.gtmHelper.customUserData();

        const donationsInfoAttrVal = this.$el.attr(this.options.attrs.gtm.donationsInfo);
        let donationsInfo = {};

        if (typeof donationsInfoAttrVal !== 'undefined') {
            donationsInfo = JSON.parse(donationsInfoAttrVal);
        }

        const data = this.gtmHelper.ecommerceTransaction(this.$el, this.$productList, donationsInfo);

        globalEmitter.emit('gtm.ecommerce-transaction', data);

        const gtmData = this.gtmHelper.ecommerceCheckoutConfirmation(this.$productList, donationsInfo, 2);

        globalEmitter.emit('gtm.ecommerce-checkout', gtmData);

        this._sendPurchaseDetailsGTM();
    }

    _sendPurchaseDetailsGTM() {
        const newMembershipsData = this.gtmHelper.purchaseNewMemberships(this.$productList);

        if (newMembershipsData !== null) {
            globalEmitter.emit('gtm.purchase-newmemberships', newMembershipsData);
        }

        const renewalMembershipsData = this.gtmHelper.purchaseRenewalMemberships(this.$productList);

        if (renewalMembershipsData !== null) {
            globalEmitter.emit('gtm.purchase-renewalmemberships', renewalMembershipsData);
        }

        const newCertificationsData = this.gtmHelper.purchaseNewCertifications(this.$productList);

        if (newCertificationsData !== null) {
            globalEmitter.emit('gtm.purchase-newcertifications', newCertificationsData);
        }

        const renewalCertificationsData = this.gtmHelper.purchaseRenewalCertifications(this.$productList);

        if (renewalCertificationsData !== null) {
            globalEmitter.emit('gtm.purchase-renewalcertifications', renewalCertificationsData);
        }

        const basketCompletionBooksData = this.gtmHelper.basketCompletionBooks(this.$productList);

        if (basketCompletionBooksData !== null) {
            globalEmitter.emit('gtm.purchase-basketcompletionbooks', basketCompletionBooksData);
        }

        const basketCompletionCEBooksData = this.gtmHelper.basketCompletionContinuingEducation(this.$productList, 'book');

        if (basketCompletionCEBooksData !== null) {
            globalEmitter.emit('gtm.purchase-basketcompletionce', basketCompletionCEBooksData);
        }

        const basketCompletionCECoursesData = this.gtmHelper.basketCompletionContinuingEducation(this.$productList, 'course');

        if (basketCompletionCECoursesData !== null) {
            globalEmitter.emit('gtm.purchase-basketcompletionce', basketCompletionCECoursesData);
        }

        const basketCompletionCEWorkshopsData = this.gtmHelper.basketCompletionContinuingEducation(this.$productList, 'workshop');

        if (basketCompletionCEWorkshopsData !== null) {
            globalEmitter.emit('gtm.purchase-basketcompletionce', basketCompletionCEWorkshopsData);
        }

        const basketCompletionCEWebinarsData = this.gtmHelper.basketCompletionContinuingEducation(this.$productList, 'webinar');

        if (basketCompletionCEWebinarsData !== null) {
            globalEmitter.emit('gtm.purchase-basketcompletionce', basketCompletionCEWebinarsData);
        }
    }
}

export default () => {
    return new OrderConfirmationPageView();
};
