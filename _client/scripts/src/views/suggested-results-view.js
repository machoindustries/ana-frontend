import BaseComponent from 'components/base-component';
import $ from 'jquery';

// const suggestedResultsJson = {
//     "suggestedResults": [
//         {
//             "url": "http://www.google.com",
//             "title": "<em>Cert</em>ification Requirements"
//         },
//         {
//             "url": "/",
//             "title": "<em>Cert</em>ification Renewals"
//         },
//         {
//             "url": "/",
//             "title": "<em>Cert</em>ification Policies"
//         },
//         {
//             "url": "/",
//             "title": "<em>Cert</em>ification Test Prep"
//         }
//     ],
//     "suggestedResultsListType": "simple",
//     "suggestedProductsOneHeading": "Education",
//     "suggestedProductsOne": [
//         {
//             "class": "online",
//             "url": "/",
//             "category": "Online Course",
//             "title": "Adult-Gerontology Acute Care Nurse and this title is really long"
//         },
//         {
//             "class": "webinar",
//             "url": "/",
//             "category": "Webinar",
//             "title": "Psychiatric-Mental Health Nurse..."
//         }
//     ],
//     "suggestedProductsOneListType": "icon",
//     "suggestedProductsTwoHeading": "",
//     "suggestedProductsTwo": [
//         {
//             "url": "/",
//             "imageSrc": "../assets/img/content/7-steps-book.jpg",
//             "imageAlt": "7 Steps to Organizational Leadership and more info",
//             "title": "7 Steps to Organizational Leadership and more info",
//             "desc": "Secondary Information",
//             "category": "ANA"
//         },
//         {
//             "url": "/",
//             "imageSrc": "../assets/img/content/magnet-hospitals-book.jpg",
//             "imageAlt": "Magnet Hospitals Revisited: Attr...",
//             "title": "Magnet Hospitals Revisited: Attr...",
//             "desc": "Secondary Information",
//             "category": "ANCC"
//         }
//     ],
//     "suggestedProductsTwoListType": "thumbnail",
//     "suggestedPopular": [
//         {
//             "url": "/",
//             "title": "Primum igitur, quid est et dolore at magnum periculum adiit"
//         },
//         {
//             "url": "/",
//             "title": "Sunt autem nusquam hoc tenebo torquem detraxit hosti et"
//         },
//         {
//             "url": "/",
//             "title": "Primum igitur, quid est et dolore"
//         }
//     ],
//     "suggestedPopularListType": "column"
// }

class SuggestedResultsView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            selectors: {
                searchInput: '[data-search-input]',
                suggestedResults: '[data-suggested-results]',
                suggestedProducts: '[data-suggested-products]',
                suggestedProductsOne: '[data-suggested-products-one]',
                suggestedProductsTwo: '[data-suggested-products-two]',
                suggestedPopular: '[data-suggested-popular]',
                suggestedResultsList: '[data-suggested-results-list]',
                suggestedProductsOneList: '[data-suggested-products-one-list]',
                suggestedProductsTwoList: '[data-suggested-products-two-list]',
                suggestedProductsOneHeading: '[data-suggested-products-one-heading]',
                suggestedProductsTwoHeading: '[data-suggested-products-two-heading]',
                suggestedPopularList: '[data-suggested-popular-list]',
            },
            iconListClass: 'list--icon',
            thumbnailListClass: 'list--thumbnail',
        };
    }

    initChildren() {
        this.webService = this.$el.attr('data-web-service');
        this.$searchInput = this.$el.find(this.options.selectors.searchInput);
        this.searchVal = '';
        this.suggestedResults = [];
        this.suggestedResultsListType = '';
        this.suggestedProductsOne = [];
        this.suggestedProductsOneHeading = '';
        this.suggestedProductsOneListType = '';
        this.suggestedProductsTwo = [];
        this.suggestedProductsTwoHeading = '';
        this.suggestedProductsTwoListType = '';
        this.suggestedPopular = [];
        this.suggestedPopularListType = '';
        this.$suggestedResults = this.$el.find(this.options.selectors.suggestedResults);
        this.$suggestedProducts = this.$el.find(this.options.selectors.suggestedProducts);
        this.$suggestedProductsOne = this.$el.find(this.options.selectors.suggestedProductsOne);
        this.$suggestedProductsTwo = this.$el.find(this.options.selectors.suggestedProductsTwo);
        this.$suggestedPopular = this.$el.find(this.options.selectors.suggestedPopular);
        this.$suggestedResultsList = this.$el.find(this.options.selectors.suggestedResultsList);
        this.$suggestedProductsOneList = this.$el.find(this.options.selectors.suggestedProductsOneList);
        this.$suggestedProductsTwoList = this.$el.find(this.options.selectors.suggestedProductsTwoList);
        this.$suggestedProductsOneHeading = this.$el.find(this.options.selectors.suggestedProductsOneHeading);
        this.$suggestedProductsTwoHeading = this.$el.find(this.options.selectors.suggestedProductsTwoHeading);
        this.$suggestedPopularList = this.$el.find(this.options.selectors.suggestedPopularList);
    }

    addListeners() {
        const self = this;

        this.$searchInput.on('keyup', function() {
            /* eslint-disable-next-line no-invalid-this */
            const value = $(this).val();
            const count = value.length;

            // only run search if more than two characters
            if (count > 2) {
                self._updateSearchValue(value);
                self._getResults();
            }
        });
    }


    _getSimpleListItem(dataItem) {
        const item =
            `<li class="grid__item one-whole">
                <a href="${dataItem.url}">${dataItem.title}</a>
            </li>`;

        return item;
    }

    _getIconListItem(dataItem) {
        const item =
            `<li>
                <a href="${dataItem.url}" class="${dataItem.class}">
                    <div class="icon"></div>    
                    <div class="info">
                        <div class="course-category">${dataItem.category}</div>
                        <div class="course-title">${dataItem.title}</div>
                    </div>
                </a>
            </li>`;

        return item;
    }

    _getThumbnailListItem(dataItem) {
        const categoryClass = `e-tag--${ dataItem.category.toLowerCase()}`;

        const item =
            `<li>
                <a href="${dataItem.url}">
                    <div class="thumbnail">
                        <img src="${dataItem.imageSrc}" alt="${dataItem.imageAlt}">
                    </div>    
                    <div class="info">
                        <div class="book-title">${dataItem.title}</div>
                        <div class="book-desc">${dataItem.desc}</div>
                    </div>
                    <div class="tag">
                        <div class="e-tag ${categoryClass}">${dataItem.category}</div>
                    </div>
                </a>
            </li>`;

        return item;
    }

    _getColumnListItem(dataItem) {
        const item =
            `<li class="grid__item medium--one-third">
                <a href="${dataItem.url}">${dataItem.title}</a>
            </li>`;

        return item;
    }


    _clearListItems($list) {
        $list.find('li').each((index, element) => {
            $(element).remove();
        });
    }

    _clearListHeading($heading) {
        $heading.text('');
    }

    _appendHeading($heading, headingTxt) {
        $heading.text(headingTxt);
    }

    _appendItems(listArray, $list, layout) {
        const self = this;

        listArray.map((item) => {
            let $item;

            switch (layout) {
            case 'list':
                $item = self._getSimpleListItem(item);
                break;
            case 'column':
                $item = self._getColumnListItem(item);
                break;
            case 'icon':
                $item = self._getIconListItem(item);
                break;
            case 'thumbnail':
                $item = self._getThumbnailListItem(item);
                break;
            default:
                $item = self._getSimpleListItem(item);
            }

            $list.append($item);
            $list.attr('data-list-type', layout);
            return listArray;
        });
    }

    _toggleList(show, $element) {
        if (show) {
            $element.removeClass('no-results');
        } else {
            $element.addClass('no-results');
        }
    }

    _updateHtml() {
        this._clearListItems(this.$suggestedResultsList);
        this._clearListItems(this.$suggestedProductsOneList);
        this._clearListHeading(this.$suggestedProductsOneHeading);
        this._clearListHeading(this.$suggestedProductsTwoHeading);
        this._clearListItems(this.$suggestedProductsTwoList);
        this._clearListItems(this.$suggestedPopularList);

        if (this.suggestedResults && this.suggestedResults.length > 0) {
            this._appendItems(this.suggestedResults, this.$suggestedResultsList, this.suggestedResultsListType);
            this._toggleList(true, this.$suggestedResults);
        } else {
            this._toggleList(false, this.$suggestedResults);
        }

        if (this.suggestedProductsOne && this.suggestedProductsOne.length > 0) {
            this._appendHeading(this.$suggestedProductsOneHeading, this.suggestedProductsOneHeading);
            this._appendItems(this.suggestedProductsOne, this.$suggestedProductsOneList, this.suggestedProductsOneListType);
            this._toggleList(true, this.$suggestedProductsOne);
        }


        if (this.suggestedProductsTwo && this.suggestedProductsTwo.length > 0) {
            // there might not be a heading for column 2
            if (this.suggestedProductsTwoHeading.length > 0) {
                this._appendHeading(this.$suggestedProductsTwoHeading, this.suggestedProductsTwoHeading);
            }
            this._appendItems(this.suggestedProductsTwo, this.$suggestedProductsTwoList, this.suggestedProductsTwoListType);
            this._toggleList(true, this.$suggestedProductsTwo);
        }

        // hide the whole products section if there are no items of either product category
        if ((!this.suggestedProductsOne || this.suggestedProductsOne.length < 1) &&
            (!this.suggestedProductsTwo || this.suggestedProductsTwo.length < 1)) {
            this.$suggestedProducts.addClass('no-results');
        } else {
            this.$suggestedProducts.removeClass('no-results');
        }

        if (this.suggestedPopular && this.suggestedPopular.length > 0) {
            this._appendItems(this.suggestedPopular, this.$suggestedPopularList, this.suggestedPopularListType);
            this._toggleList(true, this.$suggestedPopular);
        } else {
            this._toggleList(false, this.$suggestedPopular);
        }
    }

    _getResults() {
        const self = this;

        if (!this.webService) {
            return;
        }

        $.ajax({
            url: self.webService,
            data: {
                query: self.searchVal,
            },
        })
            .done((data) => {
                let response = data;

                // let response = suggestedResultsJson;

                if (self.searchVal === '') {
                    response = {
                        suggestedResults: [],
                        suggestedResultsListType: '',
                        suggestedProductsOneHeading: '',
                        suggestedProductsOneListType: '',
                        suggestedProductsOne: [],
                        suggestedProductsTwoHeading: '',
                        suggestedProductsTwoListType: '',
                        suggestedProductsTwo: [],
                        suggestedPopular: [],
                        suggestedPopularListType: '',
                    };
                }

                self.suggestedResults = response.suggestedResults;
                self.suggestedResultsListType = response.suggestedResultsListType;
                self.suggestedProductsOne = response.suggestedProductsOne;
                self.suggestedProductsOneHeading = response.suggestedProductsOneHeading;
                self.suggestedProductsOneListType = response.suggestedProductsOneListType;
                self.suggestedProductsTwo = response.suggestedProductsTwo;
                self.suggestedProductsTwoHeading = response.suggestedProductsTwoHeading;
                self.suggestedProductsTwoListType = response.suggestedProductsTwoListType;
                self.suggestedPopular = response.suggestedPopular;
                self.suggestedPopularListType = response.suggestedPopularListType;

                self._updateHtml();
            });
    }

    _updateSearchValue(value) {
        this.searchVal = value;
    }
}

export default () => {
    return new SuggestedResultsView();
};
