const isFloat = function(n){
  if (n !== undefined && n[0] === "$") {
    n = n.slice(1);
  }
  return ((Number(n) == n) && (n.includes(".")) && (Number(n) * 100 % 1 === 0));
};

const isTaxWord = function(str) {
  if (str.includes("Tax") ||
      str.includes("TAX") ||
      str.includes("tax")
     ) {
    return true;
  } else {
    return false;
  }
};

const isTotalWord = function(str) {
  if (str.includes("Total") ||
      str.includes("TOTAL") ||
      str.includes("total") ||
      str.includes("Subtotal") ||
      str.includes("SUBTOTAL") ||
      str.includes("subtotal") ||
      str.includes("Due") ||
      str.includes("DUE") ||
      str.includes("due")
     ) {
    return true;
  } else {
    return false;
  }
};

const isUsefulMoneyWord = function(str) {
  if (isTotalWord(str) ||
      isTaxWord(str) ||
      str.includes("$")
     ) {
    return true;
  }
  else {
    return false;
  }
};

const isUnhelpfulMoneyWord = function(str) {
  if (isTotalWord(str) ||
      str.includes("Price") ||
      str.includes("Reprint") ||
      str.includes("Server") ||
      str.includes("SERVER") ||
      str.includes("GUEST") ||
      str.includes("Guest") ||
      str.includes("GUESTS") ||
      str.includes("Guests") ||
      str.includes(":") ||
      str.includes("/")
     ) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  isFloat,
  isTaxWord,
  isTotalWord,
  isUsefulMoneyWord,
  isUnhelpfulMoneyWord
};