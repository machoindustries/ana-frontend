import BaseComponent from 'components/base-component';
import jitRequire from 'modules/jit-require';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import animate from 'modules/animate';

class CtaBlockView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                formsView: '[data-forms-view]',
                dropdown: '[data-form-selection]',
                submit: '[data-submit]',
                loadingOverlay: '[data-cta-block-loading-overlay]',
                stickyNav: '.c-sticky-nav',
            },
            formDisplay: '[data-form-display]',
            formDisplayShowClass: 'c-block-cta__form-display--show',
            loadingModifier: 'is-loading',
            animateDuration: 500,
            animateEasing: 'easeInOutQuad',
            pageUrl: '/',
        };
    }

    initChildren() {
        this.$formsView = this.$el.find(this.options.selectors.formsView);
        this.$loadingOverlay = this.$el.find(this.options.selectors.loadingOverlay);

        console.log(`CTA block view found ${this.$loadingOverlay.length} loading overlays`);

        if (this.$formsView.length > 0) {
            this.$dropdown = this.$el.find(this.options.selectors.dropdown);
            this.$submit = this.$el.find(this.options.selectors.submit);
            this.$formDisplay = this.$el.find(this.options.formDisplay);
        }
    }

    addListeners() {
        if (this.$formsView.length > 0) {
            this.$dropdown.on('change', this._loadForm.bind(this));
        }

        globalEmitter.on('click.ProductRequestMoreInformationView', this._scrollToAndLoadForm.bind(this));
    }

    _scrollToAndLoadForm($ctaBlock) {
        console.log('_scrollToAndLoadForm.CtaBlockView');

        if (this.$el.is($ctaBlock)) {
            animate(this.$el, 'scroll', { offset: this._calculateStickyNavHeight(),
                duration: this.options.animateDuration,
                easing: this.options.animateEasing });

            this.$dropdown.prop('selectedIndex', 1);
            this._loadForm();
        }
    }

    _calculateStickyNavHeight() {
        const $stickyNav = $(this.options.selectors.stickyNav);

        if ($stickyNav.length === 0) {
            return 0;
        }

        return -$stickyNav.outerHeight();
    }

    _loadForm() {
        if ($('.lt-ie9').size() > 0) {
            this.$submit.trigger('click');
            return;
        }

        this.$loadingOverlay.addClass(this.options.loadingModifier);

        const $selectedOption = this.$dropdown.find('option:selected'),
            timeStart = Date.now();

        if ($selectedOption.length > 0) {
            globalEmitter.emit('state.CTABlockFormDropDown', { action: 'selected', name: $selectedOption.text() });

            this.$formDisplay.load(`${ this.options.pageUrl }BlockPartialHtml?content=${ $selectedOption.val() }`, () => {
                this.$loadingOverlay.removeClass(this.options.loadingModifier);
                this.$formDisplay.addClass(this.options.formDisplayShowClass);

                console.log(`CTA block loaded form in ${ Date.now() - timeStart } ms`);

                if (window.epi.EPiServer.Forms) {
                    window.epi.EPiServer.Forms.__Initialized = false;
                    window.epi.EPiServer.Forms.init();

                    // HACK: No way to call this again as its an IIFE
                    $.getScript('/util/EPiServer.Forms.Samples/ClientResources/ViewMode/EPiServerFormsSamples.js');
                }

                jitRequire(this.$formDisplay[0]);
            });
        }
    }
}

export default () => {
    return new CtaBlockView();
};
