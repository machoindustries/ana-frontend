import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import GTMUtils from 'modules/gtm-utils';
import $ from 'jquery';
import GTMHelper from 'modules/gtm-helper';

class FilterView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                form: '[data-filter-form]',
                searchBox: '[data-filter-search-field]',
                resultsPerPage: '[data-results-per-page]',
                sortBy: '[data-sort-by]',
            },
        };
    }

    initChildren() {
        this.$form = this.$el.find(this.options.selectors.form);
        this.$searchBox = this.$el.find(this.options.selectors.searchBox);
        this.$resultsPerPage = this.$el.find(this.options.selectors.resultsPerPage);
        this.$sortBy = this.$el.find(this.options.selectors.sortBy);

        this.gtmHelper = new GTMHelper();
        this.gtmHelper.init(this.$el);
    }

    addListeners() {
        this.$form.on('validsubmit', (e) => {
            const label = GTMUtils.valueOrFallback(`${this.$searchBox.val()} ${window.location.search}`);

            this.gtmHelper.customUserData();

            globalEmitter.emit('gtm.site-filtersearch', { label });
        });

        this.$resultsPerPage.on('change', (e) => {
            const $target = $(e.currentTarget);

            const label = GTMUtils.valueOrFallback($target.val());

            this.gtmHelper.customUserData();

            globalEmitter.emit('gtm.site-filterresultsperpage', { label });
        });

        this.$sortBy.on('change', (e) => {
            const $target = $(e.currentTarget);

            const label = GTMUtils.valueOrFallback($target.val());

            this.gtmHelper.customUserData();

            globalEmitter.emit('gtm.site-filtersortby', { label });
        });
    }
}

export default () => {
    return new FilterView();
};
