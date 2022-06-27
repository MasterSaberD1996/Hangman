import {Component, OnInit} from '@angular/core';
import {DatabaseService} from "../../../core/services/database.service";
import {Observable, tap} from "rxjs";
import {FormControl} from "@angular/forms";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    public vm$: Observable<string[]>;
    public categoryControl: FormControl = new FormControl();

    constructor(
        private readonly databaseService: DatabaseService
    ) {
    }

    public ngOnInit(): void {
        this.vm$ = this.databaseService.categories$.pipe(
            tap(console.log)
        );
    }

    public saveCategories(): void {
        if (!this.categoryControl.value) {
            return;
        }
        const categories = (this.categoryControl.value as string).split(',').map((x) => x.trim());

        categories.forEach((category) => {
            this.databaseService.addCategory(category);
        });
    }
}
