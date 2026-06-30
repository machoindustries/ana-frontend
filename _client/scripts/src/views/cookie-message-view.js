import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';

class CookieMessageView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                wrapper: '[data-cookie-message-wrapper]',
                acceptBtn: '[data-cookie-message-accept]',
                declineBtn: '[data-cookie-message-decline]',
            },
            acceptDataAttr: 'data-cookie-message-accept',
            acceptCookieName: 'SiteCookie',
            declineCookieName: 'SiteCookie',
            cookieLanguageKey: '',
            cookieDomain: '',
            acceptCookieExpiryInDays: 365,
            animateCloseDuration: 2500,
            animateFadeDuration: 250,
            animateEasing: 'ease-in-out',
        };
    }

    initChildren() {
        this.$wrapper = this.$el.find(this.options.selectors.wrapper);
        this.$accept = this.$el.find(this.options.selectors.acceptBtn);
        this.$decline = this.$el.find(this.options.selectors.declineBtn);

        // This logic is just to make the static frontend section not show the message
        // The server wont render the the cookie partial if the cookie is set
        if (this._checkCookieExists()) {
            this.$el.hide();
        } else {
            this.$el.show();
        }
    }

    addListeners() {
        this.$accept.on('click', this._decide.bind(this));

        if (this.$decline.length) {
            this.$decline.on('click', this._decide.bind(this));
        }
    }

    _decide(evt) {
        evt.preventDefault();

        let completeHandler;

        const isAccepted = $(evt.currentTarget).attr(this.options.acceptDataAttr);

        if (typeof isAccepted !== 'undefined' && isAccepted !== false) {
            completeHandler = this._acceptCompleteHandler.bind(this);
        } else {
            completeHandler = this._declineCompleteHandler.bind(this);
        }

        const easing = this.options.animateEasing,
            fadeDur = this.options.animateFadeDuration,
            closeDur = this.options.animateCloseDuration,
            wrapperAnim = 'fadeOut',
            elAnim = 'slideUp';

        animate(this.$wrapper[0], wrapperAnim, { fadeDur, easing }, this)
            .then(() => {
                this.$el.css({ 'min-height': '0px' });
            });

        animate(this.$el[0], elAnim, { closeDur, easing, delay: fadeDur }, this)
            .then(completeHandler);
    }

    _acceptCompleteHandler() {
        this._setAcceptCookie();

        this.$el.remove();

        globalEmitter.emit('CookieMessageView:accept', this);
    }

    _declineCompleteHandler() {
        this._setDeclineCookie();

        this.$el.remove();

        globalEmitter.emit('CookieMessageView:decline', this);
    }

    _setDeclineCookie() {
        const cookieKey = `${this._getCookie(`${this.options.declineCookieName}=`) + this.options.cookieLanguageKey}|`;
        document.cookie = `${this.options.declineCookieName}=${cookieKey}; path=/;domain=${this.options.cookieDomain}`;
    }

    _setAcceptCookie() {
        const cookieKey = `${this._getCookie(`${this.options.acceptCookieName}=`) + this.options.cookieLanguageKey}|`,
            expiredDate = new Date();

        expiredDate.setDate(expiredDate.getDate() + this.options.acceptCookieExpiryInDays);

        document.cookie = `${this.options.acceptCookieName}=${cookieKey}; expires=${expiredDate.toGMTString()}; path=/;domain=${this.options.cookieDomain}`;
    }

    _getCookie(name) {
        const ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];

            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }

    _checkCookieExists() {
        const acceptCookie = this._getCookie(`${this.options.acceptCookieName}=`),
            declineCookie = this._getCookie(`${this.options.declineCookieName}=`);

        return acceptCookie.indexOf(`${this.options.cookieLanguageKey}|`) >= 0 ||
            declineCookie.indexOf(`${this.options.cookieLanguageKey}|`) >= 0;
    }
}

export default () => {
    return new CookieMessageView();
};
