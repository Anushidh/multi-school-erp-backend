export const generatePassword = (phone, name, date) => {
  const cleanName = name.replace(/\s+/g, "");
  return `${phone}${cleanName}${date}`;
};


