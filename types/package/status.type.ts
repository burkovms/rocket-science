import { PackageStatusEnum } from '../enum/package';

export type TPackagesStatus = {
  status: PackageStatusEnum;
  text?: String;
  count: Number;
};
