import BaseComponent from 'components/base-component';
import $ from 'jquery';

class CartLoginStatus extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                login: '[data-login]',
                cart: '[data-cart]',
            },
            isActiveClass: 'is-active',
        };
    }

    initChildren() {
        this.$login = this.$el.find(this.options.selectors.login);
        this.$cart = this.$el.find(this.options.selectors.cart);

        this._getCartLoginStatus();
    }

    _getCartLoginStatus() {
        $.post(this.options.url, { method: 'getSession' }, (data) => {
            if (data.IsLoggedIn) {
                this.$login.addClass(this.options.isActiveClass);
            }

            if (Object.hasOwn(data, 'Count') && parseInt(data.Count, 10)) {
                this.$cart.text(`(${data.Count})`);
            }
        });
    }
}

export default () => {
    return new CartLoginStatus();
};
