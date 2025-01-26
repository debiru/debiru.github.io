(function() {
  'use strict';

  queryParameterProcess();
  setAnchorToGoTop();
  setAnchorTarget();
  setSlideId();
  addEventListenerBeforeReveal();

  function queryParameterProcess() {
    var body = document.body;
    var queryAssoc = Util.getAssocFromQuery();
    var setDataAttr = function(attrName, cond) { if (cond) body.setAttribute(attrName, 'true'); }

    setDataAttr('data-auto-slide', queryAssoc.mode === 'auto');
    setDataAttr('data-controls-hide', queryAssoc.noControl);
    setDataAttr('data-slide-number-hide', queryAssoc.noSlideNumber);
    setDataAttr('data-slide-number-total-hide', queryAssoc.noSlideNumberTotal);
    setDataAttr('data-timer-hide', queryAssoc.noTimer);
    setDataAttr('data-time-label-hide', queryAssoc.noTimeLabel);
  }

  function setAnchorToGoTop() {
    var reveal = document.querySelector('.reveal');

    setBackToTop();
    setAutoSlide();

    function setBackToTop() {
      var anchor = document.createElement('a');
      var href = location.href.replace(/#.*/, '').replace(/\?.*/, '');
      var queryAssoc = Util.getAssocFromQuery();
      delete queryAssoc.mode;
      href += Util.getQueryFromAssoc(queryAssoc, true);
      anchor.className = 'link-back-to-top';
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', '_self');
      anchor.innerHTML = 'Top へ';
      Util.appendTo(reveal, anchor);
    }

    function setAutoSlide() {
      var anchor = document.createElement('a');
      var href = location.href.replace(/#.*/, '').replace(/\?.*/, '');
      var queryAssoc = Util.getAssocFromQuery();
      queryAssoc.mode = 'auto';
      href += Util.getQueryFromAssoc(queryAssoc, true);
      anchor.className = 'link-back-to-top-auto';
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', '_self');
      anchor.innerHTML = 'Auto';
      Util.appendTo(reveal, anchor);
    }
  }

  function setAnchorTarget() {
    var anchors = document.querySelectorAll('a[href]');

    Util.each(anchors, function(idx, anchor) {
      var href = anchor.getAttribute('href');

      if (!anchor.hasAttribute('target') && !(/^#/.test(href))) {
        anchor.setAttribute('target', '_blank');
      }
    });
  }

  function setSlideId() {
    var hsList = document.querySelectorAll('.slides > section');
    var i, hlen = hsList.length;
    for (i = 0; i < hlen; ++i) {
      var sect = hsList[i];
      var vsList = sect.querySelectorAll('section');
      var k, vlen = vsList.length;
      if (vlen > 0) {
        for (k = 0; k < vlen; ++k) {
          sect = vsList[k];
          setId(sect, i, k);
        }
      }
      else {
        setId(sect, i);
      }
    }
    function setId(sect, hid, vid) {
      var id = 'slide-' + hid;
      if (vid > 0) id += '-' + vid;
      sect.id = id;
    }
  }

  function addEventListenerBeforeReveal() {
    document.addEventListener('keydown', function(evt) {
      if (window.Reveal && window.Reveal._preProcessKeydown) {
        window.Reveal._preProcessKeydown(evt);
      }
    }, false);
  }
}());
