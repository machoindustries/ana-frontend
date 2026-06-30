import BaseComponent from 'components/base-component';

class CTADownloadView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                link: '[data-link]',
                checkbox: '[data-confirmation-checkbox]',
            },
            clickAllowedAttr: 'data-allow-click',
            disabledClass: 'is--disabled',
        };
    }

    initChildren() {
        this.$el.addClass(this.options.disabledClass);
        this.$link = this.$el.find(this.options.selectors.link);
        this.$checkbox = this.$el.find(this.options.selectors.checkbox);
    }

    addListeners() {
        this.$link.on('click', this._handleDownloadClick.bind(this));
        this.$checkbox.on('change', this._handleCheckboxChange.bind(this));
    }

    _handleDownloadClick(evt) {
        if (this.$checkbox.is(':checked') === false) {
            evt.preventDefault();
        }
    }

    _handleCheckboxChange() {
        if (this.$checkbox.is(':checked')) {
            this.$el.removeClass(this.options.disabledClass);
        } else {
            this.$el.addClass(this.options.disabledClass);
        }
    }
}

export default () => {
    return new CTADownloadView();
};
