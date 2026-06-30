import BaseComponent from 'components/base-component';
import $ from 'jquery';
import 'waypoints/lib/jquery.waypoints.min.js';

class TimelineView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                item: '[data-timeline-item]',
            },
            activeClass: 'is-active',
        };
    }

    initChildren() {
        this.$wnd = $(window);
        this.$items = this.$el.find(this.options.selectors.item);
    }

    addListeners() {
        this.$items.each((idx, elem) => {
            const $elem = $(elem);

            $elem.waypoint({
                offset: () => {
                    return this.$wnd.height() - $elem.outerHeight() / 2;
                },
                handler: (direction) => {
                    switch (direction) {
                    case 'down':

                        $elem.addClass(this.options.activeClass);

                        break;
                    default:
                        break;
                    }
                },
            });
        });
    }
}

export default () => {
    return new TimelineView();
};
