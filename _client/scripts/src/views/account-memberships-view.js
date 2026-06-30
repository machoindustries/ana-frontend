import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateMembershipComponent from 'components/add-update-membership-component';
import AccountMembershipsItemView from 'views/account-memberships-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import APIProxy from 'modules/api-proxy';

class AccountMembershipsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-memberships-table]',
                list: '[data-account-memberships-list]',
                noResults: '[data-account-memberships-no-results]',
                addComponent: '[data-account-membership-add]',
            },
            clientServerKeyMappings: {
                membershipId: 'MembershipId',
                association: 'Association',
                description: 'Description',
                startDate: 'StartDate',
                endDate: 'EndDate',
                nextPaymentDate: 'NextPaymentDate',
                formattedStartDate: 'FormattedStartDate',
                formattedEndDate: 'FormattedEndDate',
                membershipPortalUrl: 'MembershipPortalUrl',
                orderNumber: 'OrderNumber',
                orderTotal: 'OrderTotal',
                ctaTextPrintCertificate: 'CTATextPrintCertificate',
                ctaUrlPrintCertificate: 'CTAUrlPrintCertificate',
                ctaTextPrintCard: 'CTATextPrintCard',
                ctaUrlPrintCard: 'CTAUrlPrintCard',
                ctaCancel: 'CTACancel',
            },
            itemLineOutputAttrs: {
                membershipId: 'data-membership-id',
                description: 'data-membership-description',
                formattedStartDate: 'data-membership-start-date',
                formattedEndDate: 'data-membership-end-date',
            },
            lightboxEditSrcName: 'membershipedit',
            lightboxCancelSrcName: 'membershipconfirm',
            editText: 'Edit',
            editTriggerAttr: 'data-account-membership-edit',

            deleteText: 'Remove',
            deleteTriggerAttr: 'data-account-membership-delete',

            cancelText: 'Cancel Membership<br>',
            cancelTriggerAttr: 'data-account-membership-cancel',

            associationId: 'data-association-id',
            associationDescAttr:'data-association-description',

            itemAttr: 'data-account-memberships-item',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$list = this.$el.find(this.options.selectors.list);
        this.$table = this.$el.find(this.options.selectors.table);
        this.$noResults = this.$el.find(this.options.selectors.noResults);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateMembershipComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatemembership:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deletemembership:deleted', this._onDataDeleted.bind(this));
        globalEmitter.on('cancelmembershipaction:cancelled', this._onMembershipCancelled.bind(this));


        this._getDataFromServer();

        this.$el.find('.compare-membership-benefits-btn').magnificPopup({
            type: 'inline',
            midClick: true
        });
    }

    _onMembershipCancelled() {
        window.location.reload();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }
    _onDataDeleted() {
        this._getDataFromServer();
    }


    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        const self = this;

        APIProxy.request({
            api: 'getMemberships',
            success: (data) => {
                this._storeData(data);
                this._createList();
                this._showHide();

                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);

                let responseStatus = '(no response JSON found; cannot display error details)';

                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }

                $.magnificPopup.instance.close();

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContent('membership', 'get', `${status} ${responseStatus}`, err),
                        type: 'inline',
                    },
                    callbacks: {
                        open() {
                            setTimeout(() => {
                                self.$el.off('click.magnificPopup');

                                lightboxUtils.bindOpenModalButtons();
                            }, 0);
                        },
                    },
                }).magnificPopup('open');
            },
        });
    }

    _storeData(data) {
        this.data.length = 0;

        for (let d = 0; d < data.length; d++) {
            this._storeDataItem(data[d]);
        }
    }

    _storeDataItem(dataItem) {
        const convertedJSON = Utils.convertJSONKeysServerToClient(JSON.stringify(dataItem), this.options.clientServerKeyMappings);

        this.data.push(JSON.parse(convertedJSON));
    }

    _createList() {
        let listHtml = '';

        for (let d = 0; d < this.data.length; d++) {
            listHtml = listHtml + this._getPopulatedItemHtml(this.data[d]);
        }

        this.$list.html(listHtml);

        setTimeout(() => {
            this._instantiateItemViews();

            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
    }

    _showHide() {
        if (this.data.length > 0) {
            this.$noResults.hide();
            this.$table.show();
        } else {
            this.$table.hide();
            this.$noResults.show();
        }
    }

    _instantiateItemViews() {
        this.itemViewInstances.length = 0;

        const $itemViews = this.$list.find(`[${this.options.itemAttr}]`);

        if ($itemViews.length !== this.data.length) {
            console.log('ERROR: account-memberships-view.js : number of views in DOM does not reflect number of stored memberships.');
            return;
        }

        for (let d = 0; d < this.data.length; d++) {
            const instance = new AccountMembershipsItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data[d]);

            this.itemViewInstances.push(instance);
        }
    }

_getPopulatedItemHtml(data) {
    const editStyle = this._hideEditButton(data.association) ? 'style="display: none;"' : '';
    const printCardStyle = this._hidePrintCartButton(data.ctaTextPrintCard) ? 'style="display: none;"' : '';
    const cancelStyle = this._hideCancelButton(data.ctaCancel) ? 'style="display: none;"' : '';

    const actionCellHtml = [
        `<a href='${data.membershipPortalUrl}' ${this.options.editTriggerAttr} ${editStyle}>${this.options.editText}</a>`,
        `<a href='#' ${this.options.associationDescAttr}="${data.description}" ${this.options.associationId}="${data.association}" ${this.options.deleteTriggerAttr} ${editStyle}>/${this.options.deleteText}</a>`,
        `<a href='${data.ctaUrlPrintCertificate}' target='_blank' ${printCardStyle}>${data.ctaTextPrintCertificate}</a>`,
        `<a href='${data.ctaUrlPrintCard}' target='_blank' ${printCardStyle}>${data.ctaTextPrintCard}</a>`,
        `<a href='#' ${this.options.cancelTriggerAttr} ${cancelStyle}>${this.options.cancelText}</a>`,
    ].join(' ');

    return `<tr ${this.options.itemAttr}>
                <td ${this.options.itemLineOutputAttrs.description}>${data.description}</td>
                <td ${this.options.itemLineOutputAttrs.membershipId}>${data.membershipId}</td>
                <td ${this.options.itemLineOutputAttrs.formattedStartDate}>${data.formattedStartDate}</td>
                <td ${this.options.itemLineOutputAttrs.formattedEndDate}>${data.formattedEndDate}</td>
                <td>${actionCellHtml}</td>
            </tr>`;
}

    _hideEditButton(association) {
        switch (association) {
        case 'EMEMBER':
        case 'SUBSCRIBER':
        case 'ANA_ONLY':
        case 'ANA':
        case 'STATE_ONLY':
        case 'AFFILIATE':
            return true;
        default:
            return false;
        }
    }
    _hideCancelButton(ctaprinttext) {
        if (ctaprinttext === 'Cancel Membership<br>') {
            return false;
        }
        return true;
    }
    _hidePrintCartButton(ctaprinttext) {
        if (ctaprinttext === 'Cancel') {
            return true;
        }
        return false;
    }
}

export default () => {
    return new AccountMembershipsView();
};
