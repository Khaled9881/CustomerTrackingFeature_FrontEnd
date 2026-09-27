import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { GovernorateService } from '../../../../core/services/GovernorateService';
import { CustomerService } from '../../../../core/services/customer-service';
import { City } from '../../../../shared/models/City';
import { Governorate } from '../../../../shared/models/Governorate';

@Component({
  selector: 'app-add-customer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-customer-modal.html',
  styleUrl: './add-customer-modal.css',
})
export class AddCustomerModal implements OnChanges, AfterViewInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() customerAdded = new EventEmitter<void>();

  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  form: FormGroup;
  governorates = signal<Governorate[]>([]);
  cities = signal<City[]>([]);
  selectedFile: File | null = null;
  submitting = false;
  errorMessage: string | null = null;

  private map?: L.Map;
  private marker?: L.Marker;
  private mapInitialized = false;
  private readonly markerIcon = L.icon({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });

  constructor(
    private fb: FormBuilder,
    private governorateService: GovernorateService,
    private customerService: CustomerService,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      governorateId: [null, Validators.required],
      cityId: [{ value: null, disabled: true }, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.loadGovernorates();
      setTimeout(() => this.initMap(), 0); // wait for modal DOM to render
    }
  }

  ngAfterViewInit(): void {
    // Map init happens on isOpen change instead, since the modal may not be in the DOM yet on first load
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private loadGovernorates(): void {
    this.governorateService.getAll().subscribe({
      next: (data) => this.governorates.set(data),
      error: (err) => console.error('Failed to load governorates', err),
    });
  }

  onGovernorateChange(): void {
    const governorateId = Number(this.form.get('governorateId')?.value);
    this.form.patchValue({ cityId: null });
    this.cities.set([]);

    if (!governorateId) {
      this.form.get('cityId')?.disable();
      return;
    }

    this.governorateService.getCitiesByGovernorate(governorateId).subscribe({
      next: (data) => {
        this.cities.set(data);
        this.form.get('cityId')?.enable();
      },
      error: (err) => console.error('Failed to load cities', err),
    });
  }

  private initMap(): void {
    if (this.mapInitialized || !this.mapContainer) return;

    this.map = L.map(this.mapContainer.nativeElement).setView([30.0444, 31.2357], 6); // default: Cairo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
      this.form.patchValue({ latitude: lat, longitude: lng });
    });

    this.mapInitialized = true;

    // Leaflet sometimes renders incorrectly if the container was hidden during init
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private setMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { icon: this.markerIcon }).addTo(this.map!);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.form.invalid || !this.selectedFile) {
      this.form.markAllAsTouched();
      if (!this.selectedFile) {
        this.errorMessage = 'Please select an image.';
      }
      return;
    }

    const formValue = this.form.getRawValue();

    const formData = new FormData();
    formData.append('Name', formValue.name);
    formData.append('GovernorateId', formValue.governorateId);
    formData.append('CityId', formValue.cityId);
    formData.append('Latitude', formValue.latitude);
    formData.append('Longitude', formValue.longitude);
    formData.append('image', this.selectedFile);

    this.submitting = true;

    this.customerService.add(formData).subscribe({
      next: () => {
        this.submitting = false;
        this.customerAdded.emit();
        this.resetAndClose();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Failed to add customer. Please check your input and try again.';
        console.error(err);
      },
    });
  }

  onClose(): void {
    this.resetAndClose();
  }

  private resetAndClose(): void {
    this.form.reset();
    this.cities.set([]);
    this.selectedFile = null;
    this.marker?.remove();
    this.marker = undefined;
    this.closed.emit();
  }
}
