 
import BaseComponent from 'components/base-component';
import Utils from 'modules/utils';
import LoadingSpinner from 'modules/loading-spinner';
import AccountContinuingEducationAwardsItemView from 'views/account-continuing-education-awards-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';
import lightboxUtils from 'modules/lightbox-utils';

class AccountContinuingEducationAwardsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            notification: {
                saveToContinue: {
                    message: 'The changes in the contact hours are not yet saved. Please save them before performing any other actions.'
                },
            },
            selectors: {
                table: '[data-account-continuing-education-awards-table]',
                tableMessage: '[data-account-continuing-education-awards-table-message]',
                filterSection: '[data-account-continuing-education-filter-section]',
                list: '[data-account-continuing-education-list]',
                noResults: '[data-account-continuing-education-no-results]',
                pagination: '[data-account-continuing-education-pagination]',
                paginationNext: '[data-account-continuing-education-pagination-next]',
                paginationPrevious: '[data-account-continuing-education-pagination-previous]',
                applyFilter: '[data-account-continuing-education-apply-fitler]',
                clearFilter: '[data-account-continuing-education-clear-fitler]',
                toYear: '[data-account-continuing-education-to-year-fitler]',
                fromYear: '[data-account-continuing-education-from-year-fitler]',
                status: '[data-account-continuing-education-status-fitler]',
                updateCourseContactHours: '[data-account-continuing-education-save-records]',
                contactHours: '[data-account-continuing-education-contact-hours]',
                pharmaHours: '[data-account-continuing-education-pharma-hours]',
                totalContactHours: '[data-account-continuing-education-total-contact-hours]',
                totalPharmaHours: '[data-account-continuing-education-total-pharma-hours]',
                sortByName: '[data-account-continuing-education-sortby-name]',
                sortByCompletionDate: '[data-account-continuing-education-sortby-completion-date]',
                issueId: 'IssueId',
                isContactHoursModified: '[data-account-continuing-education-save-records]',
            },
            clientServerKeyMappings: {
                professionalDevContiEdusId: 'ProfessionalDevContiEdusId',
                anaCourseName: 'ANACourseName',
                provider: 'Provider',
                contactHours: 'ContactHours',
                pharmaHours: 'PharmaHours',
                completionDate: 'CompletionDate',
                totalHours: 'TotalHours',
                anccApproved: 'ANCCApproved',
                isArchived: 'IsArchived',
                list: 'List',
                issueId: 'IssueId',
            },
            itemLineOutputAttrs: {
                courseName: 'data-continuing-education-awards-anacoursename',
                provider: 'data-continuing-education-awards-provider',
                completionDate: 'data-continuing-education-awards-completion-date',
                contactHours: 'data-continuing-education-awards-contact-hours',
                pharmHours: 'data-continuing-education-awards-pharm-hours',
                approved: 'data-continuing-education-awards-approved',
            },
            lightboxEditSrcName: 'continuingeducationedit',
            restoreText: 'Restore',
            restoreTriggerAttr: 'data-account-continuing-education-awards-restore',
            archiveText: 'Archive',
            archiveTriggerAttr: 'data-account-continuing-education-awards-archive',
            deleteText: 'Delete',
            deleteTriggerAttr: 'data-account-continuing-education-delete',
            increasePharmHours: 'data-continuing-education-awards-increase-pharm-hours',
            decreasePharmHours: 'data-continuing-education-awards-decrease-pharm-hours',
            itemAttr: 'data-account-continuing-education-item',
            idAttr: 'data-id',
            issueIdAttr: 'data-issue-id',
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.$table = this.$el.find(this.options.selectors.table);
        this.$tableMessage = this.$el.find(this.options.selectors.tableMessage);
        this.$filterSection = this.$el.find(this.options.selectors.filterSection);
        this.$list = this.$el.find(this.options.selectors.list);
        this.$noResults = this.$el.find(this.options.selectors.noResults);
        this.$contactHours = this.$el.find(this.options.selectors.contactHours);
        this.$pharmHours = this.$el.find(this.options.selectors.pharmaHours);
        this.$totalContactHours = this.$el.find(this.options.selectors.totalContactHours);
        this.$totalPharmaHours = this.$el.find(this.options.selectors.totalPharmHours);

        this.$archiveBtn = this.$el.find(this.options.archiveTriggerAttr);
        this.$restoreBtn = this.$el.find(this.options.restoreTriggerAttr);


        this.$pagination = this.$el.find(this.options.selectors.pagination);
        this.$paginationNext = this.$el.find(this.options.selectors.paginationNext);
        this.$paginationPrevious = this.$el.find(this.options.selectors.paginationPrevious);
        this.$sortByCompletionDate = this.$el.find(this.options.selectors.sortByCompletionDate);
        this.$sortByName = this.$el.find(this.options.selectors.sortByName);

        this.$updateCourseContactHours = this.$el.find(this.options.selectors.updateCourseContactHours);
        this.$applyFilter = this.$el.find(this.options.selectors.applyFilter);
        this.$clearFilter = this.$el.find(this.options.selectors.clearFilter);


        this.$toYear = this.$el.find(this.options.selectors.toYear);
        this.$fromYear = this.$el.find(this.options.selectors.fromYear);
        this.$status = this.$el.find(this.options.selectors.status);

        this.data = {
            list: [],
            IsDataExists: false
        };
        this.itemViewInstances = [];

        this.isContactHoursModified = this.$el.find(this.options.selectors.isContactHoursModified);
        this.isContactHoursModified.prop('disabled', true);
        this.isContactHoursModified.removeClass('save_enabled').addClass('save_disabled');
        this.$el.find(this.options.selectors.isContactHoursModified).attr('title', 'To save, when changes made to Contact Hours.');
        this.CourseNameSortOrder = 'DESC';
        this.CompletionDateSortOrder = 'DESC';
        this.sortBy = 'CompletionDate';
        this.$saveToContinue = this.options.notification.saveToContinue.message;
        this.loadingSpinner = new LoadingSpinner();
    }

    addListeners() {

        globalEmitter.on('updatePharmaHours:dataupdated', this._onHoursUpdated.bind(this));
        globalEmitter.on('updateCourseStatus:dataupdated', this._onDataUpdated.bind(this));
        globalEmitter.on('addupdatecontinuingeducation:dataupdated', this._populateHours.bind(this));
        globalEmitter.on('deletecontinuingeducation:deleted', this._populateHours.bind(this));
        globalEmitter.on('updatecoursecontacthours:dataupdated', this._populateHours.bind(this));

        this.$paginationNext.on('click', this._paginationNext.bind(this));
        this.$paginationPrevious.on('click', this._paginationPrevious.bind(this));

        this.$applyFilter.on('click', this._applyFilter.bind(this));
        this.$clearFilter.on('click', this._clearFilter.bind(this));

        this.$sortByCompletionDate.on('click', this._sortByCompletionDate.bind(this));
        this.$sortByName.on('click', this._sortByName.bind(this));

        this.$pagination.on('click', '.page-number-awards', this._handlePageNumberClick.bind(this));
        console.log(this.$updateCourseContactHours, 'this.$updateCourseContactHours');
        this.$updateCourseContactHours.on('click', this._updateCourseContactHours.bind(this));

        this._getDataFromServer();

        this._populateYearsDropdown();
        this._populateHours();

    }

    _updateHours(data) {
        this.$contactHours[0].innerHTML = data.contactHours;
        this.$pharmHours[0].innerHTML = data.pharmaHours;

        let totalContactHours = document.getElementById('TotalContactHours');
        let totalPharmaHours = document.getElementById('TotalPharmaHours');

        totalContactHours.innerHTML = data.totalContactHours;
        totalPharmaHours.innerHTML = data.totalPharmaHours;
    }
    _populateHours() {
        const self = this;
        APIProxy.request({
            api: 'getContactHoursData',
            success: (data) => {
                if (data.success) {
                    this._updateHours(data);
                }
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_populateHours`);

                let responseStatus = '(no response JSON found; cannot display error details)';

                if (Object.hasOwn(jqxhr, 'responseJSON')) {
                    responseStatus = jqxhr.responseJSON.Status;
                }

                $.magnificPopup.instance.close();

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContent('awards', '_populateHours', `${status} ${responseStatus}`, err),
                        type: 'inline',
                    },
                    callbacks: {
                        open () {
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

    _handlePageNumberClick(event) {
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            const $target = $(event.currentTarget);
            const pageNumber = parseInt($target.html(), 10);
            this.currentPage = pageNumber;
            this._getDataFromServer();
        }
    }

    _sortByCompletionDate() {
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            this.currentPage = 1;
            this.sortBy = 'CompletionDate';
            this._toggleSortOrder();
            this._getDataFromServer();
        }
    }
    _sortByName() {
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            this.currentPage = 1;
            this.sortBy = 'CourseName';
            this._toggleSortOrder();
            this._getDataFromServer();
        }
    }

    _applyFilter() {
        console.log('_applyFilter');
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            this.currentPage = 1;
            this._getDataFromServer();
        }
    }

    _clearFilter() {
        console.log('_clearFilter');
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            this.currentPage = 1;
            this._getDataFromServer();
        }
    }

    _showContactHoursModified() {
        const self = this;
        console.log('_showContactHoursModified');
        this.$el.magnificPopup({
            items: {
                src: lightboxUtils.getErrorContentCustom(`<h3>Alert</h3><p>  ${this.$saveToContinue} </p>`),
                type: 'inline',
            },
            callbacks: {
                open () {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');
                        lightboxUtils.bindOpenModalButtons();
                    }, 0);
                },
            },
            mainClass: this.options.modalAdditionalClass,
        }).magnificPopup('open');
    }
    _updateCourseContactHours() {
        console.log('_updateCourseContactHours');

        this.loadingSpinner.request(`${this.guid}-_updateCourseContactHours`);
        APIProxy.request({
            api: 'updateCourseContactHours',
            queryData: {
                data: this.data.list
            },
            success: (data) => {
                if (data.success) {
                    this._disableSaveButton();
                    globalEmitter.emit('updatecoursecontacthours:dataupdated', self);
                    this.loadingSpinner.release(`${this.guid}-_updateCourseContactHours`);
                }
            },
            error: (jqxhr, status, err) => {

                this.loadingSpinner.release(`${this.guid}-_updateCourseContactHours`);
            },
        });
    }
    _enableSaveButton() {
        this.$el.find(this.options.selectors.isContactHoursModified).attr("data-contact-hours-modified", true);
        this.$el.find(this.options.selectors.isContactHoursModified).prop('disabled', false);
        this.$el.find(this.options.selectors.isContactHoursModified).attr('title', 'Click to save the Contact Hours changes.');
        this.$el.find(this.options.selectors.isContactHoursModified).removeClass('save_disabled').addClass('save_enabled');

    }

    _disableSaveButton() {
        this.$el.find(this.options.selectors.isContactHoursModified).attr("data-contact-hours-modified", false);
        this.$el.find(this.options.selectors.isContactHoursModified).prop('disabled', true);
        this.$el.find(this.options.selectors.isContactHoursModified).attr('title', 'To save, when changes made to Contact Hours.');
        this.$el.find(this.options.selectors.isContactHoursModified).removeClass('save_enabled').addClass('save_disabled');

    }
    _onDataUpdated() {
        this._getDataFromServer();
    }

    _onHoursUpdated() {
        const self = this;
        this._storeData(this.data);
        this._createList();
        this._showHide();

        this._enableSaveButton();
        globalEmitter.emit('iscontacthoursmodified:true', self);
    }

    _toggleSortOrder() {
        if (this.sortBy === 'CompletionDate') {
            if (this.CompletionDateSortOrder === 'ASC') {
                this.CompletionDateSortOrder = 'DESC';
            } else {
                this.CompletionDateSortOrder = 'ASC';
            }
        } else if (this.sortBy === 'CourseName') {
            if (this.CourseNameSortOrder === 'ASC') {
                this.CourseNameSortOrder = 'DESC';
            } else {
                this.CourseNameSortOrder = 'ASC';
            }
        }
    }
    _getDataFromServer() {
        console.log('_getDataFromServer');
        let toYear = this.$toYear.val();
        let fromYear = this.$fromYear.val();
        let status = this.$status.val();

        let sortOrder;

        if (this.sortBy === 'CourseName') { sortOrder = this.CourseNameSortOrder; }
        else { sortOrder = this.CompletionDateSortOrder; }
        this.loadingSpinner.request(`${this.guid}-_getDataFromServer`);

        const self = this;
        APIProxy.request({
            api: 'getContinuingEducationAwards',
            queryData: {
                pageNumber: this.currentPage,
                toYear,
                fromYear,
                status,
                sortBy: this.sortBy,
                sortOrder
            },
            success: (data) => {
                this.loadingSpinner.release(`${this.guid}-_getDataFromServer`);
                if (data.Success === 'True') {
                    this._storeData(data);
                    this._createList();
                    this._showHide();


                } else {

                    $.magnificPopup.instance.close();
                    this.$el.magnificPopup({
                        items: {
                            src: lightboxUtils.getErrorContentCustom(`<p> ${data.Reasons}</p>`),
                            type: 'inline',
                        },
                        callbacks: {
                            open () {
                                setTimeout(() => {
                                    self.$el.off('click.magnificPopup');

                                    lightboxUtils.bindOpenModalButtons();
                                }, 0);
                            },
                        },
                        mainClass: this.options.modalAdditionalClass,
                    }).magnificPopup('open');
                }
            },
            error: (jqxhr, errorStatus, err) => {
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

        console.log('_getDataFromServer this.data', this.data);
    }

    _paginationNext() {
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            this.currentPage = (this.currentPage || 1) + 1;
            this._getDataFromServer();
        }
    }

    _paginationPrevious() {
        if (this.isContactHoursModified.attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            this.currentPage = (this.currentPage || 1) - 1;
            this._getDataFromServer();
        }
    }

    _createList() {
        const itemsPerPage = 10;
        const totalPages = Math.ceil(this.data.TotalCount / itemsPerPage);

        const currentPage = this.currentPage || 1;
        let listHtml = '';
        for (const item of this.data.list) {
            listHtml = listHtml + this._getPopulatedItemHtml(item);
        }
        this.$list.html(listHtml);
        this._updatePagination(currentPage, totalPages);

        setTimeout(() => {
            this._instantiateItemViews();
            globalEmitter.emit('dynamictable:updated', this);
        }, 0);
    }

    _populateYearsDropdown() {

        const fromYearSelect = document.getElementById('fromYear');
        const toYearSelect = document.getElementById('toYear');

        const blankOptionFrom = document.createElement('option');
        blankOptionFrom.value = '';
        blankOptionFrom.textContent = 'Select';
        fromYearSelect.appendChild(blankOptionFrom);

        const blankOptionTo = document.createElement('option');
        blankOptionTo.value = '';
        blankOptionTo.textContent = 'Select';
        toYearSelect.appendChild(blankOptionTo);

        const currentYear = new Date().getFullYear();

        for (let year = currentYear; year > currentYear - 10; year--) {
            const optionFrom = document.createElement('option');
            optionFrom.value = year;
            optionFrom.textContent = year;
            fromYearSelect.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = year;
            optionTo.textContent = year;
            toYearSelect.appendChild(optionTo);
        }


    }

    _updatePagination(currentPage, totalPages) {
        const $pagination = $('.pagination');
        $pagination.find('.current-page').text(currentPage);
        $pagination.find('.total-pages').text(totalPages);

        const $pageNumberContainer = $pagination.find('.page-numbers');
        $pageNumberContainer.empty();

        const rangeStart = Math.max(1, currentPage - 1);
        const rangeEnd = Math.min(totalPages, currentPage + 1);

        if (rangeStart > 1) {
            if (totalPages > 1) {
                const $pageNumberFirst = $('<button class="page-number-awards" >1</button>');
                $pageNumberContainer.append($pageNumberFirst);
                if (rangeStart > 2) {
                    $pageNumberContainer.append('<span>...</span>');
                }
            }
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            const $pageNumber = $(`<button class="page-number-awards" >${ i }</button>`);

            if (i === currentPage) {
                $pageNumber.addClass('active');
                $pageNumber.css('background-color', '#0b8d98');
                $pageNumber.css('color', 'white');
            }
            $pageNumberContainer.append($pageNumber);
        }

        if (rangeEnd < totalPages) {
            if (rangeEnd < totalPages - 1) {
                $pageNumberContainer.append('<span>...</span>');
            }
            const $pageNumberLast = $(`<button class="page-number-awards" >${ totalPages }</button>`);
            $pageNumberContainer.append($pageNumberLast);
        }

        if (currentPage === 1) {
            this.$paginationPrevious.hide();
        } else {
            this.$paginationPrevious.show();
        }
        if (currentPage === totalPages || totalPages === 0) {
            this.$paginationNext.hide();
        } else {
            this.$paginationNext.show();
        }

    }
    _showHide() {
        if (this.data.list.length > 0) {
            this.$noResults.hide();
            this.$table.show();
            this.$tableMessage.show();
            this.$pagination.show();
        } else {
            this.$table.hide();
            this.$noResults.show();
            this.$tableMessage.hide();
            this.$pagination.hide();
        }

        if (this.data.IsDataExists) {
            this.$filterSection.show();
        } else {
            this.$filterSection.hide();
        }
    }

    _instantiateItemViews() {
        this.itemViewInstances.length = 0;

        const $itemViews = this.$list.find(`[${this.options.itemAttr}]`);

        if ($itemViews.length !== this.data.list.length) {
            console.log('ERROR: account-continuing-education-awards-view.js : number of views in DOM does not reflect number of stored continuing education items.');
            return;
        }

        for (let d = 0; d < this.data.list.length; d++) {
            const instance = new AccountContinuingEducationAwardsItemView();

            instance.init($($itemViews[d]), {});
            instance.setData(this.data.list[d]);

            this.itemViewInstances.push(instance);
        }
    }

    _getPopulatedItemHtml(data) {

        let archiveRestoreButton = data.isArchived ? `<button ${this.options.restoreTriggerAttr} ${this.options.idAttr}="${data.professionalDevContiEdusId}" ${this.options.issueIdAttr}="${data.issueId}">${this.options.restoreText}</button>` : `<button ${this.options.archiveTriggerAttr} ${this.options.idAttr}="${data.professionalDevContiEdusId}" ${this.options.issueIdAttr}="${data.issueId}" >${this.options.archiveText}</button>`;

        let approvedText = data.anccApproved ? "Yes" : "No";

        return `<tr ${this.options.itemAttr}>
                    <td ${this.options.itemLineOutputAttrs.courseName} style="text-align:left;">${data.anaCourseName}</td>
                    <td ${this.options.itemLineOutputAttrs.provider}>${data.provider}</td>
                    <td ${this.options.itemLineOutputAttrs.completionDate}>${data.completionDate}</td>
                    <td ${this.options.itemLineOutputAttrs.contactHours}>${data.contactHours}</td>
                    <td ${this.options.itemLineOutputAttrs.pharmHours} >
                    <a class="e-quantity-selector__nav--dec" ${this.options.decreasePharmHours} style="padding-right:10px;" ></a>
                       ${data.pharmaHours} 
                    <a class="e-quantity-selector__nav--inc" ${this.options.increasePharmHours} style="padding-left:10px;" ></a>
                    </td>
                    <td ${this.options.itemLineOutputAttrs.approved}>${approvedText}</td>
                    <td>${archiveRestoreButton}</td>
                </tr>`;

    }
}

export default () => {
    return new AccountContinuingEducationAwardsView();
};