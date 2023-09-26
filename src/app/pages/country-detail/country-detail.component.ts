import { OlympicService } from 'src/app/core/services/olympic.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OlympicCountry } from 'src/app/core/models/Olympic';

@Component({
  selector: 'app-country-detail',
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit {

  olympicCountry!: OlympicCountry;

  constructor(private route: ActivatedRoute, private olympicService: OlympicService) { }

  ngOnInit(): void {
    const countyId = +this.route.snapshot.params['id']; // cast the type the segment of route (id: string) to number

    this.olympicService.getOlympics().subscribe({
      next: olympics => {
        const countryById = olympics.find(o => o.id === countyId);
        if (!countryById) {
          throw new Error('Country Olympic not found!');
        } else {
          this.olympicCountry = countryById;
        }
      }, error: err => {
        console.log('An error occurred while loading data.', err.error.message);
      }

    });
  }

}
