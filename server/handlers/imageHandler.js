var decoder = require('./decoder');

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
      var results = decoder.decode(description);
      res.json({items: results.tuples, tax: results.tax});
    }).catch(err => {
      console.log(err);
      res.end();
    });
  });
}

module.exports = {
  processImage,
};