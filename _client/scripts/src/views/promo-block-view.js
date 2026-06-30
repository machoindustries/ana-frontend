import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import 'owl.carousel';
import GTMUtils from 'modules/gtm-utils';
import GTMHelper from 'modules/gtm-helper';

class PromoBlockView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            desktopSize: true,
            owlInitialised: false,
        };

        this.defaultOptions = {
            selectors: {
                dotsNav: '.owl-dots',
                dot: '.owl-dot',
                slide: '[data-promo-block-slide]',
                activeDot: '.active',
                contentAnchor: 'a',
            },
            breakpoints: {
                mobile: Utils.getMediaQueryMax(breakpoints.large - 1),
                desktop: Utils.getMediaQueryMin(breakpoints.large),
            },
            animDuration: 400,
            animEasing: 'ease-in-out',
            carouselSlideDuration: 800,
            carouselPostInitDelay: 1000, // only used in browsers that don't support requestAnimationFrame
        };
    }

    initChildren() {
        this.$el.addClass('owl-carousel');

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        globalEmitter.on('windowevents:debouncedresize', this._handleResize.bind(this));

        // Register query and handler with enquire
        // http://wicky.nillia.ms/enquire.js/
        enquire.register(this.options.breakpoints.mobile, {
            deferSetup: true,
            match: this._mqMatchMobile.bind(this),
        });
        enquire.register(this.options.breakpoints.desktop, {
            deferSetup: true,
            match: this._mqMatchDesktop.bind(this),
        });

        this.$el.owlCarousel({
            items: 1,
            loop: true,
            nav: false,
            dots: true,
            dotsData: true,
            lazyLoad: true,
            autoHeight: false,
            smartSpeed: this.options.carouselSlideDuration,
            fluidSpeed: this.options.carouselSlideDuration,
            dotsSpeed: this.options.carouselSlideDuration,
            dotData: true,
            onInitialized: this._onInitialized.bind(this),
            onResized: this._handleResize.bind(this),
        });
    }

    _handleResize() {
        if (this.state.owlInitialised) {
            this.$slides = this.$el.find(this.options.slideSelector);
        }
    }

    _mqMatchMobile() {
        this.state.desktopSize = false;
    }

    _mqMatchDesktop() {
        this.state.desktopSize = true;
    }

    _bindGTM() {
        this.$el.find(this.options.selectors.contentAnchor).each((idx, elem) => {
            $(elem).on('click', (e) => {
                const $elem = $(e.currentTarget);

                this.gtmHelper.customUserData();

                const action = GTMUtils.valueOrFallback($elem.text());
                const label = GTMUtils.valueOrFallback($elem.attr('href'));

                globalEmitter.emit('gtm.site-bannerlink', { action, label });
            });
        });
    }

    _onInitialized() {
        this.$dotsNav = this.$el.find(this.options.selectors.dotsNav);
        this.$dots = this.$el.find(this.options.selectors.dot);
        this.$slides = this.$el.find(this.options.selectors.slide);
        this.$currentActiveDot = this.$dotsNav.find(this.options.selectors.activeDot);
        this.state.owlInitialised = true;

        this._bindGTM();
    }
}

export default () => {
    return new PromoBlockView();
};
