import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import GTMHelper from 'modules/gtm-helper';

class AccordionItemView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
            disabled: false,
        };

        this.defaultOptions = {
            collapsePanel: false,
            selectors: {
                toggle: '[data-accordion-toggle]',
                panel: '[data-accordion-content]',
                sitemap: '[data-sitemap]',
            },
            activeClass: 'is-active',
            disabledClass: 'is-disabled',
            animDuration: 250,
            disableAtBreakpoint: null,
            disableAtBreakpointAttr: 'data-disable-at-breakpoint',
            linkListClass: 'c-in-page-link-list',
            emptyLinkListClass: 'c-in-page-link-list--empty',
        };
    }

    initChildren() {
        if (this.$el.hasClass(this.options.linkListClass) && this.$el.hasClass(this.options.emptyLinkListClass)) {
            return;
        }

        this.$trigger = this.$el.find(this.options.selectors.toggle);
        this.$panel = this.$el.find(this.options.selectors.panel);
        this.$disableAtBreakpoint = this.$el.attr(this.options.disableAtBreakpointAttr);

        this.isSitemap = this.$el.is(this.options.selectors.sitemap);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        const disableBP = this.$el.attr(this.options.disableAtBreakpointAttr);

        if (typeof disableBP !== 'undefined' && Object.hasOwn(breakpoints, disableBP)) {
            this.options.disableAtBreakpoint = breakpoints[disableBP];
        }

        this.$trigger.on('click', this._handleTriggerClick.bind(this));

        globalEmitter.on('accordionitemcomponent:open', this._handleAccordionItemComponentOpen.bind(this));

        if (this.options.collapsePanel) {
            this._closePanel(0);
        } else {
            this._openPanel(0);
        }

        if (this.$disableAtBreakpoint) {
            enquire.register(`screen and (max-width: ${ this.$disableAtBreakpoint - 1 }px)`, {
                deferSetup: true,
                match: this._mqMatchEnableAtBreakpoint.bind(this),
            });

            enquire.register(`screen and (min-width: ${ this.$disableAtBreakpoint }px)`, {
                deferSetup: true,
                match: this._mqUnmatchEnableAtBreakpoint.bind(this),
            });
        }
    }

    _handleAccordionItemComponentOpen(data) {
        // If a jquery collection was passed in, compare against this instance's element.
        if (typeof data.is === 'function' && data[0] === this.$el[0]) {
            this._openPanel(0);
            this._handleAccordionItemComponentClose(this);

            return;
        }

        // We don't want the typical accordion behaviour on the sitemap
        if (!this.isSitemap) {
            this._handleAccordionItemComponentClose(data);
        } else if (this.$disableAtBreakpoint) {
            enquire.register(`screen and (max-width: ${ this.$disableAtBreakpoint - 1 }px)`, {
                deferSetup: true,
                match: this._handleAccordionItemComponentClose.bind(this, data),
            });
        }
    }

    _handleAccordionItemComponentClose(data) {
        if (this.state.open || this.isSitemap) {
            // We don't want to close the accordion item
            // if this is the item that triggered the open event
            if (this !== data) {
                this.$el.removeClass(this.options.activeClass);

                this._closePanel(this.isSitemap ? 0 : this.options.animDuration);
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

        globalEmitter.emit('accordionitemcomponent:open', this);
    }

    _closePanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideUp';

        animate(this.$panel[0], direction, { duration, easing }, this);

        this.state.open = false;
        this.$panel.attr('aria-expanded', this.state.open);
        this.$el.removeClass(this.options.activeClass);
    }

    _handleTriggerClick(evt) {
        evt.stopImmediatePropagation();
        evt.preventDefault();

        if (this.$el.hasClass('is-active')) {
            this._closePanel(this.options.animDuration);
        } else {
            globalEmitter.emit('state.gtmVirtualPageView', this.$trigger.text());
            this._openPanel(this.options.animDuration);
        }

        const action = GTMUtils.getGtmValueFromElement(this.$el, 'action');
        const label = GTMUtils.getGtmValueFromElement(this.$el, 'label');

        this.gtmHelper.customUserData();

        globalEmitter.emit('gtm.site-accordionclick', { action, label });
    }

    _mqMatchEnableAtBreakpoint() {
        this.$trigger.on('click', this._handleTriggerClick.bind(this));
        this.$el.removeClass(this.options.disabledClass);
        this.state.disabled = false;

        if (this.isSitemap) {
            this._closePanel(0);
        } else if (this.options.collapsePanel) {
            this._closePanel(0);
        } else {
            this._openPanel(0);
        }
    }

    _mqUnmatchEnableAtBreakpoint() {
        this.$trigger.unbind('click');
        this._openPanel(0);
        this.$el.addClass(this.options.disabledClass);
        this.state.disabled = true;
    }
}

export default () => {
    return new AccordionItemView();
};
