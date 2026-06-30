import BaseComponent from 'components/base-component';
import DropdownComponent from 'components/dropdown-component';
import globalEmitter from 'modules/global-emitter';
import enquire from 'enquire.js';
import breakpoints from 'values/breakpoints';
import Utils from 'modules/utils';

class LandingPageNavView extends BaseComponent {
    constructor() {
        super();

        this.state = {
            enabled: true,
            openWhenLastDisabled: false,
        };

        this.defaultOptions = {
            breakpoints: {
                enableAt: Utils.getMediaQueryMax(breakpoints.large - 1),
                disableAt: Utils.getMediaQueryMin(breakpoints.large),
            },
        };
    }

    initChildren() {
        this.dropdownComponent = new DropdownComponent();
        this.dropdownComponent.init(this.$el);
    }

    addListeners() {
        this.dropdownComponent.on('dropdowncomponent:open', this._handleDropdownComponentOpen.bind(this));
        globalEmitter.on('dropdownview:open', this._handleDropdownViewOpen.bind(this));
        enquire.register(this.options.breakpoints.enableAt, this._enable.bind(this));
        enquire.register(this.options.breakpoints.disableAt, this._disable.bind(this));
    }

    // Handles this view's child dropdown opening
    _handleDropdownComponentOpen() {
        globalEmitter.emit('dropdownview:open', this);
    }

    // Handles other views' dropdowns opening
    _handleDropdownViewOpen(data) {
        // We need to check if the event has come from this view, if so don't do anything
        if (this !== data) {
            this.dropdownComponent.close();
        }
    }

    _enable() {
        // Ensure the dropdown returns to the state it was at before being disabled.
        if (this.state.openWhenLastDisabled) {
            this.dropdownComponent.open(false);
        } else {
            this.dropdownComponent.close(false);
        }

        this.state.enabled = true;
    }

    _disable() {
        this.state.openWhenLastDisabled = this.dropdownComponent.state.open;
        this.dropdownComponent.open(false);
        this.state.enabled = false;
    }
}

export default () => {
    return new LandingPageNavView();
};
