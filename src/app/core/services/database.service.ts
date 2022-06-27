import {Injectable} from '@angular/core';
import {getDatabase, push, onValue, Database, ref, onChildAdded} from "firebase/database";
import {app} from "../../app.module";
import {BehaviorSubject, catchError, combineLatest, filter, from, map, Observable, of, switchMap, take} from "rxjs";
import {IWord} from "../models/word.model";

@Injectable({
    providedIn: 'root'
})
export class DatabaseService {
    private readonly dbRef: Database;
    private categories$$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    private words$$: BehaviorSubject<IWord[]> = new BehaviorSubject<IWord[]>([]);
    public categories$: Observable<string[]> = this.categories$$.asObservable();
    public words$: Observable<IWord[]> = this.words$$.asObservable();
    private selectedCategory$$: BehaviorSubject<string> = new BehaviorSubject<string>("");
    public selectedCategory$: Observable<string> = this.selectedCategory$$.asObservable();
    public wordsInCategory: Observable<string[]> = this.selectedCategory$.pipe(
        filter((category) => !!category),
        switchMap((category) => {
            return combineLatest([
                of(category),
                this.words$
            ])
        }),
        map(([category, words]) => {
            return words.filter(x => x.categories.includes(category)).map((x) => x.wordOrPhrase);
        })
    );

    constructor() {
        this.dbRef = getDatabase(app);

        onChildAdded(ref(this.dbRef, "categories"), (data) => {
            const current = this.categories$$.value;
            const newValue = [...current, data.val()]
            this.categories$$.next(newValue);
            console.log(newValue);
        })

        onValue(ref(this.dbRef, "words"), (data) => {
            this.words$$.next(data.val());
        });
    }

    public addCategory(category: string): void {
        from(push(ref(this.dbRef, "categories"), category))
            .pipe(
                catchError((error) => {
                    console.log(error);
                    return of(null);
                }),
                take(1)
            ).subscribe();
    }

    public addWord(word: IWord): void {
        from(push(ref(this.dbRef, "words"), word))
            .pipe(
                catchError((error) => {
                    console.log(error);
                    return of(null);
                }),
                take(1)
            ).subscribe();
    }
}
