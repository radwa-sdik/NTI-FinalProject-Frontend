import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../../models/order';
import { OrderService } from '../../services/order-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders-list',
  imports: [CommonModule, RouterLink, AsyncPipe, CurrencyPipe, DatePipe],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.css',
})
export class OrdersList {
  currentUserOrders$: Observable<Order[]>;
  selectedOrder: Order | null = null;
  expandedOrderId: string | null = null;

  constructor(private orderService: OrderService) {
    this.currentUserOrders$ = this.orderService.getCurrentUserOrders();
  }

  openOrderModal(orderId: string) {
    this.currentUserOrders$.subscribe(orders => {
      this.selectedOrder = orders.find(order => order._id === orderId) || null;
    });
  }

  closeOrderModal() {
    this.selectedOrder = null;
  }

  toggleOrderDetails(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Pending': 'bi bi-hourglass-split',
      'Processing': 'bi bi-gear',
      'Shipped': 'bi bi-truck',
      'Delivered': 'bi bi-check-circle',
      'Cancelled': 'bi bi-x-circle'
    };
    return iconMap[status] || 'bi bi-info-circle';
  }

  isStatusActive(orderStatus: string, checkStatus: string): boolean {
    const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const orderIndex = statusOrder.indexOf(orderStatus);
    const checkIndex = statusOrder.indexOf(checkStatus);
    return checkIndex <= orderIndex;
  }

  // cancelOrder(orderId: string) {
  //   if (!confirm('Are you sure you want to cancel this order?')) {
  //     return;
  //   }
    
  //   this.orderService.cancelOrder(orderId).subscribe({
  //     next: () => {
  //       alert('Order cancelled successfully');
  //       // Refresh orders list
  //       this.currentUserOrders$ = this.orderService.getCurrentUserOrders();
  //     },
  //     error: () => {
  //       alert('Failed to cancel order');
  //     }
  //   });
  // }
}
