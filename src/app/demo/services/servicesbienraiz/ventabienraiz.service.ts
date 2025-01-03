import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ventabienraiz, ImagenViewModel, Mantenimiento } from '../../models/modelsbienraiz/ventabienraizviewmodel';
import { forkJoin, map, Observable } from 'rxjs';
import { Respuesta } from 'src/app/demo/services/ServiceResult';
import { environment } from 'src/environment/environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Cliente } from '../../models/modelsgeneral/clienteviewmodel';

@Injectable({
  providedIn: 'root'
})
export class ventabienraizservice {

  constructor(private http: HttpClient) { }

  // URL base para la API, obtenida del archivo de configuración de entorno.
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  // URLs específicas para los distintos servicios de la API.
  private procesoventa = `${this.apiUrl}/api/ProcesoVenta`;
  private clienteprocesoventa = `${this.apiUrl}/api/Mantenimiento`;
  private buscaragente = `${this.apiUrl}/api/AgenteBienesRaices`;
  private bienRaizUrl = `${this.apiUrl}/api/BienRaiz/Listar`;
  private terrenoUrl = `${this.apiUrl}/api/Terreno/ListarIdentificador`;
  private ImagenUrl = `${this.apiUrl}/api/ImagenesProcesoVenta`;
  private uploadUrl = `${this.apiUrl}/api/DocumentoBienRaiz/Subir`;

  private documentoUrl = `${this.apiUrl}/api/ImagenesProcesoVenta/Documento`;

  // Método privado para obtener las opciones HTTP, incluyendo los encabezados necesarios.
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    };
  }

  // Obtiene los documentos relacionados a un bien raíz o terreno por su tipo e ID.
  getDocumentos(tipo: number, id: number): Observable<any> {
    const url = `${this.documentoUrl}/${tipo}/${id}`;
    return this.http.get<any>(url, this.getHttpOptions());
  }

  // Retorna la URL base de la API.
  getApiUrl(): string {
    return this.apiUrl;
  }

  ////////////////

  BuscarClientePorDNI(dni: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.clienteprocesoventa}/Buscar/${dni}`, this.getHttpOptions());
  }

  ListarClienteprocesoventa(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.clienteprocesoventa}/Listar`, this.getHttpOptions());
  }

  InsertarClienteprocesoventa(modelo: Mantenimiento): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.clienteprocesoventa}/Insertar`, modelo, this.getHttpOptions());
  }

  // Marca un proceso de venta como vendido.
  Vender(modelo: ventabienraiz): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.procesoventa}/Vender`, modelo, this.getHttpOptions());
  }

  Buscarcliente(id: number): Observable<any> {
    return this.http.get<any>(`${this.procesoventa}/Buscar/${id}`, this.getHttpOptions());
  }


  ////////////////

  // Lista todos los bienes raíces.
  ListarBienesRaices(): Observable<any[]> {
    return this.http.get<any[]>(this.bienRaizUrl, this.getHttpOptions());
  }

  // Lista todos los terrenos.
  ListarTerrenos(): Observable<any[]> {
    return this.http.get<any[]>(this.terrenoUrl, this.getHttpOptions());
  }

  // Combina la lista de bienes raíces y terrenos en un solo observable.
  ListarBienesRaicesYTerrenos(): Observable<any[]> {
    return forkJoin([
        this.ListarBienesRaices(),
        this.ListarTerrenos()
    ]).pipe(
        map(([bienesRaices, terrenos]) => {
            const bienesRaicesConTipo = bienesRaices.map(bien => ({ ...bien, tipo: 0 }));
            const terrenosConTipo = terrenos.map(terreno => ({ ...terreno, tipo: 1 }));
            return [...bienesRaicesConTipo, ...terrenosConTipo];
        })
    );
  }

  // Lista todos los procesos de venta de bienes raíces.
  Listar(): Observable<ventabienraiz[]> {
    return this.http.get<ventabienraiz[]>(`${this.procesoventa}/Listar`, this.getHttpOptions());
  }

  // Busca un proceso de venta específico basado en varios identificadores.
  Buscar(id: number, tipo: number, id2: number): Observable<any> {
    return this.http.get<any>(`${this.procesoventa}/Buscar/${id}/${tipo}/${id2}`, this.getHttpOptions());
  }

  // Inserta un nuevo proceso de venta.
  Insertar(modelo: ventabienraiz): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.procesoventa}/Insertar`, modelo, this.getHttpOptions());
  }

  // Sube una imagen asociada a un proceso de venta.
  SubirImagen(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.uploadUrl, formData, {
      headers: new HttpHeaders({
        'XApiKey': `${this.apiKey}`
      })
    });
  }

  // Inserta un conjunto de imágenes asociadas a un proceso de venta.
  InsertarImagenes(modelos: ImagenViewModel[]): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.ImagenUrl}/Insertar`, modelos, this.getHttpOptions());
  }

  // Actualiza una imagen específica de un proceso de venta.
  ActualizarImagenes(modelo: ImagenViewModel): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.ImagenUrl}/Actualizar`, modelo, this.getHttpOptions());
  }

  // Actualiza un proceso de venta existente.
  Actualizar(modelo: ventabienraiz): Observable<Respuesta> {
    return this.http.put<Respuesta>(`${this.procesoventa}/Actualizar`, modelo, this.getHttpOptions());
  }


  // Elimina un proceso de venta por su ID.
  Eliminar(id: number): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${this.procesoventa}/Eliminar?id=${id}`, this.getHttpOptions());
  }

  // Marca un proceso de venta como vendido, utilizando un endpoint específico.
  Vendido(id: number): Observable<Respuesta> {
    return this.http.delete<Respuesta>(`${this.procesoventa}/Vendido?id=${id}`, this.getHttpOptions());
  }

  // Obtiene las imágenes asociadas a un proceso de venta.
  getImagenes(id: number): Observable<any> {
    return this.http.get<any>(`${this.ImagenUrl}/Buscar/${id}`, this.getHttpOptions());
  }

  // Elimina una imagen específica asociada a un proceso de venta.
  EliminarImagen(id: number): Observable<any> {
    return this.http.delete<any>(`${this.ImagenUrl}/Eliminar/${id}`, this.getHttpOptions());
  }
}
