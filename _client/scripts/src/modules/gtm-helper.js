import BaseComponent from '../components/base-component';
import * as gtmConfig from '../components/gtm-config';
import $ from 'jquery';
import GTMUtils from '../modules/gtm-utils';
import globalEmitter from 'modules/global-emitter';

class GTMHelper extends BaseComponent {

    constructor() {

        super();

        this.defaultOptions = {
            productInfoSelector: '[data-product]',
            purchasedProductInfoSelector: '[data-purchased-product]',
            pageLevelDataSourceElementSelector: 'body',
            productInfoAttr: 'data-product',
            transactionInfoAttr: 'data-transaction',
            promoInfoAttr: 'data-promo',
            currencyCode: 'USD',
            plpListingNameAttr: 'data-page-heading',
            loggedInUserIdAttr: 'data-logged-in-user-id',
            loggedInUserMemberStatusAttr: 'data-logged-in-user-member-status',
            loggedInUserRegisteredStateAttr: 'data-logged-in-user-registered-state',
            contentGroupsInfoSelector: '[data-gtm-content-groups-info]',
            personalisationInfoSelector: '[data-gtm-personalisation-info]',
            currencySymbol: '$',
            stripCurrencySymbolFromFields: [
                'price',
                'revenue',
                'shipping',
                'tax'
            ],
            infoKeyAliases: {
                'format': 'dimension8',
                'cart-item-metadata': 'CartItemMetaData'
            },
            productCategories: {
                membership: 'membership',
                certification: 'certification',
                book: 'book',
                course: 'onlinecourse',
                workshop: 'workshop',
                webinar: 'webinar'
            },
            productCategoryAttr: 'data-product-category',
            productNameAttr: 'data-product-name',
            renewalIdentifierText: 'renewal',
            productNameCharLimit: 200
        };

        this.fallbackValue = GTMUtils.getFallbackValue();
    }

    initChildren() {

        this.$contentGroupsInfo = $(this.options.contentGroupsInfoSelector);
        this.$personalisationInfo = $(this.options.personalisationInfoSelector);
    }

    _getEventDetailsFromEventName(eventList, eventName) {

        let eventDetails = "";

        for (const event of eventList) {
            const currentEventName = event.eventName;

            if (eventName === currentEventName) {
                eventDetails = JSON.parse(JSON.stringify(event.eventDetails));
            }
        }

        if (typeof eventDetails === 'undefined') {
            console.error(`event details not found for ${eventName}`);
        }

        return eventDetails;
    }

    _stripCurrencySymbol(str) {

        return str.replace(this.options.currencySymbol, '');
    }

    _stripProductInfoCurrencySymbols(productInfo) {

        Object.keys(productInfo).forEach((key) => {

            this.options.stripCurrencySymbolFromFields.forEach((item) => {

                if (item === key) {

                    productInfo[key] = this._stripCurrencySymbol(productInfo[key]);
                }
            });
        });
    }

    _translateSpecificProperties(productInfo) {
        let i;

        if (!productInfo || !productInfo.variant) {
            return;
        }

        i = productInfo.variant.indexOf('-');

        if (i !== -1) {
            productInfo.variant = productInfo.variant.substring(0, i);
        }
    }

    _getProductInfo(infoKeys, $product = this.$el) {
        const productInfo = {};

        for (const key of infoKeys) {
            const attrVal = $product.attr(`${this.options.productInfoAttr}-${key}`);

            if (typeof attrVal !== 'undefined') {
                const val = typeof attrVal === 'undefined' ? '' : attrVal.toString();

                if (Object.keys(this.options.infoKeyAliases).indexOf(key) !== -1) {
                    productInfo[this.options.infoKeyAliases[key]] = val;
                }
                else {
                    productInfo[key] = val;
                }
            }
        }

        this._translateSpecificProperties(productInfo);

        this._stripProductInfoCurrencySymbols(productInfo);

        return productInfo;
    }

    _getProductInfoFromData(productInfoKeys, product) {
        // Gets GTM info from product data when no DOM element (and hence no data attributes) is available
        const productInfo = {};

        for (const key in productInfoKeys) {
            if (Object.hasOwn(productInfoKeys, key)) {
                const dataKey = productInfoKeys[key];

                if (Object.hasOwn(product, dataKey)) {
                    productInfo[key] = product[dataKey];
                }
                else {
                    productInfo[key] = this.fallbackValue;
                }
            }
        }

        this._stripProductInfoCurrencySymbols(productInfo);

        return productInfo;
    }

    _addCartItemMetaData(productData) {
        const products = productData.length ? productData : [productData];

        for (let w = 0; w < products.length; w++) {
            if (products[w].CartItemMetaData) {
                let p;

                try {
                    p = JSON.parse(products[w].CartItemMetaData);
                }
                catch (_o) {
                    p = null;
                }

                for (const key in p || {}) {
                    if (Object.hasOwn(p, key)) {
                        products[w][key] = p[key];
                    }
                }
            }

            delete products[w].CartItemMetaData;
        }
    }

    _getTransactionInfo($el) {
        const transactionId = $el.attr(`${this.options.transactionInfoAttr}-id`);
        let transactionRevenue = $el.attr(`${this.options.transactionInfoAttr}-revenue`);
        let transactionTax = $el.attr(`${this.options.transactionInfoAttr}-tax`);
        let transactionShipping = $el.attr(`${this.options.transactionInfoAttr}-shipping`);

        transactionRevenue = this._stripCurrencySymbol(transactionRevenue);
        transactionTax = this._stripCurrencySymbol(transactionTax);
        transactionShipping = this._stripCurrencySymbol(transactionShipping);

        return {
            transaction_id: typeof transactionId === 'undefined' ? this.fallbackValue : transactionId,
            value: typeof transactionId === 'undefined' ? this.fallbackValue : transactionRevenue,
            tax: typeof transactionId === 'undefined' ? this.fallbackValue : transactionTax,
            shipping: typeof transactionId === 'undefined' ? this.fallbackValue : transactionShipping
        };
    }

    _getPromoInfo(infoKeys, $promo = this.$el) {

        const promoInfo = {};

        for (const key of infoKeys) {

            const attrVal = $promo.attr(`${this.options.promoInfoAttr}-${key}`);

            if (typeof attrVal === 'undefined') {

                console.error(`WARNING: gtm-helper.js : _getpromoInfo : promo info attribute not found for key ${key}`);
            }
            else {
                promoInfo[key] = typeof attrVal === 'undefined' ? '' : attrVal.toString();
            }
        }

        return promoInfo;
    }

    _getProductList(infoKeys, $listContainer = this.$el, productInfoSelector = this.options.productInfoSelector) {

        const productList = [];

        if ($listContainer.is(productInfoSelector)) {

            productList.push(this._getProductInfo(infoKeys, $listContainer));
        }
        else {

            $listContainer.find(productInfoSelector).each((idx, elem) => {
                productList.push(this._getProductInfo(infoKeys, $(elem)));
            });
        }

        return productList;
    }

    _getNumNewAndRenewalItems($productList, productCategory) {

        const ret = {
            numItems: 0,
            numRenewals: 0,
            firstProdName: ''
        };

        $productList.find(this.options.purchasedProductInfoSelector).each((idx, elem) => {

            const $elem = $(elem);

            const prodCategory = $elem.attr(this.options.productCategoryAttr);

            if (prodCategory.toLowerCase() === productCategory) {

                ret.numItems++;

                const prodName = $elem.attr(this.options.productNameAttr);

                if (ret.numItems === 1) {

                    ret.firstProdName = prodName;
                }

                if (typeof prodName !== 'undefined' && prodName.toLowerCase().indexOf(this.options.renewalIdentifierText) !== -1) {

                    ret.numRenewals++;
                }
            }
        });

        return ret;
    }

    _getNumInCategory($productList, productCategory) {
        const ret = {
            numItems: 0,
            firstProdName: ''
        };

        $productList.find(this.options.purchasedProductInfoSelector).each((idx, elem) => {
            const $elem = $(elem);

            const prodCategory = $elem.attr(this.options.productCategoryAttr);

            if (prodCategory.toLowerCase() === productCategory) {
                ret.numItems++;

                const prodName = $elem.attr(this.options.productNameAttr);

                if (ret.numItems === 1) {
                    ret.firstProdName = prodName;
                }
            }
        });

        return ret;
    }

    getProductInfoAttr() {
        return this.options.productInfoAttr;
    }

    _populatePlpImpressionsListName($productListItems, impressionsData) {
        const $body = $productListItems.closest('body');
        let listingName = this.options.fallbackValue;
        let listingNameID = this.options.fallbackValue;

        if ($body.length > 0) {
            const listingNameAttr = $body.attr(this.options.plpListingNameAttr);

            if (typeof listingNameAttr !== 'undefined') {
                listingName = listingNameAttr.trim();
                listingNameID = listingNameAttr.replace(/ /g, '_');
            }
        }

        for (let i = 0; i < impressionsData.length; i++) {
            impressionsData[i].item_list_name = listingName;
            impressionsData[i].item_list_id = listingNameID;
        }
    }

    _getTaxonomyInfo(eventDetails, keyMappings, $infoElem, infoTypeAttrFragment) {
        const keys = Object.keys(keyMappings);

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            const gtmVal = $infoElem.attr(`data-gtm-${infoTypeAttrFragment}-${keyMappings[key]}`);

            eventDetails[key] = GTMUtils.valueOrFallback(gtmVal);
        }
    }

    _getDonationGtmData(donation) {
        const productInfo = {
            id: donation.id,
            name: `Donation: ${donation.displayName}`,
            price: donation.amount,
            quantity: 1
        };

        this._stripProductInfoCurrencySymbols(productInfo);

        return productInfo;
    }

    _truncateProductName(str) {
        let TheString = str;

        if (TheString.length > this.options.productNameCharLimit) {
            TheString = TheString.substring(0, this.options.productNameCharLimit - 1);
        }

        return TheString;
    }

    ecommercePlpImpression($productListItems) {
        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-plpimpression');
        const infoKeys = [
            'item_name',
            'item_id',
            'price',
            'item_brand',
            'item_category',
            'item_variant',
            'index',
        ];
        const $body = $productListItems.closest('body');
        let listingName = this.options.fallbackValue;
        let listingNameID = this.options.fallbackValue;

        if ($body.length > 0) {
            const listingNameAttr = $body.attr(this.options.plpListingNameAttr);

            if (typeof listingNameAttr !== 'undefined') {
                listingName = listingNameAttr.trim();
                listingNameID = listingNameAttr.replace(/ /g, '_');
            }
        }
        eventDetails.ecommerce.item_list_id = listingNameID;
        eventDetails.ecommerce.item_list_name = listingName;
        eventDetails.ecommerce.items = this._getProductList(infoKeys, $productListItems);

        this._populatePlpImpressionsListName($productListItems, eventDetails.ecommerce.items);

        return eventDetails;
    }

    ecommercePlpClick($productItem, listingPage) {
        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-plpclick');
        const infoKeys = ['name', 'id', 'price', 'brand', 'category', 'variant', 'position'];

        eventDetails.ecommerce.currencyCode = this.options.currencyCode;
        eventDetails.ecommerce.click.actionField.list = listingPage;
        eventDetails.ecommerce.click.products = [this._getProductInfo(infoKeys, $productItem)];

        return eventDetails;
    }

    ecommercePdpImpression($productItem) {
        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-pdpimpression');
        const infoKeys = [
            'item_name',
            'item_id',
            'price',
            'item_brand',
            'item_category',
            'variant',
        ];

        eventDetails.ecommerce.items = [this._getProductInfo(infoKeys, $productItem)];
        eventDetails.ecommerce.value = eventDetails.ecommerce.items[0].price;

        return eventDetails;
    }

    ecommerceAddToCart($productItem, variantPrice = '', variantFormat = '') {
        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-addtocart');

        const infoKeys = [
            'item_name',
            'item_id',
            'item_brand',
            'item_category',
            'price',
            'position',
            'quantity',
            'item_variant',
            'cart-item-metadata' ];

        const prodInfo = this._getProductInfo(infoKeys, $productItem);

        this._addCartItemMetaData(prodInfo);
        prodInfo.value = variantPrice;
        prodInfo[this.options.infoKeyAliases.format] = variantFormat;

        eventDetails.ecommerce.items = [ prodInfo ];
        eventDetails.ecommerce.value = eventDetails.ecommerce.items[0].price;

        return eventDetails;
    }

    ecommerceRemoveFromCart($productItem) {
        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-removefromcart');

        const infoKeys = [
            'item_name',
            'item_id',
            'price',
            'PlacedPrice',
            'item_brand',
            'item_category',
            'item_variant',
            'index',
            'quantity',
            'format'];

        eventDetails.ecommerce.currency = this.options.currencyCode;
        eventDetails.ecommerce.items = [this._getProductInfo(infoKeys, $productItem)];
        eventDetails.ecommerce.value = eventDetails.ecommerce.items[0].price;

        return eventDetails;
    }

    ecommerceCheckout(productData, donations, step) {
        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-checkout');

        const productInfoKeys = {
            name: 'displayName',
            id: 'id',
            price: 'price',
            placedPrice: 'PlacedPrice',
            quantity: 'quantity',
            CartItemMetaData: 'CartItemMetaData'
        };

        eventDetails.ecommerce.checkout.actionField.step = step;
        eventDetails.ecommerce.checkout.products = [];

        if (productData) {
            for (const product of productData) {
                const productGtmInfo = this._getProductInfoFromData(productInfoKeys, product);

                this._addCartItemMetaData(productGtmInfo);

                eventDetails.ecommerce.checkout.products.push(productGtmInfo);
            }
        }

        if (donations) {
            for (const donation of donations) {

                const donationData = this._getDonationGtmData(donation);

                eventDetails.ecommerce.checkout.products.push(donationData);
            }
        }

        return eventDetails;
    }

    ecommerceCheckoutConfirmation($productList, donations, step) {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-checkout');

        const productInfoKeys = [
            'item_name',
            'item_id',
            'price',
            'PlacedPrice',
            'item_brand',
            'item_category',
            'item_variant',
            'dimension1',
            'position',
            'quantity',
            'format'];

        eventDetails.ecommerce.checkout.actionField.step = step;
        eventDetails.ecommerce.checkout.products = this._getProductList(productInfoKeys, $productList, this.options.purchasedProductInfoSelector);

        for (const donation of donations) {

            const donationData = this._getDonationGtmData(donation);

            eventDetails.ecommerce.checkout.products.push(donationData);
        }

        return eventDetails;
    }

    ecommerceTransaction($orderConfirmation, $productList, donations) {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-transaction');
        const productInfoKeys = [
            'item_name',
            'item_id',
            'price',
            'placedPrice',
            'item_brand',
            'item_category',
            'item_variant',
            'dimension1',
            'position',
            'quantity',
            'format'];

        eventDetails.ecommerce = this._getTransactionInfo($orderConfirmation);
        eventDetails.ecommerce.items = this._getProductList(productInfoKeys, $productList, this.options.purchasedProductInfoSelector);

        for (const donation of donations) {

            const donationData = this._getDonationGtmData(donation);

            eventDetails.ecommerce.purchase.products.push(donationData);
        }

        return eventDetails;
    }

    ecommercePromoImpression($promoItem) {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-promoimpression');
        const infoKeys = ['name', 'id', 'creative', 'position', 'variant'];

        eventDetails.ecommerce.promoView.promotions = [this._getPromoInfo(infoKeys, $promoItem)];

        return eventDetails;
    }

    ecommercePromoClick($promoItem) {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.eCommerce, 'ecommerce-promoclick');
        const infoKeys = ['name', 'id', 'creative', 'position', 'variant'];

        eventDetails.ecommerce.promoClick.promotions = [this._getPromoInfo(infoKeys, $promoItem)];

        return eventDetails;
    }

    customUserId() {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.customDimensions, 'custom-userid');
        let loggedInUserId = $(this.options.pageLevelDataSourceElementSelector).attr(this.options.loggedInUserIdAttr);

        if (loggedInUserId.length === 0) {
            loggedInUserId = 'null';
        }

        eventDetails['user-id'] = loggedInUserId;

        return eventDetails;
    }

    customMemberStatus() {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.customDimensions, 'custom-memberstatus');
        const loggedInUserMemberStatus = $(this.options.pageLevelDataSourceElementSelector).attr(this.options.loggedInUserMemberStatusAttr);
        const memberStatus = loggedInUserMemberStatus.length > 0 ? 'Member' : 'Non Member';

        eventDetails['member-status'] = memberStatus;

        return eventDetails;
    }

    customLoggedInStatus() {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.customDimensions, 'custom-loggedinstatus');
        const loggedInUserId = $(this.options.pageLevelDataSourceElementSelector).attr(this.options.loggedInUserIdAttr);
        const userLoggedInStatus = loggedInUserId.length > 0 ? 'Logged In' : 'Not Logged In';

        eventDetails['user-status'] = userLoggedInStatus;

        return eventDetails;
    }

    customRegisteredState() {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.customDimensions, 'custom-registeredstate');
        const loggedInUserRegisteredState = $(this.options.pageLevelDataSourceElementSelector).attr(this.options.loggedInUserRegisteredStateAttr);

        eventDetails['registered-state'] = GTMUtils.valueOrFallback(loggedInUserRegisteredState);

        return eventDetails;
    }

    customUserData() {

        const userData = this.customUserId();
        globalEmitter.emit('gtm.custom-userid', userData);

        const memberStatus = this.customMemberStatus();
        globalEmitter.emit('gtm.custom-memberstatus', memberStatus);

        const loggedInStatus = this.customLoggedInStatus();
        globalEmitter.emit('gtm.custom-loggedinstatus', loggedInStatus);

        const registeredState = this.customRegisteredState();
        globalEmitter.emit('gtm.custom-registeredstate', registeredState);
    }

    customJoinPromoView(seen) {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.customDimensions, 'custom-joinpromoview');

        eventDetails['join-promo-block'] = seen ? 'Yes' : 'No';

        return eventDetails;
    }

    contentGroups() {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.taxonomy, 'taxonomy-contentgroups');
        const keyMappings = {
            contentgroup1: 'brand',
            contentgroup2: 'theme',
            contentgroup3: 'audience',
            contentgroup4: 'userpurpose',
            contentgroup5: 'topic'
        };

        this._getTaxonomyInfo(eventDetails, keyMappings, this.$contentGroupsInfo, 'content-groups');

        return eventDetails;
    }

    personalisation() {

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.taxonomy, 'taxonomy-personalisation');
        const keyMappings = {
            checkedRoles: 'checkedroles',
            oldCart: 'oldcart',
            hasMembershipPrice: 'hasmembershipprice',
            state: 'state'
        };

        this._getTaxonomyInfo(eventDetails, keyMappings, this.$personalisationInfo, 'personalisation');

        return eventDetails;
    }

    purchaseNewMemberships($productList) {

        const membershipsInfo = this._getNumNewAndRenewalItems($productList, this.options.productCategories.membership);

        if (membershipsInfo.numItems === 0 || membershipsInfo.numRenewals === membershipsInfo.numItems) {
            return null;
        }

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.purchaseDetails, 'purchase-newmemberships');

        eventDetails.label = `Membership - ${this._truncateProductName(membershipsInfo.firstProdName)} - ${membershipsInfo.numItems - membershipsInfo.numRenewals}`;

        return eventDetails;
    }

    purchaseRenewalMemberships($productList) {

        const membershipsInfo = this._getNumNewAndRenewalItems($productList, this.options.productCategories.membership);

        if (membershipsInfo.numItems === 0 || membershipsInfo.numRenewals === 0) {
            return null;
        }

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.purchaseDetails, 'purchase-renewalmemberships');

        eventDetails.label = `Membership - ${this._truncateProductName(membershipsInfo.firstProdName)} - ${membershipsInfo.numRenewals}`;

        return eventDetails;
    }

    purchaseNewCertifications($productList) {

        const certificationsInfo = this._getNumNewAndRenewalItems($productList, this.options.productCategories.certification);

        if (certificationsInfo.numItems === 0 || certificationsInfo.numRenewals === certificationsInfo.numItems) {
            return null;
        }

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.purchaseDetails, 'purchase-newcertifications');

        eventDetails.label = `Certification - ${this._truncateProductName(certificationsInfo.firstProdName)} - ${certificationsInfo.numItems - certificationsInfo.numRenewals}`;

        return eventDetails;
    }

    purchaseRenewalCertifications($productList) {

        const certificationsInfo = this._getNumNewAndRenewalItems($productList, this.options.productCategories.certification);

        if (certificationsInfo.numItems === 0 || certificationsInfo.numRenewals === 0) {
            return null;
        }

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.purchaseDetails, 'purchase-renewalcertifications');

        eventDetails.label = `Certification - ${this._truncateProductName(certificationsInfo.firstProdName)} - ${certificationsInfo.numRenewals}`;

        return eventDetails;
    }

    basketCompletionBooks($productList) {

        const booksInfo = this._getNumInCategory($productList, this.options.productCategories.book);

        if (booksInfo.numItems === 0) {
            return null;
        }

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.purchaseDetails, 'purchase-basketcompletionbooks');

        eventDetails.label = `Book - ${this._truncateProductName(booksInfo.firstProdName)} - ${booksInfo.numItems}`;

        return eventDetails;
    }

    basketCompletionContinuingEducation($productList, productType) {

        const ceItemsInfo = this._getNumInCategory($productList, this.options.productCategories[productType]);

        if (ceItemsInfo.numItems === 0) {
            return null;
        }

        const eventDetails = this._getEventDetailsFromEventName(gtmConfig.purchaseDetails, 'purchase-basketcompletionce');

        eventDetails.label = `${productType} - ${this._truncateProductName(ceItemsInfo.firstProdName)} - ${ceItemsInfo.numItems}`;

        return eventDetails;
    }
}

export default () => { return new GTMHelper(); };
