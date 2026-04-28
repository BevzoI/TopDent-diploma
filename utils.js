
export const toSafeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : user;
  const { password, ...rest } = obj;
  return {
    ...rest,
    id: obj._id,
  };
};
