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
  

  /**
   * Retrieves and processes Olympic Countries data from the Olympic Service
   * Populates various properties, including country names, participation counts, total medals
   * And calls the `renderChartJs()` method
   */
  private getOlympics() {
    this.olympicService.getOlympics().subscribe({
      next: olympics => {
        this.olympics$ = olympics;

        if (this.olympics$ && this.olympics$.length > 0) {
          this.countries = this.olympics$.map(o => o.country);
          this.totalParticipation = this.olympics$.map(o => o.participations.length);
          this.totalMedals = this.olympics$.map(o => this.getTotalMedals(o));
          this.totolCounterNumberOfOlympics = this.countTotalOlympics(this.olympics$);
          setTimeout(() => {this.loading = false;}, 500); // Simulate the loading state of the application for testing purposes
          this.renderChartJs();
        }
      }, error: err => {
        this.errorMessage = err.error;
        console.log('An error occurred while loading data.');
      }

    });
  }

  /**
   * Calculates the total number of medals won by an Olympic country
   * @param country The Olympic country
   * @returns Total number of medals won by the country
   */
  private getTotalMedals(country: OlympicCountry): number {
    return country.participations.map(participation => participation.medalsCount).reduce((medals, total) => { return medals + total; }, 0);
  }

  /**
   * Counts the total number of participations
   * @param countries An array (a list) of Olympic countries with the total count of participation
   * @returns 
   */
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
  /**
   * Renders a pie chart using Chart.js with data from Olympic countries
   * The chart displays the total medals for each country, and clicking on a segment navigates to the detailed view of the selected country
   */

  renderChartJs() {
    const chart = new Chart('myChartJs', {
      // un objet de configuration du graphique
      type: 'pie',
      data: { //  l'objet de données 
        labels: this.countries,
        datasets: [{
          label: '🥇 Total Medals',
          data: this.totalMedals,

          borderWidth: 1
        }]
      },
      options: { // personnaliser le comportement et l'apparence du graphique
        responsive: true, // permet au graphique de s'adapter à la taille de la fenêtre du navigateur
        maintainAspectRatio:false,
        onClick: (e: ChartEvent, olympicCountries: any[]) => { // un gestionnaire d'événements qui se déclenche lorsqu'un clic se produit sur le graphique
          let clikedElemetIndex;
          if (olympicCountries.length > 0) {
            clikedElemetIndex = olympicCountries[0].index;
          }
          this.router.navigateByUrl(`countries/${clikedElemetIndex + 1}`).then();
        }
      }
    });

    chart.render(); //  appelle la méthode render() de l'objet chart, ce qui déclenche le rendu du graphique dans l'élément Canvas spécifié
  }
}
