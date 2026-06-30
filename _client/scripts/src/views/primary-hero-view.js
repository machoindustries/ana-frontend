import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import animate from 'modules/animate';
import Utils from 'modules/utils';
import $ from 'jquery';
import 'owl.carousel';

class PrimaryHeroView extends BaseComponent {
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
                slide: '[data-carousel-slide]',
                slideContent: '[data-carousel-slide-content]',
                activeDot: '.active',
                dotSlider: '.dot-slider',
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
            onTranslated: this._onTranslated.bind(this),
        });
    }

    _handleTranslate() {
        const duration = this.options.animDuration,
            easing = this.options.animEasing;

        this.$currentActiveDotSlider = this.$currentActiveDot.find(this.options.selectors.dotSlider);

        animate(this.$currentActiveDotSlider, { left: '100%' }, { duration, easing, queue: false }, this)
            .then(() => {
                this.$currentActiveDotSlider.css({ left: '0', right: '100%' });
                this.$currentActiveDot = this.$dotsNav.find(this.options.selectors.activeDot);
                this.$currentActiveDotSlider = this.$currentActiveDot.find(this.options.selectors.dotSlider);
            }).then(() => {
                animate(this.$currentActiveDotSlider, { right: '0' }, { duration, easing, queue: false }, this);
            });
    }

    _setDotsWidth() {
        let itemWidth;

        if (this.state.desktopSize) {
            itemWidth = this.$el.outerWidth() / this.$dots.length;
        } else {
            itemWidth = '100%';
        }

        this.$dots.outerWidth(itemWidth);
    }

    _handleResize() {
        this._setDotsWidth();

        if (this.state.owlInitialised) {
            this.$slides = this.$el.find(this.options.selectors.slide);
            this._triggerNormaliseSlideHeights();
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

        this._setDotsWidth();

        this._handleTranslate();

        this.$el.on('translate.owl.carousel', () => {
            this._handleTranslate();
        });

        this.state.owlInitialised = true;

        this._triggerNormaliseSlideHeights();

        globalEmitter.emit('state.HeroCarousel', { action: 'impression', name: this.$el.find('.owl-item.active').find('.c-hero__heading').text() });
    }

    _triggerNormaliseSlideHeights() {
        this.$slides.each((idx, elem) => {
            $(elem).find(this.options.selectors.slideContent).css({
                'height': '',
                'max-height': '',
            });
        });

        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(this._normaliseSlideHeights.bind(this));
        } else {
            setTimeout(this._normaliseSlideHeights.bind(this), this.options.carouselPostInitDelay);
        }
    }

    _normaliseSlideHeights() {
        console.log('normalise slide heights');

        // Ensure all slides are the same height as the tallest slide
        let tallestContentHeight = 0;
        const dotsNavHeight = this.$dotsNav.outerHeight();

        this.$slides.each((idx, elem) => {
            const contentHeight = $(elem).find(this.options.selectors.slideContent).outerHeight();

            if (contentHeight > tallestContentHeight) {
                tallestContentHeight = contentHeight;
            }
        });

        console.log(`setting slides to norm height of ${ tallestContentHeight }`);

        this.$slides.each((idx, elem) => {
            const $elem = $(elem);

            $elem.css({
                'padding-bottom': `${ dotsNavHeight }px`,
            });

            $elem.find(this.options.selectors.slideContent).css({
                'height': `${ tallestContentHeight }px`,
                'max-height': `${ tallestContentHeight }px`,
            });
        });

        // debug
        this.$slides.each((idx, elem) => {
            console.log(`slide ${ idx } height = ${ $(elem).find(this.options.selectors.slideContent).css('height') } maxHeight = ${ $(elem).find(this.options.selectors.slideContent).css('maxHeight') }`);
        });
    }

    _onTranslated() {
        globalEmitter.emit('state.HeroCarousel', { action: 'impression', name: this.$el.find('.owl-item.active').find('.c-hero__heading').text() });

        this._handleResize();
    }
}

export default () => {
    return new PrimaryHeroView();
};
