import BaseComponent from 'components/base-component';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import $ from 'jquery';
import 'owl.carousel';
import jitRequire from 'modules/jit-require';
import globalEmitter from 'modules/global-emitter';

class ContainerBlockView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                contentArea: '.c-container-block__content',
                slide: '.c-container-block__slide',
                slidesContainer: '.owl-stage',
                autoExpandAtMobile: '[data-auto-expand-at-mobile]',
                productCarousel: '[data-product-carousel]',
                activeDot: '.active',
                activeSlide: '.owl-item.active',
                dotSlider: '.dot-slider',
                dotsNav: '.owl-dots',
                dot: '.owl-dot',
                clonedSlide: '.owl-item.cloned',
            },
            mobileCarouselAttr: 'data-carousel-mobile',
            desktopCarouselAttr: 'data-carousel-desktop',
            numSlidesAtDesktopAttr: 'data-num-slides-desktop',
            nextSlidePeekWidth: 30,
            breakpoints: {
                mobile: Utils.getMediaQueryMax(breakpoints.medium - 1),
                desktop: Utils.getMediaQueryMin(breakpoints.medium),
            },
            animDuration: 400,
            animEasing: 'ease-in-out',
            carouselSlideDuration: 800,
            carouselPostInitDelay: 1000, // only used in browsers that don't support requestAnimationFrame
            autoExpandDelayInitial: 1000,
            expandedClass: 'is--expanded',
            carouselClass: 'owl-carousel',
            slideContentBlockGridClass: 'grid__item',
            slideContentBlockInitialClassAttr: 'data-slide-content-initial-class',
            carouselSlideItems: 1,
            carouselSlideItemsSmall: 1,
            carouselSlideItemsMedium: 1,
            carouselSlideItemsLarge: 3,
        };

        this.state = {
            desktopSize: false,
            owlInitialised: false,
            carouselEnabled: false,
        };

        this.owlCarouselOptions = {
            margin: 20,
            loop: true,
            nav: false,
            dots: true,
            dotsEach: this.defaultOptions.carouselSlideItems,
            lazyLoad: false,
            autoHeight: false,
            smartSpeed: this.defaultOptions.carouselSlideDuration,
            fluidSpeed: this.defaultOptions.carouselSlideDuration,
            dotsSpeed: this.defaultOptions.carouselSlideDuration,
            responsive: {
                0: {
                    margin: 20,
                    items: this.defaultOptions.carouselSlideItems,
                    loop: true,
                    autoWidth: false,
                    mouseDrag: true,
                    touchDrag: true,
                    stagePadding: this.defaultOptions.nextSlidePeekWidth,
                },
            },
            onInitialized: this._onCarouselInitialized.bind(this),
            onTranslated: this._onTranslated.bind(this),
        };
    }

    initChildren() {
        this.owlCarouselOptions.responsive[breakpoints.small] = {
            margin: 40,
            autoWidth: false,
            items: this.options.carouselSlideItemsSmall,
            dotsEach: this.options.carouselSlideItemsSmall,
            mouseDrag: true,
            touchDrag: true,
            stagePadding: 0,
        };

        this.owlCarouselOptions.responsive[breakpoints.medium] = {
            margin: 40,
            autoWidth: false,
            items: this.options.carouselSlideItemsMedium,
            dotsEach: this.options.carouselSlideItemsMedium,
            mouseDrag: true,
            touchDrag: true,
            stagePadding: 0,
        };

        this.owlCarouselOptions.responsive[breakpoints.large] = {
            margin: 40,
            autoWidth: false,
            items: this.options.carouselSlideItemsLarge,
            dotsEach: this.options.carouselSlideItemsLarge,
            mouseDrag: true,
            touchDrag: true,
            stagePadding: 0,
        };

        this.$contentArea = this.$el.find(this.options.selectors.contentArea);

        const isMobileCarousel = this.$el.attr(this.options.mobileCarouselAttr);
        const isDesktopCarousel = this.$el.attr(this.options.desktopCarouselAttr);

        this.isMobileCarousel = isMobileCarousel !== 'undefined' && isMobileCarousel === 'true';
        this.isDesktopCarousel = isDesktopCarousel !== 'undefined' && isDesktopCarousel === 'true';
        this.isProductCarousel = this.$el.is(this.options.selectors.productCarousel);
    }

    addListeners() {
        enquire.register(this.options.breakpoints.mobile, {
            deferSetup: true,
            match: this._mqMatchMobile.bind(this),
        });

        enquire.register(this.options.breakpoints.desktop, {
            deferSetup: true,
            match: this._mqMatchDesktop.bind(this),
        });
    }

    _mqMatchMobile() {
        this.state.desktopSize = false;

        if (this.isMobileCarousel === true && this.state.carouselEnabled === false) {
            this._createCarousel();
        } else if (this.isMobileCarousel === false && this.state.carouselEnabled === true) {
            this._destroyCarousel();
        }
    }

    _mqMatchDesktop() {
        this.state.desktopSize = true;

        if (this.isDesktopCarousel === true && this.state.carouselEnabled === false) {
            this._createCarousel();
        } else if (this.isDesktopCarousel === false && this.state.carouselEnabled === true) {
            this._destroyCarousel();
        }
    }

    _onCarouselInitialized() {
        this.$dotsNav = this.$el.find(this.options.selectors.dotsNav);
        this.$dots = this.$el.find(this.options.selectors.dot);
        this.$slidesContainer = this.$el.find(this.options.selectors.slidesContainer);
        this.$slides = this.$el.find(this.options.selectors.slide);
        this.$currentActiveDot = this.$dotsNav.find(this.options.selectors.activeDot);
        this.state.owlInitialised = true;

        this.$slides.children(`.${this.options.slideContentBlockGridClass}`).each((idx, elem) => {
            const $elem = $(elem);

            $elem.attr(this.options.slideContentBlockInitialClassAttr, $elem.attr('class'));
            $elem.removeClass().addClass(this.options.slideContentBlockGridClass);
        });

        this._autoCollapseAll();
        this._autoExpandActive();

        setTimeout(() => {
            this.$contentArea.trigger('refresh.owl.carousel');

            this.$slidesContainer.find(this.options.selectors.clonedSlide).each((idx, elem) => {
                jitRequire($(elem));
            });

            globalEmitter.emit('productlisting:rebinditems', this);
        }, 0);
    }

    _autoCollapseAll() {
        this.$slides.find(this.options.selectors.autoExpandAtMobile).removeClass(this.options.expandedClass);
    }

    _autoExpandActive() {
        this.$slides.closest(this.options.selectors.activeSlide).find(this.options.selectors.autoExpandAtMobile).addClass(this.options.expandedClass);
    }

    _onTranslated() {
        this._autoCollapseAll();
        this._autoExpandActive();
    }

    _createCarousel() {
        this.$contentArea.css({ 'margin-left': '0' });
        this.$contentArea.owlCarousel(this.owlCarouselOptions);
        this.$contentArea.addClass(this.options.carouselClass);
        this.state.carouselEnabled = true;
    }

    _destroyCarousel() {
        this.$slides.children(`.${this.options.slideContentBlockGridClass}`).each((idx, elem) => {
            const $elem = $(elem);

            $elem.removeClass().addClass($elem.attr(this.options.slideContentBlockInitialClassAttr));
        });

        this.$contentArea.css({ 'margin-left': '' });
        this.$contentArea.owlCarousel().trigger('destroy.owl.carousel');
        this.$contentArea.removeClass(this.options.carouselClass);
        this.state.carouselEnabled = false;

        this._autoCollapseAll();
    }
}

export default () => {
    return new ContainerBlockView();
};
