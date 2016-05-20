$(document).ready(function () {
    
    var gm = google.maps;
    var geocoder = new gm.Geocoder();
    var marker;

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
        var map = new gm.Map(document.getElementById('mapa'), {
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
    
    function addressAutocompleate(direction) {
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
    
    $('#txtEnderecoOrigem').autocomplete(addressAutocompleate('Origem'));
    
    $('#txtEnderecoDestino').autocomplete(addressAutocompleate('Destino'));
    
    $('#goSubmit').on('click', function(e) {
        //e.preventDefault();
        
        var origemLat = $('#txtLatitudeOrigem').val();
        var origemLong = $('#txtLongitudeOrigem').val();
        
        var destinoLat = $('#txtLatitudeDestino').val();
        var destinoLong = $('#txtLongitudeDestino').val(); 
        
        goButton(origemLat, origemLong, destinoLat, destinoLong);
        
        return false;
    });
    
    function goButton(oLat, oLong, dLat, dLong) {
        var origemLatLong = gm.LatLng(oLat, oLong);
        var destinoLatLong = gm.LatLng(dLat, dLong);
        var getIntermediatePoints = new IntermediatePoints();
        getIntermediatePoints.getItens(foo);
        
        function foo(result) {
            console.log(result);
            console.log(this);
        }
    }

    function IntermediatePoints() { }
    
    IntermediatePoints.prototype.getItens = function(callback) {
        var intermetiatePoints = [];
        
        $.ajax({
            type: 'GET',
            url: '/PontosInteresse.kml',
            dataType: 'xml',
            success: xmlParser
        });

        function xmlParser(xml) {
            $(xml).find('Placemark').each(function () {
                var name = $(this).find('name').text();
                var coordinates = $(this).find('Point').find('coordinates').text();
                var lat = coordinates.split(',')[1];
                var long = coordinates.split(',')[0];

                var loc = new gm.LatLng(lat, long);

                var point = {
                    name: name,
                    coordinates: coordinates,
                    loc: loc
                };
                
                intermetiatePoints.push(point);

            });
            
            callback.call(this, intermetiatePoints);
        }
    };
        
    //     map.fitBounds(bounds);
    // }
});