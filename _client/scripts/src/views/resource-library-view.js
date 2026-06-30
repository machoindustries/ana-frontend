import BaseComponent from 'components/base-component';
import $ from 'jquery';
import animate from 'modules/animate';
import globalEmitter from 'modules/global-emitter';

class ResourceLibraryView extends BaseComponent {
    constructor() {
        super();

        this.state = { };

        this.defaultOptions = {
            selectors: {
                topicFilter: '[data-topic]',
            },
            contentTypeDropDown: '[data-content-type]',
            form: '[data-resource-library-form]',
            animateDuration: 0,
            animateEasing: 'easeInOutQuad',
        };
    }

    initChildren() {
        this.$topicCheckbox = this.$el.find(this.options.selectors.topicFilter);
        this.$contentTypeDropDown = this.$el.find(this.options.contentTypeDropDown);
        this.$form = this.$el.find(this.options.form);

        if (this.$topicCheckbox.is(':checked') || this.$contentTypeDropDown.val() !== '' || location.search.match(/contenttype|topics|page/i)) {
            this._scrollToFilters();
        }
    }

    addListeners() {
        this.$topicCheckbox.on('change', this._handleCheckboxChange.bind(this));
        this.$contentTypeDropDown.on('change', this._handleSelectChange.bind(this));
    }

    _handleSelectChange(evt) {
        evt.preventDefault();

        console.log(`ResourceLibraryView._handleChange: ${evt.target}`);

        globalEmitter.emit('state.ResourceLibrarySelectChange', evt, { action: 'selection', name: $(evt.target).find('option:selected').text() });

        this.$form.submit();
    }

    _handleCheckboxChange(evt) {
        evt.preventDefault();

        console.log(`ResourceLibraryView._handleChange: ${evt.target}`);

        const $target = $(evt.target),
            checkedStatus = $target.is(':checked') ? 'checked' : 'unchecked';

        // Send appropriate action depending on if the checkbox is checked or unchecked.
        globalEmitter.emit('state.ResourceLibrarySelectChange', evt, { action: checkedStatus, name: $target.val() });

        this.$form.submit();
    }

    _scrollToFilters() {
        animate($('body'), 'scroll', { offset: this.$el.offset().top,
            duration: this.options.animateDuration,
            easing: this.options.animateEasing });
    }
}

export default () => {
    return new ResourceLibraryView();
};
