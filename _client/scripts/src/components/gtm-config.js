const checkout = [{
    eventName: 'checkout-donation',
    eventDetails: {
        eventClass: 'donation',
        category: 'Checkout',
        action: 'Donation Added',
        label: '$dynamic$',
    },
}, {
    eventName: 'checkout-discountcodeaccepted',
    eventDetails: {
        eventClass: 'discount-code',
        category: 'Checkout',
        action: 'Promo Code',
        label: 'Accepted',
    },
}, {
    eventName: 'checkout-discountcoderejected',
    eventDetails: {
        eventClass: 'discount-code',
        category: 'Checkout',
        action: 'Promo Code',
        label: 'Rejected',
    },
}];

// Page independent events
const site = [{
    eventName: 'site-meganav',
    eventDetails: {
        eventClass: 'mega-nav',
        category: 'Mega Navigation',
        action: '$dynamic$',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-mainnav',
    eventDetails: {
        eventClass: 'main-nav',
        category: 'Main Navigation',
        action: '$dynamic$',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-bannerlink',
    eventDetails: {
        eventClass: 'banner-link',
        category: 'Banner Link',
        action: '$dynamic$',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-mailtolink',
    eventDetails: {
        eventClass: 'mailto',
        category: '$dynamic$',
        action: 'Mailto',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-offsitelink',
    eventDetails: {
        eventClass: 'offsite-link',
        category: 'Offsite Link',
        action: '$dynamic$',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-accordionclick',
    eventDetails: {
        eventClass: 'accordion-interaction',
        category: 'Accordion Interaction',
        action: '$dynamic$',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-featuredcontentclick',
    eventDetails: {
        eventClass: 'featured-content-click',
        category: 'Featured Content',
        action: 'Click',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-accountmembershipadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Membership',
        label: 'Add Membership',
    },
}, {
    eventName: 'site-accountmembershipupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Membership',
        label: 'Update Membership',
    },
}, {
    eventName: 'site-cancelmembershipaction',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Membership',
        label: 'Cancel Membership',
    },
}, {
    eventName: 'site-accountlicenseadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'License',
        label: 'Add License',
    },
}, {
    eventName: 'site-accountlicenseupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'License',
        label: 'Update License',
    },
}, {
    eventName: 'site-accountaddressadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Address',
        label: 'Add Address',
    },
}, {
    eventName: 'site-accountaddressupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Address',
        label: 'Update Address',
    },
}, {
    eventName: 'site-accountpdceadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Continuing Education',
    },
}, {
    eventName: 'site-accountpdceupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Continuing Education',
    },
}, {
    eventName: 'site-accountpdacadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Academic Credit',
    },
}, {
    eventName: 'site-accountpdacupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Academic Credit',
    },
}, {
    eventName: 'site-accountpdpresadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Presentation',
    },
}, {
    eventName: 'site-accountpdpresupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Presentation',
    },
}, {
    eventName: 'site-accountpdpubadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Publication',
    },
}, {
    eventName: 'site-accountpdpubupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Publication',
    },
}, {
    eventName: 'site-accountpdprecadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Preceptorship',
    },
}, {
    eventName: 'site-accountpdprecupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Preceptorship',
    },
}, {
    eventName: 'site-accountpdserviceadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Professional Service',
    },
}, {
    eventName: 'site-accountpdserviceupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Professional Service',
    },
}, {
    eventName: 'site-accountcertificationadd',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Add New Certification',
    },
}, {
    eventName: 'site-accountcertificationupdate',
    eventDetails: {
        eventClass: 'update-details',
        category: 'My Account',
        action: 'Professional Development',
        label: 'Update Certification',
    },
}, {
    eventName: 'site-ctaclick',
    eventDetails: {
        eventClass: 'cta-interaction',
        category: 'CTA Interaction',
        action: 'Inpage CTA',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-headerctaclick',
    eventDetails: {
        eventClass: 'cta-interaction',
        category: 'CTA Interaction',
        action: 'Header CTA',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-filterresultsperpage',
    eventDetails: {
        eventClass: 'search',
        category: 'Search',
        action: 'Results per page',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-filtersortby',
    eventDetails: {
        eventClass: 'search',
        category: 'Search',
        action: 'Sort by',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-filtersearch',
    eventDetails: {
        eventClass: 'search',
        category: 'Search',
        action: 'Search Initiated',
        label: '$dynamic$',
    },
}, {
    eventName: 'site-epiformsubmit',
    eventDetails: {
        eventClass: 'form-submission',
        category: '$dynamic$',
        action: '$dynamic$',
        label: 'Form Submitted',
    },
}];

const social = [{
    eventName: 'social-share',
    eventDetails: {
        event: 'gaSocial',
        gaSocialNetwork: '$dynamic$',
        gaSocialAction: 'Share',
        gaSocialTarget: '$dynamic$',
    },
}];

const eCommerce = [{
    eventName: 'ecommerce-plpimpression',
    eventDetails: {
        event: 'view_item_list',
        ecommerce: {
            item_list_id: 'id',
            item_list_name: 'list name',
            items: []
        },
    },
}, {
    eventName: 'ecommerce-plpclick',
    eventDetails: {
        event: 'productClick',
        ecommerce: {
            currencyCode: 'USD',
            click: {
                actionField: {
                    list: '',
                    action: 'click',
                },
                products: [],
            },
        },
    },
}, {
    eventName: 'ecommerce-pdpimpression',
    eventDetails: {
        event: 'view_item',
        ecommerce: {
            currency: 'USD',
            value: 0.01,
            items: [],
        },
    },
}, {
    eventName: 'ecommerce-addtocart',
    eventDetails: {
        event: 'add_to_cart',
        ecommerce: {
            currency: 'USD',
            value: 0.01,
            items: [],
        },
    },
}, {
    eventName: 'ecommerce-removefromcart',
    eventDetails: {
        event: 'remove_from_cart',
        ecommerce: {
            currency: 'USD',
            value: 0.01,
            items: [],
        },
    },
}, {
    eventName: 'ecommerce-checkout',
    eventDetails: {
        event: 'checkout',
        ecommerce: {
            checkout: {
                actionField: {
                    step: '',
                },
                products: [],
            },
        },
    },
}, {
    eventName: 'ecommerce-transaction',
    eventDetails: {
        event: 'purchase',
        ecommerce: {
            currency: 'USD',
            transaction_id: '1',
            value: 0.01,
            shipping: 1,
            tax: 1,
            items: [],
        },
    },
}, {
    eventName: 'ecommerce-promoimpression',
    eventDetails: {
        event: 'promoImpression',
        ecommerce: {
            promoView: {
                promotions: [],
            },
        },
    },
}, {
    eventName: 'ecommerce-promoclick',
    eventDetails: {
        event: 'promoClick',
        ecommerce: {
            promoClick: {
                promotions: [],
            },
        },
    },
}];

const customDimensions = [
    {
        eventName: 'custom-userid',
        eventDetails: {
            'event': 'user-id',
            'user-id': '$dynamic$',
        },
    }, {
        eventName: 'custom-memberstatus',
        eventDetails: {
            'event': 'member-status',
            'member-status': '$dynamic$',
        },
    }, {
        eventName: 'custom-loggedinstatus',
        eventDetails: {
            'event': 'user-status',
            'user-status': '$dynamic$',
        },
    }, {
        eventName: 'custom-registeredstatus',
        eventDetails: {
            'event': 'registered-status',
            'registered-status': '$dynamic$',
        },
    }, {
        eventName: 'custom-registeredstate',
        eventDetails: {
            'event': 'registered-state',
            'registered-state': '$dynamic$',
        },
    }, {
        eventName: 'custom-joinpromoview',
        eventDetails: {
            'event': 'join-promo-block',
            'join-promo-block': '$dynamic$',
        },
    },
];

const taxonomy = [
    {
        eventName: 'taxonomy-contentgroups',
        eventDetails: {
            contentgroup1: '$dynamic$',
            contentgroup2: '$dynamic$',
            contentgroup3: '$dynamic$',
            contentgroup4: '$dynamic$',
            contentgroup5: '$dynamic$',
        },
    }, {
        eventName: 'taxonomy-personalisation',
        eventDetails: {
            checkedRoles: '$dynamic$',
            oldCart: '$dynamic$',
            hasMembershipPrice: '$dynamic$',
            state: '$dynamic$',
        },
    },
];

const purchaseDetails = [
    {
        eventName: 'purchase-newmemberships',
        eventDetails: {
            event: 'member-type',
            category: 'Member Type',
            action: 'New',
            label: '$dynamic$',
        },
    }, {
        eventName: 'purchase-renewalmemberships',
        eventDetails: {
            event: 'member-type',
            category: 'Member Type',
            action: 'Renewal',
            label: '$dynamic$',
        },
    }, {
        eventName: 'purchase-newcertifications',
        eventDetails: {
            event: 'nurse-certification',
            category: 'Nurse Certification',
            action: 'New',
            label: '$dynamic$',
        },
    }, {
        eventName: 'purchase-renewalcertifications',
        eventDetails: {
            event: 'nurse-certification',
            category: 'Nurse Certification',
            action: 'Renewal',
            label: '$dynamic$',
        },
    }, {
        eventName: 'purchase-basketcompletionbooks',
        eventDetails: {
            event: 'basket-completions',
            category: 'Basket Completions',
            action: 'Books',
            label: '$dynamic$',
        },
    }, {
        eventName: 'purchase-basketcompletionce',
        eventDetails: {
            event: 'basket-completions',
            category: 'Basket Completions',
            action: 'Continuing Education',
            label: '$dynamic$',
        },
    },
];

export { site, checkout, eCommerce, social, customDimensions, taxonomy, purchaseDetails };
