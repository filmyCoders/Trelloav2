import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { AssetsService, DIRECTORYNAME, IAssetRequest } from '../../core';

@Directive({
  selector: '[appBackgroundImage]'
})
export class BackgroundImageDirective implements OnChanges  {

  @Input() imageName!: string ; // Image name or path passed from the parent component
  @Input() directoryType: DIRECTORYNAME=DIRECTORYNAME.WorkspaceImage // Optional: Specify directory or type if needed

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private assetsService: AssetsService
  ) {}

  ngOnChanges(): void {
    if (this.imageName) {
      this.setBackgroundImage();
    }
  }

  // Method to fetch the image and set it as background
  setBackgroundImage(): void {
    const request: IAssetRequest = {
      filePath: this.imageName,
      directoryName: this.directoryType,
    };

    this.assetsService.getImage(request).subscribe(
      (blob: Blob) => {
        const imageUrl = URL.createObjectURL(blob);
        this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${imageUrl})`);
        this.renderer.setStyle(this.el.nativeElement, 'background-size', 'cover');
        this.renderer.setStyle(this.el.nativeElement, 'background-position', 'center');
      },
      (error) => {
        console.error('Error fetching background image', error);
        // Set a fallback image in case of error
        this.renderer.setStyle(this.el.nativeElement, 'background-image', `url('assets/defaultBackground.jpg')`);
      }
    );
  }
}
