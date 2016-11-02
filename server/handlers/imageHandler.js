const vision = require('@google-cloud/vision')({
  projectId: 'API Project',
  keyFilename: './../API Project-8b8a37273156.json'
});

const processImage = (req, res) => {

  vision.detectText(req.files.userPhoto.path).then(function(data) {
    var text = data[0];
    var apiResponse = data[1];
    res.json(text);
  }).catch(err => {

    console.log(err);
    res.end();
  });
}

module.exports = {
  processImage,
};