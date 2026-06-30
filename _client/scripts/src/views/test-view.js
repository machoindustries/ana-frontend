import BaseComponent from 'components/base-component';

// View would be any single use visual component.
// Perhaps a primary navigation, or a module which manages multiple child components.

class TestView extends BaseComponent {
    constructor() {
        super();

        // Use this to store any internal component state
        this.state = { };

        // Set up your default options here - these are extended with any
        // options passed into the initialisation constructor.
        this.defaultOptions = {
            selectors: {
                button: '[data-button]',
                dynamic: '[data-dynamic-content]',
            },
            message: 'default',
        };
    }

    // Automatically called on init
    // Find child elements, initialise supporting modules etc.
    initChildren() {
        this.$button = this.$el.find('[data-button]');
        this.$dynamicContent = this.$el.find('[data-dynamic-content]');

        console.log(`TestView.init: options message: ${ this.options.message }`);
    }

    // Automatically called on init
    // Add listeners to elements, supporting modules etc.
    addListeners() {
        this.$button.on('click', this._handleClick.bind(this));

        // Just to demo subscribing to component instance events. Normally, you
        // would be subscribing to events from some child component / module.
        this.once('elementClicked', () => {
            console.log('TestView._addListeners: This is a bit circular');
        });
    }

    _handleClick(evt) {
        evt.preventDefault();
        console.log('TestView._handleClick: $button clicked');

        // Anything derived from BaseView can emit events
        this.emit('elementClicked');
    }
}

// Export a factory method which will construct a new instance of the class
// import viewFactory from './src/test-component';
// let testView = viewFactory();
// testView.init($el, opts);
export default () => {
    return new TestView();
};
