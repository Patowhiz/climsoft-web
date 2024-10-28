import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegionEntity } from '../entities/region.entity';
import { FileIOService } from 'src/shared/services/file-io.service';
import { RegionTypeEnum } from '../enums/region-types.enum';
import { ViewRegionDto } from '../dtos/view-region.dto';
import { ViewRegionQueryDTO } from '../dtos/view-region-query.dto';

// TODO refactor this service later

@Injectable()
export class RegionsService {

    constructor(
        @InjectRepository(RegionEntity) private regionsRepo: Repository<RegionEntity>,
        private fileUploadService: FileIOService
    ) { }

    private async findEntity(id: number): Promise<RegionEntity> {
        const entity = await this.regionsRepo.findOneBy({
            id: id,
        });

        if (!entity) {
            throw new NotFoundException(`Source #${id} not found`);
        }
        return entity;
    }

    public async findOne(id: number): Promise<ViewRegionDto> {
        const entity = await this.findEntity(id);
        return this.getViewRegionDto(entity);
    }



    public async find(viewRegionQueryDto?: ViewRegionQueryDTO): Promise<ViewRegionDto[]> {
        const findOptions: FindManyOptions<RegionEntity> = {
            order: {
                id: "ASC"
            }
        };

        if (viewRegionQueryDto) {
            findOptions.where = this.getRegionFilter(viewRegionQueryDto);
            // If page and page size provided, skip and limit accordingly
            if (viewRegionQueryDto.page && viewRegionQueryDto.page > 0 && viewRegionQueryDto.pageSize) {
                findOptions.skip = (viewRegionQueryDto.page - 1) * viewRegionQueryDto.pageSize;
                findOptions.take = viewRegionQueryDto.pageSize;
            }
        }

        return (await this.regionsRepo.find(findOptions)).map(entity => {
            return this.getViewRegionDto(entity);
        });
    }

    public async count(viewRegionQueryDto: ViewRegionQueryDTO): Promise<number> {
        return this.regionsRepo.countBy(this.getRegionFilter(viewRegionQueryDto));
    }

    private getRegionFilter(viewRegionQueryDto: ViewRegionQueryDTO): FindOptionsWhere<RegionEntity> {
        const whereOptions: FindOptionsWhere<RegionEntity> = {};

        if (viewRegionQueryDto.regionIds) {
            whereOptions.id = viewRegionQueryDto.regionIds.length === 1 ? viewRegionQueryDto.regionIds[0] : In(viewRegionQueryDto.regionIds);
        }

        if (viewRegionQueryDto.regionType) {
            whereOptions.regionType = viewRegionQueryDto.regionType;
        }

        return whereOptions
    }

    public async extractAndsaveRegions(regionType: RegionTypeEnum, file: Express.Multer.File, userId: number) {
        const filePathName: string = `${this.fileUploadService.tempFilesFolderPath}/user_${userId}_regions_upload_${new Date().getTime()}.json`;

        // Save the file to the temporary directory
        await this.fileUploadService.saveFile(file, filePathName);

        const geoJsonData = JSON.parse(await this.fileUploadService.readFile(filePathName));

        const features = geoJsonData.features;

        const regionsToSave: RegionEntity[] = [];
        for (const region of features) {

            const name: string = region.properties.NAME_1;

            let entity = await this.regionsRepo.findOneBy({
                name: name,
            });

            if (!entity) {
                entity = await this.regionsRepo.create();
            }

            entity.name = name; // Assuming the name is in properties
            entity.description = '';
            entity.regionType = regionType; // Replace with appropriate region type
            entity.boundary = region.geometry;
            entity.entryUserId = userId;

            regionsToSave.push(entity);
        }

        this.fileUploadService.deleteFile(filePathName);

        await this.regionsRepo.save(regionsToSave);
    }

    public async delete(id: number): Promise<number> {
        const entity = await this.findEntity(id);
        await this.regionsRepo.remove(entity);
        return id;
    }

    public async deleteAll(): Promise<number> {
        const entities: RegionEntity[] = await this.regionsRepo.find();
        await this.regionsRepo.remove(entities);
        return entities.length;
    }

    private getViewRegionDto(entity: RegionEntity): ViewRegionDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            regionType: entity.regionType,
            boundary: entity.boundary.coordinates
        };
    }

}
