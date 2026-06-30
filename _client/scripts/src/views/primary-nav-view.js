import BaseComponent from 'components/base-component';
import NavTrayComponent from 'components/nav-tray-component';
import MegaNavComponent from 'components/mega-nav-component';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import animate from 'modules/animate';

class PrimaryNavView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
        };

        this.defaultOptions = {
            selectors: {
                navButton: '[data-nav-button]',
                navWrap: '[data-primary-nav-wrap]',
                navList: '[data-primary-nav-list]',
                navItem: '[data-primary-nav-item]',
                navRootItem: '[data-primary-nav-root]',
                navItemWithChildrenClass: 'e-nav-primary__item--has-children',
            },
            navLevelDataAttr: 'data-nav-level',
            navLevel: 1,
            openModifier: 'is--open',
            currentModifier: 'is--current',
            seniorModifier: 'is--senior',
            navAnimDuration: 250,
            navAnimEasing: 'ease-in-out',
            navAnimDelay: 0,
            navAnimProps: {
                toOpen: {
                    translateX: [ '0%', '-100%' ],
                },
                toClosed: {
                    translateX: [ '-100%', '0%' ],
                },
            },
            cleanUpAtBreakpoint: Utils.getMediaQueryMin(breakpoints.xlarge),
        };
    }

    initChildren() {
        this.$navButton = this.$el.siblings(this.options.selectors.navButton);
        this.$rootItem = this.$el.find(this.options.selectors.navRootItem);
        this.$navWrap = this.$el.find(this.options.selectors.navWrap);
        this.$navList = this.$el.find(this.options.selectors.navList);
        this.$navItems = this.$navList.find(this.options.selectors.navItem)
            .filter(`[${ this.options.navLevelDataAttr }=${ this.options.navLevel }]`);

        // Instantiate tray components to handle mobile nav sub-items
        this.$navItems.each((index, elem) => {
            elem.navTrayComponent = new NavTrayComponent();
            elem.navTrayComponent.init($(elem), { navLevel: this.options.navLevel + 1,
                parentTrigger: this.$rootItem, rootItem: this.$rootItem });
        });

        this.$rootItem.megaNavComponent = new MegaNavComponent();
        this.$rootItem.megaNavComponent.init(this.$rootItem);

        // Instantiate mega nav dropdown components to handle desktop nav items
        this.$navItems.each((index, elem) => {
            elem.megaNavComponent = new MegaNavComponent();
            elem.megaNavComponent.init($(elem));
        });
    }

    addListeners() {
        this.$navButton.on('click', this._toggleNav.bind(this));
        this.$rootItem.on('click', this._handleRootItemClick.bind(this));

        // Register query and handler with enquire
        // http://wicky.nillia.ms/enquire.js/
        enquire.register(this.options.cleanUpAtBreakpoint, {
            deferSetup: true,
            match: this._cleanUp.bind(this),
        });
    }

    _toggleNav(evt) {
        evt.preventDefault();

        if (this.state.open) {
            animate(
                this.$navWrap,
                this.options.navAnimProps.toClosed,
                {
                    duration: this.options.navAnimDuration,
                    easing: this.options.navAnimEasing,
                    delay: this.options.navAnimDelay,
                },
                this
            );

            this.$navButton.removeClass(this.options.openModifier);
            this.$el.removeClass(this.options.openModifier);

            globalEmitter.emit('primarynavview:toggled', this);
        } else {
            animate(
                this.$navWrap,
                this.options.navAnimProps.toOpen,
                {
                    duration: this.options.navAnimDuration,
                    easing: this.options.navAnimEasing,
                    delay: this.options.navAnimDelay,
                },
                this
            );

            this.$navButton.addClass(this.options.openModifier);
            this.$el.addClass(this.options.openModifier);
        }

        this.state.open = !this.state.open;

        globalEmitter.emit('primarynavview:toggled', this);
    }

    _handleRootItemClick(evt) {
        if (this.$rootItem.hasClass(this.options.selectors.navItemWithChildrenClass) &&
            (this.$rootItem.hasClass(this.options.currentModifier) || this.$rootItem.hasClass(this.options.seniorModifier))) {
            evt.preventDefault();

            this.$rootItem.removeClass(this.options.seniorModifier);
            this.$rootItem.addClass(this.options.currentModifier);

            globalEmitter.emit('navtraycomponent:open', this);
        }
    }

    _cleanUp() {
        this.$navWrap.attr('style', '');
    }
}

export default () => {
    return new PrimaryNavView();
};
