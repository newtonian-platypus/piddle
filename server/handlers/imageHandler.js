const fs = require('fs');
const path = require('path');
const request = require('request');
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
      res.json({items: decoder(description)});
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

var isUsefulMoneyWord = function(str) {
  if (str.includes("Tax") ||
      str.includes("TAX") ||
      str.includes("tax") ||
      str.includes("Due") ||
      str.includes("DUE") ||
      str.includes("due") ||
      str.includes("Total") ||
      str.includes("TOTAL") ||
      str.includes("total") ||
      str.includes("$")
     ) {
    return true;
  }
  else {
    return false;
  }
};

var isUnhelpfulMoneyWord = function(str) {
  if (str.includes("Price") ||
      str.includes("Total") ||
      str.includes("TOTAL") ||
      str.includes("total") ||
      str.includes("Reprint") ||
      str.includes("Server") ||
      str.includes("SERVER") ||
      str.includes(":") ||
      str.includes("/") ||
      str.includes("GUEST") ||
      str.includes("Guest") ||
      str.includes("GUESTS") ||
      str.includes("Guests")
     ) {
    return true;
  } else {
    return false;
  }
};

var toTuples = function(arr) {
  var tuples = [];
  for (var i = 0; i < arr.length; i+=2) {
    var tuple = {};
    if (isFloat(arr[i])) {
      console.log('first', arr[i], arr[i+1]);
      tuple.price = arr[i];
      tuple.description = arr[i+1];
    } else {
      console.log('second', arr[i], arr[i+1]);
      tuple.price = arr[i+1];
      tuple.description = arr[i];
    }
    tuples.push(tuple);
  }
  return tuples;
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