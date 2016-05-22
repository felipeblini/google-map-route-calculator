/// <reference path="intermediatePoints.js" />

var gm = google.maps;
var geocoder = new gm.Geocoder();
var marker;
var map;

$(document).ready(function () {
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            //'Geolocation is not supported by this browser.';
            showMap(-15.834295, -48.023389);
        }
    }
    
    function showPosition(position) {
        showMap(position.coords.latitude, position.coords.longitude);
    }
    
    getLocation();
    
    function showMap(userLat, userLong) {
        var latlng = new gm.LatLng(userLat, userLong);
        map = new gm.Map(document.getElementById('mapa'), {
            mapTypeId: gm.MapTypeId.ROADMAP,
            center: latlng, zoom: 5
        });
        
        marker = new gm.Marker({
            map: map,
            draggable: true
        });
    
        marker.setPosition(latlng);
    }

    // var kmlUrl2 = 'http://felipeblini-001-site32.btempurl.com/PontosInteresse.kml?v=2';
    // var kmlOptions = {
    //     suppressInfoWindows: false,
    //     preserveViewport: false,
    //     map: map
    // };
    
    // var kmlLayer = new gm.KmlLayer(kmlUrl2, kmlOptions);
    
    function addressAutocomplete(direction) {
        return {
            source: function (request, response) {
            
                geocoder.geocode({ 'address': request.term + ', Brasil', 'region': 'BR' }, function (results, status) {
                    response($.map(results, function (item) {
                        return {
                            label: item.formatted_address,
                            value: item.formatted_address,
                            latitude: item.geometry.location.lat(),
                            longitude: item.geometry.location.lng()
                        };
                    }));
                });
            },
            select: function (event, ui) {
                $('#txtLatitude' + direction).val(ui.item.latitude);
                $('#txtLongitude' + direction).val(ui.item.longitude);
                var location = new gm.LatLng(ui.item.latitude, ui.item.longitude);
                //marker.setPosition(location);
                //map.setCenter(location);
                //map.setZoom(16);
            }
        };
    }
    
    $('#txtEnderecoOrigem').autocomplete(addressAutocomplete('Origem'));
    
    $('#txtEnderecoDestino').autocomplete(addressAutocomplete('Destino'));
    
    $('#goSubmit').on('click', function() {
        
        var origemLat = $('#txtLatitudeOrigem').val();
        var origemLong = $('#txtLongitudeOrigem').val();
        
        var destinoLat = $('#txtLatitudeDestino').val();
        var destinoLong = $('#txtLongitudeDestino').val(); 
        
        goButton(origemLat, origemLong, destinoLat, destinoLong);
        
        return false;
    });
    
    function goButton(oLat, oLong, dLat, dLong) {
        var pointsOfInterest = new IntermediatePoints();
        
        pointsOfInterest.getItens(callback);
        
        function callback(data) {
            var points = {
                data: data.intermetiatePoints,
                size: data.intermetiatePoints.length
            };
            
            var distancesFromOrigin = [], distancesFromDestiny = [];
            
            var callbackOrigin = function(data) {
                distancesFromOrigin.push(data);
            };
            
            var callbackDestiny = function(data) {
                distancesFromDestiny.push(data);
                
                if(distancesFromDestiny.length === points.size) {
                    setTimeout(function() {
                        calcClosestPoints();
                    }, 500);
                }
            };
            
            // compare each point
            for(var i = 0; i < points.size; i++) {
                var interestingLat = points.data[i].lat;
                var interestinglong = points.data[i].long;
                
                var defaults = {
                    googleMaps: gm,
                    interestingLat: interestingLat,
                    interestinglong: interestinglong
                };
                
                pointsOfInterest.calcDistance(defaults, oLat, oLong, callbackOrigin);
                
                pointsOfInterest.calcDistance(defaults, dLat, dLong, callbackDestiny);
            }
            
            function calcClosestPoints() {            
                var distanceFromOrigin = 0, distanceFromDestiny = 0;
                var closestFromOrigin = {};
                var closestFromDestiny = {};
                
                // find closest point from origin
                var sizeOrigin = distancesFromOrigin.length;
                
                for(var i = 0; i < sizeOrigin; i++) {
                    if(distanceFromOrigin === 0) {
                        closestFromOrigin = distancesFromOrigin[i];
                    } else {
                        if(distancesFromOrigin[i].distance < closestFromOrigin.distance) {
                            closestFromOrigin = distancesFromOrigin[i];
                        }
                    }
                }
                
                // find closest point from destiny
                var sizeDestiny = distancesFromDestiny.length;
                
                for(i = 0; i < sizeDestiny; i++) {
                    if(distanceFromDestiny === 0) {
                        closestFromDestiny = distancesFromDestiny[i];
                    } else {
                        if(distancesFromDestiny[i].distance < closestFromDestiny.distance) {
                            closestFromDestiny = distancesFromDestiny[i];
                        }
                    }
                }
                
                var pi = {
                    lat: oLat,
                    long: oLong
                };
                
                var p1 = closestFromOrigin;
                
                var p2 = closestFromDestiny;
                
                var pj = {
                    lat: dLat,
                    long: dLong
                };
                
                renderRoute(pi, p1, p2, pj);
            }
            
            function renderRoute(pi, p1, p2, pj) {
                console.log('pi', pi);
                console.log('p1', p1);
                console.log('p2', p2);
                console.log('pj', pj);
                
                
            }
        }
    }
});