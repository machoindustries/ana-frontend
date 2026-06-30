import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateProfessionalServiceComponent from 'components/add-update-professional-service-component';
import AccountProfessionalServicesItemView from 'views/account-professional-services-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AccountProfessionalServicesView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-professional-services-table]',
                list: '[data-account-professional-services-list]',
                noResults: '[data-account-professional-services-no-results]',
                addComponent: '[data-account-professional-service-add]',
            },
            clientServerKeyMappings: {
                professionalServiceId: 'ProfessionalDevProServicesId',
                organization: 'Organization',
                serviceType: 'TypeOfService',
                startDate: 'StartDate',
                endDate: 'EndDate',
                formattedStartDate: 'FormattedStartDate',
                formattedEndDate: 'FormattedEndDate',
            },
            itemLineOutputAttrs: {
                organization: 'data-professional-service-organization',
                serviceType: 'data-professional-service-service-type',
                formattedStartDate: 'data-professional-service-start-date',
                formattedEndDate: 'data-professional-service-end-date',
            },
            lightboxEditSrcName: 'professionalserviceedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-professional-service-edit',
            deleteText: 'Delete',
            deleteTriggerAttr: 'data-account-professional-service-delete',
            itemAttr: 'data-account-professional-services-item',
            idAttr: 'data-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$table = this.$el.find(this.options.selectors.table);
        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateProfessionalServiceComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdateprofessionalservice:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deleteprofessionalservice:deleted', this._onDataDeleted.bind(this));

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
            api: 'getProfessionalServices',
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
            console.log('ERROR: account-professional-services-view.js : number of views in DOM does not reflect number of stored professional services.');
            return;
        }

        for (let d = 0; d < this.data.length; d++) {
            const instance = new AccountProfessionalServicesItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.organization}>${data.organization}</td>
                    <td ${this.options.itemLineOutputAttrs.serviceType}>${data.serviceType}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedStartDate}>${data.formattedStartDate}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedEndDate}>${data.formattedEndDate}</td>
                    <td><a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a>/ <a href='#' ${this.options.idAttr}="${data.professionalServiceId}" ${this.options.deleteTriggerAttr}>${this.options.deleteText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountProfessionalServicesView();
};
