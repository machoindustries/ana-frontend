import BaseComponent from 'components/base-component';
import lightboxUtils from 'modules/lightbox-utils';
import 'magnific-popup';
import $ from 'jquery';

class PersonView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                personName: '[data-person-name]',
                personImage: '[data-person-image]',
            },
            modalParentClass: 'e-modal c-person__modal',
            modalInnerClass: 'c-person c-person--large',
            modalAdditionalClass: 'mfp-fade',
            modalClassSelector: '[data-modal-class]',
            modalClassAttribute: 'data-modal-class',
        };
    }

    initChildren() {
        this.$personName = this.$el.find(this.options.selectors.personName);
        this.$personImage = this.$el.find(this.options.selectors.personImage);
    }

    addListeners() {
        this.$personName.on('click', this._openModal.bind(this));
        this.$personImage.on('click', this._openModal.bind(this));
    }

    _openModal(evt) {
        evt.preventDefault();

        const self = this;
        const $html = $(this.$el.html());

        $html.find(this.options.modalClassSelector).each((idx, el) => {
            const $el = $(el),
                modalClass = $el.attr(this.options.modalClassAttribute);

            if (typeof modalClass !== 'undefined' && modalClass !== '') {
                $el.addClass(modalClass);
            }
        });

        $.magnificPopup.instance.close();

        this.$personName.magnificPopup({
            items: {
                src: `<div class="${this.options.modalParentClass}">
                        <div class="${this.options.modalInnerClass}">
                          <div class="grid-constraint">
                            <div class="grid grid--center">
                              <div class="grid__item one-whole large--eight-twelfths">
                              ${ $html.html() }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>`,
                type: 'inline',
            },
            callbacks: {
                open: () => {
                    setTimeout(() => {
                        self.$el.off('click.magnificPopup');

                        lightboxUtils.bindOpenModalButtons();
                    }, 0);
                },
            },
            mainClass: `c-person-magnific ${this.options.modalAdditionalClass}`,
            closeBtnInside: false,
        }).magnificPopup('open');
    }
}

export default () => {
    return new PersonView();
};
