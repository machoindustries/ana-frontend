import BaseComponent from 'components/base-component';
import $ from 'jquery';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import globalEmitter from 'modules/global-emitter';
import '../../lib/hoverIntent';
import GTMUtils from 'modules/gtm-utils';
import GTMHelper from 'modules/gtm-helper';

class MegaNavComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            panelSelector: '[data-primary-nav-panel]',
            subListSelector: '[data-primary-nav-tray]',
            secondaryItemSelector: '[data-primary-nav-item]',
            linkSelector: '[data-primary-nav-link]',
            primaryNavTrigger: '[data-primary-nav-trigger]',
            openPanelModifier: 'is--open-panel',
            openListModifier: 'is--open',
            hoveredModifier: 'is--hovered',
            fadedInModifier: 'is--faded-in',
            navLevelDataAttr: 'data-nav-level',
            secondaryItemLevel: 2,
            panelAdditionalLeftPadding: 20,
            fadeInDelay: 60,
            enableAtBreakpoint: Utils.getMediaQueryMin(breakpoints.large),
            touchToggleClickThroughDebounceMS: 500,
        };

        this.state = {
            enabled: window.isIE8,
            open: false,
            fadeInIndex: 0,
            touchOpen: false,
            lastPanelOpenTime: Date.now(),
        };
    }

    initChildren() {
        this.$html = $('html');
        this.$panel = this.$el.find(this.options.panelSelector);
        this.$panelList = this.$panel.children(this.options.panelListSelector);

        this.$secondaryItems = this.$panel.find(this.options.secondaryItemSelector)
            .filter(`[${ this.options.navLevelDataAttr }=${ this.options.secondaryItemLevel }]`);

        this.$subLists = this.$panel.find(this.options.subListSelector);

        this.$links = this.$el.find(this.options.linkSelector);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        let eventType = 'touchstart';

        if (window.navigator.pointerEnabled) {
            eventType = 'pointerdown';
        } else if (window.navigator.msPointerEnabled) {
            eventType = 'MSPointerDown';
        }

        this.$html.not('.bound').addClass('bound').on('click', this._handlePageClick.bind(this));

        if (eventType !== 'touchstart') {
            this.$el.on(eventType, this._handleTouchEvent.bind(this));
        }
        // this.$el.on('mouseenter', this._handleMouseOver.bind(this));
        // this.$el.on('mouseleave', this._handleMouseOut.bind(this));

        // Triggering the mega nav on focus / blur - this needs additional thought on how to keep menu
        // open when moving onto a child item and losing focus on the parent.

        // this.$el.find(this.options.primaryNavTrigger).on('focus', this._handleMouseOver.bind(this));
        // this.$el.find(this.options.primaryNavTrigger).on('blur', this._handleMouseOut.bind(this));

        // Replaced the mouseenter/mouseleave with hoverIntent.
        this.$el.hoverIntent({
            over: this._handleMouseOver.bind(this),
            out: this._handleMouseOut.bind(this),
            timeout: 300,
        });

        this.$el.on('click', this._handleToggleClick.bind(this));

        this._bindGTM();

        globalEmitter.on('meganavcomponent:open', this._handleMegaNavComponentOpen.bind(this));

        // Register query and handler with enquire
        // http://wicky.nillia.ms/enquire.js/
        enquire.register(this.options.enableAtBreakpoint, {
            deferSetup: true,
            match: this._mqMatchEnableAtBreakpoint.bind(this),
            unmatch: this._mqUnmatchEnableAtBreakpoint.bind(this),
        },
        true); // shouldDegrade - always match if the browser doesn't support media queries
    }

    addAriaAttributes() {

    }

    _bindGTM() {
        this.$links.on('click', (e) => {
            const $elem = $(e.currentTarget);

            const action = GTMUtils.getGtmValueFromElement($elem, 'action');
            const label = GTMUtils.getGtmValueFromElement($elem, 'label');

            this.gtmHelper.customUserData();

            globalEmitter.emit('gtm.site-meganav', { action, label });
        });
    }

    _positionPanel() {
        if (this.state.enabled === false) {
            return;
        }

        const $wnd = $(window),
            itemLeft = -(this.$el[0].getBoundingClientRect().left + 1); // +1 = border

        // Panel width needs to be full window width
        this.$panel.width($wnd.innerWidth());

        // Panel left pos needs to be flush with left of window
        // Left padding needs to be distance from edge of window to left edge of primary nav elem
        this.$panel.css({
            left: `${itemLeft}px`,
        });
    }

    _fadeInNextItem() {
        if (this.state.fadeInIndex < this.$secondaryItems.length) {
            $(this.$secondaryItems[this.state.fadeInIndex++]).addClass(this.options.fadedInModifier);

            setTimeout(() => {
                this._fadeInNextItem();
            }, this.options.fadeInDelay);
        }
    }

    _fadeInItems() {
        this.state.fadeInIndex = 0;

        // Initially set the items to their faded-out state
        this.$secondaryItems.removeClass(this.options.fadedInModifier);

        const ivl = setInterval(() => {
            if (this.state.fadeInIndex < this.$secondaryItems.length) {
                $(this.$secondaryItems[this.state.fadeInIndex++]).addClass(this.options.fadedInModifier);
            } else {
                clearInterval(ivl);
            }
        }, this.options.fadeInDelay);
    }

    _handleTouchEvent(e) {
        e.preventDefault();
        e.stopPropagation();

        // If we have opened the current item from a touch event, set flag to ignore mouseout from tap end
        if (this.state.enabled) {
            this.state.touchOpen = true;
        }
    }

    // Prevent touch interactions navigating to the toggle's link unless the associated panel is already open
    _handleToggleClick(e) {
        // Checking for the open class doesn't work due to a slight delay on click events, so we can check the time since
        // the panel was opened and if it is high enough, click through to the link.
        if (Date.now() - this.state.lastPanelOpenTime < this.options.touchToggleClickThroughDebounceMS) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    _handleMouseOver() {
        console.log('in');

        if (this.state.enabled) {
            if (this.$el.hasClass(this.options.hoveredModifier)) {
                return;
            }

            this.$el.addClass(this.options.hoveredModifier);
            this.$panel.addClass(this.options.openPanelModifier);
            this.$subLists.addClass(this.options.openListModifier);

            this._positionPanel();
            this._fadeInItems();

            globalEmitter.emit('meganavcomponent:open', this);

            this.state.lastPanelOpenTime = Date.now();
        }
    }

    _handleMouseOut() {
        console.log('out');

        if (this.state.enabled) {
            if (!this.state.touchOpen) {
                this._close();
            }
        }
    }

    _close() {
        console.log('close');
        this.state.touchOpen = false;

        this.$el.removeClass(this.options.hoveredModifier);
        this.$panel.removeClass(this.options.openPanelModifier);
        this.$subLists.removeClass(this.options.openListModifier);
    }


    _handleMegaNavComponentOpen(data) {
        if (this.state.enabled) {
            // We don't want to close the component if this is the component that triggered the open event
            if (this !== data) {
                this._close();
            }
        }
    }

    _handlePageClick(e) {
        // Ignore if the event has propagated from a child element of the nav (stopPropagation doesn't have any effect)
        if ($.contains(this.$el[0], e.target)) {
            return;
        }

        this._close();
    }

    // Clear any potentially troublesome styling that may have been applied to DOM elements by this component
    _cleanUp() {
        this.$panel.attr('style', '');
        this.$el.removeClass(this.options.hoveredModifier);
        this.$panel.removeClass(this.options.openPanelModifier);
        this.$subLists.removeClass(this.options.openListModifier);
    }

    _mqMatchEnableAtBreakpoint() {
        this.state.enabled = true;
    }

    _mqUnmatchEnableAtBreakpoint() {
        this.state.enabled = false;
        this._cleanUp();
    }
}

export default () => {
    return new MegaNavComponent();
};
