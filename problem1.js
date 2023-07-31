const toCamelCase = (sentence) => {
  const words = sentence.split(" ");
  const camelCaseWords = words.map((word, index) =>
    index === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  return camelCaseWords.join("");
};
const inputSentence = "This is an input sentence";
const camelCaseString = toCamelCase(inputSentence);

console.log(camelCaseString);
