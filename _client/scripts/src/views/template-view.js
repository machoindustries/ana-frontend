import BaseComponent from 'components/base-component';

class TemplateView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {};
    }

    initChildren() {


    }

    addListeners() {


    }
}

export default () => {
    return new TemplateView();
};
