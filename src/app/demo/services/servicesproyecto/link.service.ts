import { Injectable } from '@angular/core';
import { Link } from '../../models/modelsgantt/link';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  get(): Promise<Link[]> {
    return Promise.resolve([
        // { id: 1, source: 1, target: 3, type: '0' },
    ]);
  }

  constructor() { }
}
