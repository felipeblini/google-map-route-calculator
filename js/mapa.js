window.onload = function () {
    var markersArray = [];
    var gm = google.maps;


    var latlng = new gm.LatLng(-15.834295, -48.023389);
    var map = new gm.Map(document.getElementById('map_canvas'), {
        mapTypeId: gm.MapTypeId.ROADMAP,
        center: latlng, zoom: 15  // whatevs: fitBounds will override

    });

    var kmlUrl2 = 'http://felipeblini-001-site32.btempurl.com/PontosInteresse.kml';
    var kmlOptions = {
        suppressInfoWindows: true,
        preserveViewport: false,
        map: map
    };
    
    var kmlLayer = new google.maps.KmlLayer(kmlUrl2, kmlOptions);

    //evento chamado toda vez que o usuario mexe no "Move me"
    // geocoder = new gm.Geocoder();

    // gm.event.addListener(marker, 'drag', function () {
    //     geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
    //         if (status == gm.GeocoderStatus.OK) {
    //             if (results[0]) {

    //                 var latitude = marker.getPosition().lat();
    //                 var longitude = marker.getPosition().lng()
    //                 latlng = new gm.LatLng(latitude, longitude);

    //                 for (var i = 0; i < markersArray.length; i++) {
    //                     markersArray[i].setMap(null);
    //                 }
    //                 markersArray.length = 0;

    //                 carregarPontos();
    //             }
    //         }
    //     });
    // });

    // carregarPontos();

    // function carregarPontos() {

    //     var iw = new gm.InfoWindow();
    //     var oms = new OverlappingMarkerSpiderfier(map,
    //       { markersWontMove: true, markersWontHide: true });

    //     var iconWithColor = function (color) {
    //         var icon;
    //         if (color == 'usual') {
    //             icon = '/img/especialista-pointer.png';
    //         }
    //         else if (color == 'spider') {
    //             icon = '/img/especialista-pointer-spider.png';
    //         }
            
    //         return icon;
    //     };

    //     oms.addListener('click', function (marker) {
    //         iw.setContent(marker.desc);
    //         iw.open(map, marker);
    //     });

    //     oms.addListener('spiderfy', function (markers) {
    //         for (var i = 0; i < markers.length; i++) {
    //             markers[i].setIcon(iconWithColor('spider'));
    //             markers[i].setShadow(null);
    //         }
    //         iw.close();
    //     });

    //     oms.addListener('unspiderfy', function (markers) {
    //         for (var i = 0; i < markers.length; i++) {
    //             markers[i].setIcon(iconWithColor('usual'));
    //             markers[i].setShadow(null);
    //         }
    //     });

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