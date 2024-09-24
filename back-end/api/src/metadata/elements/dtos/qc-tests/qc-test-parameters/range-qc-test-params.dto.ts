import { IsDecimal } from 'class-validator';
import { QCTestParametersValidity } from '../create-qc-test.dto';

export class RangeThresholdQCTestParamsDto implements QCTestParametersValidity {
    @IsDecimal()
    lowerLimit: number;

    @IsDecimal()
    upperLimit: number;

    isValid(): boolean {
        //TODO
        return true;
    }
}

