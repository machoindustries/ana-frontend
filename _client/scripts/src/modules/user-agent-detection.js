import $ from 'jquery';

class UserAgentDetection {

    constructor () {

        this.defaultOptions = {
            userAgentClasses: {
                'ua-ie-10': 'MSIE 10.0;'
            }
        };
    }

    init () {

        this.$html = $('html');
        this.addUserAgentClasses();
    }

    addUserAgentClasses () {

        const uaString = navigator.userAgent,
            uaClasses = this.defaultOptions.userAgentClasses;

        for (const uac in uaClasses) {

            if (Object.hasOwn(uaClasses, uac)) {

                if (uaString.indexOf(uaClasses[uac]) !== -1) {

                    this.$html.addClass(uac);
                }
            }
        }
    }
}

export default new UserAgentDetection();