import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, MoreThan, Repository } from 'typeorm';
import { StationEntity } from '../entities/station.entity';
import { StringUtils } from 'src/shared/utils/string.utils';
import { UpdateStationDto } from '../dtos/update-station.dto';
import { CreateStationDto } from '../dtos/create-update-station.dto';
import { ViewStationDto } from '../dtos/view-station.dto';
import { ViewStationQueryDTO } from '../dtos/view-station-query.dto';
import { StationChangesDto } from '../dtos/station-changes.dto';
import { retry } from 'rxjs';

@Injectable()
export class StationsService {

    constructor(
        @InjectRepository(StationEntity) private readonly stationRepo: Repository<StationEntity>,
    ) { }

    public async find(viewStationQueryDto?: ViewStationQueryDTO): Promise<ViewStationDto[]> {
        const findOptions: FindManyOptions<StationEntity> = {
            order: {
                id: "ASC"
            }
        };

        if (viewStationQueryDto) {
            findOptions.where = this.getFilter(viewStationQueryDto);
            // If page and page size provided, skip and limit accordingly
            if (viewStationQueryDto.page && viewStationQueryDto.page > 0 && viewStationQueryDto.pageSize) {
                findOptions.skip = (viewStationQueryDto.page - 1) * viewStationQueryDto.pageSize;
                findOptions.take = viewStationQueryDto.pageSize;
            }
        }

        return (await this.stationRepo.find(findOptions)).map(entity => {
            return this.createViewDto(entity);
        });
    }

    public async count(viewStationQueryDto: ViewStationQueryDTO): Promise<number> {
        return this.stationRepo.countBy(this.getFilter(viewStationQueryDto));
    }

    private getFilter(viewStationQueryDto: ViewStationQueryDTO): FindOptionsWhere<StationEntity> {
        const whereOptions: FindOptionsWhere<StationEntity> = {};

        if (viewStationQueryDto.stationIds) {
            whereOptions.id = viewStationQueryDto.stationIds.length === 1 ? viewStationQueryDto.stationIds[0] : In(viewStationQueryDto.stationIds);
        }

        if (viewStationQueryDto.obsProcessingMethods) {
            whereOptions.obsProcessingMethod = viewStationQueryDto.obsProcessingMethods.length === 1 ? viewStationQueryDto.obsProcessingMethods[0] : In(viewStationQueryDto.obsProcessingMethods);
        }

        if (viewStationQueryDto.obsEnvironmentIds) {
            whereOptions.obsEnvironmentId = viewStationQueryDto.obsEnvironmentIds.length === 1 ? viewStationQueryDto.obsEnvironmentIds[0] : In(viewStationQueryDto.obsEnvironmentIds);
        }

        if (viewStationQueryDto.obsFocusIds) {
            whereOptions.obsFocusId = viewStationQueryDto.obsFocusIds.length === 1 ? viewStationQueryDto.obsFocusIds[0] : In(viewStationQueryDto.obsFocusIds);
        }

        return whereOptions
    }

    public async findOne(id: string): Promise<ViewStationDto> {
        const entity = await this.getEntity(id);
        return this.createViewDto(entity);
    }

    public async create(createDto: CreateStationDto, userId: number): Promise<ViewStationDto> {
        let entity: StationEntity | null = await this.stationRepo.findOneBy({
            id: createDto.id,
        });

        if (entity) {
            throw new NotFoundException(`Station #${createDto.id} exists`);
        }

        entity = this.stationRepo.create({
            id: createDto.id,
        });

        this.updateStationEntity(entity, createDto, userId);

        await this.stationRepo.save(entity);

        // Retrieve the station with updated properties
        return this.findOne(entity.id);
    }

    public async update(id: string, updateDto: UpdateStationDto, userId: number): Promise<ViewStationDto> {
        const entity: StationEntity = await this.getEntity(id);

        this.updateStationEntity(entity, updateDto, userId);

        return this.createViewDto(await this.stationRepo.save(entity));
    }

    public async delete(id: string): Promise<string> {
        await this.stationRepo.remove(await this.getEntity(id));
        return id;
    }

    private async getEntity(id: string): Promise<StationEntity> {
        const entity = await this.stationRepo.findOneBy({
            id: id,
        });

        if (!entity) {
            throw new NotFoundException(`Station #${id} not found`);
        }
        return entity;
    }

    private updateStationEntity(entity: StationEntity, dto: UpdateStationDto, userId: number): void {
        entity.name = dto.name;
        entity.description = dto.description;
        entity.location = {
            type: "Point",
            coordinates: [dto.location.longitude, dto.location.latitude],
        };
        entity.elevation = dto.elevation;
        entity.obsProcessingMethod = dto.stationObsProcessingMethod;
        entity.obsEnvironmentId = dto.stationObsEnvironmentId;
        entity.obsFocusId = dto.stationObsFocusId;
        entity.wmoId = dto.wmoId;
        entity.wigosId = dto.wigosId;
        entity.icaoId = dto.icaoId;
        entity.status = dto.status;
        entity.dateEstablished = dto.dateEstablished ? new Date(dto.dateEstablished) : null;
        entity.dateClosed = dto.dateClosed ? new Date(dto.dateClosed) : null;
        entity.comment = dto.comment;
        entity.entryUserId = userId;
        entity.entryDateTime = new Date();
        entity.log = null;
    }

    private createViewDto(entity: StationEntity): ViewStationDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            location: {
                longitude: entity.location.coordinates[0],
                latitude: entity.location.coordinates[1]
            },
            elevation: entity.elevation,
            stationObsProcessingMethod: entity.obsProcessingMethod,
            stationObsProcessingMethodName: StringUtils.capitalizeFirstLetter(entity.obsProcessingMethod),
            stationObsEnvironmentId: entity.obsEnvironmentId,
            stationObsEnvironmentName: entity.obsEnvironment ? entity.obsEnvironment.name : null,
            stationObsFocusId: entity.obsFocusId,
            stationObsFocusName: entity.obsFocus ? entity.obsFocus.name : null,
            wmoId: entity.wmoId,
            wigosId: entity.wigosId,
            icaoId: entity.icaoId,
            status: entity.status,
            dateEstablished: entity.dateEstablished ? entity.dateEstablished.toISOString() : null,
            dateClosed: entity.dateClosed ? entity.dateClosed.toISOString() : null,
            comment: entity.comment,
        }
    }


    public async findUpdatedStations(entryDatetime: string, stationIds?: string[]): Promise<StationChangesDto> {
        const whereOptions: FindOptionsWhere<StationEntity> = {
            entryDateTime: MoreThan(new Date(entryDatetime))
        };

        if (stationIds) {
            whereOptions.id = stationIds.length === 1 ? stationIds[0] : In(stationIds);
        }

        const updatedStations = (await this.stationRepo.find({
            where: whereOptions
        })).map(entity => {
            return this.createViewDto(entity);
        });
        
        const totalCount = await this.stationRepo.count();

        return { updated: updatedStations, totalCount: totalCount };

    }

}
