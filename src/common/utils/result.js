export const Ok = (value) => ({
  ok: true,
  value,
});
export const Err = (error) => ({ ok: false, error });
export const isOk = (result) => result.ok === true;
export const isErr = (result) => result.ok === false;
