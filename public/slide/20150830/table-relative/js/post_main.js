(function() {
  'use strict';

  // Util.DEBUG = true;

  var Cache = {};
  var Process = {};

  keyControl();
  extSlideNumber();
  extProgress();
  marginController();

  function keyControl() {
    var body = document.body;
    var status = {
      isAvailabled: false,
      input: '',
      isMoved: false
    };
    var AVAILABLE = 'data-jump-available';
    var INPUT = 'data-jump-input';

    var keyProcess = {};
    var setKeyProcess = function(keyChar, func) {
      keyProcess[Util.Keys.get(keyChar)] = func;
    };
    var execKeyProcess = function(evt, keyCode) {
      if (!evt.ctrlKey && !evt.metaKey && keyProcess[keyCode] != null) {
        keyProcess[keyCode](evt);
      }
    };

    setKeyProcess('A', function(evt) {
      if (!evt.shiftKey) return;
      if (body.hasAttribute('data-auto-slide')) {
        Reveal.configure({ autoSlide: 0 });
      }
      else {
        Process.setCurrentSlideTime();
      }
      Util.toggleAttr(body, 'data-auto-slide');
    });
    setKeyProcess('C', function(evt) {
      if (!evt.shiftKey) return;
      Util.toggleAttr(body, 'data-controls-hide');
    });
    setKeyProcess('H', function(evt) {
      if (!evt.shiftKey) return;
      Util.toggleAttr(body, 'data-time-label-hide');
    });
    setKeyProcess('N', function(evt) {
      if (!evt.shiftKey) return;
      Util.toggleAttr(body, 'data-slide-number-hide');
    });
    setKeyProcess('M', function(evt) {
      if (!evt.shiftKey) return;
      Util.toggleAttr(body, 'data-slide-number-total-hide');
    });
    setKeyProcess('R', function(evt) {
      if (!evt.shiftKey) return;
      Reveal.slide(0, 0, 0);
      unsetAvailable();
    });
    setKeyProcess('T', function(evt) {
      if (!evt.shiftKey) return;
      Util.toggleAttr(body, 'data-timer-hide');
    });
    setKeyProcess('S', function(evt) {
      if (Process.setCurrentSlideAuto == null) return;

      if (Reveal.isAutoSliding()) {
        Reveal.configure({ autoSlide: false });
      }
      else {
        Process.setCurrentSlideTime();
      }
    });
    setKeyProcess('BACKSPACE', function(evt) {
      if (isAvailable()) backSpaceInputAndPreventHistoryBack();
    });
    setKeyProcess('ENTER', function(evt) {
      if (hasInput()) jumpPage();
    });
    setKeyProcess('SHIFT', function(evt) {
      toggleAvailable();
    });

    var options = {
      repeatKeyTime: 50,
      allowRepeatCond: function(evt) {
        return Util.Keys.isDigit(evt.keyCode) || evt.keyCode === Util.Keys.get('BACKSPACE');
      }
    };
    var keydownHandler = Util.makeDebounce(function(evt) {
      var code = evt.keyCode;

      execKeyProcess(evt, code);

      if (Util.Keys.isDigit(code)) {
        if (!isAvailable()) return;
        var num = Util.Keys.ctoi(code);
        setInput(getInput() + Util.stringCast(num));
      }
    }, options);

    function isAvailable() {
      return status.isAvailabled;
    }
    function setAvailable() {
      if (isAvailable()) return;
      status.isAvailabled = true;
      body.setAttribute(AVAILABLE, 'true');
      addDummyHistory();
    }
    function unsetAvailable() {
      body.removeAttribute(AVAILABLE);
      unsetInput();
      if (!status.isMoved) {
        removeDummyHistory();
      }
      status.isMoved = false;
      status.isAvailabled = false;
    }
    function toggleAvailable() {
      if (isAvailable()){
        unsetAvailable();
      }
      else {
        setAvailable();
      }
    }
    function hasInput() {
      return status.input !== '';
    }
    function getInput() {
      return status.input;
    }
    function setInput(str) {
      status.input = str;
      body.setAttribute(INPUT, getInput());
    }
    function unsetInput() {
      status.input = '';
      body.removeAttribute(INPUT);
    }
    function jumpPage() {
      var page = Util.intCast(getInput());
      unsetAvailable();
      Reveal.slide(page);
    }
    function addDummyHistory() {
      if (window.history.pushState == null) return;
      history.pushState(null, null, null);
    }
    function removeDummyHistory() {
      if (window.history.pushState == null) return;
      history.go(-1);
    }
    function backSpaceInputAndPreventHistoryBack() {
      addDummyHistory();
      setInput(getInput().slice(0, -1));
    }
    function slidechangedHandler() {
      if (isAvailable()) status.isMoved = true;
    }

    Reveal._preProcessKeydown = keydownHandler;
    Reveal.addEventListener('slidechanged', slidechangedHandler);
  }

  function extSlideNumber() {
    var slideNumber = document.querySelector('.reveal .slide-number');
    var hsList = document.querySelectorAll('.reveal .slides > section');
    var hlen = hsList.length;
    var indexhMax = hlen - 1;

    slideNumber.setAttribute('data-slide-count', hlen);
    slideNumber.setAttribute('data-last-index', indexhMax);
  }

  function extProgress() {
    var reveal = document.querySelector('.reveal');
    var slides = document.querySelector('.reveal .slides');
    var hsList = document.querySelectorAll('.reveal .slides > section');
    var hlen = hsList.length;
    var indexhMax = hlen - 1;
    var progress = document.createElement('div');

    if (Util.intCast(indexhMax) <= 0) return;

    progress.className = 'ext-progress';
    progress.setAttribute('data-slide-count', hlen);
    progress.setAttribute('data-last-index', indexhMax);

    setProgressBar();
    setTimer();
    autoSlide();

    Util.appendTo(reveal, progress);

    function setProgressBar() {
      var progressBar = document.createElement('div');

      progressBar.className = 'progress-bar';
      Util.appendTo(progress, progressBar);

      function updateProgressBar(evt) {
        progress.setAttribute('data-current-index', evt.indexh);
        var percentage = 100 * (evt.indexh / indexhMax);
        progressBar.style.width = percentage + '%';
      }

      Reveal.addEventListener('ready', updateProgressBar);
      Reveal.addEventListener('slidechanged', updateProgressBar);
    }

    function calculateSlidesTime() {
      if (Cache.calculateSlidesTime) return Cache.calculateSlidesTime;

      var rawTimeList = [], totalRawTime = 0, definedSectionCount = 0;
      var timeList = [], totalTimeList = [];
      var limitTime = Util.intCast(slides.getAttribute('data-limit-time'));
      var DEFAULT_TIME = 10;

      Util.each(hsList, function(i, section) {
        var sectionTime = Util.intCast(section.getAttribute('data-time'));
        if (sectionTime > 0) {
          ++definedSectionCount;
          totalRawTime += sectionTime;
          rawTimeList[i] = sectionTime;
        }
        else {
          rawTimeList[i] = null;
        }
      });
      var undefinedSectionTime = Util.numberCast(limitTime > 0 ? (limitTime - totalRawTime) / (hlen - definedSectionCount) : DEFAULT_TIME);

      Util.each(rawTimeList, function(i, sectionTime) {
        var calculatedTime = Util.def(sectionTime, undefinedSectionTime);
        timeList[i] = calculatedTime;
        totalTimeList[i] = Util.def(totalTimeList[i - 1], 0) + calculatedTime;
        hsList[i].setAttribute('data-calculated-time', calculatedTime);
      });

      var timeToIndex = {};
      Util.each(totalTimeList, function(idx, totalTime) {
        var startTime = idx > 0 ? totalTimeList[idx - 1] + 1 : 0;
        Util.forEq(startTime, totalTime, function(time) {
          timeToIndex[time] = idx;

          var intTime = Util.intCast(time);
          var i;
          for (i = intTime; timeToIndex[i] == null; --i) {
            timeToIndex[i] = idx - 1;
          }
        });
      });

      var result = {
        rawTimeList: rawTimeList,
        totalRawTime: totalRawTime,
        definedSectionCount: definedSectionCount,
        timeList: timeList,
        totalTimeList: totalTimeList,
        totalTime: totalTimeList[indexhMax],
        limitTime: limitTime,
        DEFAULT_TIME: DEFAULT_TIME,
        undefinedSectionTime: undefinedSectionTime,
        timeToIndex: timeToIndex
      };
      Cache.calculateSlidesTime = result;

      return result;
    }

    function setTimer() {
      var timeBar = document.createElement('div');
      var elapsedTime = 0;
      var times = calculateSlidesTime();

      if (Util.DEBUG) {
        alert(Util.sprintf('limit=%s, total=%s, user-total=%s, user-count=%s', times.limitTime, times.totalTime, times.totalRawTime, times.definedSectionCount));
      }
      else if (times.limitTime > 0 && times.limitTime < times.totalRawTime) {
        alert(Util.sprintf('Time Limit Exceeded: limit=%s, total=%s', times.limitTime, times.totalRawTime));
      }

      timeBar.className = 'time-bar';
      Util.prependTo(progress, timeBar);

      function updateTimer(evt) {
        ++elapsedTime;

        progress.setAttribute('data-time', elapsedTime);
        progress.setAttribute('data-time-minute', Util.zeroPadding(Util.intCast(elapsedTime / 60), 2));
        progress.setAttribute('data-time-second', Util.zeroPadding(elapsedTime % 60, 2));

        if (times.totalTime < elapsedTime) return;

        var currentIndex = Util.def(times.timeToIndex[elapsedTime], indexhMax + 1);
        var sectionElapsedTime = elapsedTime - Util.def(times.totalTimeList[currentIndex - 1], 0);

        var pastSectionPercentage = 100 * (currentIndex / indexhMax);
        var sectionTime = Util.def(times.timeList[currentIndex], times.DEFAULT_TIME);
        var sectionPercentage = 100 * (sectionElapsedTime / sectionTime);
        var percentage = Math.min(pastSectionPercentage + (sectionPercentage / indexhMax), 100);

        timeBar.style.width = percentage + '%';
      }

      setInterval(updateTimer, 1000);
    }

    function autoSlide() {
      var body = document.body;
      var linkBackToTopAuto = document.querySelector('.link-back-to-top-auto');

      if (linkBackToTopAuto && body.hasAttribute('data-auto-slide')) {
        if (linkBackToTopAuto.offsetTop > 0 && linkBackToTopAuto.offsetLeft === 0) {
          var evtObj = getCurrentEventObject();
          if (evtObj.indexh === 0 && evtObj.indexv === 0) {
            setTimeout(function() {
              evtObj = getCurrentEventObject();
              if (evtObj.indexh === 0 && evtObj.indexv === 0) {
                Reveal.right();
              }
            }, 5000);
          }
        }
      }

      function setAutoSlideTime(evt, timeSec) {
        var timeMillisec = evt.indexv === 0 ? timeSec * 1000 : 1;
        if (evt.indexh === 0) timeMillisec = 0;
        Reveal.configure({ autoSlide: timeMillisec });
      }
      Process.setAutoSlideTime = setAutoSlideTime;

      function getCurrentEventObject() {
        var index = Reveal.getIndices();
        var event = {
          currentSlide: Reveal.getCurrentSlide(),
          indexh: index.h,
          indexv: index.v
        };
        return event;
      }
      Process.getCurrentEventObject = getCurrentEventObject;

      function setCurrentSlideTime() {
        var evtObj = getCurrentEventObject();
        var sectionTime = Util.numberCast(evtObj.currentSlide.getAttribute('data-calculated-time'));
        setAutoSlideTime(evtObj, sectionTime);
      }
      Process.setCurrentSlideTime = setCurrentSlideTime;

      function setCurrentSlideAuto(evt) {
        var config = Reveal.getConfig();
        if (config.autoSlide === false) return;
        if (!body.hasAttribute('data-auto-slide')) return;

        var section = evt.currentSlide;
        var sectionTime = Util.numberCast(section.getAttribute('data-calculated-time'));
        setAutoSlideTime(evt, sectionTime);
      }
      Process.setCurrentSlideAuto = setCurrentSlideAuto;

      Reveal.addEventListener('ready', setCurrentSlideAuto);
      Reveal.addEventListener('slidechanged', setCurrentSlideAuto);
    }
  }

  function marginController() {
    var reveal = document.querySelector('.reveal');
    var config = Reveal.getConfig();
    var defaultMargin = config.margin;
    var delta = 0.1;

    var marginControl = document.createElement('div');
    marginControl.className = 'margin-control';

    var plus = document.createElement('span');
    plus.className = 'margin-plus';
    plus.innerHTML = '大';
    plus.addEventListener('click', plusTouchHandler);
    plus.addEventListener('touch', plusTouchHandler);
    Util.appendTo(marginControl, plus);

    var minus = document.createElement('span');
    minus.className = 'margin-minus';
    minus.innerHTML = '小';
    minus.addEventListener('click', minusTouchHandler);
    minus.addEventListener('touch', minusTouchHandler);
    Util.appendTo(marginControl, minus);

    var reset = document.createElement('span');
    reset.className = 'margin-reset';
    reset.innerHTML = '戻';
    reset.addEventListener('click', resetTouchHandler);
    reset.addEventListener('touch', resetTouchHandler);
    Util.appendTo(marginControl, reset);

    Util.appendTo(reveal, marginControl);

    function plusTouchHandler() {
      Reveal.configure({ margin: config.margin - delta });
    }
    function minusTouchHandler() {
      Reveal.configure({ margin: config.margin + delta });
    }
    function resetTouchHandler() {
      Reveal.configure({ margin: defaultMargin });
    }
  }
}());
