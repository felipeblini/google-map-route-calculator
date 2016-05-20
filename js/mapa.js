window.onload = function () {
    var markersArray = [];
    var gm = google.maps;


    var latlng = new gm.LatLng(-15.834295, -48.023389);
    var map = new gm.Map(document.getElementById('map_canvas'), {
        mapTypeId: gm.MapTypeId.ROADMAP,
        center: latlng, zoom: 15

    });

    var kmlUrl2 = 'http://felipeblini-001-site32.btempurl.com/PontosInteresse.kml?v=2';
    var kmlOptions = {
        suppressInfoWindows: false,
        preserveViewport: false,
        map: map
    };
    
    
    var kmlLayer = new google.maps.KmlLayer(kmlUrl2, kmlOptions);

    //     var bounds = new gm.LatLngBounds();

    //     $.ajax({
    //         type: "GET",
    //         url: "/Pontos-de-Interesse.kml",
    //         dataType: "xml",
    //         success: xmlParser
    //     });

    //     function xmlParser(xml) {
    //         var latlngbounds = new google.maps.LatLngBounds();

    //         $(xml).find("Placemark").each(function () {
    //             var name = $(this).find("name").text();
    //             var coordinates = $(this).find("Point").find("coordinates").text();
    //             var lat = coordinates.split(',')[1];
    //             var long = coordinates.split(',')[0];

    //             var loc = new gm.LatLng(lat, long);
    //             bounds.extend(loc);
    //             var marker = new gm.Marker({
    //                 position: loc,
    //                 title: name,
    //                 map: map,
    //                 icon: iconWithColor('usual')
    //             });

    //             marker.desc = '<h3>' + name + '</h3>';
    //             oms.addMarker(marker);
    //             markersArray.push(marker);
    //         });
    //     }
        
    //     map.fitBounds(bounds);
    // }
};