import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { StationsService } from '../services/stations.service';
import { StationDto } from '../dtos/station.dto';

@Controller('stations')
export class StationsController {

  constructor(private readonly stationsService: StationsService) { }

  @Get()
  find() {
    // const { limit, offset } = paginationQuery;
    console.log('getting stations');
    return this.stationsService.find();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.stationsService.findOne('' + id);
  }

  @Post()
  create(@Body() stationDto: StationDto) {
    return this.stationsService.create(stationDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() stationDto: StationDto) {
    return this.stationsService.update(id, stationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }

}
