import { Component } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { Observable } from 'rxjs';
import { CategoryService } from '../../services/category-service';
import { Category } from '../../models/category';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../product-card/product-card';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, ProductCard, AsyncPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  products$!:Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  categories$!: Observable<Category[]>;
  pageNumber:number;
  pageSize:number;
  productNameFilter:string|null = null;
  minPriceFilter:number|null = null;
  maxPriceFilter:number|null = null;
  inStockFilter:boolean|null = null
  categoriesFilter:string[] = [];
  sortBy: string = 'latest';
  productCount: number = 0;
  canLoadMore: boolean = true;

  constructor(private _productService: ProductService, private _categoryService: CategoryService, private _router: Router, private route: ActivatedRoute) {
    this.pageNumber = 1;
    this.pageSize = 9;
    const params = this.route.snapshot.queryParams;
    this.productNameFilter = params['name'] || null;
    this.minPriceFilter = params['minPrice'] ? +params['minPrice'] : null;
    this.maxPriceFilter = params['maxPrice'] ? +params['maxPrice'] : null;
    this.inStockFilter = params['inStock'] ? params['inStock'] === 'true' : null;
    this.categoriesFilter = params['categories'] ? params['categories'].split(',') : [];
  }

  ngOnInit(){
    this.products$ = this._productService.getAllProducts(this.productNameFilter, this.minPriceFilter, this.maxPriceFilter, this.inStockFilter, this.categoriesFilter, this.pageNumber, this.pageSize);
    this.filteredProducts$ = this.products$;
    this.categories$ = this._categoryService.getAllCategories();
    this.applyFilters();
  }

  applyFilters(): void {
    this.pageNumber = 1;
    this.filteredProducts$ = this._productService.getAllProducts(
      this.productNameFilter, 
      this.minPriceFilter, 
      this.maxPriceFilter, 
      this.inStockFilter, 
      this.categoriesFilter, 
      this.pageNumber, 
      this.pageSize
    );
    this.updateCanLoadMore();
  }

  clearFilters(): void {
    this.productNameFilter = null;
    this.minPriceFilter = null;
    this.maxPriceFilter = null;
    this.inStockFilter = null;
    this.categoriesFilter = [];
    this.sortBy = 'latest';
    this.pageNumber = 1;
    this.applyFilters();
  }

  toggleCategory(categoryId: string): void {
    const index = this.categoriesFilter.indexOf(categoryId);
    if (index > -1) {
      this.categoriesFilter.splice(index, 1);
    } else {
      this.categoriesFilter.push(categoryId);
    }
    this.applyFilters();
  }

  nextPage(): void {
    this.pageNumber++;
    this.filteredProducts$ = this._productService.getAllProducts(
      this.productNameFilter, 
      this.minPriceFilter, 
      this.maxPriceFilter, 
      this.inStockFilter, 
      this.categoriesFilter, 
      this.pageNumber, 
      this.pageSize
    );
    this.updateCanLoadMore();
  }

  previousPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.filteredProducts$ = this._productService.getAllProducts(
        this.productNameFilter, 
        this.minPriceFilter, 
        this.maxPriceFilter, 
        this.inStockFilter, 
        this.categoriesFilter, 
        this.pageNumber, 
        this.pageSize
      );
      this.updateCanLoadMore();
    }
  }

  updateCanLoadMore(): void {
    this.filteredProducts$.subscribe((products: Product[]) => {
      this.productCount = products.length;
      this.canLoadMore = products.length >= this.pageSize;
    });
  }
}
