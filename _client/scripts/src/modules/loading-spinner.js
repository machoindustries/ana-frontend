import svgSpinner from 'values/svg-spinner';
import $ from 'jquery';

/*
    Singleton module to control full-page loading spinner. The spinner will show as long as at least one caller
    has requested it but not released it. This ensures a single spinner on the page which deals correctly with
    requests to show and hide from multiple decoupled callers.

    request () : informs the singleton that the supplied caller needs the spinner to be shown
    release () : informs the singleton that the supplied caller no longer needs the spinner to be shown
*/

const loadingSpinnerOptions = {
    appendToSelector: 'body',
    spinnerClass: 'e-spinner',
    activeClass: 'is--active'
};

let LoadingSpinnerInstance = null;

class LoadingSpinner {

    constructor () {

        // Must be a singleton
        if (LoadingSpinnerInstance !== null) {
            return LoadingSpinnerInstance;
        }

        this.ready = false;
        this.$appendTo = $(loadingSpinnerOptions.appendToSelector);

        if (this.$appendTo.children(svgSpinner.getSpinnerSelector()).length === 0) {

            this.$appendTo.append(`${svgSpinner.getSpinner(`${loadingSpinnerOptions.spinnerClass}`)}`);
        }

        setTimeout(() => {

            this.$spinner = this.$appendTo.find(svgSpinner.getSpinnerSelector());
            this.ready = true;

            this._applyPendingActions();
            this.update();

        }, 0);

        this.pendingActions = [];
        this.activeRequests = [];

        LoadingSpinnerInstance = self;

        return LoadingSpinnerInstance;
    }

    _applyPendingActions () {

        for (let a = 0; a < this.pendingActions.length; a++) {
            if (this.pendingActions[a]) {
                this.$spinner.addClass(loadingSpinnerOptions.activeClass);
            } else {
                this.$spinner.removeClass(loadingSpinnerOptions.activeClass);
            }
        }

        this.pendingActions.length = 0;
    }

    _showHideSpinner (show) {

        if (this.ready) {

            this._applyPendingActions();

            if (show) {
                this.$spinner.addClass(loadingSpinnerOptions.activeClass);
            } else {
                this.$spinner.removeClass(loadingSpinnerOptions.activeClass);
            }
        }
        else {

            this.pendingActions.push(show);
        }
    }

    request (requestId) {

        //console.log(`*** spinner requested by ${requestId} ***`);

        if (this.activeRequests.indexOf(requestId) === -1) {
            this.activeRequests.push(requestId);
        }

        this.update();
    }

    release (requestId) {

        //console.log(`*** spinner released by ${requestId} ***`);

        const idx = this.activeRequests.indexOf(requestId);

        if (idx !== -1) {
            this.activeRequests.splice(idx, 1);
        }

        this.update();
    }

    update () {

        this._showHideSpinner(this.activeRequests.length > 0);
    }
}

export default LoadingSpinner;