import BaseComponent from 'components/base-component';
import $ from 'jquery';
import ResponsiveTableComponent from 'components/responsive-table-component';
import ResponsiveBackgroundImageComponent from 'components/responsive-background-image-component';
import globalEmitter from 'modules/global-emitter';
import jitRequire from 'modules/jit-require';
import ObjectFitPolyfill from 'components/object-fit-polyfill';
import GoogleTagManagerComponent from '../components/google-tag-manager-component';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import GTMUtils from 'modules/gtm-utils';
import GTMHelper from 'modules/gtm-helper';

class PageView extends BaseComponent {
    constructor() {
        super();

        this.state = {};

        this.defaultOptions = {
            navOpenClass: 'nav-open',
            noScrollClass: 'no--scroll',
            selectors: {
                foundationPopupSrc: '[data-foundation-popup]',
                modalParent: '.mfp-content',
                contentAnchor: 'a',
                trackedCta: '[data-tracked-cta]',
                joinPromo: '[data-join-promo]',
                videoLink: '[data-video-link]',
                accordionContent: '[data-accordion-content]',
                accordionItem: '.e-accordion__item',
            },
            foundationUrlFragment: '/foundation/',
            foundationPopupDestinationUrlAttr: 'data-destination-url',
            foundationPopupJsViewAttr: 'data-js-view',
            mailToHrefFragment: 'mailto:',
            internalLinksHrefFragment: document.location.hostname,
            addThisCheckInterval: 250,
            scrollToAnchorsDelay: 250,
            scrollToAccordionDelay: 250,
        };
    }

    initChildren() {
        this.$html = $('html');
        this.$window = $(window);

        this.responsiveTableComponent = new ResponsiveTableComponent();
        this.responsiveTableComponent.init(this.$el);
        this.responsiveBackgroundImageComponent = new ResponsiveBackgroundImageComponent();
        this.responsiveBackgroundImageComponent.init(this.$el);

        this.objectFitPolyfill = new ObjectFitPolyfill();
        this.objectFitPolyfill.init(this.$el);
        this.objectFitPolyfill.execute();

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);

        this.googleTagManager = new GoogleTagManagerComponent();
        this.googleTagManager.init(this.$el);

        this.isFoundationPage = window.location.pathname.indexOf(this.options.foundationUrlFragment) !== -1;
        this.foundationPopupSrcHtml = this.$el.find(this.options.selectors.foundationPopupSrc);

        this.$joinPromo = this.$el.find(this.options.selectors.joinPromo);
    }

    addListeners() {
        globalEmitter.on('primarynavview:toggled', this._setNavStateClass.bind(this));

        this.$window.on('scroll, touchmove', (evt) => {
            if (this.$el.hasClass(this.options.noScrollClass)) {
                evt.preventDefault();
            }
        });

        if (this.isFoundationPage) {
            this._bindFoundationPopupListeners();
        }

        this._bindGTM();
        this._sendPageLoadGTM();

        setTimeout(() => {
            this._scrollToAccordionAnchors();
        }, this.options.scrollToAnchorsDelay);
    }

    _bindFoundationPopupListeners() {
        const self = this;

        this.$el.find('a').each((idx, elem) => {
            const $elem = $(elem);
            const href = $elem.attr('href');
            let isCartLink = href.toLowerCase() === '/cart/';
            let isMyAccountLink = href.toLowerCase() === '/my-account/';

            // Skip special link types
            if ($elem.is(this.options.selectors.videoLink) ||
                typeof href !== 'undefined' && href.indexOf('mailto:') === 0 ||
                typeof href !== 'undefined' && href.indexOf('tel:') === 0
            ) {
                return;
            }


            if (typeof href !== 'undefined' &&
                href.length > 0 &&
                href !== '#' &&
                (
                    
                        (href.toLowerCase().indexOf('nursingworld.org') > -1 ||
                            href.toLowerCase().indexOf('giftplanning') > -1 ||
                            href.toLowerCase().indexOf('//localhost') > -1) &&
                        href.indexOf('://') > -1 && href.toLowerCase().replace(/%2f/g, '/').indexOf(this.options.foundationUrlFragment.toLowerCase()) === -1 && href.toLowerCase().indexOf('//ebiz.') === -1 && href.toLowerCase().indexOf('//anaconv1.') === -1 && href.toLowerCase().indexOf('/globalassets/') === -1 && !isCartLink && !isMyAccountLink && href.toLowerCase().indexOf('filter=foundation') === -1 ||

                    
                        href.indexOf('://') === -1 && href.toLowerCase().replace(/%2f/g, '/').indexOf(this.options.foundationUrlFragment.toLowerCase()) === -1 && href.toLowerCase().indexOf('//ebiz.') === -1 && href.toLowerCase().indexOf('//anaconv1.') === -1 && href.toLowerCase().indexOf('/globalassets/') === -1 && !isCartLink && !isMyAccountLink && href.toLowerCase().indexOf('filter=foundation') === -1
                    

                )

            ) {
                $elem.on('click', (e) => {
                    if (document.getElementById('foundationExcludes')
                        .value.split('|').find((x) => {
                            return e.currentTarget.href.toLowerCase().indexOf(x.toLowerCase()) !== -1;
                        })) {
                        return;
                    }

                    e.preventDefault();

                    $.magnificPopup.instance.close();

                    $elem.magnificPopup({
                        items: {
                            src: this.foundationPopupSrcHtml,
                            type: 'inline',
                        },
                        mainClass: this.options.modalAdditionalClass,
                        callbacks: {
                            open() {
                                if (this.content === null) {
                                    return;
                                }

                                setTimeout(() => {
                                    self._onFoundationPopupOpened($(this.content[0]), href);
                                }, 0);
                            },
                        },
                    }).magnificPopup('open');
                });
            }
        });
    }

    _bindGTM() {
        this.$el.find(this.options.selectors.contentAnchor).each((idx, elem) => {
            const $elem = $(elem);
            const href = $elem.attr('href');

            if (typeof href !== 'string' || href.length === 0) {
                return;
            }

            // Mailto links only
            if (href.indexOf(this.options.mailToHrefFragment) !== -1) {
                $elem.on('click', (e) => {
                    const $target = $(e.currentTarget);

                    this.gtmHelper.customUserData();

                    const category = GTMUtils.valueOrFallback($target.text());
                    const label = GTMUtils.valueOrFallback($target.attr('href'));

                    globalEmitter.emit('gtm.site-mailtolink', { category, label });
                });
            }

            // Offsite links only
            if (href.indexOf('http') !== -1 && href.indexOf(this.options.internalLinksHrefFragment) === -1) {
                $elem.on('click', (e) => {
                    const $target = $(e.currentTarget);

                    this.gtmHelper.customUserData();

                    const action = GTMUtils.valueOrFallback($target.text());
                    const label = GTMUtils.valueOrFallback($target.attr('href'));

                    globalEmitter.emit('gtm.site-offsitelink', { action, label });
                });
            }
        });

        this.$el.find(this.options.selectors.trackedCta).each((idx, elem) => {
            const $elem = $(elem);

            $elem.on('click', (e) => {
                const $target = $(e.currentTarget);

                this.gtmHelper.customUserData();

                const label = GTMUtils.valueOrFallback($target.is('input') ? $target.val() : $target.text().trim());

                globalEmitter.emit('gtm.site-ctaclick', { label });
            });
        });

        this._bindAddThisGTM();
    }

    _bindAddThisGTM() {
        this.addThisCheckInterval = setInterval(() => {
            if (typeof window.addthis !== 'undefined') {
                window.addthis.addEventListener('addthis.menu.share', this._onAddThisShare.bind(this));

                clearInterval(this.addThisCheckInterval);
            }
        }, this.options.addThisCheckInterval);
    }

    _sendPageLoadGTM() {
        this.gtmHelper.customUserData();

        const contentGroups = this.gtmHelper.contentGroups();
        globalEmitter.emit('gtm.taxonomy-contentgroups', contentGroups);

        const personalisation = this.gtmHelper.personalisation();
        globalEmitter.emit('gtm.taxonomy-personalisation', personalisation);

        if (this.$joinPromo.length === 0) {
            const data = this.gtmHelper.customJoinPromoView(false);

            globalEmitter.emit('gtm.custom-joinpromoview', data);
        }
    }

    _onAddThisShare(e) {
        this.gtmHelper.customUserData();

        const gaSocialNetwork = GTMUtils.valueOrFallback(e.data.service);
        const gaSocialTarget = GTMUtils.valueOrFallback(e.data.url);
        const gaSocialAction = 'Share';

        globalEmitter.emit('gtm.social-share', { gaSocialNetwork, gaSocialAction, gaSocialTarget });
    }

    _onFoundationPopupOpened($modalContent, destUrl) {
        $modalContent.attr(this.options.foundationPopupDestinationUrlAttr, destUrl);

        const jsViewPath = $modalContent.attr(this.options.foundationPopupJsViewAttr);
        $modalContent.attr('data-require', jsViewPath);

        lightboxUtils.bindOpenModalButtons();

        setTimeout(() => {
            jitRequire($modalContent.closest(this.options.selectors.modalParent)[0]);
        }, 0);
    }

    _setNavStateClass(context) {
        console.log('_setNavStateClass');

        this.$el.toggleClass(this.options.navOpenClass, context.state.open);
        this.$html.toggleClass(this.options.navOpenClass, context.state.open);
    }

    _refreshResponsiveBackgroundImages() {
        this.responsiveBackgroundImageComponent.refresh();
    }

    _requireDynamicContentModules(container) {
        jitRequire(container); // NOTE - need to stop this re-initialising modules that have already been initialised.
    }

    _scrollToAccordionAnchors() {
        let $elem = 1;
        let $accItem;

        if (window.location.hash.length > 1) {
            const hash = window.location.hash.replace('#', '');
            $elem = $(`${this.options.selectors.accordionContent} #${hash}`);

            if ($elem.length > 0) {
                $accItem = $elem.closest(`${this.options.selectors.accordionItem}`);

                globalEmitter.emit('accordionitemcomponent:open', $accItem);

                setTimeout(() => {
                    this.$window.scrollTop($elem.offset().top);
                }, this.options.scrollToAccordionDelay);
            }
        }
    }
}

export default () => {
    return new PageView();
};
