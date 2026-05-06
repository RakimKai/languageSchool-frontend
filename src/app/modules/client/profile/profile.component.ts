import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { UsersApiService } from '../../../api-services/users/users-api.service';
import { CitiesApiService } from '../../../api-services/cities/cities-api.service';
import { UserDto, UpdateUserDto } from '../../../api-services/users/users-api.model';
import { CityDto } from '../../../api-services/cities/cities-api.model';
import { BaseComponent } from '../../../core/components/base-classes/base-component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthFacadeService);
  private usersApi = inject(UsersApiService);
  private citiesApi = inject(CitiesApiService);
  private snackBar = inject(MatSnackBar);

  user: UserDto | null = null;
  cities: CityDto[] = [];
  profileForm!: FormGroup;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;
  uploadProgress = 0;

  isSaving = false;

  ngOnInit(): void {
    this.initForm();
    this.loadCities();
    this.loadUser();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      username: ['', [Validators.maxLength(30)]],
      phoneNumber: ['', [Validators.pattern(/^[0-9+\-\s()]*$/), Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(200)]],
      cityId: [null]
    });
  }

  private loadCities(): void {
    this.citiesApi.getAll().subscribe({
      next: (data) => this.cities = data,
      error: (err) => console.error('Error loading cities', err)
    });
  }

  private loadUser(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser?.userId) return;

    this.startLoading();
    this.usersApi.getById(currentUser.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.populateForm(user);
        this.imagePreview = this.usersApi.getProfileImageUrl(user.profileImagePath);
        this.stopLoading();
      },
      error: (err) => {
        this.stopLoading('Error loading profile');
        console.error('Error loading user', err);
      }
    });
  }

  private populateForm(user: UserDto): void {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || '',
      cityId: user.cityId
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.user) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 100);

    this.usersApi.uploadProfileImage(this.user.id, this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.selectedFile = null;
        this.imagePreview = `${environment.apiUrl}${response.imageUrl}`;
        this.snackBar.open('Profile image updated successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        this.snackBar.open('Failed to upload image. Please try again.', 'Close', { duration: 5000 });
        console.error('Error uploading image', err);
      }
    });
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreview = this.user?.profileImagePath
      ? this.usersApi.getProfileImageUrl(this.user.profileImagePath)
      : null;
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.user) return;

    this.isSaving = true;
    const formValue = this.profileForm.value;

    const payload: UpdateUserDto = {
      id: this.user.id,
      firstName: formValue.firstName || null,
      lastName: formValue.lastName || null,
      username: formValue.username || null,
      phoneNumber: formValue.phoneNumber || null,
      address: formValue.address || null,
      cityId: formValue.cityId || null
    };

    this.usersApi.update(this.user.id, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
        this.loadUser();
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 5000 });
        console.error('Error updating profile', err);
      }
    });
  }

  get fullName(): string {
    if (!this.user) return '';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return `${firstName} ${lastName}`.trim() || this.user.email;
  }
}
