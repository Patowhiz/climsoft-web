import { DateTimeColumn } from "src/shared/column-transformers/date-time-column.transformer";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("stations")
export class StationEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  // @Column({ type: 'int' })
  // stationType: number;

  // @Column({ type: 'int', nullable: true })
  // stationClass: number;

  // @Column({ type: 'varchar', nullable: true })
  // location: string | null; //a GeoJSON. Polygon feature

  // @Column({ type: 'float', nullable: true })
  // elevation: number | null; //from and to. Elevation of station above mean sea level.  todo. discuss on oscar and openCDMS

  // @Column({ type: 'varchar', nullable: true })
  // wigosId: string | null;

  // @Column({ type: 'varchar', nullable: true })
  // climateZone: string | null; //based on koppen climate classification
 
  // @Column({ type: 'varchar', nullable: true })
  // territory: string | null; //province, county, district. Lowest form of self government
  
  // @Column({ type: 'varchar', nullable: true })
  // networkAffiliation: string | null;
  
  // @Column({ type: 'varchar', nullable: true })
  // organisation: string | null; // name of organisation that owns the station.
  
  // @Column({ type: 'varchar', nullable: true })
  // wmoRegion: string | null;

  // @Column({ type: 'varchar', nullable: true })
  // timeZone: string | null;
 
  // @Column({ type: 'datetime', transformer: new DateTimeColumn() })
  // dateEstablished: string | null;

  // @Column({ type: 'varchar'})
  // status:  string | null;

  // @Column({ type: 'datetime', transformer: new DateTimeColumn() })
  // statusChangeDate: string | null;

   @Column({ type: 'varchar', nullable: true })
   comment: string | null;

   @Column({ type: "varchar", name: "entry_user_id" })
   entryUserId: number;

   @Column({ type: "timestamptz", name: "entry_date_time", transformer: new DateTimeColumn() })
   entryDateTime: string;
 
   @Column({ type: 'jsonb', nullable: true })
   log: StationLogVo[] | null;

}

export interface StationLogVo {
  name: string;
  description: string;
  comment: string | null;
  entryUserId: number;
  entryDateTime: string;  
}