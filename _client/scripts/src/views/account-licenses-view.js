import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateLicenseComponent from 'components/add-update-license-component';
import AccountLicensesItemView from 'views/account-licenses-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import APIProxy from 'modules/api-proxy';

class AccountLicensesView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                table: '[data-account-licenses-table]',
                list: '[data-account-licenses-list]',
                noResults: '[data-account-licenses-no-results]',
                addComponent: '[data-account-license-add]',
            },
            clientServerKeyMappings: {
                licenseId: 'LicenseId',
                licenseType: 'LicenseType',
                country: 'Country',
                countryDescr: 'CountryDescr',
                state: 'State',
                stateDescr: 'StateDescr',
                rnLicenseNumber: 'RnLicenseNumber',
                beginDate: 'BeginDate',
                expirationDate: 'ExpirationDate',
                formattedExpirationDate: 'FormattedExpirationDate',
                formattedBeginDate: 'FormattedBeginDate',
            },
            itemLineOutputAttrs: {
                rnLicenseNumber: 'data-license-rn-license-no',
                licenseType: 'data-license-type',
                country: 'data-license-country',
                state: 'data-license-state',
                formattedBeginDate: 'data-license-begin-date',
                formattedExpirationDate: 'data-license-expiration-date',
            },
            lightboxEditSrcName: 'licenseedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-license-edit',
            itemAttr: 'data-account-licenses-item',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$list = this.$el.find(this.options.selectors.list);
        this.$table = this.$el.find(this.options.selectors.table);
        this.$noResults = this.$el.find(this.options.selectors.noResults);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateLicenseComponent('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatelicense:dataupdated', this._onDataUpdated.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdated() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        const self = this;

        APIProxy.request({
            api: 'getLicenses',
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
                        src: lightboxUtils.getErrorContent('licenses', 'get', `${status} ${responseStatus}`, err),
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
                    mainClass: this.options.modalAdditionalClass,
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
            console.log('ERROR: account-licenses-view.js : number of views in DOM does not reflect number of stored licenses.');
            return;
        }

        for (let d = 0; d < this.data.length; d++) {
            const instance = new AccountLicensesItemView();

            instance.init($($itemViews[d]), {});

            instance.setData(this.data[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {
        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.rnLicenseNumber}>${data.rnLicenseNumber}</td>
                    <td ${this.options.itemLineOutputAttrs.licenseType}>${data.licenseType}</td>
                    <td ${this.options.itemLineOutputAttrs.country}>${data.country}</td>
                    <td ${this.options.itemLineOutputAttrs.state}>${data.state}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedBeginDate}>${data.formattedBeginDate}</td>
                    <td ${this.options.itemLineOutputAttrs.formattedExpirationDate}>${data.formattedExpirationDate}</td>
                    <td><a href='${data.licensePortalUrl}' ${this.options.editTriggerAttr}>${this.options.editText}</a></td>
                </tr>`;
    }
}

export default () => {
    return new AccountLicensesView();
};
