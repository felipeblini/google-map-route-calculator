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
    
    function getLatLonFromAddress(address, elLat, elLon, response) {
        geocoder.geocode(address, function (results, status) {
            response($.map(results, function (item) {
                elLat.val(item.geometry.location.lat());
                elLon.val(item.geometry.location.lng());
                
                return {
                    label: item.formatted_address,
                    value: item.formatted_address,
                    latitude: item.geometry.location.lat(),
                    longitude: item.geometry.location.lng()
                };
            }));
        });
    }
    
    function addressAutocomplete(direction) {
        var elLat = $('#txtLatitude' + direction);
        var elLon = $('#txtLongitude' + direction);
        
        return {
            source: function (request, response) {
                elLat.val('');
                elLon.val('');
                    
                var address = { 'address': request.term + ', Brasil', 'region': 'BR' };
                getLatLonFromAddress(address, elLat, elLon, response);
            },
            select: function (event, ui) {
                elLat.val(ui.item.latitude);
                elLon.val(ui.item.longitude);
                var location = new gm.LatLng(ui.item.latitude, ui.item.longitude);
                marker.setPosition(location);
                map.setCenter(location);
                map.setZoom(16);
            }
        };
    }
    
    $('#txtEnderecoOrigem').autocomplete(addressAutocomplete('Origem'));
    
    $('#txtEnderecoDestino').autocomplete(addressAutocomplete('Destino'));
    
    $('#goSubmit').on('click', function() {
        
        var myForm = $('#address-form');
        if (!myForm[0].checkValidity()) {
            myForm.find(':submit').click();
        }
        
        var origemAddress = $('#txtEnderecoOrigem').val();
        var origemLat = $('#txtLatitudeOrigem').val();
        var origemLong = $('#txtLongitudeOrigem').val();
        
        var destinoAddress = $('#txtEnderecoDestino').val();
        var destinoLat = $('#txtLatitudeDestino').val();
        var destinoLong = $('#txtLongitudeDestino').val();
        
        if(!origemLat || !destinoLat) {
            alert('Endereço de origem ou destino inválido ou inexistente');
        } else {
            goButton(origemLat, origemLong, destinoLat, destinoLong, origemAddress, destinoAddress);
        }
        
        return false;
    });
    
    function goButton(oLat, oLong, dLat, dLong, oAddress, dAddress) {
        var pi = {}, p1 = {}, p2 = {}, pj = {};
        
        var directionsService = new gm.DirectionsService;
        var directionsDisplay = new gm.DirectionsRenderer;
        
        showMap();
        
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
                var interestingCoordinates = points.data[i].coordinates;
                var interestingName = points.data[i].name;
                var interestingLat = points.data[i].lat;
                var interestinglong = points.data[i].long;
                
                var defaults = {
                    googleMaps: gm,
                    interestingName: interestingName,
                    interestingLat: interestingLat,
                    interestinglong: interestinglong,
                    interestingCoordinates: interestingCoordinates
                };
                
                pointsOfInterest.calcDistance(defaults, oLat, oLong, callbackOrigin);
                
                pointsOfInterest.calcDistance(defaults, dLat, dLong, callbackDestiny);
            }
            
            function calcClosestPoints() {            
                var closestFromOrigin = null;
                
                // find closest point from origin
                var sizeOrigin = distancesFromOrigin.length;
                
                for(var i = 0; i < sizeOrigin; i++) {
                    if(closestFromOrigin === null) {
                        closestFromOrigin = distancesFromOrigin[i];
                    } else {
                        if(distancesFromOrigin[i].distance < closestFromOrigin.distance) {
                            closestFromOrigin = distancesFromOrigin[i];
                        }
                    }
                }
                
                var closestFromDestiny = null;
                
                // find closest point from destiny
                var sizeDestiny = distancesFromDestiny.length;
                
                for(i = 0; i < sizeDestiny; i++) {
                    if(closestFromDestiny === null) {
                        closestFromDestiny = distancesFromDestiny[i];
                    } else {
                        if(distancesFromDestiny[i].distance < closestFromDestiny.distance) {
                            closestFromDestiny = distancesFromDestiny[i];
                        }
                    }
                }
                
                pi = {
                    name: oAddress,
                    lat: oLat,
                    long: oLong
                };
                
                p1 = closestFromOrigin;
                
                p2 = closestFromDestiny;
                
                pj = {
                    name: dAddress,
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
                
                directionsDisplay.setMap(null);
                
                directionsDisplay.setMap(map);
                
                var waypts = [{
                    location: p1.lat + ',' + p1.long,
                    //location: p1.coordinates,
                    stopover: true
                },{
                    location: p2.lat + ',' + p2.long,
                    //location: p2.coordinates,
                    stopover: true
                }];
                
                directionsService.route({
                    origin: pi.lat + ',' + pi.long,
                    destination: pj.lat + ',' + pj.long,
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    travelMode:gm.TravelMode.BICYCLING
                }, function(response, status) {
                    if (status === gm.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    } else {
                        if(status == 'ZERO_RESULTS')
                            alert('Nenhuma rota disponível para esse itinerário');
                        else
                         alert('Falha na requisição da rota devido a ' + status);
                    }
                });
            }
        }
    }
});