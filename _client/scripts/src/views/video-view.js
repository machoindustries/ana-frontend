import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';

class VideoView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            enabled: true,
        };

        this.defaultOptions = {
            language: '',
            selectors: {
                content: '[data-video-content]',
                link: '[data-video-link]',
                playIcon: '[data-video-play-icon]',
            },
            reflowTime: 1000, // only used in browsers that lack support for requestAnimationFrame
            resizeTimeout: 300,
            name: '',
        };
    }

    initChildren() {
        this.$link = this.$el.find(this.options.selectors.link);
        this.$content = this.$el.find(this.options.selectors.content);
        this.$playIcon = this.$el.find(this.options.selectors.playIcon);
    }

    addListeners() {
        const self = this;

        globalEmitter.on('windowevents:debouncedresize', this._handleResize.bind(this));

        globalEmitter.on('initialized.GalleryView', this._positionPlayIcon.bind(this));

        $.magnificPopup.instance.close();

        this.$link.magnificPopup({
            type: 'iframe',
            iframe: {
                markup: '<div class="mfp-iframe-scaler">' +
                        '<div class="mfp-close"></div>' +
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen allow="autoplay"></iframe>' +
                    '</div>',
                patterns: {
                    youtube: {
                        index: 'youtube.com/',
                        id: 'v=',
                        src: `https://www.youtube.com/embed/%id%?autoplay=1&enablejsapi=1&rel=0&hl=${this.options.language}`,
                    },
                    youtube_short: {
                        index: 'youtu.be/',
                        id: 'youtu.be/',
                        src: 'https://www.youtube.com/embed/%id%?autoplay=1&enablejsapi=1&rel=0&hl=${this.options.language}',
                    },
                    youku: {
                        index: 'youku.com/',
                        id: (url) => {
                            const m = url.match(/id_(.*).html$/);

                            if (m !== null) {
                                console.log(m);

                                if (m[1] !== null) {
                                    return m[1];
                                }
                            }

                            return null;
                        },
                        src: '//player.youku.com/embed/%id%',
                    },
                },
            },
            disableOn: () => {
                const $carouselItem = self.$el.closest('.owl-item');

                if ($carouselItem.length > 0) {
                    if ($carouselItem.hasClass('active')) {
                        console.log('disableOn carousel');

                        return true;
                    }

                    return false;
                }

                return true;
            },
            callbacks: {
                open: () => {
                    globalEmitter.emit('state.gtmTrackEvent', { eventname: 'video-engagement', category: 'Video Engagement', action: this.options.name, label: 'play' });

                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();
                    }, 0);
                },
                close: () => {
                    globalEmitter.emit('state.gtmTrackEvent', { eventname: 'video-engagement', category: 'Video Engagement', action: this.options.name, label: 'stop' });
                },
            },
        });

        this._positionPlayIcon();
        this._triggerPositionPlayIcon();
    }

    _triggerPositionPlayIcon() {
        $(window).on('resize', () => {
            setTimeout(() => {
                this._positionPlayIcon();
            }, this.options.resizeTimeout);
        });
    }

    _positionPlayIcon() {
        console.log('this._positionPlayIcon()');

        const thisElOuterHeight = this.$el.outerHeight(),
            contentHeight = this.$content.outerHeight(),
            availSpace = thisElOuterHeight - contentHeight - parseInt(this.$content.css('bottom'), 10),
            playIconHeight = this.$playIcon.outerHeight();

        let topOffset;

        if (availSpace < playIconHeight) {
            topOffset = contentHeight / 2 + (contentHeight - thisElOuterHeight) - playIconHeight / 2;
        } else {
            topOffset = -(availSpace / 2 + playIconHeight / 2);
        }

        this.$playIcon.css({
            top: `${ topOffset }px`,
            transform: '',
        });
    }

    _handleResize() {
        this._triggerPositionPlayIcon();
    }
}

export default () => {
    return new VideoView();
};
