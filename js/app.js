/// <reference path="intermediatePoints.js" />
/// <reference path="distanceCalculator.js" />
/// <reference path="exportFiles.js" />

$(document).ready(function () {
    var gm = google.maps;
    var geocoder = new gm.Geocoder();
    var marker;
    var map; 

    function getLocation() {
        $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAHnukcKfjgitOWN5XFsGchuyJnyT42JiA", function (success) {
            showMap(success.location.lat, success.location.lng);
        })
        .fail(function (err) {
            showMap(-15.834295, -48.023389);
        });
        // if (navigator.geolocation) {
        //     navigator.geolocation.getCurrentPosition(showPosition);
        // } else {
        //     //'Geolocation is not supported by this browser.';
        //     showMap(-15.834295, -48.023389);
        // }
    }
    
    function showPosition(position) {
        showMap(position.coords.latitude, position.coords.longitude);
    }
    
    getLocation();
    
    function showMap(userLat, userLong) {
        var latlng = new gm.LatLng(userLat, userLong);
        map = new gm.Map(document.getElementById('mapa'), {
            mapTypeId: gm.MapTypeId.ROADMAP,
            center: latlng, zoom: 8
        });
        
        marker = new gm.Marker({
            map: map,
            draggable: true,
            animation: gm.Animation.DROP,
            icon: './img/usu-pointer.png'
        });
    
        marker.setPosition(latlng);
    }

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
            $('#exportToKml').addClass('disabled');
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
        
        pointsOfInterest.getItems(callbackGetItems);
        
        function callbackGetItems(data) {
            var points = {
                data: data.intermetiatePoints,
                size: data.intermetiatePoints.length
            };
            
            var distancesFromOrigin = [];
            var distancesFromDestiny = [];
            
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
            
            var distanceCalculator = new DistanceCalculator();
            
            // compare each point
            for(var i = 0; i < points.size; i++) {
                var interestingName = points.data[i].name;
                var interestingLat = points.data[i].lat;
                var interestinglong = points.data[i].long;
                
                // Calc distance
                var params = {
                    mapService: gm,
                    toPointName: interestingName,
                    toPointLat: interestingLat,
                    toPointLong: interestinglong,
                    fromPointLat: oLat,
                    fromPointLong: oLong
                };
                
                distanceCalculator.calcDistance(params, callbackOrigin);
                
                distanceCalculator.calcDistance(params, callbackDestiny);
            }
            
            function calcClosestPoints() {            
                // 1. find closest point from origin
                var closestFromOrigin = null;
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
                
                // 2. find closest point from destiny
                var closestFromDestiny = null;
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
                
                // 3. definy points
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
                
                // 4. build and show route
                renderRoute(pi, p1, p2, pj);
            }
            
            function renderRoute(pi, p1, p2, pj) {
                directionsDisplay.setMap(null);
                
                directionsDisplay.setMap(map);
                
                var waypts = [{
                    location: p1.lat + ',' + p1.long,
                    stopover: true
                },{
                    location: p2.lat + ',' + p2.long,
                    stopover: true
                }];
                
                directionsService.route({
                    origin: pi.lat + ',' + pi.long,
                    destination: pj.lat + ',' + pj.long,
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    travelMode: gm.TravelMode.BICYCLING
                }, function(response, status) {
                    if (status === gm.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        $('#exportToKml').removeClass('disabled');
                        $('#exportToKml > a').on('click', function(e) {
                            e.preventDefault();
                            exportToKML(response, pi, pj, waypts);
                        });
                    } else {
                        $('#exportToKml').removeClass('disabled').addClass('disabled');
                        
                        if(status == 'ZERO_RESULTS')
                            alert('Nenhuma rota disponível para esse itinerário');
                        else
                         alert('Falha na requisição da rota devido a ' + status);
                    }
                });
            }
            
            function exportToKML(data, pi, pj, waypts) {
                var exportFiles = new ExportFiles();
                
                var kml = exportFiles.toKml(data, pi, pj, waypts);
                
                download(kml, 'woole-route.kml');
            }
            
            function download(data, fileName) {
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style = 'display: none';
                var blob = new Blob([data], {type: 'application/vnd.google-earth.kml+xml'});
                var url = window.URL.createObjectURL(blob);
                
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        }
    }
});