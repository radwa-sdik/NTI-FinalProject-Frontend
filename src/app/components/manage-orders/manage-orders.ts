import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order-service';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-orders',
  imports: [CommonModule, FormsModule, AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css',
})
export class ManageOrders implements OnInit {
  OrdersList$: Observable<Order[]>;
  filteredOrders$: Observable<Order[]>;
  userRole$: Observable<string | null>;

  searchTerm: string = '';
  statusFilter: string = '';
  startDate: string = '';
  endDate: string = '';

  selectedOrder: Order | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  private ordersSubject = new BehaviorSubject<Order[]>([]);

  constructor(private orderService: OrderService, private authService: AuthService) {
    this.OrdersList$ = this.orderService.getAllOrders();
    this.userRole$ = this.authService.userRole$;
    this.filteredOrders$ = this.OrdersList$;
  }

  ngOnInit() {
    this.OrdersList$.subscribe(orders => {
      this.ordersSubject.next(orders);
    });
  }

  applyFilters() {
    this.filteredOrders$ = this.OrdersList$.pipe(
      map(orders => {
        return orders
          .filter(order => {
            const matchesSearch = this.matchesSearch(order);
            const matchesStatus = !this.statusFilter || order.status === this.statusFilter;
            const matchesDateRange = this.matchesDateRange(order);

            return matchesSearch && matchesStatus && matchesDateRange;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      })
    );
  }

  private matchesSearch(order: Order): boolean {
    if (!this.searchTerm) return true;

    const searchLower = this.searchTerm.toLowerCase();
    const orderId = order._id?.slice(-8)?.toLowerCase() || '';

    return orderId.includes(searchLower) || order.userId.toLowerCase().includes(searchLower);
  }

  private matchesDateRange(order: Order): boolean {
    if (!this.startDate && !this.endDate) return true;

    const orderDate = new Date(order.createdAt);
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;

    if (start && orderDate < start) return false;
    if (end) {
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      if (orderDate > endOfDay) return false;
    }

    return true;
  }

  updateOrderStatus(orderId: string, newStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.successMessage = `Order status updated to ${newStatus}`;
        this.clearMessageAfterDelay();
        this.OrdersList$ = this.orderService.getAllOrders();
        this.applyFilters();
      },
      error: () => {
        this.errorMessage = 'Failed to update order status';
        this.clearMessageAfterDelay();
      }
    });
  }

  // deleteOrder(orderId: string) {
  //   if (!confirm('Are you sure you want to delete this order?')) return;

  //   this.orderService.deleteOrder(orderId).subscribe({
  //     next: () => {
  //       this.successMessage = 'Order deleted successfully';
  //       this.clearMessageAfterDelay();
  //       this.OrdersList$ = this.orderService.getAllOrders();
  //       this.applyFilters();
  //     },
  //     error: () => {
  //       this.errorMessage = 'Failed to delete order';
  //       this.clearMessageAfterDelay();
  //     }
  //   });
  // }

  openOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  getPendingCount(orders: Order[]): number {
    return orders.filter(o => o.status === 'Pending').length;
  }

  getProcessingCount(orders: Order[]): number {
    return orders.filter(o => o.status === 'Processing').length;
  }

  getShippedCount(orders: Order[]): number {
    return orders.filter(o => o.status === 'Shipped').length;
  }

  getDeliveredCount(orders: Order[]): number {
    return orders.filter(o => o.status === 'Delivered').length;
  }

  private clearMessageAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 2000);
  }
}
