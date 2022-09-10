import { ModalsEnum } from './enum';

export type ActiveModalType = {
  modal: ModalsEnum;
  data: { [key: string]: any };
} | null;
