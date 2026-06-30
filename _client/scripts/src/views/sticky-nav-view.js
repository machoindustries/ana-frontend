import BaseComponent from 'components/base-component';
import globalEmitter from 'modules/global-emitter';
import 'waypoints/lib/jquery.waypoints.min.js';
import 'waypoints/lib/shortcuts/sticky.min.js';

class StickyNavView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            hasPageSectionNavClass: 'c-sticky-nav--has-page-section-nav',
        };

        this.state = {};
    }

    initChildren() {
        this.Waypoint = window.Waypoint;
    }

    addListeners() {
        this.sticky = new this.Waypoint.Sticky({
            element: this.$el[0],
        });

        globalEmitter.on('active.PageSectionNavView', this._setPageSectionNavClass.bind(this));
    }

    _setPageSectionNavClass() {
        this.$el.addClass(this.options.hasPageSectionNavClass);
    }
}

export default () => {
    return new StickyNavView();
};
