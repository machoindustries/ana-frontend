import BaseComponent from 'components/base-component';
import $ from 'jquery';
import EventEmitter from 'eventemitter3';
import globalEmitter from 'modules/global-emitter';
import 'owl.carousel';

class GalleryView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                mainCarousel: '[data-main-carousel]',
                thumbsCarousel: '[data-thumbs-carousel]',
                thumbnail: '[data-thumbnail]',
                activeThumb: '.c-gallery__thumbnail--active',
                nextButton: '[data-next]',
                prevButton: '[data-prev]',
            },
            activeThumbClass: 'c-gallery__thumbnail--active',
            navDisabledClass: 'c-gallery__nav-btn--disabled',
            videoThumbClass: 'c-gallery__thumbnail--video',
            duration: 300,
        };

        this.localEventEmitter = new EventEmitter();
    }

    initChildren() {
        const self = this;

        this.$mainCarousel = this.$el.find(this.options.selectors.mainCarousel);
        this.$thumbsCarousel = this.$el.find(this.options.selectors.thumbsCarousel);

        this.$nextButton = this.$el.find(this.options.selectors.nextButton);
        this.$prevButton = this.$el.find(this.options.selectors.prevButton);

        this.$mainCarousel.addClass('owl-carousel');
        this.$thumbsCarousel.addClass('owl-carousel');
        this.$thumbnails = this.$thumbsCarousel.find(this.options.selectors.thumbnail);

        this.lastIndex = 0;
        this.currentIndex = 0;
        this.$activeThumb = this.$el.find(this.options.selectors.activeThumb);

        let flag = false;

        $(window).on('load', () => {
            this.$mainCarousel.owlCarousel({
                items: 1,
                dots: false,
                nav: false,
                autoHeight: true,
                onInitialized: (e) => {
                    globalEmitter.emit('initialized.GalleryView', e);
                },
            })
                .on('changed.owl.carousel', (e) => {
                    if (!flag) {
                    // console.log('main carousel changed: ' + e.item.index);

                        globalEmitter.emit('changed.GalleryView', e);
                        self.localEventEmitter.emit('mainCarousel.changed:GalleryView', e.item.index);

                        self.lastIndex = self.currentIndex;
                        self.currentIndex = e.item.index;

                        self.setActiveThumbnail(self.$thumbnails.eq(e.item.index));

                        flag = true;
                        self.$thumbsCarousel.trigger('to.owl.carousel', [ e.item.index, self.options.duration, true ]);
                        flag = false;
                    }
                });

            this.$thumbsCarousel.owlCarousel({
                items: 4,
                margin: 10,
                dots: false,
                nav: false,
                responsive: {
                    0: {
                        items: 3,
                    },
                    480: {
                        items: 4,
                    },
                },
            })
                .on('click', '.owl-item', function() {
                    /* eslint-disable-next-line no-invalid-this */
                    const $thumb = $(this);

                    self.lastIndex = self.currentIndex;
                    self.currentIndex = $thumb.index();

                    self.setActiveThumbnail($thumb);

                    self.$mainCarousel.trigger('to.owl.carousel', [ $thumb.index(), self.options.duration, true ]);
                });
        });
    }

    addListeners() {
        this.localEventEmitter.on('mainCarousel.changed:GalleryView', this._setPrevButtonState.bind(this));
        this.localEventEmitter.on('mainCarousel.changed:GalleryView', this._setNextButtonState.bind(this));

        this.$prevButton.on('click', this._prevButtonClick.bind(this));
        this.$nextButton.on('click', this._nextButtonClick.bind(this));
    }

    _prevButtonClick(evt) {
        evt.preventDefault();

        const $self = $(evt.currentTarget);

        if ($self.hasClass(this.options.navDisabledClass)) {
            return;
        }

        this.lastIndex = this.currentIndex;
        this.currentIndex--;

        console.log(`_prevButtonClick.GalleryView: ${this.currentIndex}`);

        this.setActiveThumbnail(this.$thumbnails.eq(this.currentIndex));

        this.$thumbsCarousel.trigger('to.owl.carousel', [ this.currentIndex, this.options.duration, true ]);
        this.$mainCarousel.trigger('to.owl.carousel', [ this.currentIndex, this.options.duration, true ]);
    }

    _nextButtonClick(evt) {
        evt.preventDefault();

        const $self = $(evt.currentTarget);

        if ($self.hasClass(this.options.navDisabledClass)) {
            return;
        }

        this.lastIndex = this.currentIndex;
        this.currentIndex++;

        console.log(`_nextButtonClick.GalleryView: ${this.currentIndex}`);

        this.setActiveThumbnail(this.$thumbnails.eq(this.currentIndex));

        this.$thumbsCarousel.trigger('to.owl.carousel', [ this.currentIndex, this.options.duration, true ]);
        this.$mainCarousel.trigger('to.owl.carousel', [ this.currentIndex, this.options.duration, true ]);
    }

    _setPrevButtonState(data) {
        console.log('_setPrevButtonState.GalleryView');
        console.log(data);

        this.$prevButton.toggleClass(this.options.navDisabledClass, data === 0);
    }

    _setNextButtonState(data) {
        console.log('_setNextButtonState.GalleryView');
        console.log(data);

        this.$nextButton.toggleClass(this.options.navDisabledClass, data === this.$thumbnails.length - 1);
    }

    setActiveThumbnail($thumbnail) {
        console.log('setActiveThumbnail.GalleryView');

        if (this.$activeThumb) {
            this.$activeThumb.removeClass(this.options.activeThumbClass);
        }

        $thumbnail.addClass(this.options.activeThumbClass);

        this.$activeThumb = $thumbnail;
    }
}

export default () => {
    return new GalleryView();
};
