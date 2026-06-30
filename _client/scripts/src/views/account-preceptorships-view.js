import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdatePreceptorshipComponent from 'components/add-update-preceptorship-component';
import AccountPreceptorshipsItemView from 'views/account-preceptorships-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AccountPreceptorshipsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-preceptorships-table]',
                list: '[data-account-preceptorships-list]',
                noResults: '[data-account-preceptorships-no-results]',
                addComponent: '[data-account-preceptorship-add]',
                totalCredits: '[data-account-preceptorships-total]',
            },
            clientServerKeyMappings: {
                preceptorshipId: 'ProfessionalDevPrecepsId',
                sponsor: 'Sponsor',
                studentType: 'StudentType',
                endDate: 'Date',
                totalHours: 'HoursCompleted',
                formattedDate: 'FormattedDate',
                totalCredits: 'TotalCredits',
                list: 'List',
            },
            itemLineOutputAttrs: {
                sponsor: 'data-preceptorship-sponsor',
                studentType: 'data-preceptorship-student-type',
                formattedDate: 'data-preceptorship-end-date',
                totalHours: 'data-preceptorship-total-hours',
            },
            lightboxEditSrcName: 'preceptorshipedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-preceptorship-edit',
            deleteText: 'Delete',
            deleteTriggerAttr: 'data-account-preceptorship-delete',
            itemAttr: 'data-account-preceptorship-item',
            idAttr: 'data-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$table = this.$el.find(this.options.selectors.table);
        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);
        this.$totalCredits = this.$el.find(this.options.selectors.totalCredits);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdatePreceptorshipComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatepreceptorship:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deletepreceptorship:deleted', this._onDataDeleted.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }

    _onDataDeleted() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        APIProxy.request({
            api: 'getPreceptorships',
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
        this.$totalCredits.text(this.data.totalCredits);

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
            console.log('ERROR: account-preceptorship-view.js : number of views in DOM does not reflect number of stored preceptorship.');
            return;
        }

        for (let d = 0; d < this.data.list.length; d++) {
            const instance = new AccountPreceptorshipsItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data.list[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.sponsor}>${data.sponsor}</td>
                    <td ${this.options.itemLineOutputAttrs.studentType}>${data.studentType}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedDate}>${data.formattedDate}</td>
                    <td ${this.options.itemLineOutputAttrs.totalHours}>${data.totalHours}</td>
                    <td><a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a>/ <a href='#' ${this.options.idAttr}="${data.preceptorshipId}" ${this.options.deleteTriggerAttr}>${this.options.deleteText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountPreceptorshipsView();
};
