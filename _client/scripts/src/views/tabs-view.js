import BaseComponent from 'components/base-component';
import $ from 'jquery';

class TabsView extends BaseComponent {
    constructor() {
        super();

        this.state = { };

        this.defaultOptions = {
            selectors: {
                tabTrigger: '[data-tab-trigger]',
                tabPanel: '[data-tab-panel]',
            },
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.defaultOptions.selectors.tabTrigger);
        this.$tab = this.$el.find(this.defaultOptions.selectors.tabPanel);
    }

    addListeners() {
        this.$trigger.each(this._initTrigger.bind(this));
    }

    _initTrigger(index, el) {
        $(el).on('click', this._handleTriggerClick.bind(this));
    }

    _handleTriggerClick(evt) {
        evt.preventDefault();

        const tabButton = this.$el.find(evt.target),
            tabPanel = this.$el.find(`[data-tab-panel="${tabButton.attr('data-tab-trigger')}"]`);

        if (!tabButton.hasClass('is-active')) {
            this._toggleContent(tabButton, tabPanel);
        }
    }

    _toggleContent(tabButton, tabPanel) {
        this.$trigger.removeClass('is-active');
        this.$tab.removeClass('is-active');

        tabButton.addClass('is-active');
        tabPanel.addClass('is-active');
    }
}

export default () => {
    return new TabsView();
};
