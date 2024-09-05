import { QCTestTypeEnum } from "./qc-test-type.enum";

export interface CreateQCTestModel {
    qcTestType: QCTestTypeEnum;
    elementId: number;
    observationPeriod: number;
    parameters: QCTestParametersValidity;
    disabled: boolean;
    comment: string | null;
}

export interface QCTestParametersValidity{
    isValid(): boolean;
  }