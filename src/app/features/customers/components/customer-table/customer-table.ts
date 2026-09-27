import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomerListItem } from '../../../../shared/models/Customer';

@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [],
  templateUrl: './customer-table.html',
  styleUrl: './customer-table.css',
})
export class CustomerTable {
  @Input() customers: CustomerListItem[] = [];

  @Output() viewDetails = new EventEmitter<number>();
  @Output() viewLocation = new EventEmitter<CustomerListItem>();
  @Output() getDirections = new EventEmitter<CustomerListItem>();

  onViewDetails(id: number): void {
    this.viewDetails.emit(id);
  }

  onViewLocation(customer: CustomerListItem): void {
    this.viewLocation.emit(customer);
  }

  onGetDirections(customer: CustomerListItem): void {
    this.getDirections.emit(customer);
  }
}
