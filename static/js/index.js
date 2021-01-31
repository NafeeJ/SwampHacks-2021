const { writeFile } = require("fs");

const video = document.getElementById('video');

var socket = io.connect('http://127.0.0.1:5000');
socket.on( 'connect', function() {
  console.log("SOCKET CONNECTED")
})

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
Promise.all([
  faceapi.loadFaceLandmarkModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceRecognitionModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadTinyFaceDetectorModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceLandmarkModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceLandmarkTinyModel("http://127.0.0.1:5000/static/models/"),
  faceapi.loadFaceRecognitionModel("http://127.0.0.1:5000/static/models/")
])
  .then(startVideo)
  .catch(err => console.error(err));

function startVideo() {
  console.log("Video Started");
  navigator.getUserMedia(
    {
      video: {}
    },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}
// const results = await faceapi
//   .detectAllFaces(referenceImage)
//   .withFaceLandmarks()
//   .withFaceDescriptors()

// if (!results.length) {
//   return
// }

// // create FaceMatcher with automatically assigned labels
// // from the detection results for the reference image
// const faceMatcher = new faceapi.FaceMatcher(results)

// const singleResult = await faceapi
//   .detectSingleFace(queryImage1)
//   .withFaceLandmarks()
//   .withFaceDescriptor()

// if (singleResult) {
//   const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
//   console.log(bestMatch.toString())
// }

// console.log(`Descriptor ${results.descriptor}`)
// var img = new Image();   // Create new img element
// img.src = 'Justin.jpg'; // Set source path

video.addEventListener('play', () => {
  // console.log('thiru');

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
 
    const results = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    writeFile('faces.txt', results.descriptor)

    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    // console.log(`Descriptor ${detections.detections}`)
    const faceMatcher = new faceapi.FaceMatcher(detections)
    const bestMatch = faceMatcher.findBestMatch(results.descriptor)
    socket.emit( 'my event', {
      data: detections
    })
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    console.log(bestMatch);
  }, 100)
})
