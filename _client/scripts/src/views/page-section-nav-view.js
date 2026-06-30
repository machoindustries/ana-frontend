import BaseComponent from 'components/base-component';
import animate from 'modules/animate';
import AccordionItemView from 'views/accordion-item-view';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';
import breakpoints from 'values/breakpoints';
import 'waypoints/lib/jquery.waypoints.min.js';

class PageSectionNavView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                container: '[data-page-section-nav-container]',
                linksList: '[data-page-section-nav-link-list]',
                link: '[data-page-section-nav-link]',
                sectionHeading: '[data-nav-section-heading]',
                accordionToggle: '[data-accordion-toggle]',
                blockParent: '.block',
                carousel: '.c-carousel',
                navUnderlineBar: '[data-nav-underline-bar]',
            },
            linkSelectorAttr: 'data-page-section-nav-link',
            sectionHeadingAttr: 'nav-section-heading',
            targetSectionIndexAttr: 'data-target-section-idx',
            sectionIndexAttr: 'data-section-idx',
            visibleClass: 'c-page-section-nav--visible',
            linkItemClass: 'c-page-section-nav__item',
            linkClass: 'c-page-section-nav__link',
            linkActiveClass: 'is-active',
            animateDuration: 500,
            animateEasing: 'easeInOutQuad',
            scrollOffsetBias: 100, // arbitrary height in pixels to subtract from scroll offset - prevents sticky nav obscuring scroll target
            underlineActiveClass: 'is-active',
        };

        this.state = {
            currentSection: 0,
            containerScrollLeft: 0,
        };
    }

    initChildren() {
        const self = this;

        this.$body = $('body');
        this.$container = this.$el.find(this.options.selectors.container);
        this.$linksList = this.$el.find(this.options.selectors.linksList);
        this.$sectionHeadings = this.$body.find(this.options.selectors.sectionHeading).filter(function() {
            /* eslint-disable-next-line no-invalid-this */
            const $elem = $(this),
                $parentBlock = $elem.closest(self.options.selectors.blockParent);

            return $parentBlock.parents(self.options.selectors.carousel).length === 0;
        });
        this.$navUnderlineBar = this.$el.find(this.options.selectors.navUnderlineBar);

        if (this.$sectionHeadings.length === 0) {
            this.$el.remove();
            return;
        }

        this.$linksList.html(this._buildNavHTML());
        this.$el.addClass(this.options.visibleClass);
        this.$links = this.$linksList.find(this.options.selectors.link);
        this.$activeLink = this.$links.filter(this.options.linkActiveClass);

        globalEmitter.emit('active.PageSectionNavView');
    }

    addListeners() {
        if (typeof this.$links != 'undefined') {
            this.$links.on('click', this._handleLinkClick.bind(this));
        }
        if (typeof this.$container != 'undefined') {
            this.$container.on('scroll', this._handleContainerScroll.bind(this));
        }

        this.$sectionHeadings.each((idx, elem) => {
            const $elem = $(elem),
                $parentBlock = $elem.closest(this.options.selectors.blockParent);

            $elem.attr(this.options.sectionIndexAttr, idx);

            $parentBlock.waypoint({
                offset: this.options.scrollOffsetBias,
                handler: (direction) => {
                    console.log($elem, direction, this.state);

                    this.state.currentSection = parseInt($elem.attr(this.options.sectionIndexAttr), 10);

                    if (direction === 'up' && this.state.currentSection > 0) {
                        this.state.currentSection--;
                    } else if (direction === 'up' && this.state.currentSection === 0) {
                        console.log('removing active class');
                        this.$links.removeClass(this.options.linkActiveClass);
                        this.$navUnderlineBar.removeClass(this.options.underlineActiveClass);

                        return;
                    }

                    this._updateActiveLink();
                },
            });
        });

        if (!$('html').hasClass('lt-ie9')) {
            this.accordionItemView = new AccordionItemView();
            this.accordionItemView.init(this.$container, {
                disableAtBreakpoint: breakpoints.large,
            });
        }
    }

    _buildNavHTML() {
        return `${ this.$sectionHeadings.map((idx, elem) => {
            return `<li class="${ this.options.linkItemClass }">
                <a class="${ this.options.linkClass }"
                    href="${ $(elem).attr('id') }"
                    ${ this.options.targetSectionIndexAttr }="${ idx }"
                    ${ this.options.linkSelectorAttr}
                    data-gtm data-gtm-event="sticky-nav" data-gtm-category="Sticky Navigation" data-gtm-label="${ $(elem).data(this.options.sectionHeadingAttr) }">
                    ${ $(elem).data(this.options.sectionHeadingAttr) }

                </a>
            </li>`;
        }).get().join('') }`;
    }

    _updateActiveLink() {
        this.$activeLink = this.$links.removeClass(this.options.linkActiveClass)
            .filter(`[${ this.options.targetSectionIndexAttr }=${ this.state.currentSection }]`)
            .addClass(this.options.linkActiveClass);

        this._updateUnderline();
    }

    _updateUnderlinePos() {
        this.$navUnderlineBar.css('transform', `translateX(-${ this.state.containerScrollLeft }px)`);
    }

    _updateUnderline() {
        this.$navUnderlineBar.addClass(this.options.underlineActiveClass).css({
            width: `${ this.$activeLink.width() }px`,
            left: `${ this.$activeLink.offset().left - this.$linksList.offset().left }px`,
        });
    }

    _handleContainerScroll() {
        this.state.containerScrollLeft = this.$container.scrollLeft();

        this._updateUnderlinePos();
    }

    _handleLinkClick(evt) {
        evt.preventDefault();

        const $clickedLink = $(evt.target),
            $targetSection = this.$sectionHeadings.eq(parseInt($clickedLink.attr(this.options.targetSectionIndexAttr), 10)),
            $targetBlock = $targetSection.closest(this.options.selectors.blockParent);

        animate(this.$body, 'scroll', { offset: $targetBlock.offset().top - this.options.scrollOffsetBias,
            duration: this.options.animateDuration,
            easing: this.options.animateEasing });

        this.$el.find(this.options.selectors.accordionToggle).trigger('click');
    }
}

export default () => {
    return new PageSectionNavView();
};
