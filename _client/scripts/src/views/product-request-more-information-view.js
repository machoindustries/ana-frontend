import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import $ from 'jquery';

class ProductRequestMoreInformationView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {};
    }

    initChildren() {
        this.$target = $(this.$el.attr('href'));
    }

    addListeners() {
        this.$el.on('click', this._emitEvent.bind(this));
    }

    _emitEvent(evt) {
        evt.preventDefault();

        globalEmitter.emit('click.ProductRequestMoreInformationView', this.$target);
    }
}

export default () => {
    return new ProductRequestMoreInformationView();
};
