export function removeSensitiveDataFromObject(user) {
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.fingerPrintKey;
  delete userObject.__v;
  return userObject;
}
