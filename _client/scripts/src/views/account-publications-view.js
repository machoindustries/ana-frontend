import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdatePublicationComponent from 'components/add-update-publication-component';
import AccountPublicationsItemView from 'views/account-publications-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AccountPublicationsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-publications-table]',
                list: '[data-account-publications-list]',
                noResults: '[data-account-publications-no-results]',
                addComponent: '[data-account-publication-add]',
                totalPublications: '[data-account-publications-total]',
            },
            clientServerKeyMappings: {
                publicationId: 'ProfessionalDevPublicationsId',
                subject: 'Subject',
                sponsors: 'Sponsor',
                date: 'Date',
                formattedDate: 'FormattedDate',
                list: 'List',
                totalpublicationresearch: 'Total',
            },
            itemLineOutputAttrs: {
                subject: 'data-publication-subject',
                sponsors: 'data-publication-sponsors',
                formattedDate: 'data-publication-date',
            },
            lightboxEditSrcName: 'publicationedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-publication-edit',
            deleteText: 'Delete',
            deleteTriggerAttr: 'data-account-publication-delete',
            itemAttr: 'data-account-publications-item',
            idAttr: 'data-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$table = this.$el.find(this.options.selectors.table);
        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);
        this.$publicationsTotal = this.$el.find(this.options.selectors.totalPublications);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdatePublicationComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatepublication:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deletepublication:deleted', this._onDataDeleted.bind(this));

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
            api: 'getPublications',
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
        this.$publicationsTotal.text(this.data.totalpublicationresearch);

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
            console.log('ERROR: account-publications-view.js : number of views in DOM does not reflect number of stored publications.');
            return;
        }

        for (let d = 0; d < this.data.list.length; d++) {
            const instance = new AccountPublicationsItemView();

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
                    <td><a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a>/ <a href='#' ${this.options.idAttr}="${data.publicationId}" ${this.options.deleteTriggerAttr}>${this.options.deleteText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountPublicationsView();
};
