import BaseComponent from 'components/base-component';
import PublicationComponent from 'components/publication-component';
import AddUpdatePublicationComponent from 'components/add-update-publication-component';
import DeletePublicationComponent from 'components/delete-publication-component';

class AccountPublicationsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-publication-edit]',
                deleteComponent: '[data-account-publication-delete]',
            },
            lightboxEditSrcName: 'publicationedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new PublicationComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdatePublicationComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeletePublicationComponent();
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
    return new AccountPublicationsItemView();
};
