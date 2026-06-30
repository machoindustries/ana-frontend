import BaseComponent from 'components/base-component';
import AcademicCreditComponent from 'components/academic-credit-component';
import AddUpdateAcademicCreditComponent from 'components/add-update-academic-credit-component';
import DeleteAcademicCreditComponent from 'components/delete-academic-credit-component';

class AccountAcademicCreditsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-academic-credit-edit]',
                deleteComponent: '[data-account-academic-credit-delete]',
            },
            lightboxEditSrcName: 'creditedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new AcademicCreditComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdateAcademicCreditComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeleteAcademicCreditComponent();
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
    return new AccountAcademicCreditsItemView();
};
