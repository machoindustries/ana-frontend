import BaseComponent from 'components/base-component';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';
import Modernizr from '../../lib/modernizr';
import $ from 'jquery';

class ViewMoreView extends BaseComponent {
    constructor() {
        let breakpointUnit = 1;
        super();

        this.defaultOptions = {
            selectors: {
                panel: '[data-view-more-panel]',
                panelItem: '[data-view-more-panel-item]',
                viewMore: '[data-view-more-trigger]',
            },
            maxPanelSearchOffset: 3,
            itemsPerRowMobileAttr: 'data-view-more-items-per-row-mobile',
            itemsPerRowTabletAttr: 'data-view-more-items-per-row-tablet',
            itemsPerRowDesktopAttr: 'data-view-more-items-per-row-desktop',
            numVisibleRowsAttr: 'data-view-more-num-visible-rows',
            panelBottomPadding: 150, // px
            mobileBreakpoint: Utils.getMediaQueryMax(breakpoints.medium - breakpointUnit),
            tabletBreakpoint: Utils.getMediaQueryMinMax(breakpoints.medium, breakpoints.large - breakpointUnit),
            desktopBreakpoint: Utils.getMediaQueryMin(breakpoints.large),
            reflowTime: 1000, // only used in browsers that lack support for requestAnimationFrame
        };

        this.state = {
            hasPanel: false,
            currentBreakpoint: 0,
            expanded: false,
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.selectors.viewMore);
        this._findPanel();

        if (!this.state.hasPanel) {
            this.$trigger.remove();
            return;
        }

        this.$panelItems = this.$panel.find(this.options.selectors.panelItem);

        this.itemsPerRowMobile = parseInt(this.$el.attr(this.options.itemsPerRowMobileAttr), 10);
        this.itemsPerRowTablet = parseInt(this.$el.attr(this.options.itemsPerRowTabletAttr), 10);
        this.itemsPerRowDesktop = parseInt(this.$el.attr(this.options.itemsPerRowDesktopAttr), 10);
        this.numVisibleRows = parseInt(this.$el.attr(this.options.numVisibleRowsAttr), 10);

        this._reset();
    }

    addListeners() {
        enquire.register(this.options.mobileBreakpoint, {
            deferSetup: true,
            match: this._matchMobileBreakpoint.bind(this),
        });
        enquire.register(this.options.tabletBreakpoint, {
            deferSetup: true,
            match: this._matchTabletBreakpoint.bind(this),
        });
        enquire.register(this.options.desktopBreakpoint, {
            deferSetup: true,
            match: this._matchDesktopBreakpoint.bind(this),
        });

        this.$trigger.on('click', this._handleTriggerClick.bind(this));
    }

    _reset() {
        // Don't reset if the component has already been expanded - prevents bugs when crossing breakpoints after expanding.
        if (!this.state.expanded) {
            this._setItemsPerRow();
            this._setPanelInitialHeight();
        }
    }

    _findPanel() {
        let $currentNode = this.$el;

        for (let so = 0; so < this.options.maxPanelSearchOffset; so++) {
            const $searchNodes = $currentNode.add($currentNode.siblings());
            let $panelNodes = $searchNodes.filter(this.options.selectors.panel);

            if ($panelNodes.length > 0) {
                this.$panel = $panelNodes.eq(0);
                this.state.hasPanel = true;

                // console.log('Found view more panel!');
            } else {
                $panelNodes = $searchNodes.find(this.options.selectors.panel);

                if ($panelNodes.length > 0) {
                    this.$panel = $panelNodes.eq(0);
                    this.state.hasPanel = true;

                    // console.log('Found view more panel!');
                } else {
                    $currentNode = $currentNode.parent();
                }
            }

            if (this.state.hasPanel) {
                return;
            }
        }

        // console.log(`ERROR: ViewMoreView._findPanel : no panel was found
        // within ${ this.options.maxPanelSearchOffset } ancestor levels.`);
    }

    _setItemsPerRow() {
        switch (this.state.currentBreakpoint) {
        case 0:
            this.numItemsPerRow = this.itemsPerRowMobile;
            break;
        case 1:
            this.numItemsPerRow = this.itemsPerRowTablet;
            break;
        case 2:
            this.numItemsPerRow = this.itemsPerRowDesktop;
            break;
        default:
            this.numItemsPerRow = this.itemsPerRowMobile;
            break;
        }
    }

    _deferredSetPanelHeight() {
        let panelHeight = 0;

        for (let r = 0; r < this.numVisibleRows; r++) {
            const startOffset = r * this.numItemsPerRow,
                rowItems = this.$panelItems.slice(startOffset, startOffset + this.numItemsPerRow);
            let tallestHeight = 0;

            rowItems.each((idx, elem) => {
                const elemHeight = $(elem).outerHeight();

                if (elemHeight > tallestHeight) {
                    tallestHeight = elemHeight;
                }
            });

            panelHeight = panelHeight + tallestHeight;
        }

        this.$panel.css('maxHeight', `${ panelHeight + this.options.panelBottomPadding }px`);
    }

    _setPanelInitialHeight() {
        if (Modernizr.requestanimationframe) {
            window.requestAnimationFrame(() => {
                this._deferredSetPanelHeight();
            });
        } else {
            window.setTimeout(() => {
                this._deferredSetPanelHeight();
            }, this.options.reflowTime);
        }
    }

    _handleTriggerClick(evt) {
        evt.preventDefault();

        this._openPanel();
    }

    _openPanel() {
        this.$trigger.parent().hide();
        this.$panel.css('maxHeight', 'none');
        this.$panel.addClass('is-active');

        this.state.expanded = true;
    }

    _matchMobileBreakpoint() {
        this.state.currentBreakpoint = 0;
        this._reset();
    }

    _matchTabletBreakpoint() {
        this.state.currentBreakpoint = 1;
        this._reset();
    }

    _matchDesktopBreakpoint() {
        this.state.currentBreakpoint = 2;
        this._reset();
    }
}

export default () => {
    return new ViewMoreView();
};
