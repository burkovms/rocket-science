import BigNumber from 'bignumber.js';
import { getFullDisplayBalance } from '.';
import { ActivePacketsLevelValueEnum } from '~/blockchain';
import { AppModeEnum } from '~/types/enum/store';
import { CardListNameEnum } from '~/types/enum';

export const profitCalculation = (
  level: number | undefined,
  invested: BigNumber
) => {
  if (!level)
    return getFullDisplayBalance(new BigNumber(invested).multipliedBy(2.25));
  switch (level) {
    case ActivePacketsLevelValueEnum.ten:
      return getFullDisplayBalance(new BigNumber(invested).multipliedBy(2));
    case ActivePacketsLevelValueEnum.fifteen:
      return getFullDisplayBalance(new BigNumber(invested).multipliedBy(2.25));
    case ActivePacketsLevelValueEnum.twenty:
      return getFullDisplayBalance(new BigNumber(invested).multipliedBy(3));
    case ActivePacketsLevelValueEnum.thirtyFive:
      return getFullDisplayBalance(new BigNumber(invested).multipliedBy(3.5));
  }
};

export const profitCalculationName = (
  packetLifetime: number | undefined,
  appMode: AppModeEnum
): string => {
  if (!packetLifetime) return CardListNameEnum.inDays;

  return appMode === AppModeEnum.development
    ? `In ${packetLifetime / 60} days`
    : `In ${packetLifetime / (24 * 60 * 60)} days`;
};
