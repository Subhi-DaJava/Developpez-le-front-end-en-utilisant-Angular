import { OlympicService } from 'src/app/core/services/olympic.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { Chart, registerables } from 'chart.js';
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
    const countyId = +this.route.snapshot.params['id']; // cast the type the segment of route (id: string) to number

    this.olympicService.getOlympics().subscribe({
      next: olympics => {
        const countryById = olympics.find(o => o.id === countyId);
        if (!countryById) {
          throw new Error('Country Olympic not found!');
        } else {
          this.olympicCountry = countryById;
          this.countryName = this.olympicCountry.country;
          this.numberOfEntries = this.olympicCountry.participations.length;
          this.totalNumberOfMedals = this.olympicCountry
            .participations.map(participation => participation.medalsCount).reduce((currentMedals, total) => { return currentMedals + total; }, 0);
          this.totalNumberOfAthletes = this.olympicCountry
            .participations.map(participation => participation.athleteCount).reduce((athletsPerOlympics, total) => {
              return athletsPerOlympics + total;
            }, 0);
          this.yearsOfOlympics = this.olympicCountry
            .participations.map(participation => participation.year).flat();
          this.totalMedalsPerOlympic = this.olympicCountry
            .participations.map(participation => participation.medalsCount).flat();
            this.renderCharJs();
        }
      }, error: err => {
        console.log('An error occurred while loading data.', err.error.message);
      }

    });
  }

  renderCharJs() {
    new Chart('myChartJs', {
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
      }
    });
  }

}
