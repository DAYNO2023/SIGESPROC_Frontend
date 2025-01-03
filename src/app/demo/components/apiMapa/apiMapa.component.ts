import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiMapaService } from 'src/app/demo/services/servicesgeneral/apiMapa.service';
import { TerrenoService } from '../../services/servicesbienraiz/terreno.service';
import { Terreno } from '../../models/modelsbienraiz/terrenoviewmodel';
import { MapMarker, GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-apiMapa',
  templateUrl: './apiMapa.component.html',
  styleUrls: ['./apiMapa.component.scss'],
})
export class ApiMapaComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 2;
  markers = [];
  terrenos: Terreno[] = [];
  selectedMarkerContent: string;
  infoWindow: google.maps.InfoWindow;
  searchBox: google.maps.places.SearchBox;

  constructor(private service: ApiMapaService, private bienRaizService: TerrenoService) {}

  Listado() {
    this.bienRaizService.Listar().subscribe(
      (data: any) => {
        this.terrenos = data.map((terreno: any) => ({
          ...terreno,
        }));
        this.addDynamicMarkers();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  ngOnInit(): void {
    this.Listado();
    this.infoWindow = new google.maps.InfoWindow();
  }

  ngAfterViewInit() {
    this.initializeSearchBox();
  }

  initializeSearchBox() {
    const input = document.getElementById('search-box') as HTMLInputElement;
    this.searchBox = new google.maps.places.SearchBox(input);

    this.map.googleMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    this.map.googleMap.addListener('bounds_changed', () => {
      this.searchBox.setBounds(this.map.googleMap.getBounds() as google.maps.LatLngBounds);
    });

    this.searchBox.addListener('places_changed', () => {
      const places = this.searchBox.getPlaces();

      if (places?.length === 0) {
        return;
      }

      const bounds = new google.maps.LatLngBounds();

      places.forEach(place => {
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        this.map.googleMap.setCenter(place.geometry.location);
        this.map.googleMap.setZoom(12);

        bounds.extend(place.geometry.location);
      });

      this.map.googleMap.fitBounds(bounds);
    });
  }

  addMarker(position: google.maps.LatLngLiteral, color: string = '#FFF0C6', details: any) {
    const contentString = `
      <div style="background-color: #FFF0C6; color: #000; padding: 10px; border-radius: 5px;">
        <strong>Descripción:</strong> ${details.terr_Descripcion}<br>
        <strong>País:</strong> ${details.country || 'Desconocido'}<br>
        <strong>Ciudad:</strong> ${details.city || 'Desconocida'}<br>
        <strong>Coordenadas:</strong> ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}<br>
        <strong>Google Maps:</strong> <a href="${details.terr_LinkUbicacion}" target="_blank">Link</a>
      </div>`;

    const marker = new google.maps.Marker({
      position,
      map: this.map.googleMap,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 10,
      },
    });

    marker.addListener('click', () => {
      this.infoWindow.setContent(contentString);
      this.infoWindow.open(this.map.googleMap, marker);
    });

    this.markers.push(marker);
  }


  async addDynamicMarkers() {
    const colors = ['#FF0000', '#00FF00'];
    const firstFiveTerrenos = this.terrenos.slice(0, 5);

    for (let i = 0; i < firstFiveTerrenos.length; i++) {
      const terreno = firstFiveTerrenos[i];
      const position: google.maps.LatLngLiteral = {
        lat: parseFloat(terreno.terr_Latitud),
        lng: parseFloat(terreno.terr_Longitud),
      };
      await this.delay(200);
      this.getPlaceDetails(terreno.terr_Latitud, terreno.terr_Longitud, terreno, terreno.terr_Estado ? colors[0] : colors[1]);
    }
  }

  getPlaceDetails(lat: string, lng: string, terreno: Terreno, color: string) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const place = results[0].address_components.reduce((acc, component) => {
          if (component.types.includes('country')) acc.country = component.long_name;
          if (component.types.includes('locality')) acc.city = component.long_name;
          return acc;
        }, { country: '', city: '' });

        const details = {
          ...terreno,
          country: place.country,
          city: place.city,
        };

        this.addMarker(latlng, color, details);
      }
    });
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
