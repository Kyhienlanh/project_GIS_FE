import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-layer',
  templateUrl: './layer.html',
  styleUrls: ['./layer.css']
})
export class Layer implements OnInit {
  private map!: L.Map;
  private wmsLayer!: L.TileLayer.WMS;
  private wmsLayer2!: L.TileLayer.WMS;
  private pointLayer!: L.GeoJSON;
  opacity: number = 1;
  opacity2: number = 1;
  check = true;  
  check2 = false;
   customIcon = L.icon({
    iconUrl: 'assets/icons/map_pin.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  }); 
  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [11.2, 106.65],
      zoom: 10
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/ne/wms', {
      layers: 'ne:newBinhDuong',
      format: 'image/png',
      transparent: true,
      version: '1.1.0',
      attribution: 'GeoServer',
      opacity: this.opacity
    });
    
    this.wmsLayer2 = L.tileLayer.wms('http://localhost:8080/geoserver/ne/wms', {
      layers: 'ne:oldBinhDuong',
      format: 'image/png',
      transparent: true,
      version: '1.1.0',
      attribution: 'GeoServer', 
      opacity: this.opacity2
    });
    this.wmsLayer.addTo(this.map);
  }

  toggleLayer(layer: string, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
    console.log(checked);
    if (layer === 'newbinhduong') {
      this.check = checked;
      checked ? this.wmsLayer.addTo(this.map) : this.map.removeLayer(this.wmsLayer);
    }

    if (layer === 'oldbinhduong') {
      this.check2 = checked;
      checked ? this.wmsLayer2.addTo(this.map) : this.map.removeLayer(this.wmsLayer2);
    }
  }

  updateOpacity(layer:string,event:Event):void{
    const opacityED=(event.target as HTMLInputElement).value;
    console.log(opacityED);
    if(layer=="newbinhduong"){
      this.opacity=Number(opacityED);
      this.wmsLayer.setOpacity(this.opacity);
    }
   if(layer=="oldbinhduong"){
      this.opacity2=Number(opacityED);
      this.wmsLayer2.setOpacity(this.opacity2);
    }
  }
 
    togglePoint(Point: string, event: Event): void {
      const CheckPoint = (event.target as HTMLInputElement).checked;
      if (CheckPoint) {
        this.loadPointsFromGeoServer();
        console.log('Bật điểm UBND');
      } else {
        if (this.pointLayer) {
          this.map.removeLayer(this.pointLayer);
          console.log('Ẩn điểm UBND');
        }
      }
    }

  private loadPointsFromGeoServer(): void {
  const url = 'http://localhost:8080/geoserver/ne/ows?' +
              'service=WFS&version=1.0.0&request=GetFeature' +
              '&typeName=ne:pointUBND&outputFormat=application/json';

  fetch(url)
    .then(res => res.json())
    .then(data => {
     
      if (this.pointLayer) {
        this.map.removeLayer(this.pointLayer);
      }

      this.pointLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: this.customIcon });
        },
        onEachFeature: (feature, layer) => {
          console.log('Thuộc tính điểm:', feature.properties);
          const props = feature.properties;
          const popupContent = `
            <b>${props.ten || 'Không rõ tên'}</b><br>
            Ghi chú: ${props.ghichu || 'Không có'}<br>
            Vĩ độ: ${props.lat}<br>
            Kinh độ: ${props.lon}
          `;
          layer.bindPopup(popupContent);
          layer.on('click', () => layer.openPopup());
          if ('bringToFront' in layer && typeof (layer as any).bringToFront === 'function') {
            (layer as any).bringToFront();
          }
        }
      });

      this.pointLayer.addTo(this.map);
    })
    .catch(err => {
      console.error('Lỗi khi gọi GeoServer:', err);
    });
}

  
 

}
