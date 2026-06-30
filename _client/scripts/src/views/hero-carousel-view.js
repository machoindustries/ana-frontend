import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'owl.carousel';

class HeroCarouselView extends BaseComponent {
    constructor() {
        super();

        this.state = {};

        this.defaultOptions = {
            carouselConfig: {
                items: 1,
                autoplay: false,
                autoplayTimeout: 7500,
                loop: false,
                nav: true,
                callbacks: true,
                dots: true,
                dotsData: true,
                dotData: true,
                duration: 1000,
                smartSpeed: 500,
                easing: 'ease-out',
                animationProperties: {
                    opacity: '1',
                },
                onTranslated: this._handleChange.bind(this),
                navText: [ '', '' ],
            },
            selectors: {
                carousel: '[data-carousel]',
                carouselSlide: '.owl-item',
                carouselTab: '.js-carouselTab',
                carouselActiveSlide: '.owl-item.active',
            },
            attributes: {
                autoPlayEnabled: 'data-carousel-autoplay',
                autoPlayTime: 'data-carousel-autoplay-time',
            },
            carouselActiveClass: 'active',
            activeSlideFadeInTime: 150,
        };
    }

    initChildren() {
        const autoPlayEnabled = this.$el.attr(this.options.attributes.autoPlayEnabled);
        const autoPlayTime = this.$el.attr(this.options.attributes.autoPlayTime);

        if (typeof autoPlayEnabled !== 'undefined') {
            this.options.carouselConfig.autoplay = autoPlayEnabled === 'true';
        }

        if (typeof autoPlayTime !== 'undefined' && autoPlayTime.length > 0) {
            this.options.carouselConfig.autoplayTimeout = autoPlayTime;
        }

        if (this.options.carouselConfig.autoplay) {
            this.options.carouselConfig.loop = true;
        }

        this.carousel = this.$el.find(this.options.selectors.carousel);

        this.carousel.owlCarousel(this.options.carouselConfig);

        this.$slides = this.$el.find(this.options.selectors.carouselSlide);
        this.$activeSlide = this.$el.find(this.options.selectors.carouselActiveSlide);
        this.$tabs = this.$el.find(this.options.selectors.carouselTab);

        this._slideTransition();
    }

    _handleChange(e) {
        if (e.page.index > -1) {
            this.$tabs.removeClass(this.options.carouselActiveClass);
            $(this.$tabs[e.page.index]).addClass(this.options.carouselActiveClass);
            this._slideTransition();
        }
    }

    _slideTransition() {
        $(this.$slides).each((e) => {
            return $(this.$slides[e]).removeClass('fade-in');
        });
        this.$activeSlide = this.$el.find(this.options.selectors.carouselActiveSlide);

        setTimeout(() => {
            $(this.$activeSlide).addClass('fade-in');
        }, this.options.activeSlideFadeInTime);
    }
}

export default () => {
    return new HeroCarouselView();
};
