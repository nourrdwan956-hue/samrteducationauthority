const convertArabicDigits = (str) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (char) => arabicNumbers.indexOf(char).toString());
};
console.log(convertArabicDigits('١٢٣٤٥٦'));
