import BaseComponent from 'components/base-component';
import ProfessionaServiceComponent from 'components/professional-service-component';
import AddUpdateProfessionaServiceComponent from 'components/add-update-professional-service-component';
import DeleteProfessionaServiceComponent from 'components/delete-professional-service-component';

class AccountProfessionalServicesItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-professional-service-edit]',
                deleteComponent: '[data-account-professional-service-delete]',
            },
            lightboxEditSrcName: 'professionalserviceedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new ProfessionaServiceComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdateProfessionaServiceComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeleteProfessionaServiceComponent();
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
    return new AccountProfessionalServicesItemView();
};
