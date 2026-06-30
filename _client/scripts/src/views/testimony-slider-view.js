import BaseComponent from 'components/base-component';
import 'owl.carousel';

class TestimonySliderView extends BaseComponent {
    constructor() {
        super();

        this.owlCarouselOptions = {
            margin: 20,
            loop: true,
            nav: true,
            navText: '',
            dots: false,
            items: 1,
            center: true,
            smartSpeed: 500,
            autoWidth: true,
            stagePadding: 20,
            responsive: {
                1024: {
                    margin: 120,
                    stagePadding: 60,
                },
                1280: {
                    margin: 260,
                    stagePadding: 130,
                },
            },
        };
    }

    initChildren() {
        this.$el.owlCarousel(this.owlCarouselOptions);
    }
}

export default () => {
    return new TestimonySliderView();
};
