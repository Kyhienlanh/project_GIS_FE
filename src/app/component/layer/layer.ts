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
  opacity: number = 1;
  opacity2: number = 1;
 check = true;  
check2 = false;

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
 
}
