/// <reference path="../components/xmlwritter/xmlwriter.js" />

var ExportFiles = (function() {
    'use strict';
    
    function ExportFiles() { }
        
    // Calculate distance between 2 points of the heart
    ExportFiles.prototype.toKml = function(data, pi, pj, waypts) {
        return _toKml(data, pi, pj, waypts);
    };
    
    function _toKml(data, pi, pj, waypts) {
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
        xw.close(); //clean the writer
        xw = undefined; //don't let visitors use it, it's closed
        
        return xml;
    }
    
    return ExportFiles;

})();