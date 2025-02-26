import { Injectable } from '@angular/core';

declare global {
  interface Window {
    sendEventToGa: (eventName: string, eventLabel: string) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsEventService {

  constructor() { }

  sendEventToGa(eventName: string, eventLabel: string): void {
    window.sendEventToGa(eventName, eventLabel);
  }

}
