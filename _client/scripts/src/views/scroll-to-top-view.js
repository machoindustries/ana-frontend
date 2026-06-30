import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import $ from 'jquery';

class ScrollToTopView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            animateDuration: 500,
            animateEasing: 'easeInOutQuad',
        };
    }

    initChildren() {
        this.$scrolltotop = this.$el;
    }

    addListeners() {
        this.$scrolltotop.on('click', this._scrollToTop.bind(this));
    }

    _scrollToTop(evt) {
        evt.preventDefault();

        animate($('body'), 'scroll', { offset: 0,
            duration: this.options.animateDuration,
            easing: this.options.animateEasing });
    }
}

export default () => {
    return new ScrollToTopView();
};
