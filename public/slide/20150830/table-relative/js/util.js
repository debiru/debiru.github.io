(function() {
  'use strict';

  var Util = {};
  window.Util = Util;

  Util.ord = function(char) {
    if (char == null) return null;
    return ('' + char).charCodeAt();
  };

  Util.chr = function(code) {
    return String.fromCharCode(code);
  };

  /**
   * Util.for(start, n, callback)
   * Util.for(n, callback)
   */
  Util.for = function(start, n, callback) {
    if (arguments.length === 2) {
      start = 0;
      n = arguments[0];
      callback = arguments[1];
    }
    for (var i = start; i < n; ++i) {
      if (callback(i) === false) return;
    }
  };

  /**
   * Util.forEq(start, n, callback)
   * Util.forEq(n, callback)
   */
  Util.forEq = function(start, n, callback) {
    if (arguments.length === 2) {
      start = 0;
      n = arguments[0];
      callback = arguments[1];
    }
    for (var i = start; i <= n; ++i) {
      if (callback(i) === false) return;
    }
  };

  /**
   * Util.forEqRev(start, end, callback)
   * Util.forEqRev(start, callback)
   */
  Util.forEqRev = function(start, end, callback) {
    if (arguments.length === 2) {
      start = arguments[0];
      end = 0;
      callback = arguments[1];
    }
    for (var i = start; i >= end; --i) {
      if (callback(i) === false) return;
    }
  };

  Util.keys = function(obj) {
    var result = [];
    for (var prop in obj) if (obj.hasOwnProperty(prop)) result.push(prop);
    return result;
  };

  Util.each = function(arg, callback) {
    if (arg == null) return;

    // Array like
    if (arg.length != null) {
      var i, len = arg.length;
      for (i = 0; i < len; ++i) {
        if (callback(i, arg[i], arg) === false) return;
      }
    }
    // Object
    else if (typeof arg === 'object') {
      var keys = Util.keys(arg);
      var i, len = keys.length;
      for (i = 0; i < len; ++i) {
        if (callback(keys[i], arg[keys[i]], arg) === false) return;
      }
    }
  };

  Util.Keys = (function() {
    var obj = {
      BACKSPACE : 8,
      TAB       : 9,
      ENTER     : 13,
      SHIFT     : 16,
      CTRL      : 17,
      CONTROL   : 17,
      ALT       : 18,
      CAPSLOCK  : 20,
      ESC       : 27,
      SPACE     : 32,
      LEFT      : 37,
      UP        : 38,
      RIGHT     : 39,
      DOWN      : 40,
      META      : 224
    };
    Util.forEq(Util.ord('0'), Util.ord('9'), function(i) {
      obj[Util.chr(i)] = i;
    });
    Util.forEq(Util.ord('A'), Util.ord('Z'), function(i) {
      obj[Util.chr(i)] = i;
    });

    obj.get = function(char) {
      return Util.Keys[char];
    };
    obj.ctoi = function(code) {
      return code - Util.Keys.get('0');
    };
    obj.isDigit = function(code) {
      return obj.get('0') <= code && code <= obj.get('9');
    };
    obj.isAlpha = function(code) {
      return obj.get('A') <= code && code <= obj.get('Z');
    };

    return obj;
  }());

  Util.def = function (args) {
    var i, len = arguments.length;
    for (i = 0; i < len; ++i) if (arguments[i] != null) break;
    return arguments[i];
  };

  Util.sprintf = function(format, args) {
    var p = 1, params = arguments;
    return format.replace(/%./g, function(m) {
      if (m === '%%') return '%';
      if (m === '%s') return params[p++];
      return m;
    });
  };

  Util.encodeUrl = function(str) {
    return encodeURIComponent(str);
  };

  Util.decodeUrl = function(str) {
    return decodeURIComponent(str);
  };

  Util.stringCast = function(arg) {
    if (arg == null) arg = '';
    return '' + arg;
  };

  Util.numberCast = function(arg) {
    arg = +arg;
    if (arg !== arg) arg = 0;
    return arg;
  };

  Util.intCast = function(arg) {
    return arg | 0;
  };

  Util.isRegExp = function(arg) {
    return arg instanceof RegExp;
  };

  Util.sort = function(arg) {
    return arg.sort(function(a, b) {
      if (typeof a === 'string' && typeof b === 'number') return 1;
      if (typeof a === 'number' && typeof b === 'string') return -1;
      return a < b ? -1 : (a > b ? 1 : 0);
    });
  };

  Util.trim = function(str, chars, noLtrim, noRtrim) {
    var len = str.length, firstIdx = 0, lastIdx = len - 1;
    var idxL = firstIdx, idxR = lastIdx;
    str = Util.stringCast(str);
    chars = Util.def(chars, /\s/);
    // RegExp
    if (Util.isRegExp(chars)) {
      if (!noLtrim) str = str.replace(new RegExp(Util.sprintf('^(?:%s)+', chars.source), 'g'), '');
      if (!noRtrim) str = str.replace(new RegExp(Util.sprintf('(?:%s)+$', chars.source), 'g'), '');
    }
    // String
    else {
      chars = Util.stringCast(chars);
      if (!noLtrim) while (idxL <= lastIdx && chars.indexOf(str.charAt(idxL)) !== -1) ++idxL;
      if (!noRtrim) while (idxR >= firstIdx && chars.indexOf(str.charAt(idxR)) !== -1) --idxR;
      str = str.slice(idxL, idxR + 1);
    }
    return str;
  };
  Util.ltrim = function(str, chars) { return Util.trim(str, chars, false, true); };
  Util.rtrim = function(str, chars) { return Util.trim(str, chars, true, false); };

  Util.getAssocFromQuery = function(query) {
    var assoc = {};

    if (query == null) query = location.search;
    query = query.replace(/^\?/, '');

    var params = query === '' ? [] : query.split('&');

    Util.each(params, function(idx, param) {
      var parts = param.split('=');
      var key = Util.decodeUrl(parts[0]);
      var val = parts[1] != null ? Util.decodeUrl(parts[1]) : true;
      assoc[key] = val;
    });

    return assoc;
  };

  Util.getQueryFromAssoc = function(assoc, useDelimiter) {
    var query = '';

    Util.each(assoc, function(key, val) {
      if (val === false || val == null) return;

      var param = Util.encodeUrl(key);
      if (val !== true) param += '=' + Util.encodeUrl(Util.stringCast(val));
      if (query !== '') query += '&';
      query += param;
    });
    if (useDelimiter && query !== '') query = '?' + query;

    return query;
  };

  Util.makeDebounce = function(func, options) {
    if (!options) options = {};

    var delayUntilRepeatTime = Util.def(options.delayUntilRepeatTime, 600);
    var repeatKeyTime = Util.def(options.repeatKeyTime, 100);
    var allowRepeatCond = Util.def(options.allowRepeatCond, function() { return false; });

    var prevent = false;
    var tid = null;
    var flagsKey = {};
    flagsKey[Util.Keys.get('SHIFT')] = true;
    flagsKey[Util.Keys.get('CONTROL')] = true;
    flagsKey[Util.Keys.get('ALT')] = true;
    flagsKey[Util.Keys.get('META')] = true;

    function cancelPrevent() {
      prevent = false;
    }

    return function(evt) {
      var interval;

      clearTimeout(tid);

      if (!prevent) {
        prevent = true;
        func.apply(this, arguments);
        interval = delayUntilRepeatTime;
      }
      else {
        interval = repeatKeyTime;
      }

      if (flagsKey[evt.keyCode] || allowRepeatCond(evt)) {
        cancelPrevent();
      }
      else {
        tid = setTimeout(cancelPrevent, interval);
      }
    };
  };

  Util.repeat = function(str, count) {
    if (str == null) return null;
    if (Util.intCast(count) < 0) return '';
    var result = '';
    str = str + '';
    for (;;) {
      if (count & 1) result += str;
      if ((count >>= 1) === 0) break;
      str += str;
    }
    return result;
  };

  Util.charPadding = function(str, len, char) {
    str = str + '';
    if (str.length >= len) return str;
    return (Util.repeat(char, len) + str).slice(-len);
  };

  Util.zeroPadding = function(str, len) {
    return Util.charPadding(str, len, 0);
  };

  Util.beforeTo = function(target, elem) {
    target.parentNode.insertBefore(elem, target);
  };

  Util.afterTo = function(target, elem) {
    target.parentNode.insertBefore(elem, target.nextShibling);
  };

  Util.prependTo = function(target, elem) {
    target.insertBefore(elem, target.firstChild);
  };

  Util.appendTo = function(target, elem) {
    target.appendChild(elem);
  };

  Util.toggleAttr = function(elem, attr, cond, value) {
    value = Util.def(value, 'true');
    cond = Util.def(cond, elem.hasAttribute(attr));
    if (cond) {
      elem.removeAttribute(attr);
    }
    else {
      elem.setAttribute(attr, value);
    }
  };
}());
