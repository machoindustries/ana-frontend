import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateAcademicCreditComponent from 'components/add-update-academic-credit-component';
import AccountAcademicCreditsItemView from 'views/account-academic-credits-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class AccountAcademicCreditsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-academic-credits-table]',
                list: '[data-account-academic-credits-list]',
                noResults: '[data-account-academic-credits-no-results]',
                addComponent: '[data-account-academic-credits-add]',
                totalCredits: '[data-account-academic-credits-total-credits]',
            },
            clientServerKeyMappings: {
                academicCreditId: 'ProfessionalDevAcadCredsId',
                subject: 'Subject',
                sponsor: 'Sponsor',
                formattedDate: 'FormattedDate',
                date: 'Date',
                credits: 'Credits',
                specialtyFocus: 'FocusSpecialtyFlag',
                totalCredits: 'TotalCredits',
                list: 'List',
            },
            itemLineOutputAttrs: {
                subject: 'data-academic-credit-subject',
                sponsor: 'data-academic-credit-sponsor',
                date: 'data-academic-credit-date',
                credits: 'data-academic-credit-credits',
                specialtyFocus: 'data-academic-credit-specialty-focus',
                formattedDate: 'data-academic-credit-formatted-date',
            },
            lightboxEditSrcName: 'creditedit',
            editText: 'Edit',
            deleteText: 'Delete',
            editTriggerAttr: 'data-account-academic-credit-edit',
            deleteTriggerAttr: 'data-account-academic-credit-delete',
            itemAttr: 'data-account-academic-credits-item',
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

        this.addComponent = new AddUpdateAcademicCreditComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdateacademiccredit:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('deleteacademiccredit:deleted', this._onDataDeleted.bind(this));

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
            api: 'getAcademicCredits',
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

        for (let d = 0; d < this.data.list.length; d++) {
            listHtml = listHtml + this._getPopulatedItemHtml(this.data.list[d]);
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
        // console.log('ERROR: account-academic-credits-view.js :
        // number of views in DOM does not reflect number of stored academic credit items.');
            return;
        }

        for (let d = 0; d < this.data.list.length; d++) {
            const instance = new AccountAcademicCreditsItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data.list[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.subject}>${data.subject}</td>
                    <td ${this.options.itemLineOutputAttrs.sponsor}>${data.sponsor}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedDate}>${data.formattedDate}</td>
                    <td ${this.options.itemLineOutputAttrs.credits}>${data.credits}</td>
                    <td ${this.options.itemLineOutputAttrs.specialtyFocus}>${data.specialtyFocus}</td>
                    <td><a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a> / <a href='#' ${this.options.idAttr}="${data.academicCreditId}" ${this.options.deleteTriggerAttr}>${this.options.deleteText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountAcademicCreditsView();
};
