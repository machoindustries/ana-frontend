import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';

class NavTrayComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            triggerSelector: '[data-primary-nav-trigger]',
            traySelector: '[data-primary-nav-tray]',
            navItemSelector: '[data-primary-nav-item]',
            navLevelDataAttr: 'data-nav-level',
            openModifier: 'is--open',
            currentModifier: 'is--current',
            seniorModifier: 'is--senior',
            hiddenModifier: 'is--hidden',
            animDuration: 250,
            animEasing: 'ease-in-out',
            animDelay: 250,
            animProps: {
                toOpen: 'slideDown',
                toClosed: 'slideUp',
            },
            breakpoints: {
                tablet: Utils.getMediaQueryMax(breakpoints.xlarge - 1),
                desktop: Utils.getMediaQueryMin(breakpoints.xlarge),
            },
        };

        this.state = {
            open: false,
            enabled: !window.isIE8,
        };
    }

    initChildren() {
        this.$parentTrigger = this.options.parentTrigger;
        this.$trigger = this.$el.children(this.options.triggerSelector);

        // this.$siblingItems = this.$trigger.parent(this.options.navItemSelector)
        //      .siblings(this.options.navItemSelector);

        // console.log(`[${this.options.navLevelDataAttr}=${this.options.navLevel - 1}]`);

        this.$siblingItems = this.$el.closest('ul').find(this.options.navItemSelector)
            .filter(`[${this.options.navLevelDataAttr}=${this.options.navLevel - 1}]`)
            .not(this.$el);

        this.$tray = this.$el.children(this.options.traySelector);

        this.$navItems = this.$tray.find(this.options.navItemSelector)
            .filter(`[${ this.options.navLevelDataAttr }=${ this.options.navLevel }]`);

        this.$navItems.each((index, elem) => {
            elem.navTrayComponent = new NavTrayComponent();

            elem.navTrayComponent.init($(elem),
                { navLevel: this.options.navLevel + 1,
                    parentTrigger: this.$el, rootItem: this.options.rootItem });
        });
    }

    addListeners() {
        if (!this.$trigger.length) {
            // console.log('Warning: nav-tray-component.js : no trigger element found!');
            return;
        }

        // Register query and handler with enquire
        // http://wicky.nillia.ms/enquire.js/
        enquire.register(this.options.breakpoints.tablet, {
            deferSetup: true,
            match: this._mqMatchTablet.bind(this),
        });
        enquire.register(this.options.breakpoints.desktop, {
            deferSetup: true,
            match: this._mqMatchDesktop.bind(this),
        });

        this.$trigger.on('click', this._handleTriggerClick.bind(this));

        globalEmitter.on('navtraycomponent:open', this._handleNavTrayComponentOpen.bind(this));
    }

    addAriaAttributes() {

    }

    openTray() {
        if (!this.state.open) {
            if (!this.$tray.length) {
                console.log('Warning: nav-tray-component.js : no tray element found!');
                return;
            }

            this.$tray.addClass(this.options.openModifier);

            const duration = this.options.animDuration,
                easing = this.options.animEasing,
                delay = this.options.animDelay,
                animProps = this.options.animProps.toOpen;

            animate(this.$tray[0], animProps, { duration, easing, delay }, this);

            globalEmitter.emit('navtraycomponent:open', this);

            this.state.open = true;
        }
    }

    closeTray() {
        if (this.state.open) {
            if (!this.$tray.length) {
                console.log('Warning: nav-tray-component.js : no tray element found!');
                return;
            }

            const duration = this.options.animDuration,
                easing = this.options.animEasing,
                animProps = this.options.animProps.toClosed;

            animate(this.$tray[0], animProps, { duration, easing }, this)
                .then(this._onCloseComplete.bind(this));

            this.state.open = false;
        }
    }

    _onCloseComplete() {
        this.$tray.removeClass(this.options.openModifier);
        this.$siblingItems.removeClass(this.options.hiddenModifier);
    }

    _handleTriggerClick(evt) {
        if (this.state.enabled && this.$navItems.length > 0) {
            // Override default behaviour unless the link has a current state modifier
            const target = evt.target || evt.srcElement,
                $target = $(target).closest(this.options.navItemSelector);

            if (!$target.hasClass(this.options.currentModifier)) {
                evt.preventDefault();

                if (this.state.open) {
                    // If the item is senior (has open children), close any child items
                    if ($target.hasClass(this.options.seniorModifier)) {
                        this.$navItems.each((index, elem) => {
                            elem.navTrayComponent.closeTray();
                            elem.navTrayComponent.$el.removeClass(this.options.currentModifier);
                            elem.navTrayComponent.$el.removeClass(this.options.seniorModifier);
                        });

                        const $triggerWrap = this.$trigger.parent(this.options.navItemSelector);
                        $triggerWrap.removeClass(this.options.seniorModifier);
                        $triggerWrap.addClass(this.options.currentModifier);

                        // Otherwise close the item itself
                    } else {
                        this.$siblingItems.removeClass(this.options.hiddenModifier);
                        this.$parentTrigger.removeClass(this.options.seniorModifier);
                        this.$parentTrigger.addClass(this.options.currentModifier);
                        this.$el.removeClass(this.options.currentModifier);
                        this.$el.removeClass(this.options.seniorModifier);

                        this.closeTray();
                    }
                } else {
                    this.$siblingItems.addClass(this.options.hiddenModifier);
                    this.$parentTrigger.addClass(this.options.seniorModifier);
                    this.$parentTrigger.removeClass(this.options.currentModifier);
                    this.$el.addClass(this.options.currentModifier);

                    this.openTray();
                }
            }
        }
    }

    isParentOf(navTrayComponent) {
        // Recursively search child instances of this component,
        // returning true if the supplied component is found, false otherwise
        let ret = false;

        for (let i = 0; i < this.$navItems.length; i++) {
            const item = this.$navItems[i];

            if (item.navTrayComponent === navTrayComponent) {
                return true;
            } else if (item.navTrayComponent.$navItems.length) {
                ret = item.navTrayComponent.isParentOf(navTrayComponent);
            }
        }

        return ret;
    }

    _handleNavTrayComponentOpen(data) {
        if (this.state.enabled) {
            // We don't want to close the tray if this is the tray that triggered the open event
            if (this !== data) {
                // We don't want to close the tray if it is a parent of the tray that was opened
                if (!this.isParentOf(data)) {
                    this.$el.removeClass(this.options.currentModifier);
                    this.$el.removeClass(this.options.seniorModifier);

                    this.closeTray();
                }
            }
        }
    }

    // Clear any potentially troublesome styling that may have been applied to DOM elements by this component
    _cleanUp() {
        this.$tray.attr('style', '');
        this.$tray.removeClass(this.options.openModifier);
        this.$siblingItems.removeClass(this.options.hiddenModifier);
        this.$parentTrigger.removeClass(this.options.seniorModifier);
        this.$parentTrigger.removeClass(this.options.currentModifier);
        this.$el.removeClass(this.options.currentModifier);
        this.$el.removeClass(this.options.seniorModifier);
    }

    _mqMatchTablet() {
        console.log('Tablet match, NavTrayComponent');

        this.state.enabled = true;

        // Give the first top-level item 'current' status
        if (!this.options.rootItem.hasClass(this.options.currentModifier)) {
            this.options.rootItem.addClass(this.options.currentModifier);
        }
    }

    _mqMatchDesktop() {
        console.log('Desktop match, NavTrayComponent');

        this.state.enabled = false;
        this._cleanUp();
    }
}

export default () => {
    return new NavTrayComponent();
};
