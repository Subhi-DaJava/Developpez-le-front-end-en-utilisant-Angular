import { OlympicCountry } from './../../core/models/Olympic';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  errorMessage!: string; 
  public olympics$: Observable<OlympicCountry[]> = of([]);

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    if(!this.olympics$) {
     this.errorMessage = 'Une erreur s\'est produite lors du chargement des données.';
     console.log(this.errorMessage)
    }
  }
}
