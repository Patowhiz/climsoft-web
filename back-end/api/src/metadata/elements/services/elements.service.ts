import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, In, MoreThan, Repository } from 'typeorm';
import { ElementEntity } from '../../elements/entities/element.entity'; 
import { CreateViewElementDto } from '../dtos/elements/create-view-element.dto';
import { UpdateElementDto } from '../dtos/elements/update-element.dto';
import { ViewElementQueryDTO } from '../dtos/elements/view-element-query.dto';
import { MetadataUpdatesQueryDto } from 'src/metadata/metadata-updates/dtos/metadata-updates-query.dto';
import { MetadataUpdatesDto } from 'src/metadata/metadata-updates/dtos/metadata-updates.dto';

@Injectable()
export class ElementsService {
    constructor(
        @InjectRepository(ElementEntity) private elementRepo: Repository<ElementEntity>,
    ) {

    }

    public async findOne(id: number): Promise<CreateViewElementDto> {
        return this.createViewDto(await this.getEntity(id));
    }

    public async find(viewElementQueryDto?: ViewElementQueryDTO): Promise<CreateViewElementDto[]> {
        const findOptions: FindManyOptions<ElementEntity> = {
            order: {
                id: "ASC"
            }
        };

        if (viewElementQueryDto) {
            findOptions.where = this.getFilter(viewElementQueryDto);
            // If page and page size provided, skip and limit accordingly
            if (viewElementQueryDto.page && viewElementQueryDto.page > 0 && viewElementQueryDto.pageSize) {
                findOptions.skip = (viewElementQueryDto.page - 1) * viewElementQueryDto.pageSize;
                findOptions.take = viewElementQueryDto.pageSize;
            }
        }

        return (await this.elementRepo.find(findOptions)).map(entity => {
            return this.createViewDto(entity);
        });
    }

    public async count(viewStationQueryDto: ViewElementQueryDTO): Promise<number> {
        return this.elementRepo.countBy(this.getFilter(viewStationQueryDto));
    }

    private getFilter(viewStationQueryDto: ViewElementQueryDTO): FindOptionsWhere<ElementEntity> {
        const whereOptions: FindOptionsWhere<ElementEntity> = {};

        if (viewStationQueryDto.elementIds) {
            whereOptions.id = viewStationQueryDto.elementIds.length === 1 ? viewStationQueryDto.elementIds[0] : In(viewStationQueryDto.elementIds);
        }

        if (viewStationQueryDto.typeIds) {
            whereOptions.typeId = viewStationQueryDto.typeIds.length === 1 ? viewStationQueryDto.typeIds[0] : In(viewStationQueryDto.typeIds);
        }

        return whereOptions
    }

    public async create(createDto: CreateViewElementDto, userId: number): Promise<CreateViewElementDto> {

        let entity: ElementEntity | null = await this.elementRepo.findOneBy({
            id: createDto.id,
        });

        if (entity) {
            throw new NotFoundException(`Element #${createDto.id} exists `);
        }

        entity = this.elementRepo.create({
            id: createDto.id,
        });

        this.updateElementEntity(entity, createDto, userId);

        await this.elementRepo.save(entity);

        // Important. Retrieve the entity with updated properties like type name before creating the view
        return this.findOne(entity.id);

    }

    public async update(id: number, updateDto: UpdateElementDto, userId: number): Promise<CreateViewElementDto> {
        const entity: ElementEntity = await this.getEntity(id);
  
        this.updateElementEntity(entity, updateDto, userId);

        await this.elementRepo.save(entity);

        return this.createViewDto(entity);
    }

    public async delete(id: number): Promise<number> {
        await this.elementRepo.remove(await this.getEntity(id));
        return id;
    }


    private updateElementEntity(entity: ElementEntity, dto: UpdateElementDto, userId: number): void {
        // Note, log has to be set before updating the new values to the entity, because we are logging previous values.
        //entity.log = newEntity ? null : ObjectUtils.getNewLog<ElementLogVo>(entity.log, this.getElementLogFromEntity(entity));

        entity.abbreviation = dto.abbreviation;
        entity.name = dto.name;
        entity.description = dto.description;
        entity.units = dto.units;
        entity.typeId = dto.typeId;
        entity.entryScaleFactor = dto.entryScaleFactor;
        entity.comment = dto.comment;
        entity.entryUserId = userId;
        entity.entryDateTime = new Date();

    }


    /**
     * Tries to find the element with the passed id, if not found throws a NOT FOUND error
     * @param id 
     * @returns 
     */
    private async getEntity(id: number): Promise<ElementEntity> {
        const elementEntity: ElementEntity | null = await this.elementRepo.findOneBy({
            id: id,
        });

        if (!elementEntity) {
            throw new NotFoundException(`Element #${id} not found`);
        }
        return elementEntity;
    }

    private createViewDto(entity: ElementEntity): CreateViewElementDto {
        return {
            id: entity.id,
            abbreviation: entity.abbreviation,
            name: entity.name,
            description: entity.description,
            units: entity.units,
            typeId: entity.typeId,
            entryScaleFactor: entity.entryScaleFactor,
            comment: entity.comment,
        }
    }

    public async checkUpdates(updatesQueryDto: MetadataUpdatesQueryDto): Promise<MetadataUpdatesDto> {
        let changesDetected: boolean = false;

        const serverCount = await this.elementRepo.count();

        if (serverCount !== updatesQueryDto.lastModifiedCount) {
            // If number of records in server are not the same as those in the client then changes detected
            changesDetected = true;
        } else {
            const whereOptions: FindOptionsWhere<ElementEntity> = {};

            if (updatesQueryDto.lastModifiedDate) {
                whereOptions.entryDateTime = MoreThan(new Date(updatesQueryDto.lastModifiedDate));
            }

            // If there was any changed record then changes detected
            changesDetected = (await this.elementRepo.count({ where: whereOptions })) > 0
        }

        if (changesDetected) {
            // If any changes detected then return all records 
            const allRecords = await this.find();
            return { metadataChanged: true, metadataRecords: allRecords }
        } else {
            // If no changes detected then indicate no metadata changed
            return { metadataChanged: false }
        }
    }

}
