import BaseComponent from 'components/base-component';
import ContinuingEducationComponent from 'components/continuing-education-component';
import AddUpdateContinuingEducationComponent from 'components/add-update-continuing-education-component';
import DeleteContinuingEducationComponent from 'components/delete-continuing-education-component';

class AccountContinuingEducationItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-continuing-education-edit]',
                deleteComponent: '[data-account-continuing-education-delete]',
            },
            lightboxEditSrcName: 'continuingeducationedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new ContinuingEducationComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdateContinuingEducationComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeleteContinuingEducationComponent();
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
    return new AccountContinuingEducationItemView();
};
