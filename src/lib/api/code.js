import { isEqual } from 'lodash';

export const checkCode = (code, marker) => {
  // owner code
  if (isEqual(code, marker?.password)) return true;
  // volunteer code
  if (isEqual(code, marker?.helper_password)) return true;
  // admin code
  if (isEqual(code, process.env.NEXT_PUBLIC_MASTER_KEY_PICKUPS)) return true;
  return false;
};
