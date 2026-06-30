import BaseComponent from 'components/base-component';
import $ from 'jquery';

class GridOverlayView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            overlayOpenClass: 'c-grid-overlay--open',
        };
    }

    initChildren() {
        this.$btn = $('<button class="c-grid-overlay__toggler">|||</button>');

        $('body').append(this.$btn);
    }


    addListeners() {
        this.$btn.on('click', this._toggleGrid.bind(this));
    }

    _toggleGrid(evt) {
        evt.preventDefault();

        this.$el.toggleClass(this.options.overlayOpenClass);
    }
}

export default () => {
    return new GridOverlayView();
};
