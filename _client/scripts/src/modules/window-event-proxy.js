import globalEmitter from 'modules/global-emitter';
import Utils from 'modules/utils';
import $ from 'jquery';

class WindowEventProxy {

    constructor () {

        this.defaultOptions = {
            debounceResizeMs: 150,
            throttleScrollMs: 150
        };
    }

    init () {

        this.addListeners();
    }

    addListeners () {

        this._debouncedResize = Utils.debounce(this._rawDebouncedResize, this.defaultOptions.debounceResizeMs);
        this._throttledScroll = Utils.throttle(this._rawThrottledScroll, this.defaultOptions.throttleScrollMs);

        $(window).on('resize', this._debouncedResize.bind(this));
        $(window).on('scroll', this._throttledScroll.bind(this));
    }

    _rawDebouncedResize () {

        globalEmitter.emit('windowevents:debouncedresize', this);
    }

    _rawThrottledScroll (e) {

        globalEmitter.emit('windowevents:throttledscroll', e);
    }
}

export default new WindowEventProxy();