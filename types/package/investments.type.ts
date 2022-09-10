import { PackageInvestmentEnum } from '../enum/package/investment.enum';

export type TPackageInvestments = {
  key: PackageInvestmentEnum;
  text: String;
  value: String | Number;
};
