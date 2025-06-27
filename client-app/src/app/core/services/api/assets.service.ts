import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_IMAGE_FILE } from '../..';
import { IAssetRequest } from '../../models/Assets/asset-request-params';

@Injectable({
  providedIn: 'root'
})
export class AssetsService {

  constructor(private _httpClient: HttpClient) { }
  getImage(request: IAssetRequest): Observable<Blob> {
    let params = new HttpParams()
      .set('filePath', request.filePath)
      .set('directoryName', request.directoryName);

    return this._httpClient.get<Blob>(GET_IMAGE_FILE, {
      params: params, // Send as query parameters
      responseType: 'blob' as 'json' // Ensure response is treated as a Blob
    });
  }
}
