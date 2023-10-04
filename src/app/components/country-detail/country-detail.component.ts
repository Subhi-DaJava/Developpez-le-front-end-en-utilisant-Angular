import { OlympicService } from 'src/app/core/services/olympic.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { Chart, registerables } from 'chart.js';
import { Participation } from 'src/app/core/models/Participation';
Chart.register(...registerables);

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit {

  olympicCountry!: OlympicCountry;
  countryName!: string;
  numberOfEntries!: number;
  totalNumberOfMedals!: number;
  totalNumberOfAthletes!: number;
  yearsOfOlympics!: number[];
  totalMedalsPerOlympic!: number[];
  errorMessage!: string;
  loading = true;

  constructor(private route: ActivatedRoute, private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    // Retrieves the country identifier from the current route's snapshot parameters
    const countryId = +this.route.snapshot.params['id']; // cast the type the segment of route (id: string) to number
    this.getCountryById(countryId);
  }


  /**
  * Retrieves information about an Olympic country by its identifier and simulate the state of the application with `loading` attribute
  * And calls the `renderChartJs()` method
  * @param countryId identifier of the Olympic country to retrieve
  * @Error Error if the Olympic country is not found
  */
  private getCountryById(countryId: number) {
    this.olympicService.getOlympics().subscribe({
      next: olympics => {
        if (olympics !== undefined && olympics.length > 0) {
          const countryById = olympics.find(o => o.id === countryId);
          if (!countryById) {
            throw new Error('Country Olympic not found!');
          } else {
            this.olympicCountry = countryById;
            this.countryName = this.olympicCountry.country;
            this.numberOfEntries = this.olympicCountry.participations.length;
            this.totalNumberOfMedals = this.calculateTotalMedals(this.olympicCountry.participations);
            this.totalNumberOfAthletes = this.calculateTotalAthletes(this.olympicCountry.participations);
            this.yearsOfOlympics = this.olympicCountry.participations.flatMap(participation => participation.year);
            this.totalMedalsPerOlympic = this.olympicCountry.participations.flatMap(participation => participation.medalsCount);
            setTimeout(() => { this.loading = false; }, 500);
            this.renderChartJs();
          }

        }
      }, error: err => {
        this.errorMessage = err.console.error.message;
        console.log('An error occurred while loading data.', err.error.message);
      }

    });
  }

  /**
   * Calculates the total number of medals from a list of Olympic participations
   * @param participations An array (a list) of Olympic participations
   * @returns Total number of medals
   */
  private calculateTotalMedals(participations: Participation[]): number {
    return participations.map(participation => participation.medalsCount).reduce((currentMedals, total) => { return currentMedals + total; }, 0);
  }

  /**
   * Calculates the total number of athletes from a list of Olympic participations
   * @param participations An array(a list) of Olympic participations
   * @returns Total number of athletes
   */
  private calculateTotalAthletes(participations: Participation[]): number {
    return participations.map(participation => participation.athleteCount).reduce((athletsPerOlympics, total) => {
      return athletsPerOlympics + total;
    }, 0);
  }

  /**
   * Renders a line chart using Chart.js librarie to display the total medals won by year for a specific Olympic country
   */
  renderChartJs() {
    const char = new Chart('myChartJsLine', {
      type: 'line',
      data: {
        labels: this.yearsOfOlympics,
        datasets: [{
          label: this.countryName,
          fill: false,
          backgroundColor: "rgba(0,0,255, 1.0)",
          borderColor: "rgba(0,0,255,0.3)",
          data: this.totalMedalsPerOlympic,
          borderWidth: 2
        }]
      },
      options: {
        maintainAspectRatio: false
      }
    });

    char.render();
  }

}
