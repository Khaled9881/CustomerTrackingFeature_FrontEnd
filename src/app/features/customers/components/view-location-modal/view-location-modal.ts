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
import * as L from 'leaflet';
import { CustomerListItem } from '../../../../shared/models/Customer';

@Component({
  selector: 'app-view-location-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-location-modal.html',
  styleUrl: './view-location-modal.css',
})
export class ViewLocationModal implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() customer: CustomerListItem | null = null;

  @Output() closed = new EventEmitter<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private mapInitialized = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.customer) {
      setTimeout(() => this.initOrUpdateMap(), 0);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initOrUpdateMap(): void {
    if (!this.mapContainer || !this.customer) return;

    const { latitude, longitude, name } = this.customer;

    if (!this.mapInitialized) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });

      this.map = L.map(this.mapContainer.nativeElement).setView([latitude, longitude], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      this.mapInitialized = true;
    } else {
      this.map!.setView([latitude, longitude], 14);
    }

    L.marker([latitude, longitude]).addTo(this.map!).bindPopup(name).openPopup();

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  onClose(): void {
    this.mapInitialized = false;
    this.map?.remove();
    this.map = undefined;
    this.closed.emit();
  }
}
