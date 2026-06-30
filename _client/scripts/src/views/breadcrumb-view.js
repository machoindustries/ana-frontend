import BaseComponent from 'components/base-component';
import $ from 'jquery';

class BreadcrumbView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                listItem: '[data-breadcrumb-list-item]',
                collapsedList: '[data-breadcrumb-collapsed-list]',
                expandButton: '[data-breadcrumb-expand]',
            },
            expandedModifierClass: 'is-expanded',
            itemsToShow: 2,
        };
    }

    initChildren() {
        this.$listItems = this.$el.find(this.options.selectors.listItem);
        this.$collapsedList = this.$el.find(this.options.selectors.collapsedList);
        this.$expandButton = this.$el.find(this.options.selectors.expandButton);

        // Move all but last itemsToShow items into a separate collapsed list
        this.$listItems.each((idx, elem) => {
            if (idx < this.$listItems.length - this.options.itemsToShow) {
                this.$collapsedList.append($(elem).remove());
            }
        });

        this.$expandButton.on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            this.$collapsedList.toggleClass(this.options.expandedModifierClass);
        });

        this.$collapsedList.on('click', (e) => {
            e.stopPropagation();
        });

        $(document).on('click', () => {
            this.$collapsedList.removeClass(this.options.expandedModifierClass);
        });
    }

    addListeners() {

    }
}

export default () => {
    return new BreadcrumbView();
};
