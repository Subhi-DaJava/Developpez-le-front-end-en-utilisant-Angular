import { OlympicCountry } from './../../core/models/Olympic';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartEvent, registerables } from 'chart.js';
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
  loading = true;

  constructor(private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    this.getOlympics();
  }
  
  private getOlympics() {
    this.olympicService.getOlympics().subscribe({
      next: olympics => {
        this.olympics$ = olympics;

        if (this.olympics$ && this.olympics$.length > 0) {

          this.countries = this.olympics$.map(o => o.country);
          this.totalParticipation = this.olympics$.map(o => o.participations.length);
          this.totalMedals = this.olympics$.map(o => this.getTotalMedals(o));
          this.totolCounterNumberOfOlympics = this.countTotalOlympics(this.olympics$);
          setTimeout(() => {this.loading = false;}, 2000);
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
    const chart = new Chart('myChartJs', {
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
        scales: {},
        responsive: true,
        maintainAspectRatio:false,
        onClick: (e: ChartEvent, olympicCountries: any[]) => {
          let clikedElemetIndex;
          if (olympicCountries.length > 0) {
            clikedElemetIndex = olympicCountries[0].index;
          }
          this.router.navigateByUrl(`countries/${clikedElemetIndex + 1}`).then();
        }
      }
    });

    chart.render();
  }
}
