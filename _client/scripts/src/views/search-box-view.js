/* eslint id-length: ["warn", { "exceptions": ["e"] }] */
import BaseComponent from 'components/base-component';

class SearchBoxView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                searchInput: '[data-search-input]',
            },
            hasContentClass: 'has--content',
        };
    }

    initChildren() {
        this.$input = this.$el.find(this.options.selectors.searchInput);
    }

    addListeners() {
        this.$input.on('keyup', this._handleSearchInputKeyup.bind(this));
        this.$input.on('focus', this._handleFocusState.bind(this, true));
        this.$input.on('blur', this._handleFocusState.bind(this, false));
    }

    _handleFocusState(isFocused) {
        if (isFocused) {
            this.$el.addClass('is-focused');
        } else {
            this.$el.removeClass('is-focused');
        }
    }

    _handleSearchInputKeyup(e) {
        if (this.$input.val().length > 0) {
            this.$input.addClass(this.options.hasContentClass);
        } else {
            this.$input.removeClass(this.options.hasContentClass);
        }
    }
}

export default () => {
    return new SearchBoxView();
};
