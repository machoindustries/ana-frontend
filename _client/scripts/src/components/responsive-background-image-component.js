import BaseComponent from 'components/base-component';
import $ from 'jquery';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import animate from 'modules/animate';

class ResponsiveBackgroundImagesComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            imageSizes: {
                smallmobile: {
                    name: 'xsmall',
                    precedence: 0,
                    breakpoint: Utils.getMediaQueryMinMax(0, breakpoints.small - 1),
                },
                mobile: {
                    name: 'small',
                    precedence: 0,
                    breakpoint: Utils.getMediaQueryMinMax(breakpoints.small, breakpoints.medium - 1),
                },
                tablet: {
                    name: 'medium',
                    precedence: 1,
                    breakpoint: Utils.getMediaQueryMinMax(breakpoints.medium, breakpoints.large - 1),
                },
                desktop: {
                    name: 'large',
                    precedence: 2,
                    breakpoint: Utils.getMediaQueryMinMax(breakpoints.large, breakpoints.xlarge - 1),
                },
                largedesktop: {
                    name: 'xlarge',
                    precedence: 3,
                    breakpoint: Utils.getMediaQueryMin(breakpoints.xlarge),
                },

            },
            duration: 100,
            easing: 'ease-in-out',
            animationProperties: {
                opacity: '1',
            },
        };

        this.state = {
            currentSize: null,
        };
    }

    initChildren() {
        console.log('initChildren ResponsiveBackgroundImagesComponent');

        // Find all elements which have background images which need to respond
        this.$elements = this.$el.find('[data-responsive-background-image]');
    }

    addListeners() {
        // Register query and handler with enquire
        // http://wicky.nillia.ms/enquire.js/
        enquire.register(this.defaultOptions.imageSizes.smallmobile.breakpoint, {
            deferSetup: true,
            match: this._mqMatchSmallMobile.bind(this),
        });

        enquire.register(this.defaultOptions.imageSizes.mobile.breakpoint, {
            deferSetup: true,
            match: this._mqMatchMobile.bind(this),
        });

        enquire.register(this.defaultOptions.imageSizes.tablet.breakpoint, {
            deferSetup: true,
            match: this._mqMatchTablet.bind(this),
        });

        enquire.register(this.defaultOptions.imageSizes.desktop.breakpoint, {
            deferSetup: true,
            match: this._mqMatchDesktop.bind(this),
        });

        enquire.register(this.defaultOptions.imageSizes.largedesktop.breakpoint, {
            deferSetup: true,
            match: this._mqMatchLargeDesktop.bind(this),
        });

        if ($('html').hasClass('lt-ie9')) {
            this._setSize(this.options.imageSizes.desktop);
        }
    }

    // Handle changing of background paths according to current breakpoint
    _update() {
        const duration = this.options.duration,
            easing = this.options.easing,
            animationProperties = this.options.animationProperties;

        // This check needs to be here in case update is called from somewhere other than _setSize
        if (this.state.currentSize) {
            this.$elements.each((index, elem) => {
                const $elem = $(elem),
                    dataAttr = `data-responsive-background-${ this.state.currentSize.name }`,
                    imagePath = $elem.attr(dataAttr);

                $elem.css({ 'background-image': `url(${ imagePath })` });

                animate($elem, animationProperties, { duration, easing }, this);
            });
        }
    }

    refresh() {
        this.initChildren();
        this._update();
    }

    _setSize(newSize) {
        // Only update if the new image size has a greater precedence than the current size (never reduce image size)
        // if (this.state.currentSize === null || newSize.precedence > this.state.currentSize.precedence) {

        this.state.currentSize = newSize;
        this._update();
        // }
    }

    _mqMatchSmallMobile() {
        console.log('Small Mobile match, ResponsiveBackgroundImagesComponent');

        this._setSize(this.options.imageSizes.smallmobile);
    }

    _mqMatchMobile() {
        console.log('Mobile match, ResponsiveBackgroundImagesComponent');

        this._setSize(this.options.imageSizes.mobile);
    }

    _mqMatchTablet() {
        console.log('Tablet match, ResponsiveBackgroundImagesComponent');

        this._setSize(this.options.imageSizes.tablet);
    }

    _mqMatchDesktop() {
        console.log('Desktop match, ResponsiveBackgroundImagesComponent');

        this._setSize(this.options.imageSizes.desktop);
    }

    _mqMatchLargeDesktop() {
        console.log('Large desktop match, ResponsiveBackgroundImagesComponent');

        this._setSize(this.options.imageSizes.largedesktop);
    }
}

// Export a factory method which will construct a new instance of the class
export default () => {
    return new ResponsiveBackgroundImagesComponent();
};
