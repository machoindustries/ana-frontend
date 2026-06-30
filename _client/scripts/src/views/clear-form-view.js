import BaseComponent from 'components/base-component';

class ClearFormView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                clear: '[data-clear-filters]',
            },
        };
    }

    initChildren() {
        this.$trigger = this.$el.find(this.options.clear);
        this.$elements = this.$el[0].elements;
    }

    addListeners() {
        this.$trigger.on('click', this._handleClick.bind(this));
    }

    _handleClick(evt) {
        for (let i = 0; i < this.$elements.length; i++) {
            const fieldType = this.$elements[i].type.toLowerCase();

            switch (fieldType) {
            case 'text':
            case 'password':
            case 'textarea':
            case 'hidden':
                this.$elements[i].value = '';
                break;

            case 'radio':
            case 'checkbox':
                if (this.$elements[i].checked) {
                    this.$elements[i].checked = false;
                }
                break;

            case 'select-one':
            case 'select-multi':
                this.$elements[i].selectedIndex = 0;
                break;

            default:
                break;
            }
        }

        evt.preventDefault();
    }
}

export default () => {
    return new ClearFormView();
};
