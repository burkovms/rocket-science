// eslint-disable-next-line import/named
import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { RootState } from '.';
import { PackageStatusEnum } from '~/types/enum/package';
import { initialSwitchState } from '~/types/store';
import { SwitchMutationsEnum } from '~/types/enum/store/switch/mutations.enum';

const initialState: initialSwitchState = {
  switchStatus: PackageStatusEnum.active,
};

export const state = () => initialState;

export type SwitchState = ReturnType<typeof state>;

export const getters: GetterTree<SwitchState, RootState> = {
  packageStatus(state): PackageStatusEnum {
    return state.switchStatus;
  },
};

export const mutations: MutationTree<SwitchState> = {
  SET_PACKEGE_STATUS(state, status: PackageStatusEnum) {
    state.switchStatus = status;
  },
};

export const actions: ActionTree<SwitchState, RootState> = {
  changePackageStatus({ commit }, status: PackageStatusEnum) {
    commit(SwitchMutationsEnum.SET_PACKEGE_STATUS, status);
  },
};
