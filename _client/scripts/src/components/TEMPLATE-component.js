import BaseComponent from 'components/base-component';

class TemplateComponent extends BaseComponent {
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
    return new TemplateComponent();
};
