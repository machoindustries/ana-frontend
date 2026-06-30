import EventEmitter from 'eventemitter3';

export default class BaseComponent extends EventEmitter {
    constructor() {
        super();

        // Turn off memory leak warning on EventEmitter.
         
        this.setMaxListeners(0);

         

        this.state = {};
        this.defaultOptions = {};
    }

    init($el, options) {
        this.$el = $el;
        this.options = Object.assign({}, this.defaultOptions, options);

        this.initChildren();
        this.addAriaAttributes();
        this.addListeners();
    }

    initChildren() {

    }

    addAriaAttributes() {

    }

    addListeners() {

    }
}
