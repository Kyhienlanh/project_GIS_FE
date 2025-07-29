import { Component, OnInit ,AfterViewInit} from '@angular/core';
import * as L from 'leaflet';
import Fuse from 'fuse.js';
import { ViewChild, ElementRef } from '@angular/core';
import 'leaflet-routing-machine';
import { Router } from '@angular/router';
import { CheckboxService } from '../../services/checkbox.service';

@Component({
  selector: 'app-homeuser',
  imports: [],
  templateUrl: './homeuser.html',
  styleUrl: './homeuser.css'
})

export class Homeuser  implements OnInit,AfterViewInit  {
  constructor(private router: Router,private checkboxService: CheckboxService) {}
  pointFeatures: any[] = []; 
  searchResults: any[] = [];
  private fuse!: Fuse<any>;
  opacity: number = 1;
  opacity2: number = 1;
  check = true;  
  check2 = false;
  checkpointNew=true;
  menuOpen = false;
  private isRoutingEnabled = false;
  private map!: L.Map;
  private wmsLayer!: L.TileLayer.WMS;
  private wmsLayer2!: L.TileLayer.WMS;
  private pointLayer!: L.GeoJSON;
  private pointLayerDulich!: L.GeoJSON;
  private pointLayerNew!: L.GeoJSON;
  private roadLayerGeoJSON!: L.GeoJSON;
  private routeControl: any;
  isTracking = false; 
  private userMarker!: L.Marker;
  private watchId: number | null = null;
     customIcon = L.icon({
    iconUrl: 'assets/icons/map_pin.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  }); 
   customIconNew = L.icon({
    iconUrl: 'assets/icons/map_pin_new.png',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40]
  }); 
  
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
@ViewChild('notification', { static: false }) notificationRef!: ElementRef;

onCheckboxClick(name: string) {
    this.checkboxService.sendClick(name, 0).subscribe({
      next: res => console.log('Click sent:', res),
      error: err => console.error('Error:', err)
    });
  }
showNotification(message: string): void {
  const el = this.notificationRef.nativeElement;
  el.innerText = message;
  el.style.display = 'block';

  // Tự ẩn sau 3 giây
  setTimeout(() => {
    el.style.display = 'none';
  }, 3000);
}

showNotificationLong(message: string): void {
  const el = this.notificationRef.nativeElement;
  el.innerText = message;
  el.style.display = 'block';

  // Tự ẩn sau 3 giây
  setTimeout(() => {
    el.style.display = 'none';
  }, 10000);
}


  ngOnInit(): void {
    this.loadPointsFromGeoServernew();
    this.checkpointNew=true;
  }
   ngAfterViewInit(): void {
    this.initMap();   
    // this.enableRoutingOnClick();
    this.showMyLocation();
   
    
  }
  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
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

  //Di chuyển theo vị trí
  startTrackingLocation(): void {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị!');
      this.showNotification("Trình duyệt không hỗ trợ định vị");
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const latLng = L.latLng(lat, lon);

        if (!this.userMarker) {
          this.userMarker = L.marker(latLng, {
            icon: L.icon({
              iconUrl: 'assets/icons/myaddress_pin.png',
              iconSize: [30, 30],
              iconAnchor: [15, 30]
            })
          }).addTo(this.map).bindPopup('📍 Vị trí hiện tại của bạn');
        } else {
          this.userMarker.setLatLng(latLng);
        }

        this.map.setView(latLng, this.map.getZoom(), {
          animate: true
        });
      },
      (error) => {
        console.error('Lỗi theo dõi vị trí:', error);
        alert('Không thể theo dõi vị trí.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
  }

  
  stopTrackingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
      this.userMarker = undefined!;
    }
  }

  toggleTracking(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isTracking = checked;

    if (checked) {
      this.startTrackingLocation();
       this.onCheckboxClick("tracking");
    } else {
      this.stopTrackingLocation();
    }
  }


  
    //Tìm đường đi
  TimDuongDi(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isRoutingEnabled = checked;

    if (checked) {
      this.enableRoutingOnClick();
      // alert("Bấm vào bản đồ để chọn điểm đến.");
      this.showNotification('Bấm vào bản đồ để chọn điểm đến.');

    } else {
      this.map.off('click'); // Xóa sự kiện click
      if (this.routeControl) {
        this.map.removeControl(this.routeControl); // Xóa tuyến cũ nếu có
        this.routeControl = null;
      }
    }
  }
  
  enableRoutingOnClick(): void {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị!');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const startLat = position.coords.latitude;
        const startLng = position.coords.longitude;

        // Gỡ bỏ sự kiện click cũ để tránh trùng lặp
        this.map.off('click');

        // Gắn sự kiện click để chọn điểm đến
        this.map.on('click', (e: L.LeafletMouseEvent) => {
          if (!this.isRoutingEnabled) return; // chỉ kích hoạt khi checkbox bật

          const destLat = e.latlng.lat;
          const destLng = e.latlng.lng;

          // Xóa tuyến cũ nếu có
          if (this.routeControl) {
            this.map.removeControl(this.routeControl);
          }

          // Tạo tuyến đường mới với icon tùy chỉnh
              this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(startLat, startLng),
          L.latLng(destLat, destLng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        show: true, // 🔥 bật panel chi tiết hướng đi
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,

        createMarker: (i: number, waypoint: any, n: number) => {
          const icon = L.icon({
            iconUrl: i === 0 ? 'assets/icons/myaddress_pin.png' : 'assets/icons/map_pin.png',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
          });

          const marker = L.marker(waypoint.latLng, { icon });
          marker.bindPopup(i === 0 ? '📍 Vị trí của bạn' : '🎯 Điểm đến');
          return marker;
        }
      }).addTo(this.map);

          this.routeControl.on('routesfound', (e: any) => {
            const summary = e.routes[0].summary;
            const distance = (summary.totalDistance / 1000).toFixed(2); // km
            const time = Math.round(summary.totalTime / 60); // phút

            // alert(`🚗 Quãng đường: ${distance} km\n⏱️ Thời gian dự kiến: ${time} phút`);
            this.showNotificationLong(`🚗 Quãng đường: ${distance} km\n⏱️ Thời gian dự kiến: ${time} phút`);
            
          });
                });
      },
      (error) => {
        console.error('Không thể lấy vị trí:', error);
        alert('Không thể xác định vị trí của bạn.');
      }
    );
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
        this.onCheckboxClick("layer");
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
          this.onCheckboxClick("UBND");
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
      // this.pointFeatures = data.features;
     
      // this.fuse = new Fuse(this.pointFeatures, {
      //   keys: ['properties.ten'],
      //   threshold: 0.4
      // });

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
           layer.on('click', (e: L.LeafletMouseEvent) => {
            layer.openPopup();
            this.map.flyTo(e.latlng, 14, {
              animate: true,
              duration: 1  
            });
          });
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

     togglePointnew(Point: string, event: Event): void {
      const CheckPoint = (event.target as HTMLInputElement).checked;
      if (CheckPoint) {
        this.loadPointsFromGeoServernew();
        console.log('Bật điểm UBND mới');
         this.onCheckboxClick("pointNew");
      } else {
        if (this.pointLayerNew) {
          this.map.removeLayer(this.pointLayerNew);
          console.log('Ẩn điểm UBND mới');
        }
      }
    }
  private loadPointsFromGeoServernew(): void {
  const url = 'http://localhost:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne:UBNDnew&outputFormat=application/json';
  fetch(url)
    .then(res => res.json())
    .then(data => {
     
      if (this.pointLayerNew) {
        this.map.removeLayer(this.pointLayerNew);
      }
       this.pointFeatures = data.features;
     
      this.fuse = new Fuse(this.pointFeatures, {
        keys: ['properties.ten'],
        threshold: 0.4
      });
      this.pointLayerNew = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: this.customIconNew });
        },
        onEachFeature: (feature, layer) => {
          console.log('Thuộc tính điểm:', feature.properties);
          const props = feature.properties;
          const popupContent = `
            <b>${props.ten || 'Không rõ tên'}</b><br>
            Trụ sở: ${props.TruSo || 'Không có'}<br>
            <br>
            Xã/Phường: ${props.phuong || 'Không có'}<br>
            Vĩ độ: ${props.lat}<br>
            Kinh độ: ${props.lon}
          `;
          layer.bindPopup(popupContent);
          // layer.on('click', () => layer.openPopup());
          layer.on('click', (e: L.LeafletMouseEvent) => {
            layer.openPopup();
            this.map.flyTo(e.latlng, 14, {
              animate: true,
              duration: 1  
            });
          });
          if ('bringToFront' in layer && typeof (layer as any).bringToFront === 'function') {
            (layer as any).bringToFront();
          }
        }
      });

      this.pointLayerNew.addTo(this.map);
    })
    .catch(err => {
      console.error('Lỗi khi gọi GeoServer:', err);
    });
}
  
  search(event: Event): void {
  const keyword = (event.target as HTMLInputElement).value;
  if (!this.fuse || keyword.length < 2) {
    this.searchResults = [];
    return;
  } 

 this.searchResults = this.fuse.search(keyword).slice(0, 5).map(result => result.item);

}

zoomToPoint(feature: any): void {
  const lat = feature.geometry.coordinates[1];
  const lon = feature.geometry.coordinates[0];
  
  this.map.flyTo([lat, lon], 15);

  L.popup()
    .setLatLng([lat, lon])
    .setContent(`<b>${feature.properties.ten}</b>`)
    .openOn(this.map);

  this.searchResults = []; 
}

  exportGeoJSON(type: 'old' | 'new'): void {
  const data = type === 'old' ? this.pointLayer?.toGeoJSON() : this.pointLayerNew?.toGeoJSON();
  if (!data) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = type === 'old' ? 'UBND_CU.geojson' : 'UBND_MOI.geojson';
  a.click();
  window.URL.revokeObjectURL(url);
}
public loadRoadGeoJSON(): void {
  const url = 'http://localhost:8080/geoserver/ne/ows?' +
              'service=WFS&version=1.0.0&request=GetFeature' +
              '&typeName=ne:TuyenDuongGiaoThong&outputFormat=application/json';

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (this.roadLayerGeoJSON) {
        this.map.removeLayer(this.roadLayerGeoJSON);
      }

      this.roadLayerGeoJSON = L.geoJSON(data, {
        style: feature => {
  const highway = feature?.properties?.highway;

  const colorMap: { [key: string]: string } = {
    'primary': '#ff0000',         // Đỏ
    'secondary': '#ffa500',       // Cam
    'tertiary': '#ffff00',        // Vàng
    'residential': '#00bfff',     // Xanh dương
    'service': '#8a2be2',         // Tím
    'unclassified': '#999999',    // Xám
    'trunk': '#ff6600',           // Cam đậm
    'pedestrian': '#009933',      // Xanh lá
    'living_street': '#a0522d'    // Nâu đất
  };

  const color = colorMap[highway] || '#666'; 

  return {
    color,
    weight: 3,
    opacity: 0.9
  };
}
,
  onEachFeature: (feature, layer) => {
  const props = feature.properties;

  
  const highwayMap: { [key: string]: string } = {
    'primary': 'Đường chính',
    'residential': 'Đường dân cư',
    'pedestrian': 'Đường đi bộ',
    'secondary': 'Đường phụ',
    'tertiary': 'Đường cấp ba',
    'service ':'Đường dịch vụ',
    'unclassified':'Đường cấp thấp chưa phân loại',
    'trunk':'Đường quốc lộ chính',
    'living_street':'Đường dân sinh'
  };

  const highwayVN = highwayMap[props.highway] || props.highway || 'Không rõ';

  const popupContent = `
    <b>ID:</b> ${props['@id'] || 'Không rõ'}<br>
    <b>Loại đường:</b> ${highwayVN}<br>
    <b>Khu vực:</b> ${props.area === 'yes' ? 'Có' : 'Không'}
  `;

  layer.bindPopup(popupContent);
  layer.on('click', (e: L.LeafletMouseEvent) => {
    layer.openPopup();
    this.map.flyTo(e.latlng, 16);
  });
}

      });

      this.roadLayerGeoJSON.addTo(this.map);
    })
    .catch(err => {
      console.error('Lỗi tải GeoJSON tuyến đường:', err);
    });
}


toggleRoadGeoJSON(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  if (checked) {
    this.loadRoadGeoJSON();
     this.onCheckboxClick("TuyenDuong");
  } else {
    if (this.roadLayerGeoJSON) {
      this.map.removeLayer(this.roadLayerGeoJSON);
    }
  }
}

    customIconDulich = L.icon({
      iconUrl: 'assets/icons/travel_pin1.png', // icon du lịch
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40]
    });

     togglePointDulich(Point: string, event: Event): void {
      const CheckPoint = (event.target as HTMLInputElement).checked;
      if (CheckPoint) {
        this.loadPointsFromGeoServerTravel();
        console.log('Bật điểm du lịch');
         this.onCheckboxClick("Dulich");
      } else {
        if (this.pointLayerDulich) {
          this.map.removeLayer(this.pointLayerDulich);
          console.log('Ẩn điểm lịch');
        }
      }
    }
 private loadPointsFromGeoServerTravel(): void {
  const url ='http://localhost:8080/geoserver/ne/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ne:dulichPoint&bbox=106.61,10.90,106.82,11.06&outputFormat=application/json';

  fetch(url)
    .then(res => res.json())
    .then(data => {
     
      if (this.pointLayerDulich) {
        this.map.removeLayer(this.pointLayerDulich);
      }
      this.pointLayerDulich = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: this.customIconDulich });
        },
        onEachFeature: (feature, layer) => {
          console.log('Thuộc tính điểm:', feature.properties);
          const props = feature.properties;
          const popupContent = `
            <div style="width: 220px; font-family: Arial, sans-serif;">
              <h4 style="margin: 0; color: #2E86C1;">${props.ten || 'Không rõ tên'}</h4>
              <img src="${props.img || 'assets/icons/no-image.png'}" 
                  alt="Không có hình" 
                  style="width: 100%; height: auto; margin: 8px 0; border-radius: 8px;" />
              <p style="margin: 4px 0;"><strong>Ghi chú:</strong> ${props.ghichu || 'Không có'}</p>
              <p style="margin: 4px 0;"><strong>Thông tin:</strong> ${props.ThongTin || 'Chưa cập nhật'}</p>
              <p style="margin: 4px 0; font-size: 12px; color: gray;">
                <strong>Vĩ độ:</strong> ${props.lat} - 
                <strong>Kinh độ:</strong> ${props.lon}
              </p>
            </div>
          `;

          layer.bindPopup(popupContent);
           layer.on('click', (e: L.LeafletMouseEvent) => {
            layer.openPopup();
            this.map.flyTo(e.latlng, 14, {
              animate: true,
              duration: 1  
            });
          });
          if ('bringToFront' in layer && typeof (layer as any).bringToFront === 'function') {
            (layer as any).bringToFront();
          }
        }
      });

      this.pointLayerDulich.addTo(this.map);
    })
    .catch(err => {
      console.error('Lỗi khi gọi GeoServer:', err);
    });
  }
    
 public showMyLocation(): void {
  if (!navigator.geolocation) {
    alert('Trình duyệt không hỗ trợ định vị!');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const myMarker = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: 'assets/icons/myaddress_pin.png',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }).addTo(this.map);

      myMarker.bindPopup('📍 Vị trí của bạn').openPopup();

      
      // this.map.flyTo([lat, lon], 15, {
      //   animate: true,
      //   duration: 2 
      // });
    },
    (error) => {
      console.error('Lỗi lấy vị trí:', error);
      alert('Không thể lấy vị trí của bạn.');
    }
  );
}


goToLogin() {
  // Xóa token nếu cần:
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}



}
