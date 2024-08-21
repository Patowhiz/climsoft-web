import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { AuthUtil } from '../services/auth.util';
import { ViewObservationQueryDTO } from 'src/observation/dtos/view-observation-query.dto';
import { CreateObservationQueryDto } from 'src/observation/dtos/create-observation-query.dto';

@Injectable()
export class AuthorisedStationsPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public transform(value: any, metadata: ArgumentMetadata) {
    const user = AuthUtil.getSessionUser(this.request);

    // If user is not logged in, return the value. Authorization will be handled by another pipe.
    if (!user) return value;

    // If user is admin or has no restrictions on authorized stations, return the value.
    if (AuthUtil.sessionUserIsAdmin(this.request) || user.authorisedStationIds === null) return value;

    // Ensure metatype is available
    if (!metadata.metatype) {
      throw new BadRequestException('Could not determine how to authorize stations');
    }

    // Handle different types of metatype
    switch (metadata.metatype.name) {
      case 'Array':
        return this.handleArray(value, user.authorisedStationIds);

      case 'String':
        return this.handleString(value, user.authorisedStationIds);

      case ViewObservationQueryDTO.name:
        return this.handleViewObservationQueryDTO(value as ViewObservationQueryDTO, user.authorisedStationIds);

      case CreateObservationQueryDto.name:
        return this.handleCreateObservationQueryDto(value as CreateObservationQueryDto, user.authorisedStationIds);

      default:
        throw new BadRequestException('Could not determine how to authorize stations');
    }
  }

  private handleArray(value: any, authorisedStationIds: string[]): string[] {
    if (value) {
      if (!this.allAreAuthorisedStations(value, authorisedStationIds)) {
        throw new BadRequestException('Not authorised to access station(s)');
      }
    } else {
      value = authorisedStationIds;
    }
    return value;
  }

  private handleString(value: any, authorisedStationIds: string[]): string {
    if (value && this.allAreAuthorisedStations([value], authorisedStationIds)) {
      return value;
    } else {
      throw new BadRequestException('Not authorised to access station(s)');
    }    
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

  private handleCreateObservationQueryDto(value: CreateObservationQueryDto, authorisedStationIds: string[]): CreateObservationQueryDto {
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
