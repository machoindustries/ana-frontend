import BaseComponent from 'components/base-component';
import $ from 'jquery';
import Modernizr from '../../lib/modernizr';

class ObjectFitPolyfill extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            targetContainerSelector: '[data-object-fit-container]',
            targetSrcSelector: 'img[data-object-fit-src]',
            configAttrBackgroundSize: 'data-object-fit',
            configAttrBackgroundPosition: 'data-object-fit-config-bgpos',
            configAttrBackgroundRepeat: 'data-object-fit-config-bgrepeat',
            defaultBackgroundSize: 'cover',
            defaultBackgroundPosition: '50%',
            defaultBackgroundRepeat: 'no-repeat',
        };

        this.state = {
            hasExecuted: false,
        };
    }

    initChildren() {
        this.$html = $('html');
        this.$elems = this.$el.find(this.options.targetContainerSelector);
    }

    execute() {
        // Only execute once, and only if the browser doesn't support object-fit
        if (!this.state.hasExecuted) {
            this.state.hasExecuted = true;

            if (!Modernizr.objectfit) {
                // Run polyfill
                this.$elems.each((idx, elem) => {
                    // Take the src of the srcElem and make it the background-image of the container
                    const $container = $(elem),
                        $srcElem = $container.find(this.options.targetSrcSelector),
                        dataBgSize = $srcElem.attr(this.options.configAttrBackgroundSize),
                        dataBgPos = $srcElem.attr(this.options.configAttrBackgroundPosition),
                        dataBgRepeat = $srcElem.attr(this.options.configAttrBackgroundRepeat),
                        configBackgroundSize = typeof dataBgSize !== 'undefined' && dataBgSize.length > 0 ? dataBgSize : this.options.defaultBackgroundSize,
                        configBackgroundPosition = typeof dataBgPos !== 'undefined' && dataBgPos.length > 0 ? dataBgPos : this.options.defaultBackgroundPosition,
                        configBackgroundRepeat = typeof dataBgRepeat !== 'undefined' && dataBgRepeat.length > 0 ? dataBgRepeat : this.options.defaultBackgroundRepeat;

                    console.log(`dataBgPos: ${ dataBgPos }`);

                    if ($srcElem.length > 0) {
                        const srcPath = $srcElem.attr('src');

                        if (srcPath.length > 0) {
                            $container.css({
                                'background-image': `url(${ srcPath })`,
                                'background-repeat': configBackgroundRepeat,
                                'background-size': configBackgroundSize,
                                'background-position': configBackgroundPosition,
                            });

                            $srcElem.hide();
                        }
                    }
                });

                return;
            }
        }
    }
}

export default () => {
    return new ObjectFitPolyfill();
};
