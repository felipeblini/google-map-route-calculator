window.onload = function () {
    var markersArray = [];
    var gm = google.maps;


    var latlng = new gm.LatLng(-15.834295, -48.023389);
    var map = new gm.Map(document.getElementById('map_canvas'), {
        mapTypeId: gm.MapTypeId.ROADMAP,
        center: latlng, zoom: 15  // whatevs: fitBounds will override

    });

    //cria e adiciona o ponteiro (marker) "Move me"
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        icon: '/img/usu-pointer.png'
    });

    marker.setPosition(latlng);

    //evento chamado toda vez que o usuário mexe no "Move me"
    geocoder = new gm.Geocoder();

    gm.event.addListener(marker, 'drag', function () {
        geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
            if (status == gm.GeocoderStatus.OK) {
                if (results[0]) {

                    var latitude = marker.getPosition().lat();
                    var longitude = marker.getPosition().lng()
                    latlng = new gm.LatLng(latitude, longitude);

                    for (var i = 0; i < markersArray.length; i++) {
                        markersArray[i].setMap(null);
                    }
                    markersArray.length = 0;

                    carregarPontos();
                }
            }
        });
    });

    carregarPontos();

    function carregarPontos() {

        var iw = new gm.InfoWindow();
        var oms = new OverlappingMarkerSpiderfier(map,
          { markersWontMove: true, markersWontHide: true });

        var iconWithColor = function (color) {
            var icon;
            if (color == 'usual') {
                icon = '/img/especialista-pointer.png';
            }
            else if (color == 'spider') {
                icon = '/img/especialista-pointer-spider.png';
            }
            
            return icon;
        }

        oms.addListener('click', function (marker) {
            iw.setContent(marker.desc);
            iw.open(map, marker);
        });

        oms.addListener('spiderfy', function (markers) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setIcon(iconWithColor('spider'));
                markers[i].setShadow(null);
            }
            iw.close();
        });

        oms.addListener('unspiderfy', function (markers) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setIcon(iconWithColor('usual'));
                markers[i].setShadow(null);
            }
        });

        var bounds = new gm.LatLngBounds();

        $.ajax({
            type: "GET",
            url: "/Pontos.xml",
            dataType: "xml",
            success: xmlParser
        });

        function xmlParser(xml) {
            var latlngbounds = new google.maps.LatLngBounds();

            $(xml).find("Especialista").each(function () {
                var idPonto = $(this).find("Id").text();
                var nome = $(this).find("Nome").text();
                var end = $(this).find("Endereco").text();
                var tel = $(this).find("Telefone").text();
                var lat = $(this).find("Latitude").text();
                var long = $(this).find("Longitude").text();
                var desc = $(this).find("Descricao").text();
                var dest = $(this).find("Destaque").text();
                var logo = $(this).find("Logo").text();

                var loc = new gm.LatLng(lat, long);
                bounds.extend(loc);
                var marker = new gm.Marker({
                    position: loc,
                    title: nome,
                    map: map,
                    icon: iconWithColor('usual')
                });

                marker.desc = "<div style='min-width: 480px; min-height: 50px'><img src='/img/" + logo + "' alt='" + nome + "' /></div><p><b>" + nome + "</b></p><p>" + desc + "</p>" + end + "<br />" + tel
                oms.addMarker(marker);
                markersArray.push(marker);
            });

        }
    }

    map.fitBounds(bounds);
}