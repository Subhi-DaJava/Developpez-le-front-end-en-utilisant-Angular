import { OlympicCountry } from './../../core/models/Olympic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  errorMessage!: string;
  olympics$!: OlympicCountry[];

  countries: string[] = [];
  totalMedals: number[] = [];
  totalParticipation: number[] = [];
  totolCounterNumberOfOlympics!: number;

  constructor(private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    this.olympicService.getOlympics().subscribe({
      next: olympics => {
        this.olympics$ = olympics;

        if (this.olympics$ && this.olympics$.length > 0) {

          this.countries = this.olympics$.map(o => o.country);
          this.totalParticipation = this.olympics$.map(o => o.participations.length);
          this.totalMedals = this.olympics$.map(o => this.getTotalMedals(o));
          this.totolCounterNumberOfOlympics = this.countTotalOlympics(this.olympics$);
          this.renderCharJs();
        }
      }, error: err => {
        this.errorMessage = err.error;
        console.log('An error occurred while loading data.');
      }

    });
  }

  private getTotalMedals(country: OlympicCountry): number {
    return country.participations.map(participation => participation.medalsCount).reduce((medals, total) => { return medals + total; }, 0);
  }

  private countTotalOlympics(countries: OlympicCountry[]): number {
    const uniqueYears = new Set<number>(
      countries
        .map(country =>
          country.participations.map(participation => participation.year)
        )
        .flat()
    );

    return uniqueYears.size;
  }

  renderCharJs() {
    new Chart('myChartJs', {
      type: 'pie',
      data: {
        labels: this.countries,
        datasets: [{
          label: '🥇 Total Medals',
          data: this.totalMedals,

          borderWidth: 1
        }]
      },
      options: {
        scales: {
        },
        onClick: (e) => {
          console.log(e);
          this.router.navigateByUrl(`coutries/1`).then();
        }
      }
    });
  }
}
