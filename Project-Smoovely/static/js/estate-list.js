var map;

var latitude;
var longitude;
var locations = [];
var locationSlug = {};
var markers = [];
var defaultLocation = ['Vancouver', 49.18, -123.1];

function setAllMap(map) {
  for (var i = 0; i < locations.length; i++) {
    markers[i].setMap(map);
  }
}

// Deletes all locations in the array by removing references to them.
function deleteMarkers() {
    setAllMap(null);
    locations = [];
    markers = [];
}

function formatNumbers(amount) {
    return amount.toFixed(0).replace(/./g, function(c, i, a) {
        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
}

function toggleSearchBox() {
    $("span#search-opener-closer").toggleClass('glyphicon-search').toggleClass('glyphicon-chevron-up');
    if (searchBoxClosed) {
        $("div.search-container").slideDown('slow');
        searchBoxClosed = false;
    } else {
        $("div.search-container").slideUp('slow');
        searchBoxClosed = true;
    }
}

function paintOverListItems() {
    $('.list-item:visible:odd').removeClass('even-item').addClass('odd-item');
    $('.list-item:visible:even').removeClass('odd-item').addClass('even-item');
}


function searchEstatesByNav(ev) {
    ev.preventDefault();
    var url = $(this).attr('href');
    searchEstates(url,null);
    var favButton = $('#favorites-button');
    if (url == '/estate/favorites/') {
        favButton.addClass('active')
    }
    else {
        favButton.removeClass('active')
    }
}

function searchEstatesByForm(ev) {
    ev.preventDefault();
    console.log('Search!');
    var form = $(this).parents('form:first');
    var data = form.serialize();
    var url = form.attr('action');
    searchEstates(url,data);
}


function searchEstates(url,data) {
    var config = {
        url: url,
        type: 'GET',
        success: function(data) {
            var $d = $("<div/>").append(data);
            var contentFound = $d.find("#listing");
            var infoWindows = $d.find("#infowindows");
            var pager = $d.find(".listing-pager");
            $('.listing-pager').replaceWith(pager);
            var searchForm = $d.find("#estate-search-form");
            $('#estate-search-form').replaceWith(searchForm);
            initSliders();
            initAdvancedOptions();

            var sorting = $d.find('.sorting');
            $('.sorting').replaceWith(sorting);
            $('#infowindows').replaceWith(infoWindows);
            $('#listing').fadeOut("fast", function() {
                $(this).replaceWith(contentFound);
                $(this).fadeIn("fast");
                deleteMarkers();
                loadLocations();
                drawLocations();
                paintOverListItems();
            });
        }
    };

    if(data) {
        config['data'] = data;
    }

    $.ajax(config);
    var saveQueryInput = $('#id_query');
    saveQueryInput.val('?' + data);
}


function loadLocations() {
    $(".estate-instance").each(function(i) {
        var latitude = $(this).attr('latitude');
        var longitude = $(this).attr('longitude');
        var location = [$(this).text(),latitude,longitude,$(this).attr('slug')];
        locations.push(location);
        // Build dict for reverse position>element searches
        var ll = new google.maps.LatLng(latitude, longitude);
        locationSlug[[ll.lat(), ll.lng()]] = $(this).attr('slug');
    });
}


function drawLocations() {
    var marker, i;
    locations.forEach(function(location) {
        var infowindow = new google.maps.InfoWindow({
             content: $('div.infowindow[slug="{slug}"]'.format(
                {slug: location[3]})).html()
        });

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(location[1], location[2]),
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            infowindow: infowindow
        });


        google.maps.event.addListener(marker, 'click', function() {
            markers.forEach(function(marker) {
                marker.infowindow.close()
            });
            this.infowindow.open(map, this);

        });

        var sideBarItem = $('#item-' + location[3]);
        sideBarItem.marker = marker;

        sideBarItem.mouseover(function() {
           sideBarItem.marker.setIcon("http://maps.google.com/mapfiles/ms/icons/orange-dot.png");
        });

        sideBarItem.mouseout(function() {
           sideBarItem.marker.setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
        });

        markers.push(marker);

    });
    if (typeof markerCluster == 'undefined') {
        markerCluster = new MarkerClusterer(map, markers);
    }
    else {
        markerCluster.clearMarkers();
        markerCluster.addMarkers(markers);
    }

}

function getListItemByCoordinates(position) {
    return $('.estate-instance[slug="{slug}"]'.format(
        {slug: locationSlug[[position.lat(), position.lng()]]}
    )).closest('.list-item')
}

function hideSearchResult(position) {
    getListItemByCoordinates(position).hide();
}

function showSearchResult(position) {
    getListItemByCoordinates(position).show();
}

function filterSearchResults() {
    var bounds = map.getBounds();

    for (var i = 0; i < markers.length; i++) {
        if (bounds.contains(markers[i].position)) {
            showSearchResult(markers[i].position);
        } else {
            hideSearchResult(markers[i].position);
        }
    }
    paintOverListItems();

}


function initialize() {
    loadLocations();
    if (locations.length != 0) {
        var firstloc = locations[0]
    }
    else {
        var firstloc = defaultLocation
    }
    var map_canvas = document.getElementById('map-canvas');
    var map_options = {
        zoom: 16,
        center: new google.maps.LatLng(firstloc[1], firstloc[2]),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(map_canvas, map_options);
    drawLocations(map);
    google.maps.event.addListener(map, 'idle', function() {
        filterSearchResults();
    });

}

function initAdvancedOptions() {
      $('#amenities-uncheck').click(function () {
      $('.amenity-check').attr('checked', false);
    });

    $('#features-uncheck').click(function () {
      $('.feature-check').attr('checked', false);
    });

    $('.datepicker').datepicker()
    .on('changeDate', function(ev){
        $(this).datepicker('hide');
    });
}

function initSliders() {
    $("#id_price_range").slider({});
    $("#id_price_range").on('slide', function(slideEvt) {
        $("#priceSliderVal").text(
            "$" + formatNumbers(slideEvt.value[0]) +
                " - $" + formatNumbers(slideEvt.value[1]));
    });

    $("#id_area_range").slider({});
    $("#id_area_range").on('slide', function(slideEvt) {
        $("#areaSliderVal").text(
            formatNumbers(slideEvt.value[0]) +
                " - " + formatNumbers(slideEvt.value[1]) + "sq");
    });
}

$(document).ready(function() {

    $('.nav-pills li').click(function() {
        $('.nav-pills li').removeClass('active');
        $(this).addClass('active');
    });

    var mapHeight = $(window).height() - 160;
    var resultsHeight = $(window).height() - 250;
     //init search button
    $('li.disabled a').click(function(ev) { ev.preventDefault() });
    $('body').on('click', '#search-button', searchEstatesByForm);
    $('body').on('click', '.arrow', searchEstatesByNav);
    $('body').on('click', '#favorites-button', searchEstatesByNav);

    $('#select-saved-query').change(function() {
        var data = $(this).val();
        var url = $('#estate-search-form').attr('action');
        searchEstates(url,data);
    });
    initSliders();
    $('#map-canvas').height(mapHeight);
    $('.homeResults').height(resultsHeight);
    $('.selectpicker').selectpicker();

    if (window.location.search.length != 0) {
        $('#id_query').val(window.location.search);
    }
//    $('#save-search-modal').on('click', '#save-search-submit-btn', saveSearchQuery);
    $('#save-search-modal').on('click', '#submit-btn', saveSearchQuery);
    paintOverListItems();

    google.maps.event.addDomListener(window, 'load', initialize);



});



function getSaveQueryForm(data) {
    $.ajax({
        url: data.location,
        type: 'GET',
        success: function(result) {
           var $d = $("<div/>").append(result);
          $(".modal-content").html($d.find("#form-content"))
        }
    })
}


function saveSearchQuery(ev) {
  var form = $(this).parents('form:first');
  ev.preventDefault();
  $.ajax({
      url: form.attr('action'),
      type: 'POST',
      data: form.serialize(),
      success: function(data) {
        if (data.location != undefined && data.location.length != 0 && data.location != '/') {
            getSaveQueryForm(data)
        }
        else {
          var $d = $("<div/>").append(data);
          var contentFound = $d.find("#form-content");
          if (contentFound.html()) {
              $(".modal-content").html($d.find("#form-content"));
          }
          else {
              var parsedData = JSON.parse(data);
              var queriesList = $('#saved-queries-list');
              var newQueryLink = $('<a />').append(parsedData.alias);
              newQueryLink.attr('href', parsedData.query);
              var newQueryItem = $('<li />').append(newQueryLink);
              queriesList.append(newQueryItem);
//              $('#save-search-modal').modal('hide')
              console.log($('#id_query').val());
              var redirectPath = '/estate/{0}'.format($('#id_query').val());
              window.location.href = redirectPath
          }
        }
      },
      error: function(data) {
          var responseHtml = data.responseJSON.html;
          var $d = $("<div/>").append(responseHtml);
          var contentFound = $d.find("#form-content");
          if (contentFound.html()) {
              $(".modal-content").html($d.find("#form-content"));
          }
      }
  });
}


$(document).ready(function() {
    $(document).on('click', '.dropdown-menu.advance-option-menu', function (e) {
      e.stopPropagation();
    });

    initAdvancedOptions();

});
