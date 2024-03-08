import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { AuthorisedStationsPipe } from 'src/user/pipes/authorised-stations.pipe';
import { Admin } from 'src/user/decorators/admin.decorator';
import { Request } from 'express';
import { AuthUtil } from 'src/user/services/auth.util'; 
import { StationFormsService } from '../services/station-forms.service'; 

@Controller('station-forms')
export class StationFormsController {

  constructor(private readonly stationFormsService: StationFormsService) { }

  @Get('forms/:id')
  getForms(@Param('id', AuthorisedStationsPipe) id: string) {
    return this.stationFormsService.findForms(id);
  }

  @Admin()
  @Post('forms/:id')
  saveForms(@Req() request: Request, @Param('id', AuthorisedStationsPipe) stationId: string, @Body() formIds: number[]) {
    return this.stationFormsService.saveForms(stationId, formIds, AuthUtil.getLoggedInUserId(request));
  }


  @Admin()
  @Delete('forms/:id')
  deleteForms(@Param('id', AuthorisedStationsPipe) stationId: string, @Body() elementIds: number[]) {
    return this.stationFormsService.deleteForms(stationId, elementIds);
  }


}
