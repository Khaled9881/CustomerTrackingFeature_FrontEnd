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
import { CustomerDetail } from '../../../../shared/models/Customer';

@Component({
  selector: 'app-customer-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-detail-modal.html',
  styleUrl: './customer-detail-modal.css',
})
export class CustomerDetailModal implements OnChanges {
  @Input() customerId: number | null = null;
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();
  @Output() imagesChanged = new EventEmitter<void>(); // tells parent to refresh main list (MainImagePath may have changed)

  customer = signal<CustomerDetail | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  settingMainId = signal<number | null>(null);

  constructor(private customerService: CustomerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.customerId) {
      this.loadCustomer();
    }
  }

  private loadCustomer(): void {
    if (!this.customerId) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.customerService.getById(this.customerId).subscribe({
      next: (data) => {
        this.customer.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load customer details.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  onUploadImage(): void {
    const selectedFile = this.selectedFile();
    if (!selectedFile || !this.customerId) return;

    const formData = new FormData();
    formData.append('CustomerId', this.customerId.toString());
    formData.append('Image', selectedFile);

    this.uploading.set(true);
    this.errorMessage.set(null);

    this.customerService.addImage(formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.selectedFile.set(null);
        this.loadCustomer(); // refresh this modal's image list
        this.imagesChanged.emit(); // tell parent to refresh main table/card (in case this was the first image ever)
      },
      error: (err) => {
        this.uploading.set(false);
        this.errorMessage.set('Failed to upload image.');
        console.error(err);
      },
    });
  }

  onSetMain(imageId: number): void {
    if (!this.customerId) return;

    this.settingMainId.set(imageId);

    this.customerService.setMainImage(this.customerId, imageId).subscribe({
      next: () => {
        this.settingMainId.set(null);
        this.loadCustomer();
        this.imagesChanged.emit(); // Main image changed — parent's list needs refreshing
      },
      error: (err) => {
        this.settingMainId.set(null);
        this.errorMessage.set('Failed to set main image.');
        console.error(err);
      },
    });
  }

  onClose(): void {
    this.customer.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set(null);
    this.loading.set(false);
    this.closed.emit();
  }
}
