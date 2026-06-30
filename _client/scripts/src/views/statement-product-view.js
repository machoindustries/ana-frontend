import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';

class StatementProductView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            open: false,
        };

        this.defaultOptions = {
            selectors: {
                secondaryPanel: '[data-secondary-panel]',
                trigger: '[data-trigger]',
                closeBtn: '[data-panel-close]',
            },
            activeClass: 'is-active',
            headingClass: '.c-statement-product__title',
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.selectors.trigger);
        this.$closeBtn = this.$el.find(this.options.selectors.closeBtn);
        this.$overlayPanel = this.$el.find(this.options.selectors.secondaryPanel);
    }

    addListeners() {
        this.$trigger.on('click', this._handleTriggerClick.bind(this));
        this.$closeBtn.on('click', this._handleCloseBtnClick.bind(this));

        this._closePanel(0);
    }

    _openPanel() {
        this.state.open = true;
        this.$overlayPanel.attr('aria-expanded', this.state.open);
        this.$el.addClass(this.options.activeClass);

        globalEmitter.emit('state.gtmVirtualPageView', this.$el.find(this.options.headingClass).text());
    }

    _closePanel() {
        this.state.open = false;
        this.$overlayPanel.attr('aria-expanded', this.state.open);
        this.$el.removeClass(this.options.activeClass);
    }

    _handleCloseBtnClick(evt) {
        evt.preventDefault();

        this._closePanel();
    }

    _handleTriggerClick(evt) {
        evt.preventDefault();

        if (this.state.open) {
            this._closePanel();
        } else {
            this._openPanel();
        }
    }
}

export default () => {
    return new StatementProductView();
};
