var IntermediatePoints = (function() {
    'use strict';
    
    function IntermediatePoints() { }
        
    IntermediatePoints.prototype.getItems = function(callback) {
        var intermetiatePoints = [];
        
        $.ajax({
            type: 'GET',
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Negotiate');
            },
            url: './PontosInteresse.kml',
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
                    coordinates: coordinates,
                    lat: lat,
                    long: long
                };
                
                intermetiatePoints.push(point);
            });
            
            callback.call(this, {intermetiatePoints: intermetiatePoints});
        }
    };
    
    return IntermediatePoints;

})();