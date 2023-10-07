import { OlympicCountry } from './../../core/models/Olympic';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActiveElement, Chart, ChartEvent, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
Chart.register(...registerables);
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {

  errorMessage!: string;
  olympics$!: OlympicCountry[];
  countries: string[] = [];
  totalMedals: number[] = [];
  totolCounterNumberOfOlympics!: number;
  loading = true;
  private olympicsSubscription: Subscription | undefined; // Declare a variable to maintain the subscription

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
    this.olympicsSubscription = this.olympicService.getOlympics().subscribe({
      next: olympics => {
        this.olympics$ = olympics;

        if (this.olympics$ && this.olympics$.length > 0) {
          this.countries = this.olympics$.map(o => o.country);
          this.totalMedals = this.olympics$.map(o => this.getTotalMedals(o));
          this.totolCounterNumberOfOlympics = this.countTotalOlympics(this.olympics$);
          setTimeout(() => { this.loading = false; }, 500); // Simulate the loading state of the application for testing purposes
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

  private renderChartJs(): void {
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
      options: { // customize the behavior and appearance of the chart
        responsive: true, // allows the chart to fit the size of the browser window
        maintainAspectRatio: false,
        onClick: (e: ChartEvent, elements: ActiveElement[]) => { // an event handler that fires when a click occurs on the chart
          let clikedElemetIndex: number | undefined;
          if (elements.length > 0) {
            // Votre logique pour extraire l'index de l'élément cliqué ici
            clikedElemetIndex = elements[0].index;
          }
          if (clikedElemetIndex) {
            this.router.navigateByUrl(`countries/${clikedElemetIndex + 1}`).then();
          }

        }
      }
    });

    chart.render(); // calls the chart object's render() method, which triggers rendering of the chart in the specified Canvas element
  }

  ngOnDestroy(): void {
    if (this.olympicsSubscription) {
      this.olympicsSubscription.unsubscribe(); // Unsubscribe when the component is destroyed
    }
  }

}
