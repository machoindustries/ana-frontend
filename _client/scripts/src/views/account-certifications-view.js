import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateCertificationComponent from 'components/add-update-certification-component';
import AccountCertificationsItemView from 'views/account-certifications-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';

class AccountCertificationsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            endpointUrls: {
                getData: `${window.location.origin}/PersonalDevelopment/getcertifications`,
            },
            selectors: {
                table: '[data-account-certifications-table]',
                list: '[data-account-certifications-list]',
                addComponent: '[data-account-certifications-add]',
            },
            clientServerKeyMappings: {
                certificationId: 'CertificationId',
                certificationName: 'CertificationName',
                dateStarted: 'DateStarted',
                status: 'Status',
                nextStepsUrl: 'NextStepsUrl',
            },
            itemLineOutputAttrs: {
                certificationId: 'data-certification-id',
                certificationName: 'data-certification-name',
                dateStarted: 'data-certification-date-started',
                status: 'data-certification-status',
            },
            lightboxEditSrcName: 'certificationedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-certification-edit',
            itemAttr: 'data-account-certification-item',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$list = this.$el.find(this.options.selectors.list);
        this.$table = this.$el.find(this.options.selectors.table);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateCertificationComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatecertification:dataupdated', this._onDataUpdated.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        $.ajax({
            method: 'GET',
            url: `${this.options.endpointUrls.getData}`,
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
            this.$table.show();
        } else {
            this.$table.hide();
        }
    }

    _instantiateItemViews() {
        this.itemViewInstances.length = 0;

        const $itemViews = this.$list.find(`[${this.options.itemAttr}]`);

        if ($itemViews.length !== this.data.length) {
            console.log('ERROR: account-certifications-view.js : number of views in DOM does not reflect number of stored certifications.');
            return;
        }

        for (let d = 0; d < this.data.length; d++) {
            const instance = new AccountCertificationsItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.certificationId}>${data.certificationId}</td>
                    <td ${this.options.itemLineOutputAttrs.certificationName}>${data.certificationName}</td>
                    <td ${this.options.itemLineOutputAttrs.dateStarted}>${data.dateStarted}</td>
                    <td ${this.options.itemLineOutputAttrs.status}>${data.status}</td>
                    <td><a href='${data.nextStepslUrl}' ${this.options.editTriggerAttr}>${this.options.editText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountCertificationsView();
};
