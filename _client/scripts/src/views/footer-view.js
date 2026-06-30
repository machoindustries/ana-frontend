import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import GTMHelper from 'modules/gtm-helper';

class FooterView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
            enabled: false,
        };

        this.defaultOptions = {
            selectors: {
                trigger: '[data-country-selector-trigger]',
                panel: '[data-country-selector-panel]',
                closeBtn: '[data-country-selector-close]',
                toggle: '[data-toggle-heading]',
                linkList: '[data-link-list]',
                links: '[data-footer-nav-link]',
            },
            smallModifier: 'is--small',
            smallExpandModifier: 'is--small--expand',
            hasChildrenModifier: 'has--children',
            animDuration: 250,
            enableAtBreakpoint: Utils.getMediaQueryMax(breakpoints.medium),
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.selectors.trigger);
        this.$closeBtn = this.$el.find(this.options.selectors.closeBtn);
        this.$panel = this.$el.find(this.options.selectors.panel);
        this.$linkList = this.$el.find(this.options.selectors.linkList);
        this.$toggle = this.$el.find(this.options.selectors.toggle);
        this.$links = this.$el.find(this.options.selectors.links);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$trigger.on('click', this._handleTriggerClick.bind(this));
        this.$closeBtn.on('click', this._handleCloseBtnClick.bind(this));

        this._closePanel(0);

        enquire.register(this.options.enableAtBreakpoint, {
            deferSetup: true,
            match: this._mqMatchEnableAtBreakpoint.bind(this),
            unmatch: this._mqUnmatchEnableAtBreakpoint.bind(this),
        });

        this.$toggle.each(this._initToggleButton.bind(this));

        this.$links.on('click', (e) => {
            const $elem = $(e.currentTarget);

            this.gtmHelper.customUserData();

            const label = GTMUtils.getGtmValueFromElement($elem, 'label');

            globalEmitter.emit('gtm.site-mainnav', { action: 'Footer Navigation', label });
        });
    }

    _initToggleButton(index, el) {
        $(el).on('click', this._toggleLinkList.bind(this));
    }

    _openPanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideDown';

        animate(this.$panel[0], direction, { duration, easing }, this);

        this.state.open = true;
        this.$panel.attr('aria-expanded', this.state.open);
    }

    _toggleLinkList(evt) {
        evt.preventDefault();

        if (!this.state.enabled) {
            return;
        }

        const expandButton = this.$el.find(evt.target),
            toggleElement = this.$el.find(`[data-toggle-item-${expandButton.data('index')}]`),
            opening = toggleElement.data('opening'),
            direction = opening ? 'slideUp' : 'slideDown',
            currentModifier = opening ? this.options.smallExpandModifier : this.options.smallModifier,
            nextModifier = opening ? this.options.smallModifier : this.options.smallExpandModifier,
            easing = 'ease-in-out',
            duration = 500;

        animate(toggleElement, direction, { duration, easing }, this);

        expandButton.removeClass(currentModifier);
        expandButton.addClass(nextModifier);
        toggleElement.data('opening', !opening);

        return;
    }

    _closePanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideUp';

        animate(this.$panel[0], direction, { duration, easing }, this);

        this.state.open = false;
        this.$panel.attr('aria-expanded', this.state.open);
    }

    _handleCloseBtnClick() {
        this._closePanel(this.options.animDuration);
    }

    _handleTriggerClick() {
        if (this.state.open) {
            this._closePanel(this.options.animDuration);
        } else {
            this._openPanel(this.options.animDuration);
        }
    }

    _cleanUp() {
        this.$linkList.attr('style', '');
        this.$toggle.removeClass(this.options.smallModifier);
        this.$toggle.removeClass(this.options.smallExpandModifier);
    }

    _mqMatchEnableAtBreakpoint() {
        this.state.enabled = true;
        this.$toggle.addClass(this.options.smallModifier);
    }

    _mqUnmatchEnableAtBreakpoint() {
        this.state.enabled = false;
        this._cleanUp();
    }
}

export default () => {
    return new FooterView();
};
