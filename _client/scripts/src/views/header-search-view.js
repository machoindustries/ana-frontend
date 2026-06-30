import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';

class HeaderSearchView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
        };

        this.defaultOptions = {
            selectors: {
                triggerButton: '[data-search-trigger]',
                searchPanel: '[data-search-panel]',
                controlsWrapper: '[data-search-controls-wrapper]',
                searchInput: '[data-search-input]',
            },
            visibleClass: 'is--visible',
            activeClass: 'is--active',
            fadedInClass: 'is--faded-in',
            fadeInDelay: 60,
            escKey: 27,
        };
    }

    initChildren() {
        this.$panel = this.$el.find(this.options.selectors.searchPanel);
        this.$searchInput = this.$panel.find(this.options.selectors.searchInput);
        this.$triggerButton = this.$el.find(this.options.selectors.triggerButton);
        this.$controlsWrapper = this.$el.find(this.options.selectors.controlsWrapper);
    }

    addListeners() {
        const self = this;

        this.$triggerButton.on('click', this._handleTriggerButtonClick.bind(this));

        $('body').on('keydown', (e) => {
            if (e.keyCode === self.options.escKey && self.state.open) {
                self._close();
                self.$triggerButton.focus();
            }
        });

        $('body').on('click', (e) => {
            const searchPanelClicked = $(e.target).closest('.e-header-search').length > 0;

            if (!searchPanelClicked && self.state.open) {
                self._close();
            }
        });

        globalEmitter.on('meganavcomponent:open', this._handleMegaNavComponentOpen.bind(this));
    }

    _open() {
        globalEmitter.emit('meganavcomponent:open', this);
        this.$panel.addClass(this.options.visibleClass);
        this.$triggerButton.addClass(this.options.activeClass);

        setTimeout(() => {
            this.$controlsWrapper.addClass(this.options.fadedInClass);
        }, this.options.fadeInDelay);

        setTimeout(() => {
            this.$searchInput.focus();
        }, 1);

        this.state.open = true;
    }

    _close() {
        this.$panel.removeClass(this.options.visibleClass);
        this.$triggerButton.removeClass(this.options.activeClass);
        this.$controlsWrapper.removeClass(this.options.fadedInClass);

        this.state.open = false;
    }

    _handleTriggerButtonClick(e) {
        e.preventDefault();

        if (this.state.open) {
            this._close();
        } else {
            this._open();
        }
    }

    _handleMegaNavComponentOpen(data) {
        if (this !== data) {
            this._close();
        }
    }
}

export default () => {
    return new HeaderSearchView();
};
