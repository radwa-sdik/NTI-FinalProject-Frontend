import { Component } from '@angular/core';
import { ProductCard } from '../product-card/product-card';
import { Observable } from 'rxjs';
import { ProductService } from '../../services/product-service';
import { Product } from '../../models/product';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductCard, AsyncPipe, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  featuredProducts$: Observable<Product[]>;

  constructor(private _productService: ProductService) {
    this.featuredProducts$ = this._productService.getAllProducts(null, null, null, null, [], 1, 4);
  }
}
