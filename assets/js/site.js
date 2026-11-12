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

  /* ---- How to Give: each method tile opens its instructions directly beneath its row ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.method-tab'));
  if(tabs.length){
    var host = document.createElement('li');
    host.className = 'method-host';
    var store = document.querySelector('.method-panels');
    var openId = null;
    var panelFor = function(id){ var el = id && document.getElementById(id); return el && el.classList.contains('method') ? el : null; };
    var tabFor = function(id){ for(var k = 0; k < tabs.length; k++){ if(tabs[k].getAttribute('href') === '#' + id) return tabs[k]; } return null; };
    var place = function(){
      if(!openId) return;
      var item = tabFor(openId).parentNode, last = item, sib = item.nextElementSibling;
      while(sib){
        if(sib !== host){ if(sib.offsetTop !== item.offsetTop) break; last = sib; }
        sib = sib.nextElementSibling;
      }
      if(last.nextElementSibling !== host) last.parentNode.insertBefore(host, last.nextElementSibling);
    };
    var close = function(){
      if(host.firstChild) store.appendChild(host.firstChild);   /* return the panel to the hidden list */
      if(host.parentNode) host.parentNode.removeChild(host);
      openId = null;
      tabs.forEach(function(t){ t.setAttribute('aria-expanded', 'false'); });
    };
    var open = function(id, scrollTo){
      var panel = panelFor(id);
      if(!panel) return;
      close();
      host.appendChild(panel);
      openId = id;
      tabs.forEach(function(t){ t.setAttribute('aria-expanded', t.getAttribute('href') === '#' + id ? 'true' : 'false'); });
      place();
      var tab = tabFor(id);
      if(scrollTo || host.getBoundingClientRect().top > window.innerHeight * 0.7){
        tab.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: 'start'});
      }
    };
    tabs.forEach(function(t){
      t.setAttribute('aria-expanded', 'false');
      t.setAttribute('aria-controls', t.getAttribute('href').slice(1));
    });
    document.addEventListener('click', function(e){
      var link = e.target.closest && e.target.closest('a[href^="#"]');
      if(!link) return;
      var id = link.getAttribute('href').slice(1);
      if(!panelFor(id)) return;
      e.preventDefault();
      var isTab = link.classList.contains('method-tab');
      if(isTab && openId === id){ close(); return; }
      open(id, !isTab);
      if(history.replaceState) history.replaceState(null, '', '#' + id);
    });
    window.addEventListener('resize', place);
    var fromHash = function(){ var id = location.hash.slice(1); if(panelFor(id)) open(id, true); };
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }
})();
