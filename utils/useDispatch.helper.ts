export const useDispatch = (module: string | null, action: string) =>
  !module ? action : `${module}/${action}`;
