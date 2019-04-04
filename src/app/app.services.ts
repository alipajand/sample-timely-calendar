import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

import {MessageService} from './message.service';

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({providedIn: 'root'})
export class Services {

    /**
     * URL to web api
     */
    private baseUrl = 'api/timely';

    constructor(
        private http: HttpClient,
        private messageService: MessageService) {
    }

    /**
     * GET CalendarEvents from the server
     */
    getCalendarEvents(): Observable<any> {
        return this.http.get<any>(this.baseUrl)
            .pipe(
                tap(_ => this.log('fetched CalendarEvents')),
                catchError(this.handleError<any>('getCalendarEvents', []))
            );
    }

    /**
     * GET event by id. Return `undefined` when id not found
     */
    getEventNo404<Data>(id: number): Observable<any> {
        const url = `${this.baseUrl}/?id=${id}`;
        return this.http.get<any>(url)
            .pipe(
                map(event => event[0]), // returns a {0|1} element array
                tap(h => {
                    const outcome = h ? `fetched` : `did not find`;
                    this.log(`${outcome} event id=${id}`);
                }),
                catchError(this.handleError<any>(`getEvent id=${id}`))
            );
    }

    /**
     * GET event by id. Will 404 if id not found
     */
    getEvent(id: number): Observable<any> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.get<any>(url).pipe(
            tap(_ => this.log(`fetched event id=${id}`)),
            catchError(this.handleError<any>(`getEvent id=${id}`))
        );
    }

    /**
     * GET CalendarEvents whose name contains search term
     */
    searchCalendarEvents(term: string): Observable<any> {
        if (!term.trim()) {
            // if not search term, return empty event array.
            return of([]);
        }
        return this.http.get<any>(`${this.baseUrl}/?name=${term}`).pipe(
            tap(_ => this.log(`found CalendarEvents matching "${term}"`)),
            catchError(this.handleError<any>('searchCalendarEvents', []))
        );
    }

    /**
     * POST: add a new event to the server
     */
    addEvent(event: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, event, httpOptions).pipe(
            tap((newEvent: any) => this.log(`added event w/ id=${newEvent.id}`)),
            catchError(this.handleError<any>('addEvent'))
        );
    }

    /**
     * DELETE: delete the event from the server
     */
    deleteEvent(event: any | number): Observable<any> {
        const id = typeof event === 'number' ? event : event.id;
        const url = `${this.baseUrl}/${id}`;

        return this.http.delete<any>(url, httpOptions).pipe(
            tap(_ => this.log(`deleted event id=${id}`)),
            catchError(this.handleError<any>('deleteEvent'))
        );
    }

    /**
     * PUT: update the event on the server
     */
    updateEvent(event: any): Observable<any> {
        return this.http.put(this.baseUrl, event, httpOptions).pipe(
            tap(_ => this.log(`updated event id=${event.id}`)),
            catchError(this.handleError<any>('updateEvent'))
        );
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    /**
     * Log a eventService message with the MessageService
     */
    private log(message: string) {
        this.messageService.add(`eventService: ${message}`);
    }
}
