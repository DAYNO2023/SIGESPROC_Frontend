import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { Material } from '../../models/modelsinsumo/materialviewmodel';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
    // Propiedades

    // URL base de la API, obtenida del archivo de configuración del entorno
    private apiUrl: string = environment.apiUrl;

    // Clave API, obtenida del archivo de configuración del entorno
    private apiKey: string = environment.apiKey;

    // Endpoint específico para materiales
    private Material = `${this.apiUrl}/api/Material`;

    // Opciones HTTP, incluyendo encabezados con la clave API
    private options: {} = {
        headers: new HttpHeaders({
            'XApiKey': `${this.apiKey}`,
        })
    };

    // Constructor
    constructor(private http: HttpClient) {}

    // Endpoints

    /**
     * Eliminar un material por ID
     * @param id - Identificador del material a eliminar
     * @returns - Promesa con la respuesta de la operación
     */
    Eliminar(id: number) {
        return this.http.put<any>(`${this.Material}/Eliminar`, id, this.options)
            .toPromise();
    }

    /**
     * Buscar un material por ID
     * @param id - Identificador del material a buscar
     * @returns - Promesa con el material encontrado
     */
    Buscar(id: number) {
        return this.http.post<any>(`${this.Material}/Buscar/${id}`, null, this.options)
            .toPromise()
            .then(result => result.data as Material)
            .then(data => data);
    }

    /**
     * Insertar un nuevo material
     * @param modelo - Objeto Material a insertar
     * @returns - Promesa con la respuesta de la operación
     */
    Insertar(modelo: Material) {
        return this.http.post<any>(`${this.Material}/Insertar`, modelo, this.options)
            .toPromise();
    }

    /**
     * Listar todos los materiales
     * @returns - Promesa con la lista de materiales
     */
    Listar() {
        return this.http.get<any>(`${this.Material}/Listar`, this.options)
            .toPromise()
            .then(result => result.data as Material[])
            .then(data => data);
    }

    /**
     * Actualizar un material existente
     * @param modelo - Objeto Material con los datos actualizados
     * @returns - Promesa con la respuesta de la operación
     */
    Actualizar(modelo: Material) {
        return this.http.put<any>(`${this.Material}/Actualizar`, modelo, this.options)
            .toPromise();
    }
}
