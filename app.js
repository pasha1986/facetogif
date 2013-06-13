(function () {
  var video, button, canvas, ctx, interval;

  function thisBrowserIsBad() {
    console.log('This browser does not support getUserMedia yet.');
  }

  function getStream(callback, fail) {
    (navigator.getUserMedia || navigator.webkitGetUserMedia || thisBrowserIsBad).call(navigator, {video: true}, callback, fail);
  }

  var facetogif = {
    stream: null,
    video: null,
    gifContainer: null,
    controls: null,
    str: {
      ASK_FOR_PERMISSION: "put your face here",
      STOP_STREAMING: "stop streaming",
      START_RECORDING: "start recording",
      STOP_RECORDING: "make gif",
      COMPILING: "\"it's compiling...\"",
      PAUSE: "▮▮",
      RESUME: "►"
    },

    displayGIF: function (img) {
      var article = document.createElement('article');
      article.appendChild(facetogif.controls.cloneNode(true));
      article.appendChild(img);
      article.className = "generated-gif";
      img.className = "generated-img";
      facetogif.gifContainer.appendChild(article);
    }
  };

  document.addEventListener('DOMContentLoaded', function (e) {
    facetogif.video = document.querySelector('video');
    facetogif.controls = document.getElementById('controls-template');
    facetogif.controls.parentNode.removeChild(facetogif.controls);
    facetogif.controls.removeAttribute('id');

    canvas = document.querySelector('canvas');
    facetogif.gifContainer = document.getElementById('gifs-go-here');
    facetogif.gifContainer.addEventListener('click', function (e) {
      var container = (function (e) {
        while (e.parentNode && !e.classList.contains('generated-gif') && (e = e.parentNode)) ;
        return e;
      } (e.target));
      if (e.target.classList.contains('img')) {
        e.target.href = container.querySelector('.generated-img').src;
      }
    }, false);

    document.getElementById('put-your-face-here').addEventListener('click', function (e) {
      var button = e.target;
      if (button.classList.contains('clicked') && facetogif.stream) {
        facetogif.stream.stop();
        facetogif.stream = null;
        facetogif.video.removeAttribute('src');
        button.innerText = facetogif.str.ASK_FOR_PERMISSION;
        button.classList.remove('streaming');
      } else {
        getStream(function (stream) {
          button.innerText = facetogif.str.STOP_STREAMING;
          button.classList.add('streaming');
          facetogif.video.src = window.URL.createObjectURL(stream);
          facetogif.stream = stream;
        }, function (fail) { console.log(fail); });
      }
      button.classList.toggle('clicked');
    }, false);

    button = document.getElementById('start-recording');
    var pause = document.getElementById('pause-recording');
    button.addEventListener('click', function (e) {
      if (recorder.state === recorder.states.RECORDING || recorder.state === recorder.states.PAUSED) {
        button.classList.remove('recording');
        button.innerText = facetogif.str.COMPILING;
        clearInterval(recorder.interval);
        button.disabled = true;
        recorder.state = recorder.states.COMPILING;
        recorder.gif.on('finished', function (blob) {
          var img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          facetogif.displayGIF(img);
          button.removeAttribute('disabled');
          button.innerText = facetogif.str.START_RECORDING;
          recorder.state = recorder.states.FINISHED;
        });
        recorder.gif.render();

        ctx = null;
      } else if (recorder.state === recorder.states.IDLE || recorder.state === recorder.states.FINISHED) {
        button.classList.add('recording');
        recorder.state = recorder.states.RECORDING;
        button.innerText = facetogif.str.STOP_RECORDING;
        ctx = canvas.getContext('2d');
        recorder.gif = new GIF({ workers: 2, width: 640, height: 480 });
        recorder.interval = setInterval(recorder_fn(ctx, recorder.gif), 67);
      }
    }, false);
    pause.addEventListener('click', function (e) {
      if (recorder.state === recorder.states.RECORDING) {
        clearInterval(recorder.interval);
        recorder.state = recorder.states.PAUSED;
        pause.innerText = facetogif.str.RESUME;
      } else if (recorder.state === recorder.states.PAUSED) {
        recorder.interval = setInterval(recorder_fn(ctx, recorder.gif), 67);
        pause.innerText = facetogif.str.PAUSE;
        recorder.state = recorder.states.RECORDING;
      }
    }, false);

  }, false);

  var recorder = {
    state: 0,
    gif: null,
    interval: null,
    states: {
      IDLE: 0,
      RECORDING: 1,
      PAUSED: 2,
      COMPILING: 3,
      FINISHED: 4
    }
  };

  function recorder_fn(ctx, gif) {
    return function () {
      ctx.drawImage(facetogif.video, 0,0, 640,480);
      gif.addFrame(ctx, {delay: 67, copy: true});
    }
  }

} ());