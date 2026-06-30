import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateContinuingEducationComponent from 'components/add-update-continuing-education-component';
import AccountContinuingEducationItemView from 'views/account-continuing-education-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AccountContinuingEducationView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-continuing-education-table]',
                list: '[data-account-continuing-education-list]',
                noResults: '[data-account-continuing-education-no-results]',
                addComponent: '[data-account-continuing-education-add]',
                totalHours: '[data-account-continuing-education-total-hours]',
                totalPharm: '[data-account-continuing-education-total-pharma]',
            },
            clientServerKeyMappings: {
                continuingEducationItemId: 'ProfessionalDevContiEdusId',
                subject: 'Subject',
                sponsor: 'Sponsor',
                offeredDate: 'DateOfOffering',
                formattedDate: 'FormattedDate',
                contactHours: 'ContactHours',
                approved: 'ANCCApproved',
                pharmHrs: 'PharmHrs',
                description: 'Description',
                totalHours: 'TotalHours',
                total: 'Total',
                list: 'List',
            },
            itemLineOutputAttrs: {
                subject: 'data-continuing-education-subject',
                description: 'data-continuing-education-description',
                sponsor: 'data-continuing-education-sponsor',
                formattedDate: 'data-continuing-education-offered-date',
                contactHours: 'data-continuing-education-contact-hours',
                approved: 'data-continuing-education-approved',
                pharmHrs: 'data-continuing-education-pharm-hours',
            },
            lightboxEditSrcName: 'continuingeducationedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-continuing-education-edit',
            deleteText: 'Delete',
            deleteTriggerAttr: 'data-account-continuing-education-delete',
            itemAttr: 'data-account-continuing-education-item',
            idAttr: 'data-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$table = this.$el.find(this.options.selectors.table);
        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);
        this.$totalHours = this.$el.find(this.options.selectors.totalHours);
        this.$totalPharm = this.$el.find(this.options.selectors.totalPharm);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateContinuingEducationComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatecontinuingeducation:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deletecontinuingeducation:deleted', this._onDataUpdated.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        APIProxy.request({
            api: 'getContinuingEducation',
            success: (data) => {
                this._storeData(data);
                this._createList();
                this._showHide();

                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
            error: (jqxhr, status, err) => {
                this.data.length = 0;
                this._showHide();

                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
            },
        });
    }

    _storeData(data) {
        this.data.length = 0;

        this._storeDataItem(data);
    }

    _storeDataItem(dataItem) {
        const convertedJSON = Utils.convertJSONKeysServerToClient(JSON.stringify(dataItem), this.options.clientServerKeyMappings);

        this.data = JSON.parse(convertedJSON);
    }

    _createList() {
        this.$totalHours.text(this.data.totalHours);
        this.$totalPharm.text(this.data.total);

        let listHtml = '';

        for (const item of this.data.list) {
            listHtml = listHtml + this._getPopulatedItemHtml(item);
        }

        this.$list.html(listHtml);

        setTimeout(() => {
            this._instantiateItemViews();

            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
    }

    _showHide() {
        if (this.data.list.length > 0) {
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

        if ($itemViews.length !== this.data.list.length) {
            console.log('ERROR: account-continuing-education-view.js : number of views in DOM does not reflect number of stored continuing education items.');
            return;
        }

        for (let d = 0; d < this.data.list.length; d++) {
            const instance = new AccountContinuingEducationItemView();

            instance.init($($itemViews[d]), {});
            instance.setData(this.data.list[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.subject}>${data.subject}</td>
                    <td ${this.options.itemLineOutputAttrs.description}>${data.description}</td>
                    <td ${this.options.itemLineOutputAttrs.sponsor}>${data.sponsor}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedDate}>${data.formattedDate}</td>
                    <td ${this.options.itemLineOutputAttrs.contactHours}>${data.contactHours}</td>
                    <td ${this.options.itemLineOutputAttrs.pharmHrs}>${data.pharmHrs}</td>
                    <td ${this.options.itemLineOutputAttrs.approved}>${data.approved}</td>
                    <td><a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a> / <a href='#' ${this.options.idAttr}="${data.continuingEducationItemId}" ${this.options.deleteTriggerAttr}>${this.options.deleteText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountContinuingEducationView();
};
