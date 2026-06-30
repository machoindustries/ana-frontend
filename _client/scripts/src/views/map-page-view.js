import BaseComponent from 'components/base-component';
import LoadingSpinner from 'modules/loading-spinner';
import MapComponent from 'components/map-component';
import Utils from 'modules/utils';
import globalEmitter from 'modules/global-emitter';
import APIProxy from 'modules/api-proxy';

class MapPageView extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            mapSelector: '[data-map]',
            noResultsMessageSelector: '[data-map-no-results]',
            resultsOutputSelector: '[data-location-results-output]',
            resultsOutputContainerSelector: '[data-location-results-container]',
            outputOrgNameSelector: '[data-location-results-name]',
            outputKeyPersonnelSelector: '[data-location-results-key-personnel]',
            outputAddressSelector: '[data-location-results-address]',
            outputWebsiteSelector: '[data-location-results-website]',
            outputPhoneSelector: '[data-location-results-phone]',
            outputEmailSelector: '[data-location-results-email]',
            outputFaxSelector: '[data-location-results-fax]',
            outputCommentsSelector: '[data-location-results-comments]',
            outputOpeningHoursSelector: '[data-location-results-opening-hours]',
            outputViewOnMapLinkSelector: '[data-view-on-map-link]',
            mapPageTypeDataAttr: 'data-map-page-type',
            mapPageTypes: {
                state: 'state',
                accredited: 'accredited',
                magnet: 'magnet',
                pathway: 'pathway',
            },
            filters: {
                inUsa: {
                    selector: '[data-location-filter-inusa]',
                    values: {
                        usa: 'USA',
                        international: 'INT',
                    },
                },
                state: {
                    selector: '[data-location-filter-state]',
                },
                country: {
                    selector: '[data-location-filter-country]',
                },
                types: {
                    selector: '[data-location-filter-type]',
                },
            },
            filterContainerSelector: '[data-location-filter-container]',
            mapOptions: {

                /* Improved UX experience on maps */
                draggableCursor: 'pointer',
                draggingCursor: 'pointer',

                centerLatLng: {
                    lat: 39.833,
                    lng: -98.583,
                },
                reportClickedLocation: true,
            },
            allStatesFilterVal: '',
            allCountryFilterVal: '',
            defaultFilterVals: {
                state: '',
                inUsa: true,
                country: 'USA',
            },
            clientServerKeyMappings: {
                mapItems: 'Mapitem',
                index: 'Index',
                accreditorId: 'AccreditorId',
                address1: 'Address1',
                address2: 'Address2',
                city: 'City',
                state: 'State',
                postalCode: 'PostalCode',
                country: 'Country',
                providerFlag: 'ProviderFlag',
                approverFlag: 'ApproverFlag',
                jointFlag: 'JointFlag',
                PTAPFlag: 'PTAPFlag', /* Part of DT2-257 */
                AccreditationType: 'AccreditationType',
                onlineCEFlag: 'OnlineCEFlag',
                comments: 'Comments',
                status: 'Status',
            },
            getResultItemHTML: (name, mapLink, address) => {
                return `<tr><td data-cell-header="Name of organization:">${name}<a href="${mapLink}" target="_blank" class="e-responsive-table__map-link">View on map</a></td><td data-cell-header="Address:">${address}</td></tr>`;
            },
        };

        this.state = {
            initialised: false,
            filterValues: {
                inUsa: true,
                state: '',
                country: '',
            },
        };
    }

    initChildren() {
        this.guid = Utils.generateGUID();

        this.mapPageType = this.$el.attr(this.options.mapPageTypeDataAttr);

        if (typeof this.mapPageType === 'undefined' && !Object.hasOwn(this.options.mapPageTypes, this.mapPageType)) {
            console.log(`ERROR: map-page-view.initChildren : mapPageType "${this.mapPageType}" not recognized`);
        }

        this.$map = this.$el.find(this.options.mapSelector);
        this.$resultsOutput = this.$el.find(this.options.resultsOutputSelector);
        this.$resultsOutputContainer = this.$resultsOutput.closest(this.options.resultsOutputContainerSelector);
        this.$filterInUsa = this.$el.find(this.options.filters.inUsa.selector);
        this.$filterContainerInUsa = this.$filterInUsa.closest(this.options.filterContainerSelector);
        this.$filterState = this.$el.find(this.options.filters.state.selector);
        this.$filterContainerState = this.$filterState.closest(this.options.filterContainerSelector);
        this.$filterCountry = this.$el.find(this.options.filters.country.selector);
        this.$filterContainerCountry = this.$filterCountry.closest(this.options.filterContainerSelector);
        this.$filterType = this.$el.find(this.options.filters.types.selector);

        this.loadingSpinner = new LoadingSpinner();
        this.data = [];

        this.$outputOrgName = this.$el.find(this.options.outputOrgNameSelector);
        this.$outputKeyPersonnel = this.$el.find(this.options.outputKeyPersonnelSelector);
        this.$outputAddress = this.$el.find(this.options.outputAddressSelector);
        this.$outputWebsite = this.$el.find(this.options.outputWebsiteSelector);
        this.$outputPhone = this.$el.find(this.options.outputPhoneSelector);
        this.$outputEmail = this.$el.find(this.options.outputEmailSelector);
        this.$outputFax = this.$el.find(this.options.outputFaxSelector);
        this.$outputComments = this.$el.find(this.options.outputCommentsSelector);

        this.$outputOpeningHours = this.$el.find(this.options.outputOpeningHoursSelector);
        this.$outputViewOnMapLink = this.$el.find(this.options.outputViewOnMapLinkSelector);

        this.$resultsOutputContainer.hide();

        this._getLocationData();
    }

    addListeners() {
        this.$filterInUsa.on('change', (e) => {
            this._onInUsaFilterUpdate();
        });
        this.$filterState.on('change', (e) => {
            this._getLocationData();
        });
        this.$filterCountry.on('change', (e) => {
            this._getLocationData();
        });
        this.$filterType.on('change', (e) => {
            this._getLocationData();
        });

        globalEmitter.on('mapcomponent:locationselected', this._onMapLocationSelected.bind(this));
    }

    _onInUsaFilterUpdate() {
        const inUsaVal = this.$filterInUsa.val();

        switch (inUsaVal) {
        case this.options.filters.inUsa.values.usa:

            this.$filterContainerCountry.hide();
            this.$filterContainerState.show();
            break;

        case this.options.filters.inUsa.values.international:

            this.$filterContainerState.hide();
            this.$filterContainerCountry.show();
            break;

        default:

            console.log(`ERROR: map-page-view._onInUsaFilterUpdate : unrecognised filter value "${inUsaVal}".`);

            break;
        }
        this._getLocationData();
    }

    _getLocationData() {
        this.loadingSpinner.request(`${this.guid}-_getLocationData`);

        this._getFilterValues();
        this._applyLocationDataToMap();
        this._outputData();

        if (this.state.filterValues.state === this.options.allStatesFilterVal && this.state.filterValues.country === this.options.allCountryFilterVal) {
            this.loadingSpinner.release(`${this.guid}-_getLocationData`);
            return;
        }

        let isInUsa = false;

        if (this.mapPageType === 'state') {
            isInUsa = true;
        } else if (this.state.filterValues.inUsa === this.options.filters.inUsa.values.usa) {
            isInUsa = true;
        }

        const postData = {
            isinusa: isInUsa,
            state: this.state.filterValues.state,
            type: '',
            page: 1,
            pagesize: 1000,
            IsAccredited: this.mapPageType === 'accredited',
            IsMagnet: this.mapPageType === 'magnet',
            IsPathway: this.mapPageType === 'pathway',
            IsState: this.mapPageType === 'state',
            country: this.$el.find(this.options.filters.country.selector).val(),
            typeFilter: this.$el.find(this.options.filters.types.selector).val(),
        };

        APIProxy.request({
            api: 'getMapData',
            queryData: postData,
            success: (data) => {
                const convertedData = JSON.parse(Utils.convertJSONKeysServerToClient(JSON.stringify(data), this.options.clientServerKeyMappings));

                this._storeData(convertedData);
                this._filterData();
                this._applyLocationDataToMap();
                this._outputData();

                this.loadingSpinner.release(`${this.guid}-_getLocationData`);
            },
            error: (jqxhr, status, err) => {
                this.data.length = 0;

                this.loadingSpinner.release(`${this.guid}-_getLocationData`);
            },
        });
    }

    _getFilterValues() {
        this.state.filterValues.state = this.$filterState.length > 0 ? this.$filterState.val() : this.options.defaultFilterVals.state;
        this.state.filterValues.inUsa = this.$filterInUsa.length > 0 ? this.$filterInUsa.val() : this.options.defaultFilterVals.inUsa;
        this.state.filterValues.country = this.$filterCountry.length > 0 ? this.$filterCountry.val() : this.options.defaultFilterVals.country;
    }

    _filterData() {
        if (this.mapPageType === this.options.mapPageTypes.state) {
            return;
        }

        if (this.state.filterValues.inUsa === this.options.filters.inUsa.values.international) {
            for (let d = 0; d <= this.data.length; d++) {
                const location = this.data[d];

                if (location && location.country !== this.state.filterValues.country) {
                    this.data.splice(d--, 1);
                }
            }

            return;
        }
    }

    _storeData(data) {
        if (data) {
            this.data.length = 0;

            for (let d = 0; d <= data.length; d++) {
                this.data.push(data[d]);
            }
        }
    }

    _applyLocationDataToMap() {
        if (this.state.initialised === false) {
            this.mapComponent = new MapComponent();

            const mapOpts = this.options.mapOptions;

            globalEmitter.on('mapcomponent:stateclicked', this._onUSAStateClicked.bind(this));
            globalEmitter.on('mapcomponent:countryclicked', this._onUSACountryClicked.bind(this));

            this.mapComponent.init(this.$map, mapOpts);
        }

        if (this.data) {
            this.mapComponent.updateLocations(this.data);

            if (this.state.initialised === false) {
                this.state.initialised = true;
            }
        }
    }

    _onUSAStateClicked(clickedState) {
        this.$filterInUsa.val(this.options.filters.inUsa.values.usa);
        this.$filterState.val(clickedState);

        if (this.state.filterValues.inUsa !== this.options.filters.inUsa.values.usa) {
            this._onInUsaFilterUpdate();
        } else {
            this._getLocationData();
        }
    }

    _onUSACountryClicked(clickedCountry) {
        this.$filterInUsa.val(this.options.filters.inUsa.values.international);
        this.$filterCountry.val(clickedCountry);

        if (this.state.filterValues.inUsa !== this.options.filters.inUsa.values.international) {
            this._onInUsaFilterUpdate();
        } else {
            this._getLocationData();
        }
    }

    _outputData() {
        if (this.data) {
            if (this.mapPageType !== this.options.mapPageTypes.state) {
                this._updateOutputMultiple(this.data);
            }
        }
    }

    _onMapLocationSelected(location) {
        if (!location) {
            return;
        }
        if (this.mapPageType === this.options.mapPageTypes.state) {
            this._updateOutputSingle(location);
        } else {
            this._updateOutputMultiple(location);
        }
    }

    _updateOutputSingle(location) {
        this.$outputOrgName.text(location.StateName);

        let keyPersonnel = '';

        if (location.President.length) {
            keyPersonnel = `${keyPersonnel }<li class="e-state-org-item__info-list-item">President: ${location.President}</li>`;
        }

        if (location.ExecutiveDirector.length) {
            keyPersonnel = `${keyPersonnel }<li class="e-state-org-item__info-list-item">Executive Director: ${location.ExecutiveDirector}</li>`;
        }

        let addressHTML = '';

        addressHTML = String(addressHTML);

        if (location.address1.length > 0) {
            addressHTML = `${addressHTML }<li class="e-state-org-item__info-list-item">${location.address1}</li>`;
        }

        if (location.address2.length > 0) {
            addressHTML = `${addressHTML }<li class="e-state-org-item__info-list-item">${location.address2}</li>`;
        }

        addressHTML = `${addressHTML }<li class="e-state-org-item__info-list-item">${location.city}, ${location.state} ${location.postalCode}</li>`;

        this.$outputKeyPersonnel.html(keyPersonnel);
        this.$outputAddress.html(addressHTML);

        let url = '';

        if (location.WebAddress && !location.WebAddress.match(/^[a-zA-Z]+:\/\//)) {
            url = `http://${ location.WebAddress}`;
        }

        this.$outputWebsite.attr('href', url);
        this.$outputWebsite.text(location.WebAddress);

        if (location.PrimaryPhone) {
            this.$outputPhone.attr('href', `tel:${location.PrimaryPhone}`);
            this.$outputPhone.text(location.PrimaryPhone);
        }

        if (location.PrimaryEmail) {
            this.$outputEmail.attr('href', `mailto:${location.PrimaryEmail}`);
            this.$outputEmail.text(location.PrimaryEmail);
        }
        if (location.comments) {
            this.$outputComments.text(location.comments);
        }
        this.$outputViewOnMapLink.attr('href', this._generateMapLink(location.Latitude, location.Longitude));

        this.$resultsOutputContainer.show();
    }

    _updateOutputMultiple(locations) {
        if (!locations) {
            return;
        }

        let rowsHtml = '';

        if (this.mapPageType === 'accredited') {
            for (let d = 0; d <= this.data.length; d++) {
                const location = this.data[d];

                if (location) {
                    let url = '';

                    if (location.WebAddress && !location.WebAddress.match(/^[a-zA-Z]+:\/\//)) {
                        url = `http://${ location.WebAddress}`;
                    }

                    let address = location.address1;
                    if (location.address2 !== '') {
                        address = `${address }, ${ location.address2}`;
                    }
                    if (location.city !== '') {
                        address = `${address }, ${ location.city}`;
                    }
                    if (location.state !== '') {
                        address = `${address }, ${ location.state}`;
                    }
                    if (location.postalCode !== '') {
                        address = `${address }, ${ location.postalCode}`;
                    }

                    // Fix 8003 - Apply line break after 40 characters for Web Address Column.
                    rowsHtml = `${rowsHtml }<tr>
                    <td>${location.FacilityName1}</td>
                    <td>${address}</td>
                    <td><a href="${url}" title="${location.FacilityName1}">${location.WebAddress.replace(/(.{40})/g, '$1<br>')}</a></td>
                    <td>${location.AccreditationType}</td>
                    <td>${location.status}</td>
                </tr>`;
                }
            }
        } else {
            for (let d = 0; d <= this.data.length; d++) {
                const location = this.data[d];

                if (location) {
                    let address = location.address1;
                    if (location.address2 !== '') {
                        address = `${address }, ${ location.address2}`;
                    }
                    if (location.city !== '') {
                        address = `${address }, ${ location.city}`;
                    }
                    if (location.state !== '') {
                        address = `${address }, ${ location.state}`;
                    }
                    if (location.postalCode !== '') {
                        address = `${address }, ${ location.postalCode}`;
                    }
                    rowsHtml = `${rowsHtml }<tr>
                    <td>${location.FacilityName1}</td>
                    <td>${address}</td>
                    <td>${location.DesignationYear}</td>
                    <td>${location.RedesignationYears}</td>
                </tr>`;
                }
            }
        }

        this.$resultsOutput.html(rowsHtml);
        this.$resultsOutputContainer.show();
    }

    _generateMapLink(lat, lng) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
}

export default () => {
    return new MapPageView();
};
