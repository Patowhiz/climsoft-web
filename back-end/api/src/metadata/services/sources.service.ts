import { Injectable, NotFoundException } from '@nestjs/common';
import { SourceEntity, SourceTypeEnum } from '../entities/source.entity';
import { FindManyOptions, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSourceDto } from '../dtos/create-source.dto';
import { ViewSourceDto } from '../dtos/view-source.dto';

@Injectable()
export class SourcesService {

    constructor(@InjectRepository(SourceEntity) private readonly sourceRepo: Repository<SourceEntity>,
    ) { }

    public async findSourcesByIds(ids?: number[]): Promise<ViewSourceDto[]> {
        const findOptions: FindManyOptions<SourceEntity> = {
            order: {
                id: "ASC"
            }
        };

        if (ids) {
            findOptions.where = { id: In(ids) };
        }

        const sourceEntities = await this.sourceRepo.find(findOptions);
        return sourceEntities.map(source => ({ ...source }));
    }

    async findSourcesByTypeIds(sourceTypeId?: SourceTypeEnum): Promise<SourceEntity[]> {
        let sources: SourceEntity[];
        if (sourceTypeId) {
            sources = await this.sourceRepo.find({
                where: {
                    sourceTypeId: sourceTypeId,
                },
            });
        } else {
            sources = await this.sourceRepo.find();
        }

        if (!sources) {
            throw new NotFoundException(`Sources of type #${sourceTypeId} not found`);
        }
        return sources;
    }

    async findSource(id: number) {
        const source = await this.sourceRepo.findOneBy({
            id: id,
        });

        if (!source) {
            throw new NotFoundException(`Source #${id} not found`);
        }
        return source;
    }

    async create(sourceDto: CreateSourceDto) {
        const source = this.sourceRepo.create({
            ...sourceDto,
        });
        return this.sourceRepo.save(source);
    }

    async updateSource(id: number, sourceDto: CreateSourceDto) {
        const source = await this.sourceRepo.preload({
            id, ...sourceDto,
        });
        if (!source) {
            throw new NotFoundException(`Source #${id} not found`);
        }
        return this.sourceRepo.save(source);
    }

    async deleteSource(id: number) {
        const source = await this.findSource(id);
        return this.sourceRepo.remove(source);
    }
}
