import { AppBaseEntity, BaseLogVo } from "src/shared/entity/app-base-entity";
import { Column, Entity, Index, MultiPolygon, PrimaryGeneratedColumn } from "typeorm";
import { RegionTypeEnum } from "../enums/region-types.enum";

@Entity("regions")
export class RegionEntity extends AppBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', unique: true })
  name: string;

  @Column({ name: 'description', type: 'varchar' })
  description: string;

  @Column({ name: 'region_type', type: 'enum', enum: RegionTypeEnum })
  @Index()
  regionType: RegionTypeEnum;

  @Column({ name: 'boundary', type: 'geometry', spatialFeatureType: 'MultiPolygon', srid: 4326 })
  @Index({ spatial: true })
  boundary: MultiPolygon;

  @Column({ name: 'log', type: 'jsonb', nullable: true })
  log: BaseLogVo[] | null;
}

