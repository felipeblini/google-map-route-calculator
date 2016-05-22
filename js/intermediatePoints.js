var IntermediatePoints = (function() {
    'use strict';
    
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

                var point = {
                    name: name,
                    lat: lat,
                    long: long
                };
                
                intermetiatePoints.push(point);

            });
            
            callback.call(this, {'intermetiatePoints': intermetiatePoints});
        }
    };
    
    IntermediatePoints.prototype.calcDistance = function(defaults, lat, long, callback) {
        var params = {
            googleMaps: defaults.googleMaps,
            interestingLat: defaults.interestingLat,
            interestinglong: defaults.interestinglong,
            lat: lat,
            long: long
        };
        
        _calcDistance(params, callback);
    };
    
    function _calcDistance(params, callback) {
        var gm = params.googleMaps;
        var posFrom = params.lat + ',' + params.long;
        var posTo = params.interestingLat + ',' + params.interestinglong;
        
        var distanceService = new gm.DistanceMatrixService();

        distanceService.getDistanceMatrix({
            origins: [posFrom],
            destinations: [posTo],
            travelMode: gm.TravelMode.BICYCLING,
            unitSystem: gm.UnitSystem.METRIC
        }, function(response) {
            var distance = response.rows[0].elements[0].distance.value;
            
            var toReturn = {
                distance: distance,
                lat: params.interestingLat,
                long: params.interestinglong
            };
            
            callback.call(this, toReturn);
        });
    }
    
    return IntermediatePoints;

})();