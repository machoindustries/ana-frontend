import BaseComponent from 'components/base-component';
import $ from 'jquery';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';

class ParallaxComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            disableAtMobile: true,
            parallaxElemSelector: '[data-parallax-elem]',
            parallaxAmtXDataAttr: 'data-parallax-x',
            parallaxAmtYDataAttr: 'data-parallax-y',
            maxParallaxElems: 10,
        };

        this.state = {
            enabled: false,
        };
    }

    initChildren() {
        let numParallaxElems = 0;

        this.$wnd = $(window);

        this.$parallaxElems = this.$el.find(this.options.parallaxElemSelector);

        this.$parallaxElems.each((index) => {
            if (numParallaxElems++ > this.options.maxParallaxElems) {
                console.log(`ParallaxComponent: Warning! Max parallax elements exceeded.
                    Maximum of ${ this.options.maxParallaxElems } parallax elements allowed.`);

                return;
            }

            const pElem = this.$parallaxElems[index],
                $pElem = $(pElem);

            pElem.parallaxAmt = {
                x: parseFloat($pElem.attr(this.options.parallaxAmtXDataAttr)),
                y: parseFloat($pElem.attr(this.options.parallaxAmtYDataAttr)),
            };
        });
    }

    addListeners() {
        // NOTE - unthrottled scroll needed for smoothness
        this.$wnd.on('scroll', this._handleScroll.bind(this));

        if (this.options.disableAtMobile) {
            enquire.register(Utils.getMediaQueryMax(breakpoints.medium - 1), {
                deferSetup: true,
                match: this._mqMatchDisableAtBreakpoint.bind(this),
            });

            enquire.register(Utils.getMediaQueryMin(breakpoints.medium), {
                deferSetup: true,
                match: this._mqUnmatchDisableAtBreakpoint.bind(this),
            });
        }

        setTimeout(this._handleScroll.bind(this), 1);
    }

    _handleScroll() {
        if (this.state.enabled) {
            const scrollOffset = this.$wnd.scrollTop(),
                wndHeight = this.$wnd.outerHeight(),
                halfWndHeight = wndHeight / 2,
                wndCenter = scrollOffset + halfWndHeight;

            this.$parallaxElems.each((index) => {
                const $pElem = this.$parallaxElems.eq(index),
                    elemHeight = $pElem.outerHeight(),
                    elemOffset = $pElem.offset().top,
                    halfElemHeight = elemHeight / 2,
                    elemCenter = elemOffset + halfElemHeight,
                    centerPointOffset = wndCenter - elemCenter,
                    centerPointRelOffset = Utils.capNumberToRange(centerPointOffset / (halfWndHeight + halfElemHeight), -1, 1);

                const xOff = $pElem[0].parallaxAmt.x * centerPointRelOffset,
                    yOff = $pElem[0].parallaxAmt.y * centerPointRelOffset;

                $pElem.css({ transform: `translate(${xOff}px, ${yOff}px)` });
            });
        } else {
            this.$parallaxElems.each((index) => {
                const $pElem = this.$parallaxElems.eq(index);

                $pElem.css('transform', '');
            });
        }
    }

    _mqMatchDisableAtBreakpoint() {
        this.state.enabled = false;
    }

    _mqUnmatchDisableAtBreakpoint() {
        this.state.enabled = true;
    }
}

export default () => {
    return new ParallaxComponent();
};
