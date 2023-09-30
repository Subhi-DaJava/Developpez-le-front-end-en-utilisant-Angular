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

  constructor(private route: ActivatedRoute, private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    const countryId = +this.route.snapshot.params['id']; // cast the type the segment of route (id: string) to number
    this.getCountryById(countryId);
  }

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

            this.renderCharJs();
          }

        }
      }, error: err => {
        this.errorMessage = err.console.error.message;
        console.log('An error occurred while loading data.', err.error.message);
      }

    });
  }

  private calculateTotalMedals(participations: Participation[]): number {
    return participations.map(participation => participation.medalsCount).reduce((currentMedals, total) => { return currentMedals + total; }, 0);
  }
  private calculateTotalAthletes(participations: Participation[]): number {
    return participations.map(participation => participation.athleteCount).reduce((athletsPerOlympics, total) => {
      return athletsPerOlympics + total;
    }, 0);
  }

  renderCharJs() {
    const char = new Chart('myChartJsLine', {
      type: 'line',
      data: {
        labels: this.yearsOfOlympics,
        datasets: [{
          label: this.countryName,
          fill: false,
          backgroundColor: "rgba(0,0,255,1.0)",
          borderColor: "rgba(0,0,255,0.1)",
          data: this.totalMedalsPerOlympic,
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio:false
      }
    });

    char.render();
  }

}
