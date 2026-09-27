import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, map, of, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { CustomerService } from '../../../../core/services/customer-service';
import { CustomerListItem } from '../../../../shared/models/Customer';

@Component({
  selector: 'app-view-all-map-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-all-map-modal.html',
  styleUrl: './view-all-map-modal.css',
})
export class ViewAllMapModal implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  loading = false;
  errorMessage: string | null = null;

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;

  constructor(private customerService: CustomerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      setTimeout(() => this.initMapAndLoadCustomers(), 0);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMapAndLoadCustomers(): void {
    if (!this.mapContainer) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });

    this.map = L.map(this.mapContainer.nativeElement).setView([26.8206, 30.8025], 6); // centered on Egypt

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    this.loadCustomers();

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private loadCustomers(): void {
    this.loading = true;
    this.errorMessage = null;

    const pageSize = 100;

    this.customerService
      .getAll(1, pageSize)
      .pipe(
        switchMap((firstPage) => {
          const totalPages = Math.ceil(firstPage.totalCount / pageSize);
          if (totalPages <= 1) {
            return of(firstPage.items);
          }

          const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) =>
            this.customerService.getAll(index + 2, pageSize),
          );

          return forkJoin(remainingPages).pipe(
            map((pages) => [...firstPage.items, ...pages.flatMap((page) => page.items)]),
          );
        }),
      )
      .subscribe({
        next: (customers) => {
          this.plotCustomers(customers);
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load customers.';
          this.loading = false;
          console.error(err);
        },
      });
  }

  private plotCustomers(customers: CustomerListItem[]): void {
    if (!this.markersLayer || customers.length === 0) return;

    this.markersLayer.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    for (const customer of customers) {
      const marker = L.marker([customer.latitude, customer.longitude]).bindPopup(
        `<strong>${customer.name}</strong><br>${customer.governorateName} — ${customer.cityName}`,
      );
      marker.addTo(this.markersLayer);
      bounds.push([customer.latitude, customer.longitude]);
    }

    this.map!.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [30, 30] });
  }

  onClose(): void {
    this.map?.remove();
    this.map = undefined;
    this.markersLayer = undefined;
    this.closed.emit();
  }
}
