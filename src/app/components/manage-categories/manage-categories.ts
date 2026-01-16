import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category-service';
import { AuthService } from '../../services/auth-service';
import { Observable, map } from 'rxjs';
import { Category } from '../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-manage-categories',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './manage-categories.html',
  styleUrl: './manage-categories.css',
})
export class ManageCategories {
  categories$: Observable<Category[]>;
  userRole$: Observable<string | null>;

  searchTerm: string = '';

  showModal: boolean = false;
  isEditMode: boolean = false;
  categoryForm: FormGroup;

  successMessage: string = '';
  errorMessage: string = '';
  currentEditingCategory: Category | null = null;

  constructor(
    private _categoryService: CategoryService,
    private _authService: AuthService,
  ) {
    this.categories$ = this._categoryService.categories$;
    this.userRole$ = this._authService.userRole$;
    this.categoryForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      parentCategory: new FormControl('')
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this._categoryService.loadCategories().subscribe();
  }

  applyFilters(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.categories$ = this._categoryService.categories$;
      return;
    }

    this.categories$ = this._categoryService.categories$.pipe(
      map(categories =>
        categories.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentEditingCategory = null;
    this.categoryForm.reset();
    this.showModal = true;
    this.clearMessages();
  }

  openEditModal(category: Category) {
    this.isEditMode = true;
    this.currentEditingCategory = category;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      parentCategory: category.parentCategory?._id || '',
    });

    this.showModal = true;
    this.clearMessages();
  }

  closeModal() {
    this.showModal = false;
    this.categoryForm.reset();
    this.currentEditingCategory = null;
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    const categoryData = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description,
      parentCategory: this.categoryForm.value.parentCategory || null
    };

    if (this.isEditMode && this.currentEditingCategory) {
      this._categoryService
        .updateCategory(this.currentEditingCategory._id!, categoryData)
        .subscribe({
          next: () => {
            this.successMessage = 'Category updated successfully!';
            setTimeout(() => {
              this.closeModal();
            }, 1500);
          },
          error: () => {
            this.errorMessage = 'Failed to update category.';
          }
        });
    } else {
      this._categoryService.addCategory(categoryData).subscribe({
        next: () => {
          this.successMessage = 'Category added successfully!';
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        },
        error: () => {
          this.errorMessage = 'Failed to add category.';
        }
      });
    }
  }

  deleteCategory(categoryId: string) {
    if (!categoryId || !confirm('Are you sure you want to delete this category?')) {
      return;
    }

    this._categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.successMessage = 'Category deleted successfully!';
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete category. Please try again.';
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
