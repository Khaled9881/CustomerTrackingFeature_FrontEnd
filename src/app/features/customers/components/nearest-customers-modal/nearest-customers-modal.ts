import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../core/services/customer-service';
import { GeolocationService } from '../../../../core/services/geolocation-service';
import { CustomerNearest } from '../../../../shared/models/Customer';

@Component({
  selector: 'app-nearest-customers-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nearest-customers-modal.html',
  styleUrl: './nearest-customers-modal.css',
})
export class NearestCustomersModal implements OnChanges {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  customers = signal<CustomerNearest[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private customerService: CustomerService,
    private geolocationService: GeolocationService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.loadNearestCustomers();
    }
  }

  private loadNearestCustomers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.customers.set([]);

    this.geolocationService.getCurrentPosition().subscribe({
      next: (coords) => {
        this.customerService.getNearest(coords.latitude, coords.longitude).subscribe({
          next: (data) => {
            this.customers.set(data);
            this.loading.set(false);
          },
          error: (err) => {
            this.errorMessage.set('Failed to load nearest customers.');
            this.loading.set(false);
            console.error(err);
          },
        });
      },
      error: (err) => {
        this.errorMessage.set(
          'Could not access your location. Please allow location access and try again.',
        );
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onClose(): void {
    this.customers.set([]);
    this.closed.emit();
  }
}
