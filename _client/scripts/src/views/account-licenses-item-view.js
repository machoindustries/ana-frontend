import BaseComponent from 'components/base-component';
import LicenseComponent from 'components/license-component';
import AddUpdateLicenseComponent from 'components/add-update-license-component';

class AccountLicensesItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                editComponent: '[data-account-license-edit]',
            },
            lightboxEditSrcName: 'licenseedit',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new LicenseComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdateLicenseComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
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
    return new AccountLicensesItemView();
};
