import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { CategoryService } from '../../services/category-service';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Category } from '../../models/category';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-manage-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './manage-product.html',
  styleUrl: './manage-product.css',
})
export class ManageProduct implements OnInit {
  products$: Observable<Product[]>;
  categories$: Observable<Category[]>;
  userRole$: Observable<string | null>;

  searchTerm: string = '';
  categoryFilter: string = '';

  showModal: boolean = false;
  isEditMode: boolean = false;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  imageBaseUrl: string = 'https://nti-final-project-backend.onrender.com';
  selectedImageFile: File | null = null;
  productForm: FormGroup;

  successMessage: string = '';
  errorMessage: string = '';
  currentEditingProduct: Product | null = null;


  constructor(
    private _productService: ProductService,
    private _categoryService: CategoryService,
    private _authService: AuthService
  ) {
    this.products$ = this._productService.products$;
    this.categories$ = this._categoryService.getAllCategories();
    this.userRole$ = this._authService.userRole$;
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      price: new FormControl(0, [Validators.required, Validators.min(0)]),
      quantity: new FormControl(0, Validators.required),
      category: new FormControl('', Validators.required),
      imageUrl: new FormControl('')
    });
  }

  ngOnInit() {
    this.loadProducts();
  }


  loadProducts() {
    this._productService.loadProducts(null, null, null, null, [], 1, 100).subscribe();
  }

  applyFilters(searchTerm: string, categoryFilter: string): void {
    const categories = categoryFilter ? [categoryFilter] : [];
    this._productService.loadProducts(searchTerm || null, null, null, null, categories, 1, 100).subscribe();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedImageFile = file;

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }



  openAddModal() {
    this.isEditMode = false;
    this.currentEditingProduct = null;
    this.productForm.reset();
    this.imagePreviewUrl = null;
    this.showModal = true;
    this.clearMessages();
  }


  openEditModal(product: Product) {
    this.isEditMode = true;
    this.currentEditingProduct = product;

    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: (product as any).category?._id || product.category,
    });

    this.imagePreviewUrl =
  this.imageBaseUrl + (product.productImages?.[0]?.imageUrl ?? '');

    this.showModal = true;
    this.clearMessages();
  }


  closeModal() {
    this.showModal = false;
    this.productForm.reset();
    this.currentEditingProduct = null;
  }

  // private buildFormData(): Promise<FormData> {
  //   return new Promise((resolve) => {
  //     const formData = new FormData();

  //     formData.append('name', this.productForm.value.name);
  //     formData.append('description', this.productForm.value.description);
  //     formData.append('price', this.productForm.value.price.toString());
  //     formData.append('quantity', this.productForm.value.quantity.toString());
  //     formData.append('category', this.productForm.value.category);

  //     if (this.selectedImageFile) {
  //       // Convert file to base64
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         const base64String = reader.result as string;
  //         formData.append('productImage', base64String);
  //         resolve(formData);
  //       };
  //       reader.readAsDataURL(this.selectedImageFile);
  //     } else {
  //       resolve(formData);
  //     }
  //   });
  // }


  saveProduct() {
    if (this.productForm.invalid) return;

    const payload = {
      ...this.productForm.value,
      productImages: this.imagePreviewUrl
        ? [{ imageUrl: this.imagePreviewUrl, isMain: true }]
        : []
    };

    if (this.isEditMode && this.currentEditingProduct) {
      this._productService.updateProduct(this.currentEditingProduct.id!, payload).subscribe({
        next: () => {
          this.successMessage = 'Product updated successfully!';
          this.closeModal();
        },
        error: () => this.errorMessage = 'Failed to update product'
      });
      return;
    } else {
      this._productService.addProduct(payload).subscribe({
        next: () => {
          this.successMessage = 'Product added successfully!';
          this.closeModal();
        },
        error: () => this.errorMessage = 'Failed to add product'
      });
    }
  }



  deleteProduct(productId: string | undefined) {
    if (!productId || !confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this._productService.deleteProduct(productId).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully!';
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete product. Please try again.';
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
