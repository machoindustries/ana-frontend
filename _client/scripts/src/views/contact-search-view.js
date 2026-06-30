import BaseComponent from 'components/base-component';
import 'chosen-js';
import globalEmitter from 'modules/global-emitter';

class ContactSearchView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                searchInput: '[data-contact-search-input]',
                resultsPanel: '[data-contact-search-result]',
                searchInstructions: '[data-contact-search-instructions]',
            },
            resultsPanelShowClass: 'c-contact-search__result--show',
            pageUrl: '/',
        };
    }

    initChildren() {
        this.$instructions = this.$el.find(this.options.selectors.searchInstructions);
        this.$result = this.$el.find(this.options.selectors.resultsPanel);
        this.$searchInput = this.$el.find(this.options.selectors.searchInput);
        this.$searchInput.chosen();
    }

    addListeners() {
        this.$searchInput.on('change', this._displayResult.bind(this));
    }

    _displayResult() {
        const $selectedOption = this.$searchInput.find('option:selected');

        if ($selectedOption.length > 0) {
            globalEmitter.emit('state.ContactSearch', { action: 'selected', name: $selectedOption.text() });

            this.$result.load(`${ this.options.pageUrl }BlockPartialHtml?content=${ $selectedOption.data('id') }`, () => {
                document.activeElement.blur();
                this.$instructions.hide();

                this.$result.addClass(this.options.resultsPanelShowClass);
            });
        }
    }
}

export default () => {
    return new ContactSearchView();
};
