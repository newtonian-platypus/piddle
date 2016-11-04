const words = require('./words');

const toTuples = function(arr) {
  var results = {};
  var tuples = [];
  var tax = 0;

  for (var i = 0; i < arr.length; i+=2) {
    var tuple = {};
    if (words.isFloat(arr[i])) {
      tuple.quantity = 1;
      tuple.price = arr[i];
      tuple.description = arr[i+1];
    } else {
      if (arr[i+1] === undefined) {
        arr[i+1] = 0;
      }
      tuple.quantity = 1;
      tuple.price = arr[i+1];
      tuple.description = arr[i];
    }
    tuples.push(tuple);
  };

  for (var i = 0; i < tuples.length; i++) {
    var str1 = String(tuples[i]['price']);
    var str2 = String(tuples[i]['description']);
    if (words.isTaxWord(str1)) {
      var str3 = tuples[i]['price'];
      tuples[i]['price'] = str3.match(/[0-9.]+\d*/g);
      tax = Number(tuples[i]['price']);
      tuples.splice(i, 1);
      i--;
    }
    if (words.isTaxWord(str2)) {
      tax = Number(tuples[i]['price']);
      tuples.splice(i, 1);
      i--;
    }
  };

  for (var i = 0; i < tuples.length; i++) {
    var str1 = String(tuples[i]['price']);
    var str2 = String(tuples[i]['description']);
    if (words.isTotalWord(str1) || words.isTotalWord(str2)) {
      tuples.splice(i, 1);
      i--;
    }
  };

  for (var i = 0; i < tuples.length; i++) {
    tuples[i]['price'] = Number(tuples[i]['price']) || 0;
    var str = String(tuples[i]['description']);
    if (str[0].match(/[0-9]\d*/g) && str[0].match(/[0-9]\d*/g)) {
      var quantity = str.slice(0, 2);
      tuples[i]['quantity'] = Number(quantity);
      tuples[i]['description'] = tuples[i]['description'].slice(2);
    }
    else if (str[0].match(/[0-9]\d*/g)) {
      tuples[i]['quantity'] = Number(str[0]);
      tuples[i]['description'] = tuples[i]['description'].slice(2);
    }
  };

  results.tuples = tuples;
  results.tax = tax;
  return results;
};

const decode = function(arr) {
  arr = arr.split("\n");
  var truth = true;

  for (var i = 0; i < arr.length; i++) {
    if (words.isFloat(arr[i]) && truth === true) {
      if (words.isUnhelpfulMoneyWord(arr[i-1])) {
        arr = arr.slice(i);
        truth = false;
      } else {
        arr = arr.slice(i-1);
        truth = false;
      }
    }
  };

  var lastNum = arr.length;
  for (var i = 0; i < arr.length; i++) {
    if (words.isFloat(arr[i]) || words.isUsefulMoneyWord(arr[i])) {
      lastNum = i;
    }
  }

  arr = arr.slice(0, lastNum + 1);
  return toTuples(arr);
};


module.exports = {
  decode,
};

