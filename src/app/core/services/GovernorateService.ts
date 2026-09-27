import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Governorate } from '../../shared/models/Governorate';
import { City } from '../../shared/models/City';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GovernorateService {
  // private readonly baseUrl = 'https://localhost:7295/api/Location';

  private readonly baseUrl = `${environment.apiUrl}/Location`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Governorate[]> {
    return this.http.get<Governorate[]>(this.baseUrl);
  }

  getCitiesByGovernorate(governorateId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.baseUrl}/${governorateId}/cities`);
  }
}
