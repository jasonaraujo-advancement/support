/* SAO Advancement — shared behaviour. Everything here is progressive enhancement:
   with JavaScript off, the nav stays expanded and videos simply don't autoplay. */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile menu (disclosure pattern) ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  if(toggle && nav){
    var setOpen = function(open){
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('open', open);
    };
    toggle.addEventListener('click', function(){
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true'){
        setOpen(false); toggle.focus();
      }
    });
    window.addEventListener('resize', function(){
      if(window.innerWidth > 1000) setOpen(false);
    });
  }

  /* ---- Background hero video: pause/play control (WCAG 2.2.2) ---- */
  var heroVideo = document.querySelector('.hero video');
  var vbtn = document.querySelector('.video-toggle');
  if(heroVideo && vbtn){
    var label = vbtn.querySelector('.label');
    var icon = vbtn.querySelector('svg');
    var PAUSE = '<path d="M3 2h3v12H3zM10 2h3v12h-3z"/>';
    var PLAY  = '<path d="M3 2l11 6-11 6z"/>';
    var sync = function(){
      var playing = !heroVideo.paused;
      label.textContent = playing ? 'Pause background video' : 'Play background video';
      vbtn.setAttribute('aria-pressed', playing ? 'false' : 'true');
      icon.innerHTML = playing ? PAUSE : PLAY;
    };
    if(!reduceMotion){
      var p = heroVideo.play();
      if(p && p.catch) p.catch(function(){});
    }
    heroVideo.addEventListener('play', sync);
    heroVideo.addEventListener('pause', sync);
    vbtn.addEventListener('click', function(){
      if(heroVideo.paused){ heroVideo.play(); } else { heroVideo.pause(); }
    });
    sync();
  }

  /* ---- Portrait fallback: show initials if a remote photo fails to load ---- */
  var fallback = function(img){
    var box = img.parentNode;
    var name = box.getAttribute('data-initials') || '';
    box.textContent = name;
  };
  document.querySelectorAll('.portrait img').forEach(function(img){
    if(img.complete && img.naturalWidth === 0){ fallback(img); }
    else { img.addEventListener('error', function(){ fallback(img); }); }
  });
})();
