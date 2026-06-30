import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdatePresentationComponent from 'components/add-update-presentation-component';
import AccountPresentationsItemView from 'views/account-presentations-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AccountPresentationsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-presentations-table]',
                list: '[data-account-presentations-list]',
                noResults: '[data-account-presentations-no-results]',
                addComponent: '[data-account-presentation-add]',
                totalPresentations: '[data-account-presentations-total]',
            },
            clientServerKeyMappings: {
                presentationId: 'ProfessionalDevPresentationsId',
                subject: 'Subject',
                sponsors: 'Sponsor',
                offeredDate: 'Date',
                audience: 'Audience',
                clockHrs: 'ClockHrs',
                formattedDate: 'FormattedDate',
                list: 'List',
                total: 'Total',
            },
            itemLineOutputAttrs: {
                subject: 'data-presentation-subject',
                sponsors: 'data-presentation-sponsors',
                formattedDate: 'data-presentation-offered-date',
                audience: 'data-presentation-audience',
                clockHrs: 'data-presentation-clockhrs',
            },
            lightboxEditSrcName: 'presentationedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-presentation-edit',
            deleteText: 'Delete',
            deleteTriggerAttr: 'data-account-presentation-delete',
            itemAttr: 'data-account-presentation-item',
            idAttr: 'data-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$table = this.$el.find(this.options.selectors.table);
        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);
        this.$totalPresentations = this.$el.find(this.options.selectors.totalPresentations);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdatePresentationComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatepresentation:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deletepresentation:deleted', this._onDataDeleted.bind(this));

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
            api: 'getPresentations',
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
        this.$totalPresentations.text(this.data.total);

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
            console.log('ERROR: account-presentations-view.js : number of views in DOM does not reflect number of stored presentations.');
            return;
        }

        for (let d = 0; d < this.data.list.length; d++) {
            const instance = new AccountPresentationsItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data.list[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.subject}>${data.subject}</td>
                    <td ${this.options.itemLineOutputAttrs.sponsors}>${data.sponsors}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedDate}>${data.formattedDate}</td>
                    <td ${this.options.itemLineOutputAttrs.audience}>${data.audience}</td> 
                    <td ${this.options.itemLineOutputAttrs.clockHrs}>${data.clockHrs}</td> 
                    <td><a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a>/ <a href='#' ${this.options.idAttr}="${data.presentationId}" ${this.options.deleteTriggerAttr}>${this.options.deleteText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountPresentationsView();
};
