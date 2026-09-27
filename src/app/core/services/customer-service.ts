import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PagedResult,
  CustomerListItem,
  CustomerNearest,
  CustomerDetail,
} from '../../shared/models/Customer';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly baseUrl = `${environment.apiUrl}/Customers`;
  private readonly imageBaseUrl = `${environment.apiUrl}/Image`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, pageSize: number = 10): Observable<PagedResult<CustomerListItem>> {
    return this.http.get<PagedResult<CustomerListItem>>(`${this.baseUrl}/GetAllCustomers`, {
      params: { page, pageSize },
    });
  }

  getById(id: number): Observable<CustomerDetail> {
    return this.http.get<CustomerDetail>(`${this.baseUrl}/${id}`);
  }

  add(formData: FormData): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/AddCustomer`, formData);
  }

  addImage(formData: FormData): Observable<number> {
    return this.http.post<number>(this.imageBaseUrl, formData);
  }

  setMainImage(customerId: number, imageId: number): Observable<void> {
    return this.http.put<void>(`${this.imageBaseUrl}/SetMainImage`, {
      customerId,
      imageId,
    });
  }

  getNearest(latitude: number, longitude: number): Observable<CustomerNearest[]> {
    return this.http.get<CustomerNearest[]>(`${this.baseUrl}/nearest`, {
      params: { latitude, longitude },
    });
  }
}
