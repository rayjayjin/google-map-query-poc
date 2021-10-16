/* tslint:disable */
import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import { seoul_geojson } from './seoul';

import { reducer } from './FilterList';

// import logo from './logo.svg';

// const seoul = seoul_geojson;
let map: any;
let places: any;
let infoWindow: any;
let markers: any = [];
let autocomplete: any;

const MARKER_PATH =
  "https://developers.google.com/maps/documentation/javascript/images/marker_green";
const hostnameRegexp = new RegExp("^https?://.+?/");

const store = createStore(reducer);

interface IState {
  isButtonPressed: boolean;
}

class App extends React.Component<any, IState> {
  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      isButtonPressed: false,
    };
  }

  public componentDidMount() {
    if (typeof (window as any).google === 'undefined') {
      const script = (document as any).createElement('script');
      script.src = 'http://maps.googleapis.com/maps/api/js?key=&callback=initMap&libraries=places';
      script.async = true;
      (window as any).initMap = () => {
        const google = (window as any).google;
        map = new google.maps.Map((document as any).getElementById("map") as HTMLElement, {
          center: { lat: 37.5642135, lng: 127.0016985 },
          zoom: 8,
        });
        const fixed = {
          type: 'FeatureCollection',
          // features: [seoul_geojson.features[0]],
          features: seoul_geojson.features,
        };
        map.data.addGeoJson(fixed);

            const initBounds = new google.maps.LatLngBounds();
        map.data.forEach(function(feature: any) {
          var geo = feature.getGeometry();
          geo.forEachLatLng(function(LatLng: any) {
            initBounds.extend(LatLng);
          });
        });
        map.fitBounds(initBounds);

        infoWindow = new google.maps.InfoWindow({
          content: (document as any).getElementById("info-content"),
        });
        // Create the autocomplete object and associate it with the UI input control.
        // Restrict the search to the default country, and to place type "cities".
        autocomplete = new google.maps.places.Autocomplete(
          (document as any).getElementById("autocomplete"),
          {
            types: ["(cities)"],
            componentRestrictions: {country: []},
          }
        );
        places = new google.maps.places.PlacesService(map);


        autocomplete.addListener("place_changed", onPlaceChanged);
        // Add a DOM event listener to react when the user selects a country.
        (document as any)
          .getElementById("country")
          .addEventListener("change", setAutocompleteCountry);
          function onPlaceChanged() {
            const place = autocomplete.getPlace();
          
            if (place.geometry && place.geometry.location) {
              // map.panTo(place.geometry.location);
              // map.setZoom(15);

        let cnt = 0;
          const pTask = (feature: any) => {
            return function () {
          const geo = feature.getGeometry();
        // console.log('%%%%%%%%%%%%%%%%%%% =>  geo', geo);
          let searchBound: any;
          searchBound = new google.maps.LatLngBounds();
          geo.forEachLatLng(function(LatLng: any) {
            // if (cnt === 1) {
            searchBound.extend(LatLng);
            // cnt = cnt + 1;
            // }
          });
            search(searchBound);
            console.log('%%%%%%%%%%%%%%%%%%% =>  feature', feature);
            // cnt = cnt + 1;
            };
          }
        map.data.forEach(function(feature: any) {
            // console.log('%%%%%%%%%%%%%%%%%%% =>  cnt', cnt);
            
          setTimeout(pTask(feature), cnt * 500);
          cnt = cnt + 1;
          // setTimeout(() => {
          // }, cnt * 2000);
            // search(searchBound);
        });
        // map.fitBounds(initBounds);

              // search();
            } else {
              (document as any).getElementById("autocomplete").placeholder = "Enter a city";
            }
          }
          
          // Search for hotels in the selected city, within the viewport of the map.
          function search(bounds: any) {
            // console.log('##################3 Geojson bound', bounds);
            // console.log('##################3 map bound', map.getBounds());
            const search = {
              // bounds: map.getBounds(),
              bounds,
              types: ["lodging"],
            };
          
            places.nearbySearch(search, (results: any, status: any, pagination: any) => {
              console.log('===================== statue', status);
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                // clearResults();
                // clearMarkers();
                // console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ result', results);
                // Create a marker for each hotel found, and
                // assign a letter of the alphabetic to each marker icon.
                for (let i = 0; i < results.length; i++) {
                  const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
                  const markerIcon = MARKER_PATH + markerLetter + ".png";
          
                  // Use marker animation to drop the icons incrementally on the map.
                  markers[i] = new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon,
                  });
                  // If the user clicks a hotel marker, show the details of that hotel
                  // in an info window.
                  markers[i].placeResult = results[i];
                  google.maps.event.addListener(markers[i], "click", showInfoWindow);
                  // setTimeout(dropMarker(i), i * 100);
                  dropMarker(i)();
                  addResult(results[i], i);
                  if (pagination && pagination.hasNextPage) {
                    // setTimeout(() => {
                    //   pagination.nextPage();

                    // }, i * 1000);
                    // setTimeout(nextSearch(pagination.nextPage), i * 1000);
                      pagination.nextPage();
                    // getNextPage = () => {
                    //   // Note: nextPage will call the same handler function as the initial call
                    //   pagination.nextPage();
                    // };
                  }
                }
              }
            });
          }
          
          function clearMarkers() {
            for (let i = 0; i < markers.length; i++) {
              if (markers[i]) {
                markers[i].setMap(null);
              }
            }
          
            markers = [];
          }
          
          // Set the country restriction based on user input.
          // Also center and zoom the map on the given country.
          function setAutocompleteCountry() {
            const country = (document as any).getElementById("country").value;
          
            if (country == "all") {
              autocomplete.setComponentRestrictions({ country: [] });
              map.setCenter({ lat: 15, lng: 0 });
              map.setZoom(2);
            } else {
              // autocomplete.setComponentRestrictions({ country: country });
              // map.setCenter(countries[country].center);
              // map.setZoom(countries[country].zoom);
            }
          
            clearResults();
            clearMarkers();
          }
          
          function dropMarker(i: any) {
            return function () {
              markers[i].setMap(map);
            };
          }
          
          // function nextSearch(fn: any) {
          //   return function () {
          //     fn();
          //   };
          // }

          function addResult(result: any, i: any) {
            const results = (document as any).getElementById("results");
            const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
            const markerIcon = MARKER_PATH + markerLetter + ".png";
            const tr = (document as any).createElement("tr");
          
            tr.style.backgroundColor = i % 2 === 0 ? "#F0F0F0" : "#FFFFFF";
            tr.onclick = function () {
              google.maps.event.trigger(markers[i], "click");
            };
          
            const iconTd = (document as any).createElement("td");
            const nameTd = (document as any).createElement("td");
            const icon = (document as any).createElement("img");
          
            icon.src = markerIcon;
            icon.setAttribute("class", "placeIcon");
            icon.setAttribute("className", "placeIcon");
          
            const name = (document as any).createTextNode(result.name);
          
            iconTd.appendChild(icon);
            nameTd.appendChild(name);
            tr.appendChild(iconTd);
            tr.appendChild(nameTd);
            results.appendChild(tr);
          }
          
          function clearResults() {
            const results = (document as any).getElementById("results");
          
            while (results.childNodes[0]) {
              results.removeChild(results.childNodes[0]);
            }
          }
          
          // Get the place details for a hotel. Show the information in an info window,
          // anchored on the marker for the hotel that the user selected.
          function showInfoWindow() {
            const marker: any = this;
            places.getDetails(
              { placeId: marker.placeResult.place_id },
              (place: any, status: any) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                  return;
                }
          
                infoWindow.open(map, marker);
                buildIWContent(place);
              }
            );
          }
          
          // Load the place information into the HTML elements used by the info window.
          function buildIWContent(place: any) {
            (document as any).getElementById("iw-icon").innerHTML =
              '<img class="hotelIcon" ' + 'src="' + place.icon + '"/>';
            (document as any).getElementById("iw-url").innerHTML =
              '<b><a href="' + place.url + '">' + place.name + "</a></b>";
            (document as any).getElementById("iw-address").textContent = place.vicinity;
            if (place.formatted_phone_number) {
              (document as any).getElementById("iw-phone-row").style.display = "";
              (document as any).getElementById("iw-phone").textContent =
                place.formatted_phone_number;
            } else {
              (document as any).getElementById("iw-phone-row").style.display = "none";
            }
          
            // Assign a five-star rating to the hotel, using a black star ('&#10029;')
            // to indicate the rating the hotel has earned, and a white star ('&#10025;')
            // for the rating points not achieved.
            if (place.rating) {
              let ratingHtml = "";
          
              for (let i = 0; i < 5; i++) {
                if (place.rating < i + 0.5) {
                  ratingHtml += "&#10025;";
                } else {
                  ratingHtml += "&#10029;";
                }
          
                (document as any).getElementById("iw-rating-row").style.display = "";
                (document as any).getElementById("iw-rating").innerHTML = ratingHtml;
              }
            } else {
              (document as any).getElementById("iw-rating-row").style.display = "none";
            }
          
            // The regexp isolates the first part of the URL (domain plus subdomain)
            // to give a short URL for displaying in the info window.
            if (place.website) {
              let fullUrl = place.website;
              let website = String(hostnameRegexp.exec(place.website));
          
              if (!website) {
                website = "http://" + place.website + "/";
                fullUrl = website;
                console.log('====> fullUrl', fullUrl);
              }
          
              (document as any).getElementById("iw-website-row").style.display = "";
              (document as any).getElementById("iw-website").textContent = website;
            } else {
              (document as any).getElementById("iw-website-row").style.display = "none";
            }
          }
      };
      (document as any).head.appendChild(script);
    }
  }

  public render() {
    return (
      <Provider store={store}>
      <React.Fragment>
        <div className="hotel-search">
      <div id="findhotels">Find hotels in:</div>

      <div id="locationField">
        <input id="autocomplete" placeholder="Enter a city" type="text" />
      </div>

      <div id="controls">
        <select id="country">
          <option value="all" selected>All</option>
        </select>
      </div>
    </div>

    {/* <div id="map"></div> */}

    <div id="listing">
      <table id="resultsTable">
        <tbody id="results"></tbody>
      </table>
    </div>

    <div style={{display: 'none'}}>
      <div id="info-content">
        <table>
          <tr id="iw-url-row" className="iw_table_row">
            <td id="iw-icon" className="iw_table_icon"></td>
            <td id="iw-url"></td>
          </tr>
          <tr id="iw-address-row" className="iw_table_row">
            <td className="iw_attribute_name">Address:</td>
            <td id="iw-address"></td>
          </tr>
          <tr id="iw-phone-row" className="iw_table_row">
            <td className="iw_attribute_name">Telephone:</td>
            <td id="iw-phone"></td>
          </tr>
          <tr id="iw-rating-row" className="iw_table_row">
            <td className="iw_attribute_name">Rating:</td>
            <td id="iw-rating"></td>
          </tr>
          <tr id="iw-website-row" className="iw_table_row">
            <td className="iw_attribute_name">Website:</td>
            <td id="iw-website"></td>
          </tr>
        </table>
      </div>
    </div>

        {/* <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <div className="App-intro">
            <FilterList />
          </div>
        </div> */}
      </React.Fragment>
      </Provider>

    );
  }
}

export default App;
