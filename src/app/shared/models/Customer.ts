export interface CustomerImage {
  id: number;
  imagePath: string;
  isMain: boolean;
}

export interface CustomerListItem {
  id: number;
  name: string;
  governorateName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  mainImagePath: string | null;
}

export interface CustomerNearest {
  id: number;
  name: string;
  governorateName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  mainImagePath: string | null;
  distanceKm: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CustomerDetail {
  id: number;
  name: string;
  governorateId: number;
  governorateName: string;
  cityId: number;
  cityName: string;
  latitude: number;
  longitude: number;
  images: CustomerImage[];
}
