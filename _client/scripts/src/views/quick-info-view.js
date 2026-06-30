import BaseComponent from 'components/base-component';
import animate from 'modules/animate';

class QuickInfoView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
        };

        this.defaultOptions = {
            selectors: {
                toggle: '[data-quick-info-toggle]',
                panel: '[data-quick-info-panel]',
            },
            activeClass: 'is-active',
            animDuration: 250,
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.selectors.toggle);
        this.$panel = this.$el.find(this.options.selectors.panel);
    }

    addListeners() {
        this.$trigger.on('click', this._handleTriggerClick.bind(this));

        this._closePanel(0);
    }

    _openPanel(duration) {
        const easing = 'ease-in-out',
            direction = 'slideDown';

        animate(this.$panel[0], direction, { duration, easing }, this);

        this.state.open = true;
        this.$panel.attr('aria-expanded', this.state.open);
        this.$el.addClass(this.options.activeClass);
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
        evt.preventDefault();

        if (this.state.open) {
            this._closePanel(this.options.animDuration);
        } else {
            this._openPanel(this.options.animDuration);
        }
    }

    _cleanUp() {
        this.$el.removeClass(this.options.activeClass);
    }
}

export default () => {
    return new QuickInfoView();
};
