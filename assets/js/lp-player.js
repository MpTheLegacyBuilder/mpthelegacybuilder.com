/* The Legacy Builder — background music bar.
 * Music never starts on its own; visitors press "Play music".
 * To change the song, replace /assets/audio/legacy-jazz.mp3 (keep the same name)
 * and update TRACK_TITLE below.
 * If the MP3 is missing, the bar stays hidden so nothing looks broken. */
(function () {
  var AUDIO_SRC   = '/assets/audio/legacy-jazz.mp3';
  var TRACK_TITLE = 'Smooth Jazz Instrumental \u2014 Alex Morgan';

  var bar       = document.getElementById('lp-player');
  if (!bar) return;
  var playBtn   = document.getElementById('lp-play-btn');
  var btnText   = document.getElementById('lp-play-text');
  var iconPlay  = document.getElementById('lp-icon-play');
  var iconPause = document.getElementById('lp-icon-pause');
  var volSlider = document.getElementById('lp-volume');
  var logo      = document.getElementById('lp-logo');
  var dismiss   = document.getElementById('lp-dismiss');
  var trackName = document.getElementById('lp-track-name');

  function store(key, val) {
    try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); }
    catch (e) { return null; }
  }

  // Visitor closed the bar earlier in this visit: keep it closed.
  if (store('lp-dismissed') === '1') return;

  var audio = new Audio();
  audio.preload = 'none';       // download nothing until someone presses play
  audio.loop = true;
  audio.volume = parseInt(volSlider.value, 10) / 100;
  if (trackName) trackName.textContent = TRACK_TITLE;

  function show() {
    bar.hidden = false;
    document.body.classList.add('lp-has-player');
  }

  // Only show the bar once we know the MP3 exists.
  fetch(AUDIO_SRC, { method: 'HEAD' })
    .then(function (r) { if (r.ok) show(); })
    .catch(function () {});

  function setPlaying(on) {
    iconPlay.style.display  = on ? 'none' : 'block';
    iconPause.style.display = on ? 'block' : 'none';
    btnText.textContent = on ? 'Pause' : 'Play music';
    playBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
    playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    logo.classList.toggle('paused', !on);
  }

  playBtn.addEventListener('click', function () {
    if (!audio.src) {
      audio.src = AUDIO_SRC;
      var resumeAt = parseFloat(store('lp-time') || '0');
      if (resumeAt > 0) {
        audio.addEventListener('loadedmetadata', function () {
          if (resumeAt < audio.duration) audio.currentTime = resumeAt;
        }, { once: true });
      }
    }
    if (audio.paused) {
      audio.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  volSlider.addEventListener('input', function () {
    audio.volume = parseInt(this.value, 10) / 100;
  });

  dismiss.addEventListener('click', function () {
    audio.pause();
    bar.hidden = true;
    document.body.classList.remove('lp-has-player');
    store('lp-dismissed', '1');
  });

  // Remember where the song was, so pressing play on the next page picks up there.
  window.addEventListener('pagehide', function () {
    if (audio.src) store('lp-time', String(audio.currentTime || 0));
  });
})();
