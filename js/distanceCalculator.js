var DistanceCalculator = (function() {
    'use strict';
    
    function DistanceCalculator() { }
        
    // Calculate distance between 2 points of the heart
    DistanceCalculator.prototype.calcDistance = function(defaults, callback) {
        _calcDistance(defaults, callback);
    };
    
    // this version works only for google maps service
    function _calcDistance(params, callback) {
        var mapService = params.mapService;
        var posFrom = params.fromPointLat + ',' + params.fromPointLong;
        var posTo = params.toPointLat + ',' + params.toPointLong;
        
        var distanceService = new mapService.DistanceMatrixService();

        distanceService.getDistanceMatrix({
            origins: [posFrom],
            destinations: [posTo],
            travelMode: mapService.TravelMode.BICYCLING,
            unitSystem: mapService.UnitSystem.METRIC
        }, function(response) {
            var distance = response.rows[0].elements[0].distance.value;
            
            var toReturn = {
                distance: distance,
                lat: params.fromPointLat,
                long: params.fromPointLong,
                name: params.toPointName
            };
            
            callback.call(this, toReturn);
        });
    }
    
    return DistanceCalculator;

})();