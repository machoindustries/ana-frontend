import BaseComponent from 'components/base-component';
import $ from 'jquery';
import animate from 'modules/animate';
import 'owl.carousel';
import globalEmitter from 'modules/global-emitter';

class CarouselView extends BaseComponent {
    constructor() {
        super();

        this.options = {
            selectors: {
                carousel: '[data-carousel]',
                dotsNav: '.owl-dots',
                dot: '.owl-dot',
                slide: '[data-carousel-slide]',
            },
            carouselSlideClass: 'carouselitem',
            owlClass: 'owl-carousel',
            duration: 100,
            easing: 'ease-in-out',
            animationProperties: {
                opacity: '1',
            },
            navArrows: false,
            prevText: null,
            nextText: null,
            navDots: true,
            itemsToShow: 1,
        };
    }

    init($el) {
        this.$el = $el;
        this.owl = this.$el.is(this.options.selectors.carousel) ? this.$el : this.$el.find(this.options.selectors.carousel);

        this.owl.addClass(this.options.owlClass);

        $(window).on('load', () => {
            this.owl.owlCarousel({
                responsive: {
                    0: {
                        items: 1,
                    },
                    768: {
                        items: this.options.itemsToShow,
                    },
                },
                nestedItemSelector: this.options.carouselSlideClass,
                loop: true,
                nav: this.options.navArrows,
                navText: [ this.options.prevText, this.options.nextText ],
                dots: this.options.navDots,
                dotsData: false,
                autoHeight: true,
                margin: 20,
                onInitialized: this._setSlideVisible.bind(this),
                onTranslated: this._onTranslated.bind(this),
            });
        });

        this.$dotsNav = this.$el.find(this.options.selectors.dotsNav);
        this.$dots = this.$el.find(this.options.selectors.dot);
    }

    _setSlideVisible() {
        const duration = this.options.duration,
            easing = this.options.easing,
            animationProperties = this.options.animationProperties;

        this.$slides = this.$el.find(this.options.selectors.slide);
        this.$slides.each((idx, obj) => {
            animate(obj, animationProperties, { duration, easing }, this);
        });

        globalEmitter.emit('state.Carousel', { action: 'impression', name: this.options.carouselname });
    }

    _onTranslated() {
        globalEmitter.emit('state.Carousel', { action: 'impression', name: this.options.carouselname });
    }
}

export default () => {
    return new CarouselView();
};
