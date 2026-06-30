import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';

class DropdownComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            openModifier: 'is--open',
            openDuration: 250,
            closeDuration: 250,
            selectElementSelector: '[data-dropdown-select]',
            optionsElementSelector: '[data-dropdown-options]',
            openOnHoverClass: 'dropdown-hover',
            desktopBreakpoint: Utils.getMediaQueryMin(breakpoints.medium),
        };

        this.state = {
            open: false,
        };
    }

    initChildren() {
        this.$select = this.$el.find(this.options.selectElementSelector);
        this.$options = this.$el.find(this.options.optionsElementSelector);

        this.openOnHover = this.$el.hasClass(this.options.openOnHoverClass);
    }

    addListeners() {
        const self = this;

        this.$select.on('click', this._handleClick.bind(this));

        console.log(this.options.desktopBreakpoint);
        console.log(window.matchMedia(self.options.desktopBreakpoint).matches);

        if (this.openOnHover) {
            this.$el.on('mouseenter mouseleave', (e) => {
                if (window.matchMedia(self.options.desktopBreakpoint).matches) {
                    self._handleClick(e);
                }
            });
        }
    }

    addAriaAttributes() {
        const selectId = this.$select.attr('id'),
            optionsId = this.$options.attr('id');

        this.$select.attr('aria-haspopup', true);
        this.$select.attr('aria-owns', optionsId);
        this.$select.attr('aria-controls', optionsId);
        this.$options.attr('role', 'group');
        this.$options.attr('aria-labelledby', selectId);
        this.$options.attr('aria-expanded', false);
    }

    open(showAnim) {
        this.state.open = true;
        this._updateState(showAnim);
    }

    close(showAnim) {
        this.state.open = false;
        this._updateState(showAnim);
    }

    toggle() {
        this.state.open = !this.state.open;
        this._updateState(true);
    }

    _updateState(showAnim) {
        const easing = 'ease-in-out';

        let duration = this.options.closeDuration,
            direction = 'slideUp',
            completeHandler = this._closeCompleteHandler.bind(this);

        this.$options.attr('aria-expanded', this.state.open);

        if (this.state.open) {
            duration = this.options.openDuration;
            direction = 'slideDown';
            completeHandler = () => {}; // Empty function

            this.$el.addClass(this.options.openModifier);

            this.emit('dropdowncomponent:open');
        }

        if (!showAnim) {
            duration = 0;
        }

        animate(this.$options[0], direction, { duration, easing }, this)
            .then(completeHandler);

        if (this.state.open) {
            this.$el.addClass(this.options.openModifier);
        } else {
            this.$el.removeClass(this.options.openModifier);
        }
    }

    _closeCompleteHandler() {
        this.$el.removeClass(this.options.openModifier);
    }

    _handleClick(evt) {
        evt.preventDefault();

        this.toggle();
    }
}

export default () => {
    return new DropdownComponent();
};
