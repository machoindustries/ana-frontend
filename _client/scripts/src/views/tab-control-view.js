import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import enquire from 'enquire.js';
import globalEmitter from 'modules/global-emitter';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';

class TabControlItemView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
        };

        this.defaultOptions = {
            selectors: {
                toggle: '[data-tab-control-toggle]',
                panel: '[data-tab-control-content]',
            },
            collapsePanel: true,
            activeClass: 'is-active',
            animDuration: 250,
            changeLayoutAtBreakpoint: (bp) => {
                return bp === 'max' ? Utils.getMediaQueryMax(breakpoints.medium - 1) : Utils.getMediaQueryMin(breakpoints.medium);
            },
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.selectors.toggle);
        this.$panel = this.$el.find(this.options.selectors.panel);
    }

    addListeners() {
        this.$trigger.on('click', this._handleTriggerClickDesktop.bind(this));

        globalEmitter.on('tabitemcomponent:open', this._handleTabItemComponentOpen.bind(this));

        if (this.options.collapsePanel) {
            this._closePanel(0);
        } else {
            this._openPanel(0);
        }

        if (this.options.changeLayoutAtBreakpoint) {
            enquire.register(this.options.changeLayoutAtBreakpoint('max'), {
                deferSetup: true,
                match: this._mqMatchEnableAtBreakpoint.bind(this),
            });

            enquire.register(this.options.changeLayoutAtBreakpoint('min'), {
                deferSetup: true,
                match: this._mqUnmatchEnableAtBreakpoint.bind(this),
            });
        }
    }

    _handleTabItemComponentOpen(data) {
        if (this.state.open) {
            // We don't want to close the tab item
            // if this is the item that triggered the open event
            if (this !== data) {
                this.$el.removeClass(this.options.activeClass);
                this._closePanel(0);
            }
        }
    }

    _openPanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideDown';

        animate(this.$panel[0], direction, { duration, easing }, this);

        this.state.open = true;
        this.$panel.attr('aria-expanded', this.state.open);
        this.$el.addClass(this.options.activeClass);

        globalEmitter.emit('tabitemcomponent:open', this);
    }

    _closePanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideUp';

        animate(this.$panel[0], direction, { duration, easing }, this);

        this.state.open = false;
        this.$panel.attr('aria-expanded', this.state.open);
        this.$el.removeClass(this.options.activeClass);
    }

    _handleTriggerClickDesktop(evt) {
        evt.stopImmediatePropagation();
        evt.preventDefault();

        if (!this.$el.hasClass(this.options.activeClass)) {
            this._openPanel(0);
        }
    }

    _handleTriggerClickMobile(evt) {
        evt.stopImmediatePropagation();
        evt.preventDefault();

        if (this.$el.hasClass(this.options.activeClass)) {
            this._closePanel(this.options.animDuration);
        } else {
            this._openPanel(this.options.animDuration);
        }
    }

    _mqMatchEnableAtBreakpoint() {
        this.$trigger.off();

        this.$trigger.on('click', this._handleTriggerClickMobile.bind(this));

        if (this.options.collapsePanel) {
            this._closePanel(0);
        } else {
            this._openPanel(0);
        }
    }

    _mqUnmatchEnableAtBreakpoint() {
        this.$trigger.off();

        this.$trigger.on('click', this._handleTriggerClickDesktop.bind(this));

        if (this.options.collapsePanel) {
            this._closePanel(0);
        } else {
            this._openPanel(0);
        }
    }
}

export default () => {
    return new TabControlItemView();
};
