import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CityDto } from './cities-api.model';

@Injectable({
  providedIn: 'root'
})
export class CitiesApiService {
  private readonly baseUrl = `${environment.apiUrl}/api/Cities`;
  private http = inject(HttpClient);

  getAll(): Observable<CityDto[]> {
    return this.http.get<CityDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<CityDto> {
    return this.http.get<CityDto>(`${this.baseUrl}/${id}`);
  }
}
