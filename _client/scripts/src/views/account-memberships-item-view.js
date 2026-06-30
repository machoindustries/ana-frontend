import BaseComponent from 'components/base-component';
import MembershipComponent from 'components/membership-component';
import AddUpdateMembershipComponent from 'components/add-update-membership-component';
import CancelMembershipComponent from 'components/cancel-membership-component';
import DeleteMembershipComponent from 'components/delete-membership-component';

class AccountMembershipsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {

            selectors: {
                editComponent: '[data-account-membership-edit]',
                deleteComponent: '[data-account-membership-delete]',
                cancelComponent: '[data-account-membership-cancel]',
            },
            lightboxEditSrcName: 'membershipedit',
            lightboxCancelSrcName: 'membershipcancel',
        };
    }

    initChildren() {
        this.data = {};

        this.displayComponent = new MembershipComponent();
        this.displayComponent.init(this.$el, {});
        this.editComponent = new AddUpdateMembershipComponent('edit', this.options.lightboxEditSrcName);
        this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
        this.deleteComponent = new DeleteMembershipComponent();
        this.deleteComponent.init(this.$el.find(this.options.selectors.deleteComponent), {});
        this.cancelComponent = new CancelMembershipComponent('cancel', this.options.lightboxCancelSrcName);
        this.cancelComponent.init(this.$el.find(this.options.selectors.cancelComponent), {});
    }

    _populateData() {
        this.displayComponent.setData(this.data);
        this.editComponent.setData(this.data);
        this.cancelComponent.setData(this.data);
    }

    setData(data) {
        this.data = data;

        this._populateData();
    }
}

export default () => {
    return new AccountMembershipsItemView();
};
