import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map/map.component';
import { MapService } from './map.service';
import { RegionService } from '../../services/region.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    MapComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    MapRoutingModule
  ],
  providers: [
    MapService,
    RegionService
  ],
  exports: [
    MapComponent
  ]
})
export class MapModule { }
