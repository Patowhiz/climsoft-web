import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { SourcesService } from '../../services/sources/sources.service';
import { CreateUpdateSourceDto } from '../../dtos/sources/create-update-source.dto';
import { Admin } from 'src/user/decorators/admin.decorator';
import { SourceTypeEnum } from '../../enums/source-type.enum';



@Controller('sources')
export class SourcesController {

    constructor(private readonly sourcesService: SourcesService) { }

    @Get()
    public find() {
        return this.sourcesService.findSources();
    }

    /** TODO. Deprecate this route handler after implementing controllers for import and machine sources */
    @Get('/source/:id')
    public findSource(@Param('id', ParseIntPipe) id: number) {
        return this.sourcesService.findSourceRaw(id);
    }

    @Get('/source-type/:id')     // TODO validate enum. 
    public findSourcesOfType(@Param('id') id: SourceTypeEnum) {
        return this.sourcesService.findSourcesBySourceTypes(id);
    }

    /** TODO. Deprecate this route handler after implementing controllers for import and machine sources */
    @Admin()
    @Post()
    public create(@Body() createSourceDto: CreateUpdateSourceDto<string>) {
        return this.sourcesService.create(createSourceDto);
    }

    /** TODO. Deprecate this route handler after implementing controllers for import and machine sources */
    @Admin()
    @Patch(':id')
    public update(@Param('id', ParseIntPipe) id: number, @Body() createSourceDto: CreateUpdateSourceDto<string>) {
        return this.sourcesService.updateSource(id, createSourceDto);
    }

    @Admin()
    @Delete(':id')
    public delete(@Param('id', ParseIntPipe) id: number) {
        return this.sourcesService.deleteSource(id);
    }


}
