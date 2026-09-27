import { Component, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../core/services/customer-service';
import { CustomerListItem } from '../../shared/models/Customer';
import { CustomerTable } from './components/customer-table/customer-table';
import { Pagination } from '../../shared/components/pagination/pagination';
import { CustomerCardList } from './components/customer-card-list/customer-card-list';
import { AddCustomerModal } from './components/add-customer-modal/add-customer-modal';
import { CustomerDetailModal } from './components/customer-detail-modal/customer-detail-modal';
import { ViewAllMapModal } from './components/view-all-map-modal/view-all-map-modal';
import { NearestCustomersModal } from './components/nearest-customers-modal/nearest-customers-modal';
import { ViewLocationModal } from './components/view-location-modal/view-location-modal';

type ViewMode = 'table' | 'card';

@Component({
  selector: 'app-customers',
  imports: [
    CustomerTable,
    Pagination,
    CustomerCardList,
    AddCustomerModal,
    CustomerDetailModal,
    ViewAllMapModal,
    NearestCustomersModal,
    ViewLocationModal
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  customers = signal<CustomerListItem[]>([]);
  viewMode = signal<ViewMode>('table');
  currentPage = signal<number>(1);
  totalCount = signal<number>(0);
  pageSize = 10;
  isAddModalOpen = signal(false);
  selectedCustomerId = signal<number | null>(null);
  isDetailModalOpen = signal(false);
  isViewAllModalOpen = signal(false);
  isNearestModalOpen = signal(false);
  selectedLocationCustomer = signal<CustomerListItem | null>(null);
  isLocationModalOpen = signal(false);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAll(this.currentPage(), this.pageSize).subscribe({
      next: (result) => {
        this.customers.set(result.items);
        this.totalCount.set(result.totalCount);
      },
      error: (err) => console.error('Failed to load customers', err),
    });
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  onGetDirections(customer: CustomerListItem): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${customer.latitude},${customer.longitude}`;
    window.open(url, '_blank');
  }

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  onModalClosed(): void {
    this.isAddModalOpen.set(false);
  }

  onCustomerAdded(): void {
    this.loadCustomers(); // refresh the list
  }

  onViewDetails(id: number): void {
    this.selectedCustomerId.set(id);
    this.isDetailModalOpen.set(true);
  }

  onDetailModalClosed(): void {
    this.isDetailModalOpen.set(false);
    this.selectedCustomerId.set(null);
  }

  onImagesChanged(): void {
    this.loadCustomers(); // MainImagePath may have changed — refresh the table/card list
  }

  openViewAllModal(): void {
    this.isViewAllModalOpen.set(true);
  }

  onViewAllModalClosed(): void {
    this.isViewAllModalOpen.set(false);
  }

  openNearestModal(): void {
    this.isNearestModalOpen.set(true);
  }

  onNearestModalClosed(): void {
    this.isNearestModalOpen.set(false);
  }

  onViewLocation(customer: CustomerListItem): void {
    this.selectedLocationCustomer.set(customer);
    this.isLocationModalOpen.set(true);
  }

  onLocationModalClosed(): void {
    this.isLocationModalOpen.set(false);
    this.selectedLocationCustomer.set(null);
  }
}
