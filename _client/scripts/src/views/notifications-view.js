import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';

class NotificationsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            notificationTypes: {
                checkout_invalidcard: {
                    message: 'The supplied payment method is invalid',
                },
                checkout_nolineitems: {
                    message: 'There are no items in the cart',
                },
                checkout_noshippingaddress: {
                    message: 'No shipping address was supplied',
                },
            },
            activeClass: 'is--active',
            contentSelector: '[data-notifications]',
        };

        this.state = {
            open: false,
        };
    }

    initChildren() {
        this.activeNotifications = [];

        this.$content = this.$el.find(this.options.contentSelector);
    }

    addListeners() {
        globalEmitter.on('notification:triggered', this._onNotificationTriggered.bind(this));
        globalEmitter.on('customnotification:triggered', this._onCustomNotificationTriggered.bind(this));

        if (this.$content.children().length === 0) {
            this._updateDisplayState();
        }
    }

    _onNotificationTriggered(notificationType) {
        if (Object.hasOwn(this.options.notificationTypes, notificationType)) {
            this._createNotification(notificationType);
        } else {
            console.log('ERROR: notifications-view.js : the triggered notification type was not found in module config.');
        }
    }

    _onCustomNotificationTriggered(notificationText) {
        this._createCustomNotification(notificationText);
    }

    _createNotification(notificationType) {
        const notificationMessage = this.options.notificationTypes[notificationType].message;

        if (this.activeNotifications.indexOf(notificationMessage) !== -1) {
            return;
        }

        this.activeNotifications.push(notificationMessage);

        this._displayNotifications();
    }

    _createCustomNotification(notificationText) {
        if (this.activeNotifications.indexOf(notificationText) !== -1) {
            return;
        }

        this.activeNotifications.push(notificationText);

        this._displayNotifications();
    }

    _displayNotifications() {
        let notificationsHtml = '';

        for (let an = 0; an < this.activeNotifications.length; an++) {
            notificationsHtml = `${notificationsHtml }<p class="e-notifications__item">${this.activeNotifications[an]}</p>`;
        }

        this.$content.html(notificationsHtml);

        this._updateDisplayState();
    }

    _updateDisplayState() {
        if (this.activeNotifications.length > 0) {
            if (this.state.open) {
                return;
            }

            this.state.open = true;

            this.$el.addClass(this.options.activeClass);
        } else {
            this.state.open = false;

            this.$el.removeClass(this.options.activeClass);
        }
    }
}

export default () => {
    return new NotificationsView();
};
