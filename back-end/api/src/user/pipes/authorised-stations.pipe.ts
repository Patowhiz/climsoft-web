import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthUtil } from '../services/auth.util';
import { ViewObservationQueryDTO } from 'src/observation/dtos/view-observation-query.dto';
import { EntryFormObservationQueryDto } from 'src/observation/dtos/entry-form-observation-query.dto';
import { ViewStationQueryDTO } from 'src/metadata/stations/dtos/view-station-query.dto';

@Injectable()
export class AuthorisedStationsPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) { }

  public transform(value: any, metadata: ArgumentMetadata) {
    const user = AuthUtil.getSessionUser(this.request);

    // If user is not logged in, return the value. Authorization will be handled by authentication guard.
    if (!user) return value;

    // If user is admin return the value.
    if (AuthUtil.sessionUserIsAdmin(this.request)) return value;

       // TODO. Throw the correct exception that relates to authorisation
    if (!user.permissions)   throw new BadRequestException('Could not check for permissions');

    //if (user.permissions.entryPermissions?.stationsIds)  

      //const authorisedStationIds = user.permissions.entryPermissions.stationsIds;

    // Ensure metatype is available
    if (!metadata.metatype) {
      throw new BadRequestException('Could not determine how to authorize stations');
    }

    const authorisedStationIds: any = [];

    // Handle different types of metatype
    switch (metadata.metatype.name) {
      case 'Array':
        return this.handleArray(value, authorisedStationIds);
      case 'String':
        return this.handleString(value, authorisedStationIds);
      case ViewStationQueryDTO.name:
        return this.handleViewStationQueryDTO(value as ViewStationQueryDTO, authorisedStationIds);
      case ViewObservationQueryDTO.name:
        return this.handleViewObservationQueryDTO(value as ViewObservationQueryDTO, authorisedStationIds);
      case EntryFormObservationQueryDto.name:
        return this.handleCreateObservationQueryDto(value as EntryFormObservationQueryDto, authorisedStationIds);
      default:
        // TODO. Throw the correct exception that relates to authorisation
        throw new BadRequestException('Could not determine how to authorize stations');
    }
  }

  private handleArray(value: string[], authorisedStationIds: string[]): string[] {
    if (value) {
      if (!this.allAreAuthorisedStations(value, authorisedStationIds)) {
        throw new BadRequestException('Not authorised to access station(s)');
      }
    } else {
      value = authorisedStationIds;
    }
    return value;
  }

  private handleString(value: string, authorisedStationIds: string[]): string {
    if (value && this.allAreAuthorisedStations([value], authorisedStationIds)) {
      return value;
    } else {
      throw new BadRequestException('Not authorised to access station(s)');
    }
  }

  private handleViewStationQueryDTO(value: ViewStationQueryDTO, authorisedStationIds: string[]): ViewStationQueryDTO {
    if (value.stationIds) {
      if (!this.allAreAuthorisedStations(value.stationIds, authorisedStationIds)) {
        throw new BadRequestException('Not authorised to access station(s)');
      }
    } else {
      value.stationIds = authorisedStationIds;
    }
    return value;
  }

  private handleViewObservationQueryDTO(value: ViewObservationQueryDTO, authorisedStationIds: string[]): ViewObservationQueryDTO {
    if (value.stationIds) {
      if (!this.allAreAuthorisedStations(value.stationIds, authorisedStationIds)) {
        throw new BadRequestException('Not authorised to access station(s)');
      }
    } else {
      value.stationIds = authorisedStationIds;
    }
    return value;
  }

  private handleCreateObservationQueryDto(value: EntryFormObservationQueryDto, authorisedStationIds: string[]): EntryFormObservationQueryDto {
    if (value && this.allAreAuthorisedStations([value.stationId], authorisedStationIds)) {
      return value;
    } else {
      throw new BadRequestException('Not authorised to access station(s)');
    }
  }

  private allAreAuthorisedStations(requestedIds: string[], authorisedIds: string[]): boolean {
    return requestedIds.every(id => authorisedIds.includes(id));
  }
}
