import BaseComponent from 'components/base-component';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';

class SubNavView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
            enabled: false,
        };

        this.defaultOptions = {
            selectors: {
                trigger: '[data-show-subnav]',
                panel: '[data-subnav-wrap]',
                container: '[data-subnav-container]',
            },
            closedClass: 'c-subnav__wrap--closed',
            breakpoints: {
                belowLarge: Utils.getMediaQueryMax(breakpoints.large - 1),
                largeAndAbove: Utils.getMediaQueryMin(breakpoints.large),
            },
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.selectors.trigger);
        this.$panel = this.$el.find(this.options.selectors.panel);
        this.$container = this.$el.closest(this.options.selectors.container);
    }

    addListeners() {
        enquire.register(this.options.breakpoints.belowLarge, {
            deferSetup: true,
            match: this._mqMatchBelowLarge.bind(this),
        });

        enquire.register(this.options.breakpoints.largeAndAbove, {
            deferSetup: true,
            match: this._mqMatchLargeAndAbove.bind(this),
        });

        this.$trigger.on('click', this._handleTriggerClick.bind(this)).trigger('click');
    }

    _mqMatchBelowLarge() {
        this.$container.css({ 'min-height': '' });
    }

    _mqMatchLargeAndAbove() {
        this._setContainerMinHeight();
    }

    _handleTriggerClick(e) {
        e.preventDefault();
        this.$panel.toggleClass(this.options.closedClass);
    }

    _setContainerMinHeight() {
        if (this.$container.length === 0) {
            return;
        }

        // The container seems to change size at some point during rendering so 1ms deferral to wait for this size change to complete
        window.setTimeout(() => {
            const subnavHeight = this.$el.outerHeight() + this.$el.position().top;

            if (subnavHeight > this.$container.outerHeight()) {
                this.$container.css({ 'min-height': `${subnavHeight}px` });
            }
        }, 1);
    }
}

export default () => {
    return new SubNavView();
};
