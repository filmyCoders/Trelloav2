import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UserService } from '../../../core/services/api/user.service';
import { AssetsService } from '../../../core/services/api/assets.service';
import { IAssetRequest } from '../../../core/models/Assets/asset-request-params';
import { DIRECTORYNAME } from '../../../core/models/enums/asset-file-types';

@Component({
  selector: 'app-imageshow',
  templateUrl: './imageshow.component.html',
  styleUrls: ['./imageshow.component.css']
})
export class ImageshowComponent implements OnInit, OnChanges {
  @Input() imagePath?: string; // Server image path
  @Input() type: DIRECTORYNAME | DIRECTORYNAME.ProfileImage; // Optional input for additional logic
  @Input() name: string | undefined; // Optional input for additional logic
  @Input() file?: File | null; // Selected file

  directoryType?:DIRECTORYNAME
  src: string = ''; // Holds the image source URL
  defaultImage: string = 'assets/defaultProfile.jpg'; // Default fallback image
  loading: boolean = true; // State to show/hide the loader
  imagePreview: string | null = null; // Stores image preview URL

  constructor(private _userServices: UserService,private _asset:AssetsService) {
    debugger
    this.type=DIRECTORYNAME.ProfileImage

  }

  ngOnInit(): void {
    console.log("This",this.imagePath)
    if (this.imagePath) {
      this.fetchServerImage();
    } else {
      this.setDefaultImage();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['file'] && this.file) {
      this.previewSelectedImage();
    } else if (changes['imagePath'] && this.imagePath) {
      this.fetchServerImage();
    }
  }

// Method to preview the selected image
previewSelectedImage(): void {
  if (!this.file) return;
 this.loading=true
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    this.imagePreview = event.target?.result as string;
    this.loading = false;
  };
  reader.readAsDataURL(this.file);
}


  // Method to fetch image from the server as a blob
  fetchServerImage(): void {
    if (!this.imagePath) {
      this.setDefaultImage();
      return;
    }

    this.loading = true;
    const request: IAssetRequest = {
      filePath: this.imagePath,
      directoryName: this.type
    };

    this._asset.getImage(request).subscribe(
      (blob: Blob) => {
        this.imagePreview = URL.createObjectURL(blob);
        this.loading = false;

        // Cleanup old object URLs
        setTimeout(() => URL.revokeObjectURL(this.imagePreview!), 30000);
      },
      () => {
        this.setDefaultImage();
      }
    );
  }

  

   // Set default placeholder image
   setDefaultImage(): void {
    this.imagePreview =
      this.type === DIRECTORYNAME.ProfileImage
        ? 'assets/defaultProfile.jpg'
        : 'https://images.pexels.com/photos/699459/pexels-photo-699459.jpeg?auto=compress&cs=tinysrgb&w=600';
    this.loading = false;
  }
}
