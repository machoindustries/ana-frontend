import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'magnific-popup';
import Utils from 'modules/utils';
import breakpoints from 'values/breakpoints';

class SearchFiltersView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            enabled: true,
        };

        this.defaultOptions = {
            selectors: {
                link: '[data-filters-button]',
                clear: '[data-search-clear]',
                filters: '[data-search-filters]',
            },
            disableAtBreakpoint: Utils.getMediaQueryMin(breakpoints.medium),
        };
    }

    initChildren() {
        this.$link = this.$el.find(this.options.selectors.link);
        this.$clear = this.$el.find(this.options.selectors.clear);
        this.$filters = this.$el.find(this.options.selectors.filters).find('input[type="radio"]');
    }

    addListeners() {
        const self = this;

        $.magnificPopup.instance.close();

        this.$link.magnificPopup({
            prependTo: '.c-search-results__controls',
        });

        $(window).resize(() => {
            if (matchMedia(self.options.disableAtBreakpoint).matches) {
                self.$link.magnificPopup('close');
            }
        });

        this.$clear.click(() => {
            self.$filters.filter(':checked').prop('checked', false);
            self.$el.submit();
        });

        this.$filters.click(() => {
            self.$el.submit();
        });
    }
}

export default () => {
    return new SearchFiltersView();
};
