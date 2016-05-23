/// <reference path="intermediatePoints.js" />
/// <reference path="xmlwriter.js" />

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
                            toKml(response, pi, pj, waypts);
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
            
            function toKml(data, pi, pj, waypts) {
                var xw = new XMLWriter('UTF-8');
                xw.formatting = 'indented'; //add indentation and newlines
                xw.indentChar = ' '; //indent with spaces
                xw.indentation = 2; //add 2 spaces per level

                // Start Doc
                xw.writeStartDocument();
                xw.writeStartElement('kml');
                xw.writeAttributeString('xmlns', 'http://www.opengis.net/kml/2.2');
                xw.writeStartElement('Document');
                
                xw.writeStartElement('Placemark');
                xw.writeElementString('name', 'Directions from ' + pi.name + ' to ' + pj.name);
                xw.writeElementString('styleUrl', '#line-1267FF-5-nodesc');
                
                // Route Points
                xw.writeStartElement('LineString');
                
                var coordinates;
                var path = data.routes[0].overview_path;
                var pathLength = path.length;
                
                for(var i = 0; i < pathLength; i++) {
                    var lat = path[i].lat();
                    var lng = path[i].lng();
                    
                    if(lat && lng)
                        coordinates += (lng + ',').trim() + (lat + ',0.0 ').trim() + ' ';
                }
                
                xw.writeElementString('coordinates', coordinates.replace('undefined', ''));
                
                xw.writeEndElement();
                xw.writeEndElement();
                
                // Origin
                xw.writeStartElement('Placemark');
                xw.writeElementString('name', pi.name);
                xw.writeElementString('styleUrl', '#icon-503-DB4436-nodesc');
                xw.writeStartElement('Point');

                xw.writeElementString('coordinates', pi.long + ',' + pi.lat + ',0.0');
                
                xw.writeEndElement();
                xw.writeEndElement();
           
                var wayptsLength = waypts.length;
                
                // Intermediate Points
                for(i = 0; i < wayptsLength; i++) {
                    xw.writeStartElement('Placemark');
                    
                    var wayLat = waypts[i].location.split(',')[0];
                    var wayLng = waypts[i].location.split(',')[1];
                    var wayName = wayLat + ',' + wayLng;
                    var wayCoors = wayLng + ',' + wayLat;
                    
                    xw.writeElementString('name', wayName);
                    xw.writeElementString('styleUrl', '#icon-503-DB4436-nodesc');
                    xw.writeStartElement('Point');

                    xw.writeElementString('coordinates', wayCoors);
                    
                    xw.writeEndElement();
                    xw.writeEndElement();
                }
                
                // Destiny
                xw.writeStartElement('Placemark');
                xw.writeElementString('name', pj.name);
                xw.writeElementString('styleUrl', '#icon-503-DB4436-nodesc');
                xw.writeStartElement('Point');

                xw.writeElementString('coordinates', pj.long + ',' + pj.lat + ',0.0');
                
                xw.writeEndElement();
                xw.writeEndElement();
                
                //Styles
                xw.writeStartElement('Style');
                xw.writeAttributeString('id', 'icon-503-DB4436-nodesc-normal');
                xw.writeStartElement('IconStyle');
                xw.writeElementString('color', 'ff3644DB');
                xw.writeElementString('scale', '1.1');
                xw.writeStartElement('Icon');
                xw.writeElementString('href', 'http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png');
                xw.writeEndElement();
                
                xw.writeStartElement('hotSpot');
                xw.writeAttributeString('x', '16');
                xw.writeAttributeString('y', '31');
                xw.writeAttributeString('xunits', 'pixels');
                xw.writeAttributeString('yunits', 'insetPixels');
                xw.writeEndElement();
                xw.writeEndElement();
                
                xw.writeStartElement('LabelStyle');
                xw.writeElementString('scale', '0.0');
                xw.writeEndElement();
                
                xw.writeStartElement('BalloonStyle');
                xw.writeCDATA('text', '<![CDATA[<h3>$[name]</h3>]]>');
                xw.writeEndElement(); // BalloonStyle
			
                xw.writeEndElement(); //</Style>
                
                xw.writeStartElement('Style');
                xw.writeAttributeString('id', 'line-1267FF-5-nodesc-normal');
                xw.writeStartElement('LineStyle');
                xw.writeElementString('color', 'ffFF6712');
                xw.writeElementString('width', '5');
                xw.writeEndElement(); //</LineStyle>
                
                xw.writeStartElement('BalloonStyle');
                xw.writeCDATA('text', '<![CDATA[<h3>$[name]</h3>]]>');
		        xw.writeEndElement(); //</BalloonStyle>
                
                xw.writeEndElement(); //</Style>
                
                xw.writeStartElement('Style');
                xw.writeAttributeString('id', 'line-1267FF-5-nodesc-highlight');
                xw.writeStartElement('LineStyle');
                xw.writeElementString('color', 'ffFF6712');
                xw.writeElementString('width', '8');
                xw.writeEndElement(); //</LineStyle>
                
                xw.writeStartElement('BalloonStyle');
                xw.writeCDATA('text', '<![CDATA[<h3>$[name]</h3>]]>');
		        xw.writeEndElement(); //</BalloonStyle>
                
                xw.writeEndElement(); //</Style>
                
                xw.writeStartElement('StyleMap');
                xw.writeAttributeString('id', 'line-1267FF-5-nodesc');
                
                xw.writeStartElement('Pair');
                xw.writeElementString('key', 'normal');
                xw.writeElementString('styleUrl', '#line-1267FF-5-nodesc-normal');
				xw.writeEndElement(); //</Pair>
                
                xw.writeStartElement('Pair');
                xw.writeElementString('key', 'highlight');
                xw.writeElementString('styleUrl', '#line-1267FF-5-nodesc-highlight');
				xw.writeEndElement(); //</Pair>
			
		        xw.writeEndElement(); //</StyleMap>
                
                xw.writeStartElement('Style');
                xw.writeAttributeString('id', 'icon-503-DB4436-nodesc-highlight');
                
                xw.writeStartElement('IconStyle');
                xw.writeElementString('color', 'ff3644DB');
                xw.writeElementString('scale', '1.1');
                xw.writeStartElement('Icon');
                xw.writeElementString('href', 'http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png');
                xw.writeEndElement(); //</Icon>
                
                xw.writeStartElement('hotSpot');
                xw.writeAttributeString('x', '16');
                xw.writeAttributeString('y', '31');
                xw.writeAttributeString('xunits', 'pixels');
                xw.writeAttributeString('yunits', 'insetPixels');
                xw.writeEndElement();//</hotSpot>
                xw.writeEndElement(); //</IconStyle>
                
                xw.writeStartElement('LabelStyle');
                xw.writeElementString('scale', '1.1');
                xw.writeEndElement();
                
                xw.writeStartElement('BalloonStyle');
                xw.writeCDATA('text', '<![CDATA[<h3>$[name]</h3>]]>');
		        xw.writeEndElement(); //</BalloonStyle>
                
                xw.writeEndElement(); //</Style>

                xw.writeStartElement('StyleMap');
                xw.writeAttributeString('id', 'icon-503-DB4436-nodesc');
                
                xw.writeStartElement('Pair');
                xw.writeElementString('key', 'normal');
                xw.writeElementString('styleUrl', '#icon-503-DB4436-nodesc-normal');
				xw.writeEndElement(); //</Pair>
                
                xw.writeStartElement('Pair');
                xw.writeElementString('key', 'highlight');
                xw.writeElementString('styleUrl', '#icon-503-DB4436-nodesc-highlight');
				xw.writeEndElement(); //</Pair>
			
		        xw.writeEndElement(); //</StyleMap>
                xw.writeEndElement();

                // End Doc
                xw.writeEndElement();
                xw.writeEndElement();
                xw.writeEndDocument();
                
                var xml = xw.flush(); //generate the xml string
                xw.close();//clean the writer
                xw = undefined;//don't let visitors use it, it's closed
                
                var saveData = (function () {
                    var a = document.createElement('a');
                    document.body.appendChild(a);
                    a.style = 'display: none';
                    return function (data, fileName) {
                        var blob = new Blob([data], {type: 'application/vnd.google-earth.kml+xml'}),
                            url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    };
                }());

                saveData(xml, 'woole-route.kml');
            }
        }
    }
});