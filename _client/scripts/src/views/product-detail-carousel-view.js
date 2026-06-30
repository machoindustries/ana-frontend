import BaseComponent from 'components/base-component';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import 'owl.carousel';

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
                slide: '[data-containerblock-carousel-slide]',
                activeDot: '.active',
            },
            breakpoints: {
                mobile: Utils.getMediaQueryMax(breakpoints.large - 1),
                desktop: Utils.getMediaQueryMin(breakpoints.large),
            },
            animDuration: 400,
            animEasing: 'ease-in-out',
            carouselSlideDuration: 800,
            carouselPostInitDelay: 1000, // only used in browsers that don't support requestAnimationFrame
            carouselClass: 'owl-carousel',
            slideContentBlockGridClass: 'grid__item one-whole',
        };

        this.owlCarouselOptions = {
            margin: 20,
            loop: true,
            nav: false,
            dots: true,
            dotsData: true,
            lazyLoad: false,
            autoHeight: false,
            smartSpeed: this.defaultOptions.carouselSlideDuration,
            fluidSpeed: this.defaultOptions.carouselSlideDuration,
            dotsSpeed: this.defaultOptions.carouselSlideDuration,
            dotData: true,
            responsive: {
                0: {
                    autoWidth: true,
                    mouseDrag: true,
                    touchDrag: true,
                },
            },
            onInitialized: this._onInitialized.bind(this),
            onResized: this._handleResize.bind(this),
        };

        this.owlCarouselOptions.responsive[breakpoints.xlarge] = {
            autoWidth: false,
            items: 4,
            mouseDrag: true,
            touchDrag: true,
        };
    }

    initChildren() {
        this.$el.addClass(this.options.carouselClass);
    }

    addListeners() {
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

        this.$el.owlCarousel(this.owlCarouselOptions);
    }

    _handleResize() {
        this.$el.owlCarousel().trigger('destroy.owl.carousel');
        this.$el.owlCarousel(this.owlCarouselOptions);

        if (this.state.owlInitialised) {
            this.$slides = this.$el.find(this.options.selectors.slide);
        }
    }

    _mqMatchMobile() {
        this.state.desktopSize = false;
    }

    _mqMatchDesktop() {
        this.state.desktopSize = true;
    }

    _onInitialized() {
        this.$dotsNav = this.$el.find(this.options.selectors.dotsNav);
        this.$dots = this.$el.find(this.options.selectors.dot);
        this.$slides = this.$el.find(this.options.selectors.slide);
        this.$currentActiveDot = this.$dotsNav.find(this.options.selectors.activeDot);
        this.state.owlInitialised = true;

        this._postProcessSlideMarkup();
    }

    _postProcessSlideMarkup() {
        this.$slides.children().removeClass().addClass(this.options.slideContentBlockGridClass);
    }
}

export default () => {
    return new PromoBlockView();
};
