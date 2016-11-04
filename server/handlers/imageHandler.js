const vision = require('@google-cloud/vision')({
  projectId: 'API Project',
  keyFilename: './../API Project-8b8a37273156.json'
});
 
const processImage = (req, res) => {
  let chunks = [];
  req.on('data', (chunk) => { chunks.push(chunk) });
  req.on('end', () => {

    let body = Buffer.concat(chunks).toString('base64');
    let annotateImageReq = {
      "image": {
        "content": body,
      },
      "features": [
        {
          "type": 'TEXT_DETECTION',
          "maxResults": 10,
        }
      ]
    }
    vision.annotate(annotateImageReq).then(data => {
      var text = data[0];
      var apiResponse = data[1];
      let description = text[0].textAnnotations[0].description;
      var results = decoder(description);
      res.json({items: results.tuples, tax: results.tax});
    }).catch(err => {
      console.log(err);
      res.end();
    });
  });
}


// ==== parse receipt string ====

var isFloat = function(n){
  if (n !== undefined && n[0] === "$") {
    n = n.slice(1);
  }
  return ((Number(n) == n) && (n.includes(".")) && (Number(n) * 100 % 1 === 0));
};

var isTaxWord = function(str) {
  if (str.includes("Tax") ||
      str.includes("TAX") ||
      str.includes("tax")
     ) {
    return true;
  } else {
    return false;
  }
};

var isTotalWord = function(str) {
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

var isUsefulMoneyWord = function(str) {
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

var isUnhelpfulMoneyWord = function(str) {
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

var toTuples = function(arr) {
  var results = {};
  var tuples = [];
  var tax = 0;

  for (var i = 0; i < arr.length; i+=2) {
    var tuple = {};
    if (isFloat(arr[i])) {
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
    if (isTaxWord(str1)) {
      var str3 = tuples[i]['price'];
      tuples[i]['price'] = str3.match(/[0-9.]+\d*/g);
      tax = Number(tuples[i]['price']);
      tuples.splice(i, 1);
      i--;
    }
    if (isTaxWord(str2)) {
      tax = Number(tuples[i]['price']);
      tuples.splice(i, 1);
      i--;
    }
  };

  for (var i = 0; i < tuples.length; i++) {
    var str1 = String(tuples[i]['price']);
    var str2 = String(tuples[i]['description']);
    if (isTotalWord(str1) || isTotalWord(str2)) {
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

var decoder = function(arr) {
  arr = arr.split("\n");

  var truth = true;

  for (var i = 0; i < arr.length; i++) {
    if (isFloat(arr[i]) && truth === true) {
      if (isUnhelpfulMoneyWord(arr[i-1])) {
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
    if (isFloat(arr[i]) || isUsefulMoneyWord(arr[i])) {
      lastNum = i;
    }
  }

  arr = arr.slice(0, lastNum + 1);
  return toTuples(arr);
};


module.exports = {
  processImage,
};