 
import BaseComponent from 'components/base-component';
import ContinuingEducationAwardsComponent from 'components/continuing-education-awards-component';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';
import lightboxUtils from 'modules/lightbox-utils';
import LoadingSpinner from 'modules/loading-spinner';

class AccountContinuingEducationAwardsItemView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            notification: {
                saveToContinue: {
                    message: 'The changes in the contact hours are not yet saved. Please save them before performing any other actions.'
                },
            },
            selectors: {
                decreasePharmaHours: '[data-continuing-education-awards-decrease-pharm-hours]',
                increasePharmaHours: '[data-continuing-education-awards-increase-pharm-hours]',
                contactHours: '[data-continuing-education-awards-contact-hours]',
                pharmaHours: '[data-continuing-education-awards-pharm-hours]',
                sortByName: '[data-account-continuing-education-sortby-name]',
                sortByCompletionDate: '[data-account-continuing-education-sortby-completion-date]',
                restoreRecord: '[data-account-continuing-education-awards-restore]',
                archiveRecord: '[data-account-continuing-education-awards-archive]',
                lightboxArchiveYesButton: '[data-confirm-archive-yes]',
                lightboxArchiveNoButton: '[data-confirm-archive-no]',
                lightboxRestoreYesButton: '[data-confirm-restore-yes]',
                lightboxRestoreNoButton: '[data-confirm-restore-no]',
                idAttr: '[data-id]',
                issueIdAttr: '[data-issue-id]',
                isContactHoursModified: '[data-account-continuing-education-save-records]'
            },
            lightboxConfirmArchiveSrcName: 'archiveRecord',
            lightboxConfirmRestoreSrcName: 'restoreRecord',
        };
    }

    initChildren() {
        this.data = {};

        this.lightboxSrcHtml = lightboxUtils.getLightboxSources();
        this.loadingSpinner = new LoadingSpinner();

        this.displayComponent = new ContinuingEducationAwardsComponent();
        this.displayComponent.init(this.$el, {});

        this.$contactHours = this.$el.find(this.options.selectors.contactHours);
        this.$pharmaHours = this.$el.find(this.options.selectors.pharmaHours);
        this.$idAttr = this.$el.find(this.options.selectors.idAttr);
        this.$issueIdAttr = this.$el.find(this.options.selectors.issueIdAttr);

        this.$archiveBtn = this.$el.find(this.options.selectors.archiveRecord);
        this.$restoreBtn = this.$el.find(this.options.selectors.restoreRecord);

        this.$decreasePharmaHoursBtn = this.$el.find(this.options.selectors.decreasePharmaHours);
        this.$increasePharmaHoursBtn = this.$el.find(this.options.selectors.increasePharmaHours);

        this.$saveToContinue = this.options.notification.saveToContinue.message;
    }
    addListeners() {
        this.$decreasePharmaHoursBtn.on('click', this._onDecreasePharmaHours.bind(this));
        this.$increasePharmaHoursBtn.on('click', this._onIncreasePharmaHours.bind(this));

        this.$archiveBtn.on('click', this._openPopupArchive.bind(this));
        this.$restoreBtn.on('click', this._openPopupRestore.bind(this));
    }

    _onDecreasePharmaHours() {
        let currentPharmaHours = parseFloat(this.$pharmaHours[0].innerText);
        if (currentPharmaHours < 0.25) {
            return;
        }
        this._updatePharmaHours(-0.25);

        this._enableSaveButton();
    }
    _onIncreasePharmaHours() {

        let currentContactHours = parseFloat(this.$contactHours[0].innerText);
        if (currentContactHours < 0.25) {
            return;
        }
        this._updatePharmaHours(+0.25);

        this._enableSaveButton();
    }
    _enableSaveButton() {
        this.$el.find(this.options.selectors.isContactHoursModified).attr("data-contact-hours-modified", true);
        this.$el.find(this.options.selectors.isContactHoursModified).prop('disabled', false);
        this.$el.find(this.options.selectors.isContactHoursModified).attr('title', 'Click to save the Contact Hours changes.');
        this.$el.find(this.options.selectors.isContactHoursModified).removeClass('save_disabled').addClass('save_enabled');

    }
    _openPopupArchive() {

        if ($(this.options.selectors.isContactHoursModified).attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            const self = this;
            $.magnificPopup.instance.close();
            this.$el.magnificPopup({
                items: {
                    src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmArchiveSrcName]),
                    type: 'inline',
                },
                callbacks: {
                    open () {
                        setTimeout(() => {
                            self.$el.off('click.magnificPopup');
                            lightboxUtils.bindOpenModalButtons();
                            self._onArchivePopupModalOpened($(this.content[0]));
                        }, 0);
                    },
                },
            }).magnificPopup('open');
        }
    }


    _onArchivePopupModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();
        $modalContent.find(this.options.selectors.lightboxArchiveYesButton).on('click', this._archiveRecord.bind(this));
    }


    _archiveRecord(e) {
        e.preventDefault();
        console.log('_ArchiveRecord');
        this._updateStatus(true);
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

    _openPopupRestore() {
        if ($(this.options.selectors.isContactHoursModified).attr("data-contact-hours-modified") === 'true') {
            this._showContactHoursModified();
        } else {
            const self = this;
            $.magnificPopup.instance.close();
            this.$el.magnificPopup({
                items: {
                    src: lightboxUtils.getLightboxMarkupForContent(this.lightboxSrcHtml[this.options.lightboxConfirmRestoreSrcName]),
                    type: 'inline',
                },
                callbacks: {
                    open () {
                        setTimeout(() => {
                            self.$el.off('click.magnificPopup');
                            lightboxUtils.bindOpenModalButtons();
                            self._onRestorePopupModalOpened($(this.content[0]));
                        }, 0);
                    },
                },
            }).magnificPopup('open');
        }
    }


    _onRestorePopupModalOpened($modalContent) {
        lightboxUtils.bindOpenModalButtons();
        $modalContent.find(this.options.selectors.lightboxRestoreYesButton).on('click', this._restoreRecord.bind(this));
    }

    _restoreRecord(e) {
        e.preventDefault();
        console.log('_restoreRecord');
        this._updateStatus(false);
    }

    _updateStatus(isArchive) {
        const self = this;

        $.magnificPopup.instance.close();

        console.log('_updateStatus');
        let id = this.$idAttr[0].getAttribute('data-id');
        let issueId = this.$issueIdAttr[0].getAttribute('data-issue-id');

        APIProxy.request({
            api: 'updateCourseStatus',
            queryData: {
                coursecode: id,
                isArchive,
                issueId,
            },
            success: (data) => {
                if (data.success) {
                    globalEmitter.emit('updateCourseStatus:dataupdated', self);
                }
                this.loadingSpinner.release(`${this.guid}-_updateStatus`);
            },
            error: (jqxhr, status, err) => {
                this.loadingSpinner.release(`${this.guid}-_updateStatus`);

                this.$el.magnificPopup({
                    items: {
                        src: lightboxUtils.getErrorContentCustom(`<h3>Error</h3><p>There was a problem updating the record. Please try again.</p>`),
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
    _updatePharmaHours(increment) {

        this._enableSaveButton();
        this.$el.find(this.options.selectors.isContactHoursModified).attr("data-contact-hours-modified", true);

        let updatedContactHours;
        let updatedPharmaHours;

        let currentContactHoursText = this.$contactHours[0].innerText.trim();
        let currentPharmaHoursText = this.$pharmaHours[0].innerText.trim();

        let currentContactHours = parseFloat(currentContactHoursText);
        let currentPharmaHours = parseFloat(currentPharmaHoursText);


        updatedContactHours = currentContactHours - increment;
        updatedPharmaHours = currentPharmaHours + increment;
        if (updatedPharmaHours < 0 || updatedContactHours < 0) {
            return;
        }
        this.data.contactHours = updatedContactHours;
        this.data.pharmaHours = updatedPharmaHours;
        const self = this;
        globalEmitter.emit('updatePharmaHours:dataupdated', self);

    }
    setData(data) {
        this.data = data;
    }
}

export default () => {
    return new AccountContinuingEducationAwardsItemView();
};