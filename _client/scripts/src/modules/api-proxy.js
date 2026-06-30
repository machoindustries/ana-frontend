import $ from 'jquery';
import Utils from 'modules/utils';

const APIProxyOptions = {
    apis: {
        getAddresses: {
            name: 'getAddresses',
            method: 'GET',
            url: `${window.location.origin}/address/GetAddressBook/`,
            callbackQueue: [], // queue of callback wrappers (each of which can contain success and error callbacks) to execute on response
            cache: { // uncacheable requests are specified by omitting this property
                data: null, // no 'valid' flag - instead this will be nulled whenever cached data is invalidated
                invalidatedBy: [ // list of other API calls that invalidate this API's cache
                    'addUpdateAddress',
                    'removeAddress'
                ]
            }
        },
        addUpdateAddress: {
            name: 'addUpdateAddress',
            method: 'POST',
            url: `${window.location.origin}/address/AddUpdateAddress/`,
            callbackQueue: []
        },
        removeAddress: {
            name: 'removeAddress',
            method: 'POST',
            url: `${window.location.origin}/address/DeleteAddress/`,
            callbackQueue: []
        },
        updateCartItemQuantity: {
            name: 'updateCartItemQuantity',
            method: 'GET',
            url: `${Utils.getCurrentHref()}UpdateItem/`,
            callbackQueue: []
        },
        addToCart: {
            name: 'addToCart',
            method: 'GET',
            url: `${window.location.origin}/Cart/AddToCart`,
            callbackQueue: []
        },
        joinNowOneClickMembership: {
            name: 'addToCart',
            method: 'GET',
            url: `${window.location.origin}/Cart/JoinNowOneClickMembership`,
            callbackQueue: [],
        },
        checkOneClickMembershipEligibility: {
            name: 'CheckOneClickMembershipEligibility',
            method: 'POST',
            url: `${window.location.origin}/Cart/CheckOneClickMembershipEligibility`,
            callbackQueue: [],
        },
        getCart: {
            name: 'getCart',
            method: 'GET',
            url: `${window.location.origin}/userdata/GetCart/`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addToCart',
                    'updateCartItemQuantity',
                    'removeCartItem',
                    'addDonation',
                    'removeDonation',
                    'addDiscountCode',
                    'removeDiscountCode',
                    'updateShippingMethod',
                    'applyShippingAddress',
                    'deleteDonation',
                    'addToCartFromEnrollment'
                ]
            }
        },
        getCartSummary: {
            name: 'getCartSummary',
            method: 'GET',
            url: `${window.location.origin}/userdata/getcartsummary`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addToCart',
                    'updateCartItemQuantity',
                    'removeCartItem',
                    'addDonation',
                    'removeDonation',
                    'addDiscountCode',
                    'removeDiscountCode',
                    'updateShippingMethod',
                    'applyShippingAddress',
                    'deleteDonation',
                    'addToCartFromEnrollment'
                ]
            }
        },
        getShippingMethods: {
            name: 'getShippingMethods',
            method: 'GET',
            url: `${window.location.origin}/userdata/getshippingmethods/`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'updateShippingMethod',
                    'applyShippingAddress'
                ]
            }
        },
        updateShippingMethod: {
            name: 'updateShippingMethod',
            method: 'GET',
            url: `${Utils.getCurrentHref()}updateshippingmethod/`,
            callbackQueue: []
        },
        applyShippingAddress: {
            name: 'applyShippingAddress',
            method: 'GET',
            url: `${window.location.origin}/checkout/updateshippingaddress/`,
            callbackQueue: []
        },
        removeCartItem: {
            name: 'removeCartItem',
            method: 'GET',
            url: `${Utils.getCurrentHref()}RemoveItem/`,
            callbackQueue: []
        },
        addUpdateAcademicCredit: {
            name: 'addUpdateAcademicCredit',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerAcademicCredit/`,
            callbackQueue: []
        },
        addUpdatePersonalDetails: {
            name: 'addUpdatePersonalDetails',
            method: 'POST',
            url: `${window.location.origin}/userdata/addupdatecuscommunication/`,
            callbackQueue: []
        },
        addUpdateCertification: {
            name: 'addUpdateCertification',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/addupdatecertification/`,
            callbackQueue: []
        },
        addUpdateContinuingEducation: {
            name: 'addUpdateContinuingEducation',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerContinuingEducation/`,
            callbackQueue: []
        },
        addUpdateLicense: {
            name: 'addUpdateLicense',
            method: 'POST',
            url: `${window.location.origin}/userdata/addupdatelicense/`,
            callbackQueue: []
        },
        addUpdateMembership: {
            name: 'addUpdateMembership',
            method: 'POST',
            url: `${window.location.origin}/userdata/addupdatemembership/`,
            callbackQueue: []
        },
        cancelMembership: {
            name: 'cancelMembership',
            method: 'POST',
            url: `${window.location.origin}/userdata/cancelmembership/`,
            callbackQueue: []
        },
        addUpdatePreceptorship: {
            name: 'addUpdatePreceptorship',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerPreceptorship/`,
            callbackQueue: []
        },
        addUpdatePresentation: {
            name: 'addUpdatePresentation',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerPresentation/`,
            callbackQueue: []
        },
        addUpdateProfessionalService: {
            name: 'addUpdateProfessionalService',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerProfessionalService/`,
            callbackQueue: []
        },
        addUpdatePublication: {
            name: 'addUpdatePublication',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerPublication/`,
            callbackQueue: []
        },
        addDonation: {
            name: 'addDonation',
            method: 'GET',
            url: `${window.location.origin}/userdata/AddDonation/`,
            callbackQueue: []
        },
        removeDonation: {
            name: 'removeDonation',
            method: 'GET',
            url: `${window.location.origin}/userdata/RemoveDonation/`,
            callbackQueue: []
        },
        addDiscountCode: {
            name: 'addDiscountCode',
            method: 'GET',
            url: `${window.location.origin}/userdata/AddDiscount/`,
            callbackQueue: []
        },
        removeDiscountCode: {
            name: 'removeDiscountCode',
            method: 'GET',
            url: `${window.location.origin}/userdata/RemoveDiscount/`,
            callbackQueue: []
        },
        removePaymentMethod: {
            name: 'removePaymentMethod',
            method: 'GET',
            url: `${window.location.origin}/userdata/deletecardtoken/`,
            callbackQueue: []
        },
        getAcademicCredits: {
            name: 'getAcademicCredits',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalCreds`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdateAcademicCredit',
                    'deletePersonalDevelopment'
                ]
            }
        },
        getContinuingEducation: {
            name: 'getContinuingEducation',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalEducation`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdateContinuingEducation',
                    'deletePersonalDevelopment'
                ]
            }
        },
        getLicenses: {
            name: 'getLicenses',
            method: 'GET',
            url: `${window.location.origin}/userdata/getlicenses`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdateLicense'
                ]
            }
        },
        getMemberships: {
            name: 'getMemberships',
            method: 'GET',
            url: `${window.location.origin}/userdata/getmemberships`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdateMembership',
					'deleteMembership'
                ]
            }
        },
        getPaymentDetails: {
            name: 'getPaymentDetails',
            method: 'GET',
            url: `${window.location.origin}/userdata/getcardtokens/`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'removePaymentMethod',
                    'purchase'
                ]
            }
        },
        getPersonalDetails: {
            name: 'getPersonalDetails',
            method: 'GET',
            url: `${window.location.origin}/userdata/getcuscommunications`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdatePersonalDetails'
                ]
            }
        },
        getPreceptorships: {
            name: 'getPreceptorships',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalPreceptorship`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdatePreceptorship'
                ]
            }
        },
        getPresentations: {
            name: 'getPresentations',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalPresentation`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdatePresentation',
                    'deletePersonalDevelopment'
                ]
            }
        },
        getProfessionalServices: {
            name: 'getProfessionalServices',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalService`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdateProfessionalService',
                    'deletePersonalDevelopment'
                ]
            }
        },
        getPublications: {
            name: 'getPublications',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalPublications`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdatePublication',
                    'deletePersonalDevelopment'
                ]
            }
        },
        deletePersonalDevelopment: {
            name: 'deletePersonalDevelopment',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/DeleteProfessionalDevelopment`,
            callbackQueue: []
        },
		
		deleteMembership: {
            name: 'deleteMembership',
            method: 'POST',
            url: `${window.location.origin}/UserData/RemoveMembership`,
            callbackQueue: []
        },
        deleteDonation: {
            name: 'deleteDonation',
            method: 'GET',
            url: `${window.location.origin}/UserData/RemoveDonation`,
            callbackQueue: []
        },
		
		
        purchase: {
            name: 'purchase',
            method: 'POST',
            url: `${Utils.getCurrentHref()}Purchase/`,
            callbackQueue: []
        },
        getMapData: {
            name: 'getMapData',
            method: 'POST',
            url: `${window.location.origin}/api/maporganization/getmapdata`,
            callbackQueue: []
        },
        getContactHoursData: {
            name: 'getContactHoursData',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetContactHoursData`,
            callbackQueue: []
        },
        updatePharmaHours: {
            name: 'updatePharmaHours',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/AddUpdateCustomerContinuingEducationAwards/`,
            callbackQueue: []
        },
        updateCourseContactHours: {
            name: 'updateCourseContactHours',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/UpdateCourseContactHours/`,
            callbackQueue: []
        },
        updateCourseStatus: {
            name: 'updateCourseStatus',
            method: 'POST',
            url: `${window.location.origin}/PersonalDevelopment/UpdateCourseStatus/`,
            callbackQueue: []
        },
        getContinuingEducationAwards: {
            name: 'getContinuingEducationAwards',
            method: 'GET',
            url: `${window.location.origin}/PersonalDevelopment/GetCustomerProfessionalEducationAwards`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'addUpdateContinuingEducation',
                    'deletePersonalDevelopment',
                    'getContinuingEducationAwards'
                ]
            }
        },
        GetEnrollmentByProductCode: {
            name: 'GetEnrollmentByProductCode',
            method: 'GET',
            url: `${window.location.origin}/userdata/GetEnrollmentByProductCode`,
            callbackQueue: [],
            cache: {
                data: null,
                invalidatedBy: [
                    'AddUpdateBulkPurchaseDetails',
                    'OverwriteEnrollmentFromExcelAsync',
                    'uploadRefresh',
                    'deleteEnrollment',
                    'removeCartItem',
                    'addToCart',
                    'updateQuantity',
                    'addToCartFromEnrollment',
                    'DeleteUnRegisteredEnrollmentsAsync'
                ]
            }
        },
        AddUpdateBulkPurchaseDetails: {
            name: 'AddUpdateBulkPurchaseDetails',
            method: 'POST',
            url: `${window.location.origin}/userdata/AddUpdateBulkPurchaseDetails/`,
            callbackQueue: []
        },
        deleteEnrollment: {
            name: 'deleteEnrollment',
            method: 'POST',
            url: `${window.location.origin}/UserData/DeleteEnrollmentRequest`,
            callbackQueue: []
        },
        removeItemFromCart: {
            name: 'removeItemFromCart',
            method: 'GET',
            url: `${window.location.origin}/Cart/RemoveBulkPurchaseItem/`,
            callbackQueue: []
        },
        addToCartFromEnrollment: {
            name: 'addToCartFromEnrollment',
            method: 'GET',
            url: `${window.location.origin}/Cart/AddToCartFromEnrollment/`,
            callbackQueue: []
        },
        uploadRefresh: {
            name: 'uploadRefresh',
            method: 'POST',
            url: `${window.location.origin}/userdata/UploadRefresh/`,
            callbackQueue: []
        },
        downloadSample: {
            name: 'downloadSample',
            method: 'POST',
            url: `${window.location.origin}/userdata/DownloadSampleFile/`,
            callbackQueue: []
        },
        exportUnRegisteredEnrollmentsToCSV: {
            name: 'exportUnRegisteredEnrollmentsToCSV',
            method: 'GET',
            url: `${window.location.origin}/userdata/ExportUnRegisteredEnrollmentsToCSV/`,
            callbackQueue: []
        },
        DeleteUnRegisteredEnrollmentsAsync: {
            name: 'DeleteUnRegisteredEnrollmentsAsync',
            method: 'POST',
            url: `${window.location.origin}/userdata/DeleteUnRegisteredEnrollmentsAsync/`,
            callbackQueue: []
        },
        OverwriteEnrollmentFromExcelAsync: {
            name: 'OverwriteEnrollmentFromExcelAsync',
            method: 'POST',
            url: `${window.location.origin}/userdata/OverwriteEnrollmentFromExcelAsync/`,
            callbackQueue: []
        },
        getQuantityMismatchProducts: {
            name: 'getQuantityMismatchProducts',
            method: 'POST',
            url: `${window.location.origin}/Cart/GetQuantityMismatchProductsOnItemRemoval/`,
            callbackQueue: []
        },
        CheckOrderEnrollmentsLimitExceeded: {
            name: 'CheckOrderEnrollmentsLimitExceeded',
            method: 'POST',
            url: `${window.location.origin}/Cart/CheckOrderEnrollmentsLimitExceeded/`,
            callbackQueue: []
        },
        getEmptyAddressIdEnrollments: {
            name: 'getEmptyAddressIdEnrollments',
            method: 'POST',
            url: `${window.location.origin}/Cart/GetEmptyAddressIdEnrollmentsOnItemRemoval/`,
            callbackQueue: []
        },
        verifyEnrollmentEmail: {
            name: 'VerifyEnrollmentEmail',
            method: 'POST',
            url: `${window.location.origin}/userdata/VerifyEnrollmentEmailAsync`,
            callbackQueue: []
        },
        updateQuantity: {
            name: 'updateQuantity',
            method: 'POST',
            url: `${window.location.origin}/UserData/UpdateQuantity`,
            callbackQueue: []
        }, checkPurchaseType: {
            name: 'checkPurchaseType',
            method: 'POST',
            url: `${window.location.origin}/Cart/checkPurchaseType/`,
            callbackQueue: []
        },
        CartBulkSingleStatus: {
            name: 'CartBulkSingleStatus',
            method: 'GET',
            url: `${window.location.origin}/Cart/CartBulkSingleStatus`,
            callbackQueue: []
        },
        setProductCode: {
            name: 'SetProductCode',
            method: 'GET',
            url: `${window.location.origin}/Cart/SetProductCode`,
            callbackQueue: [],
            cache: { // uncacheable requests are specified by omitting this property
                data: null, // no 'valid' flag - instead this will be nulled whenever cached data is invalidated
                invalidatedBy: [ // list of other API calls that invalidate this API's cache
                    'SetProductCode'
                ]
            }
        }
    }
};

class APIProxy {

    static _apiGet (apiConf, queryString, queryData) {

        // make request supplying callbacks - to get fresh data
        const requestObj = {
            method: apiConf.method,
            url: apiConf.url + queryString,
            success: (data) => {

                // cache the resulting data if cacheable
                if (Object.hasOwn(apiConf, 'cache')) {
                    apiConf.cache.data = data;
                }

                // if any other caches are invalidated by this action, invalidate them
                const apiObjKeys = Object.keys(APIProxyOptions.apis);
                
                for (let k = 0; k < apiObjKeys.length; k++) {

                    const key = apiObjKeys[k];
                    const apiEntry = APIProxyOptions.apis[key];

                    if (Object.hasOwn(apiEntry, 'cache')) {

                        if (apiEntry.cache.data !== null && apiEntry.cache.invalidatedBy.indexOf(apiConf.name) !== -1) {

                            console.log(`API Proxy : invalidating cached data for ${apiEntry.name}`);

                            apiEntry.cache.data = null;
                        }
                    }
                }

                this._processSuccessCallbacks(apiConf.callbackQueue, data);
            },
            error: (jqxhr, status, err) => {

                this._processErrorCallbacks(apiConf.callbackQueue, jqxhr, status, err);
            }
        };

        if (queryData !== null) {

            requestObj.data = queryData;
        }

        $.ajax(requestObj);
    }

    static _processSuccessCallbacks (callbackQueue, data) {

        while (callbackQueue.length > 0) {

            const queueItem = callbackQueue.pop();

            queueItem.success(data);
        }
    }

    static _processErrorCallbacks (callbackQueue, jqxhr, status, err) {

        while (callbackQueue.length > 0) {

            const queueItem = callbackQueue.pop();

            queueItem.error(jqxhr, status, err);
        }
    }

    // Request data from the API. This may be cached or uncached data depending on the api being called.
    static _getNewOrCachedData (
                apiConf,
                {
                    success = () => {},
                    error = () => {},
                    queryString = '',
                    queryData = null
                }
    ) {

        // add the callback to the list of callbacks to be called when the request completes
        const priorCallbackQueueLen = apiConf.callbackQueue.length;

        apiConf.callbackQueue.push({
            success,
            error
        });

        // if cacheable
        if (Object.hasOwn(apiConf, 'cache')) {

            const cache = apiConf.cache;

            // if there is already a valid cached version
            if (cache.data !== null) {

                // return cached version to success callback
                console.log(`API Proxy : returning *CACHED* data for ${apiConf.name}`);

                this._processSuccessCallbacks(apiConf.callbackQueue, cache.data);
            }
            // else if there is no pending request for the same data, make a new request
            else if (priorCallbackQueueLen === 0) {

                console.log(`API Proxy : requesting *NEW* data for ${apiConf.name}`);

                this._apiGet(apiConf, queryString, queryData);
            }
            else {

                console.log(`API Proxy : *QUEUED* request for ${apiConf.name}`);
            }
        }
        else {

            console.log(`API Proxy : requesting *UNCACHEABLE* data for ${apiConf.name}`);

            this._apiGet(apiConf, queryString, queryData);
        }
    }

    // New generic interface method
    static request (opts) {

        if (!Object.hasOwn(APIProxyOptions.apis, opts.api)) {
            console.error(`APIProxy.request() Error: config for api "${opts.api}" not found.`);
        }

        this._getNewOrCachedData(APIProxyOptions.apis[opts.api], opts);
    }
}

export default APIProxy;