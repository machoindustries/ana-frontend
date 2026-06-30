import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AddUpdateCusCommunication from 'components/add-update-account-personaldetails-component';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import 'magnific-popup';
import lightboxUtils from 'modules/lightbox-utils';
import APIProxy from 'modules/api-proxy';

class AccountPersonalDetailsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                addComponent: '[data-account-personaldetails-add]',
                editComponent: '[data-account-personaldetails-edit]',
                list: '[data-account-personaldetails-list]',
            },
            clientServerKeyMappings: {
                primaryFlag: 'PrimaryFlag',
                formattedPhoneAddress: 'FormattedPhoneAddress',
            },
            lightboxEditSrcName: 'cusedit',
            editText: 'Edit',
            editTriggerAttr: 'data-account-personaldetails-edit',
            itemAttr: 'data-account-personaldetails-item',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$list = this.$el.find(this.options.selectors.list);

        this.data = [];
        this.itemViewInstances = [];

        this.addComponent = new AddUpdateCusCommunication('add', this.options.lightboxEditSrcName);
        this.addComponent.init(this.$el.find(this.options.selectors.addComponent), {});

        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {
        globalEmitter.on('addupdatecuscommunication:dataupdated', this._onDataUpdate.bind(this));

        this._getDataFromServer();
    }

    _onDataUpdate() {
        this._getDataFromServer();
    }

    _getDataFromServer() {
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        const self = this;

        APIProxy.request({
            api: 'getPersonalDetails',
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
                        src: lightboxUtils.getErrorContent('personaldetails', 'get', `${status} ${responseStatus}`, err),
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
        const convertedJson = Utils.convertJSONKeysServerToClient(JSON.stringify(data), this.options.clientServerKeyMappings);
        this.data = JSON.parse(convertedJson);
    }

    _createList() {
        let listHtml = '';

        for (const item of this.data) {
            listHtml = listHtml + this._getPopulatedItemHtml(item);
        }

        this.$list.html(listHtml);

        setTimeout(() => {
            this._instantiateItemViews();
            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
    }

    _instantiateItemViews() {
        this.itemViewInstances.length = 0;

        for (let d = 0; d < this.data.length; d++) {
            this.editComponent = new AddUpdateCusCommunication('edit', this.options.lightboxEditSrcName);
            this.editComponent.init(this.$el.find(this.options.selectors.editComponent), {});
            this.editComponent.setData(this.data[d]);
        }
    }

    _showHide() {
        if (this.data) {
            this.$list.show();
        } else {
            this.$list.hide();
        }
    }

    _getPopulatedItemHtml(data) {
        return `<div class="grid__item three-eighths">Phone Number:</div>
                <div class="grid__item three-eighths">
                    <p class="c-account__text c-account__text--no-margin">${data.formattedPhoneAddress}</p>
                </div>
                <div class="grid__item two-eighths">
                    <a href='#' ${this.options.editTriggerAttr}>${this.options.editText}</a>
                </div>`;
    }
}

export default () => {
    return new AccountPersonalDetailsView();
};
