import { Component, OnInit } from '@angular/core';
import { Address } from '../../models/address';
import { AddressService } from '../../services/address-service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-addresses',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class Addresses implements OnInit {
  addressList$: Observable<Address[]>;
  userId!: string;

  showModal: boolean = false;
  isEditMode: boolean = false;
  addressForm: FormGroup;

  successMessage: string = '';
  errorMessage: string = '';
  currentEditingAddress: Address | null = null;

  constructor(
    private _addressService: AddressService,
    private _authService: AuthService,
    private fb: FormBuilder
  ) {
    this.addressList$ = this._addressService.addresses$;
    this._authService.currentUserId$.subscribe(id => {
      this.userId = id!;
    });
    this.addressForm = new FormGroup({
      street: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      zipCode: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      isDefault: new FormControl(false)
    });
  }

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this._addressService.loadAddresses().subscribe();
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentEditingAddress = null;
    this.addressForm.reset({ isDefault: false });
    this.showModal = true;
    this.clearMessages();
  }

  openEditModal(address: Address) {
    this.isEditMode = true;
    this.currentEditingAddress = address;

    this.addressForm.patchValue({
      street: address.street,
      city: address.city,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });

    this.showModal = true;
    this.clearMessages();
  }

  closeModal() {
    this.showModal = false;
    this.addressForm.reset({ isDefault: false });
    this.currentEditingAddress = null;
  }

  saveAddress() {
    if (this.addressForm.invalid) return;

    const addressData: Address = {
      userId: this.userId,
      street: this.addressForm.value.street,
      city: this.addressForm.value.city,
      zipCode: this.addressForm.value.zipCode,
      country: this.addressForm.value.country,
      isDefault: this.addressForm.value.isDefault
    };

    if (this.isEditMode && this.currentEditingAddress) {
      this._addressService
        .updateAddress(this.currentEditingAddress._id!, addressData)
        .subscribe({
          next: () => {
            this.successMessage = 'Address updated successfully!';
            setTimeout(() => {
              this.closeModal();
            }, 1500);
          },
          error: () => {
            this.errorMessage = 'Failed to update address.';
          }
        });
    } else {
      this._addressService.addAddress(addressData).subscribe({
        next: () => {
          this.successMessage = 'Address added successfully!';
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        },
        error: () => {
          this.errorMessage = 'Failed to add address.';
        }
      });
    }
  }

  setDefaultAddress(addressId: string) {
    this._addressService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.successMessage = 'Default address updated!';
        setTimeout(() => this.clearMessages(), 2000);
      },
      error: () => {
        this.errorMessage = 'Failed to set default address.';
        setTimeout(() => this.clearMessages(), 2000);
      }
    });
  }

  deleteAddress(addressId: string) {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this._addressService.deleteAddress(addressId).subscribe({
      next: () => {
        this.successMessage = 'Address deleted successfully!';
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete address. Please try again.';
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
