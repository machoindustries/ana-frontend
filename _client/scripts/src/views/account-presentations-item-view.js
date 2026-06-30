import BaseComponent from 'components/base-component';
import PresentationComponent from 'components/presentation-component';
import AddUpdatePresentationComponent from 'components/add-update-presentation-component';
import DeletePresentationComponent from 'components/delete-presentation-component';

class AccountPresentationsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-presentation-edit]',
                deleteComponent: '[data-account-presentation-delete]',
            },
            lightboxEditSrcName: 'presentationedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new PresentationComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdatePresentationComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeletePresentationComponent();
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
    return new AccountPresentationsItemView();
};
