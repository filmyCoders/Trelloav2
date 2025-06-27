import { Pipe, PipeTransform } from '@angular/core';
import { Events } from '../../core/models/events.model';

@Pipe({
  name: 'filterEventsByDate',
})
export class FilterEventsByDatePipe implements PipeTransform {
  transform(events: Events[], month: Date, day: number): Events[] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    return events.filter((event) => {
      const eventDate = new Date(event.eventDateTime || '');
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === monthIndex &&
        eventDate.getDate() === day
      );
    });
  }
}
