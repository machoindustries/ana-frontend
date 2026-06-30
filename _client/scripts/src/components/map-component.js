/* global google*/
import BaseComponent from 'components/base-component';
import $ from 'jquery';
import globalEmitter from 'modules/global-emitter';

class MapComponent extends BaseComponent {
    constructor() {
        super();

        this.defaultOptions = {
            apiKey: 'AIzaSyDmfC2OzBCHX_PG0zt5yADWZjl8NfbrtUc',
            scrollwheel: false,
            scaleControl: true,
            centerLatLng: {
                lat: 39.8286,
                lng: -98.5802,
            },
            locations: [],
            markers: [],
            latLngBounds: null,
            singleLocationZoomLevel: 17,
            noLocationsZoomLevel: 4,
            pinLocation: null,
            googleFormatProperties: {
                addressComponents: 'address_components',
                state: 'administrative_area_level_1',
                country: 'country',
                types: 'types',
                shortName: 'short_name',
                longName: 'long_name',
            },
            usaCode: 'US',
        };

        this.state = {
            initialised: false,
        };
    }

    initChildren() {
        this.clickedState = null;

        this._initGoogleMap();
    }

    addListeners() {

    }

    addAriaAttributes() {

    }

    updateLocations(locations) {
        this.data = locations;

        if (this.state.initialised === true) {
            this._placeMarkers();
            this._zoomToFitMarkers();
        }
    }

    _initGoogleMap() {
        $.getScript(`https://maps.googleapis.com/maps/api/js?key=${this.options.apiKey}`, this._onMapLoad.bind(this));
    }

    _onMapLoad(data, status) {
        if (status !== 'success') {
            console.log(`ERROR: Failed to get Google Maps API - status ${status}`);
            return;
        }

        this.googleMap = new google.maps.Map(this.$el[0], {
            zoom: 4,
            center: this.options.centerLatLng,
            scrollwheel: this.options.scrollwheel,
            scaleControl: this.options.scaleControl,
        });

        this._bindEventListeners();

        this._placeMarkers();
        this._zoomToFitMarkers();

        this.state.initialised = true;
    }

    _bindEventListeners() {
        if (this.options.reportClickedLocation) {
            this.geocoder = new google.maps.Geocoder();

            google.maps.event.addListener(this.googleMap, 'click', (e) => {
                const clickedLat = e.latLng.lat();
                const clickedLng = e.latLng.lng();

                this._getClickedUSAState(clickedLat, clickedLng);
            });
        }
    }

    _getClickedUSAState(lat, lng) {
        this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK') {
                if (results[0]) {
                    const firstResult = results[0];
                    const addressComponents = firstResult[this.options.googleFormatProperties.addressComponents];

                    for (let ac = 0; ac < addressComponents.length; ac++) {
                        const addressComp = addressComponents[ac];

                        // If the component represents the country
                        if (addressComp.types.indexOf(this.options.googleFormatProperties.country) !== -1) {
                            // If the country is the USA
                            if (addressComp[this.options.googleFormatProperties.shortName] === this.options.usaCode) {
                                for (let ac2 = 0; ac2 < addressComponents.length; ac2++) {
                                    const addressComp2 = addressComponents[ac2];

                                    // If the component represents the state
                                    if (addressComp2.types.indexOf(this.options.googleFormatProperties.state) !== -1) {
                                        // Return the matching state
                                        const clickedState = addressComp2[this.options.googleFormatProperties.shortName];

                                        globalEmitter.emit('mapcomponent:stateclicked', clickedState);

                                        return;
                                    }
                                }
                            } else {
                                // If outside the USA, return the country name instead
                                const clickedCountry = addressComp[this.options.googleFormatProperties.longName];

                                globalEmitter.emit('mapcomponent:countryclicked', clickedCountry);
                            }
                        }
                    }
                } else {
                    console.log('WARNING: map-component._getClickedUSAState: No results found');
                }
            } else {
                console.log(`WARNING: map-component._getClickedUSAState: Geocoding failed. Status: ${status}`);
            }
        });
    }

    _onGetClickedUSAStateSuccess(stateCode) {
        this.clickedState = stateCode;

        // alert(`Clicked state: ${this.clickedState}`);
    }

    _placeMarkers() {
        this._deleteAllMarkers();

        for (let loc = 0; loc < this.data.length; loc++) {
            const location = this.data[loc];

            if (location) {
                let lat = location.Latitude;
                let lng = location.Longitude;

                if (!lat) {
                    lat = '37.090240';
                }

                if (!lng) {
                    lng = '-95.712891';
                }

                const myLatlng = new google.maps.LatLng(lat, lng);

                const marker = new google.maps.Marker({
                    position: myLatlng,
                    map: this.googleMap,
                });

                let title;

                if (location.StateName) {
                    title = location.StateName;
                } else {
                    title = location.FacilityName1;
                }

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


                const contentString = `<h3 class="c-cta-block__heading">${title}</h3>
                    <div>${address}</div>
                    <div><a href="${url}" title="${title}">${location.WebAddress}</a></div>`;

                const infowindow = new google.maps.InfoWindow();
                infowindow.setContent(contentString);

                google.maps.event.addListener(marker, 'click', function() {
                    /* eslint-disable-next-line no-invalid-this */
                    infowindow.open(this.googleMap, marker);
                    globalEmitter.emit('mapcomponent:locationselected', location);
                });

                this.options.markers.push(marker);
            }
        }

        if (this.data && this.data.length > 0) {
            globalEmitter.emit('mapcomponent:locationselected', this.data[0]);
        }
    }

    _deleteAllMarkers() {
        for (let m = 0; m < this.options.markers.length; m++) {
            this.options.markers[m].setMap(null);
        }

        this.options.markers.length = 0;
    }

    _zoomToFitMarkers() {
        const filterData = this.data.filter((e) => {
            return e;
        });

        if (this.options.markers.length === 0) {
            this.googleMap.setCenter(this.options.centerLatLng);
            this.googleMap.setZoom(this.options.noLocationsZoomLevel);

            return;
        }

        this.options.latLngBounds = new google.maps.LatLngBounds();

        for (let i = 0; i < this.data.length; i++) {
            const loc = this.data[i];

            if (loc) {
                let lat = loc.Latitude;
                let lng = loc.Longitude;

                if (!lat) {
                    lat = '37.090240';
                }

                if (!lng) {
                    lng = '-95.712891';
                }

                const myLatlng = new google.maps.LatLng(lat, lng);

                this.options.latLngBounds.extend(myLatlng);
            }
        }

        this.googleMap.setCenter(this.options.latLngBounds.getCenter());

        // For single results, use the single result default zoom level
        if (filterData.length === 1) {
            console.log('Zoom', this.options.singleLocationZoomLevel);
            this.googleMap.setZoom(this.options.singleLocationZoomLevel);
        } else {
            this.googleMap.fitBounds(this.options.latLngBounds);
        }
    }
}

export default () => {
    return new MapComponent();
};
