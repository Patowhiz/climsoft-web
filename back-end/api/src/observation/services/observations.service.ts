import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, FindOptionsWhere, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ObservationEntity, UpdateObservationValuesLogVo } from '../entities/observation.entity';
import { CreateObservationDto } from '../dtos/create-observation.dto';
import { ViewObservationQueryDTO } from '../dtos/view-observation-query.dto';
import { ObjectUtils } from 'src/shared/utils/object.util';
import { ElementsService } from 'src/metadata/services/elements/elements.service';
import { ViewObservationDto } from '../dtos/view-observation.dto';
import { StationsService } from 'src/metadata/services/stations/stations.service';
import { QCStatusEnum } from '../enums/qc-status.enum';
import { CreateObservationQueryDto } from '../dtos/create-observation-query.dto';
import { ViewObservationLogQueryDto } from '../dtos/view-observation-log-query.dto';
import { ViewObservationLogDto } from '../dtos/view-observation-log.dto';
import { SourcesService } from 'src/metadata/controllers/sources/services/sources.service';

@Injectable()
export class ObservationsService {

    constructor(
        @InjectRepository(ObservationEntity) private readonly observationRepo: Repository<ObservationEntity>,
        private readonly stationsService: StationsService,
        private readonly elementsService: ElementsService,
        private readonly sourcesService: SourcesService,
    ) { }


    public async findProcessed(selectObsevationDto: ViewObservationQueryDTO): Promise<ViewObservationDto[]> {

        const obsView: ViewObservationDto[] = [];

        const obsEntities = await this.findProcessedObs(selectObsevationDto);

        const stationEntities = await this.stationsService.findAll();
        const elementEntities = await this.elementsService.findAll();
        const sourceEntities = await this.sourcesService.findAll();

        for (const obsEntity of obsEntities) {

            const viewObs: ViewObservationDto = new ViewObservationDto();

            const station = stationEntities.find(data => data.id === obsEntity.stationId);
            if (station) {
                viewObs.stationName = station.name;
            }

            const element = elementEntities.find(data => data.id === obsEntity.elementId);
            if (element) {
                viewObs.elementAbbrv = element.abbreviation;
            }

            const source = sourceEntities.find(data => data.id === obsEntity.sourceId);
            if (source) {
                viewObs.sourceName = source.name;
            }

            viewObs.elevation = obsEntity.elevation;
            viewObs.period = obsEntity.period;
            viewObs.datetime = obsEntity.datetime.toISOString();
            viewObs.value = obsEntity.value;
            viewObs.flag = obsEntity.flag;

            obsView.push(viewObs);
        }

        return obsView;

    }


    private async findProcessedObs(selectObsevationDto: ViewObservationQueryDTO) {
        const whereOptions: FindOptionsWhere<ObservationEntity> = {};

        if (selectObsevationDto.stationIds) {
            whereOptions.stationId = In(selectObsevationDto.stationIds);
        }

        if (selectObsevationDto.elementIds) {
            whereOptions.elementId = In(selectObsevationDto.elementIds);
        }

        if (selectObsevationDto.sourceIds) {
            whereOptions.sourceId = In(selectObsevationDto.sourceIds);
        }

        if (selectObsevationDto.period) {
            whereOptions.period = selectObsevationDto.period;
        }

        this.setProcessedObsDateFilter(selectObsevationDto, whereOptions);

        whereOptions.deleted = false;

        const findOptions: FindManyOptions<ObservationEntity> = {
            order: {
                stationId: "ASC",
                elementId: "ASC",
                sourceId: "ASC",
                elevation: "ASC",
                datetime: "ASC"
            },
            where: whereOptions
        };


        if (selectObsevationDto.page && selectObsevationDto.pageSize) {
            findOptions.skip = (selectObsevationDto.page - 1) * selectObsevationDto.pageSize;
            findOptions.take = selectObsevationDto.pageSize
        }

        return this.observationRepo.find(findOptions);


    }

    private setProcessedObsDateFilter(selectObsevationDto: ViewObservationQueryDTO, selectOptions: FindOptionsWhere<ObservationEntity>) {

        if (selectObsevationDto.fromDate && selectObsevationDto.toDate) {

            if (selectObsevationDto.fromDate === selectObsevationDto.toDate) {
                selectOptions.datetime = new Date(selectObsevationDto.fromDate);
            } else {
                selectOptions.datetime = Between(new Date(selectObsevationDto.fromDate), new Date(selectObsevationDto.toDate));
            }

        } else if (selectObsevationDto.fromDate) {
            selectOptions.datetime = MoreThanOrEqual(new Date(selectObsevationDto.fromDate))
        } else if (selectObsevationDto.toDate) {
            selectOptions.datetime = LessThanOrEqual(new Date(selectObsevationDto.toDate))
        }


    }


    public async findRawObs(queryDto: CreateObservationQueryDto): Promise<CreateObservationDto[]> {

        //TODO. Think about elevation

        const entities: ObservationEntity[] = await this.observationRepo.findBy({
            stationId: queryDto.stationId,
            elementId: In(queryDto.elementIds),
            sourceId: queryDto.sourceId,
            period: queryDto.period,
            datetime: In(queryDto.datetimes.map(datetime => new Date(datetime))),
            deleted: false
        });

        const dtos: CreateObservationDto[] = entities.map(data => ({
            stationId: data.stationId,
            elementId: data.elementId,
            sourceId: data.sourceId,
            elevation: data.elevation,
            datetime: data.datetime.toISOString(),
            period: data.period,
            value: data.value,
            flag: data.flag,
            comment: data.comment,
        })
        );

        return dtos;
    }

    public async findObsLog(queryDto: ViewObservationLogQueryDto): Promise<ViewObservationLogDto[]> {

        const entity: ObservationEntity | null = await this.observationRepo.findOneBy({
            stationId: queryDto.stationId,
            elementId: queryDto.elementId,
            sourceId: queryDto.sourceId,
            period: queryDto.period,
            datetime: new Date(queryDto.datetime)
        });

        if (!entity) {
            throw new NotFoundException('Observation not found');
        }

        console.log("entity log: ", entity.log, " type of: ", typeof entity.log);

        let log: ViewObservationLogDto[] = [];

        if (entity.log) {
            log = entity.log.map(item => {
                const logObj: ViewObservationLogDto = {
                    value: item.value,
                    flag: item.flag,
                    final: item.final,
                    comment: item.comment,
                    deleted: item.deleted,
                    entryDateTime: item.entryDateTime,
                }
                return logObj;

            })

        }

        // Include the current values as log.
        // Important because present values should be part of the record history
        const currentValuesAsLogObj: ViewObservationLogDto = {
            value: entity.value,
            flag: entity.flag,
            final: entity.final,
            comment: entity.comment,
            deleted: entity.deleted,
            entryDateTime: entity.entryDateTime.toISOString()
        }

        log.push(currentValuesAsLogObj);

        return log;
    }


    public async save1(createObservationDtoArray: CreateObservationDto[], userId: number) {

        const obsEntities: ObservationEntity[] = [];

        let newEntity: boolean;
        let observationEntity;
        for (const createObservationDto of createObservationDtoArray) {
            newEntity = false;
            observationEntity = await this.observationRepo.findOneBy({
                stationId: createObservationDto.stationId,
                elementId: createObservationDto.elementId,
                sourceId: createObservationDto.sourceId,
                elevation: createObservationDto.elevation,
                datetime: new Date(createObservationDto.datetime),
                period: createObservationDto.period,
            });

            if (observationEntity) {
                const oldChanges: UpdateObservationValuesLogVo = this.getEntityValsAsLogVO(observationEntity);
                const newChanges: UpdateObservationValuesLogVo = this.getObservationLogFromDto(createObservationDto, userId);

                if (ObjectUtils.areObjectsEqual<UpdateObservationValuesLogVo>(oldChanges, newChanges, ["entryUserId", "entryDateTime"])) {
                    continue;
                }

            } else {

                //TODO. Move this validation to a pipe validator
                if (createObservationDto.value === null && createObservationDto.flag === null) {
                    continue;
                }

                newEntity = true;
                observationEntity = this.observationRepo.create({
                    stationId: createObservationDto.stationId,
                    elementId: createObservationDto.elementId,
                    sourceId: createObservationDto.sourceId,
                    elevation: createObservationDto.elevation,
                    datetime: createObservationDto.datetime,
                    period: createObservationDto.period,
                });

            }


            this.updateObservationEntity(observationEntity, createObservationDto, userId, newEntity);
            obsEntities.push(observationEntity);
        }

        return this.observationRepo.save(obsEntities);
    }


    public async save(createObservationDtoArray: CreateObservationDto[], userId: number): Promise<string> {

        let startTime = new Date().getTime();

        const obsEntities: Partial<ObservationEntity>[] = [];
        for (const dto of createObservationDtoArray) {

            const entity: ObservationEntity = this.observationRepo.create({
                stationId: dto.stationId,
                elementId: dto.elementId,
                sourceId: dto.sourceId,
                elevation: dto.elevation,
                datetime: new Date(dto.datetime),
                period: dto.period,
                value: dto.value,
                flag: dto.flag,
                qcStatus: QCStatusEnum.NO_QC_TESTS_DONE,
                comment: dto.comment,
                final: false,
                entryUserId: userId,
                deleted: (dto.value === null && dto.flag === null), // TODo. I'm not sure if this is the correct way to perform deletes
                entryDateTime: new Date(), // Will be sent to database in utc, that is, new Date().toISOString()
               
            });
            
            
            obsEntities.push(entity);
        }

        console.log("DTO transformation took: ", new Date().getTime() - startTime);
 

        startTime = new Date().getTime();

        const batchSize = 1000; // bacthsize of 1000 seems to be safer (incase there are comments) and faster.
        for (let i = 0; i < obsEntities.length; i += batchSize) {
            const batch = obsEntities.slice(i, i + batchSize);
            await this.insertUser(batch); 
        } 
        console.log("Saving entities took: ", new Date().getTime() - startTime);

        return "success";
 
    }


    async insertUser(observationsData: Partial<ObservationEntity>[]): Promise<void> {
        await this.observationRepo
            .createQueryBuilder()
            .insert()
            .into(ObservationEntity)
            .values(observationsData)
            .orUpdate(
                ["value", "flag", "qc_status", "final", "comment", "deleted", "entry_user_id"],
                ["station_id", "element_id", "source_id", "elevation", "date_time", "period"],
                {
                    skipUpdateIfNoValuesChanged: true,
                }
            )
            .execute();
    }




    private getEntityValsAsLogVO(entity: ObservationEntity): UpdateObservationValuesLogVo {
        return {
            value: entity.value,
            flag: entity.flag,
            final: entity.final,
            comment: entity.comment,
            entryUserId: entity.entryUserId,
            deleted: entity.deleted,
            entryDateTime: entity.entryDateTime.toISOString()
        };
    }

    private getObservationLogFromDto(dto: CreateObservationDto, userId: number): UpdateObservationValuesLogVo {
        return {
            value: dto.value,
            flag: dto.flag,
            final: false,
            comment: dto.comment,
            entryUserId: userId,
            deleted: false,
            entryDateTime: new Date().toISOString()
        };
    }

    private updateObservationEntity(entity: ObservationEntity, dto: CreateObservationDto, userId: number, newEntity: boolean): void {

        // Then set the new values 
        entity.value = dto.value;
        entity.flag = dto.flag;
        entity.qcStatus = QCStatusEnum.NO_QC_TESTS_DONE;
        entity.comment = dto.comment;
        entity.final = false;
        entity.entryUserId = userId;
        entity.deleted = (entity.value === null && entity.flag === null); // TODo. I'm not sure if this is the correct way to perform deletes
        entity.entryDateTime = new Date(); // Will be sent to database in utc, that is, new Date().toISOString()
    }




}
