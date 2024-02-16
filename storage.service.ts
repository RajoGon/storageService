import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StorageKey } from '../enums/storageKey';
interface BroadCastObject {
  key: string;
  value: any;
}
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dataMap = new Map();
  private eventQueue: Subject<BroadCastObject>;

  constructor() {
    this.eventQueue = new Subject<BroadCastObject>();
  }

  /**
   * Set a key value pair in the service's memory and broadcasts it.
   * @param key  - The key of the object
   * @param value - The value of the object
   */
  set(key: string, value: unknown): void {
    this.dataMap.set(key, value);
    this.broadcast(key);
  }

  /**
   * Get a value of the object by the key from the service's memory. Throws an error if the value doesn't exist.
   * @param key - The key of the object
   * @returns 
   */
  get(key: string): any | null {
    if (this.checkData(key)) {
      return this.dataMap.get(key);
    }
    throw new Error("Value doesn't exist");
  }

  /**
   * Deletes the object from the service's memory
   * @param key - The key of the object
   */
  delete(key: string): void {
    this.dataMap.delete(key);
  }

  /**
   * Broadcasts a value already stored in the service's memory. Throws an error if the value doesn't exist.
   * @param key - The key of the object
   * @param value - The value of the object
   */
  broadcastValue(key: string, value?: any): boolean {
    if (this.checkData(key) || value) {
      this.broadcast(key, value);
      return true;
    }
    throw new Error("Cannot broadcast a non-existent value");
  }

  private broadcast(key: string, value?: any): void {
    value = value || this.get(key);
    this.eventQueue.next({ key, value });
  }

  /**
   * Returns an Observable that listens to the value of a specific key. 
   * @param key - The key of the object
   * @returns 
   */
  listen(key: string): Observable<any> {
    const obs = this.eventQueue.asObservable().pipe(
      filter((data) => data.key === key),
      map(data => data.value)
    );
    return obs;
  }
  /**
   *  Returns an Observable that listens to the value of multiple keys. 
   * @param keys - Array of keys to listen to.
   * @returns 
   */
  listenMany(keys: Array<string>): Observable<any> {
    const obs = this.eventQueue.asObservable().pipe(
      filter((data) => keys.includes(data.key)),
      map((dataSelected) => dataSelected.value)
    );
    return obs;
  }
  /**
   * Check if an object exists in the service's memory with a certain key.
   * @param key - The key of the object
   * @returns 
   */
  checkData(key: string): boolean {
    return this.dataMap.has(key);
  }

  /**
   * Clear the objects in the service's memory for the provided keys.
   * @param keys - Array of keys.
   */
  clearData(keys: StorageKey[]): void {
    keys.forEach(key => {
      this.dataMap.delete(key);
    });
  }
}
