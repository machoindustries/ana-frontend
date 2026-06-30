import BaseComponent from 'components/base-component';
import PreceptorshipComponent from 'components/preceptorship-component';
import AddUpdatePreceptorshipComponent from 'components/add-update-preceptorship-component';
import DeletePreceptorshipComponent from 'components/delete-preceptorship-component';

class AccountPreceptorshipsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-preceptorship-edit]',
                deleteComponent: '[data-account-preceptorship-delete]',
            },
            lightboxEditSrcName: 'preceptorshipedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new PreceptorshipComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdatePreceptorshipComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeletePreceptorshipComponent();
        this.deleteComponent.init(this.$el.find(this.options.selectors.deleteComponent), {});
    }

    _populateData() {
        this.displayComponent.setData(this.data);
        this.editComponent.setData(this.data);
    }

    setData(data) {
        this.data = data;

        this._populateData();
    }
}

export default () => {
    return new AccountPreceptorshipsItemView();
};
