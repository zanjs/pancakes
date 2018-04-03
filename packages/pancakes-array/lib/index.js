'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getFlagArrs = function getFlagArrs(m, n) {
  if (!n || n < 1) {
    return [];
  }
  var resultArrs = [];
  var flagArr = [];
  var isEnd = false;
  var leftCnt = void 0;
  for (var i = 0; i < m; i++) {
    flagArr[i] = i < n ? 1 : 0;
  }
  resultArrs.push(flagArr.concat());
  while (!isEnd) {
    leftCnt = 0;
    for (var _i = 0; _i < m - 1; _i++) {
      if (flagArr[_i] === 1 && flagArr[_i + 1] === 0) {
        for (var j = 0; j < _i; j++) {
          flagArr[j] = j < leftCnt ? 1 : 0;
        }
        flagArr[_i] = 0;
        flagArr[_i + 1] = 1;
        var aTmp = flagArr.concat();
        resultArrs.push(aTmp);
        if (aTmp.slice(-n).join('').indexOf('0') === -1) {
          isEnd = true;
        }
        break;
      }
      flagArr[_i] === 1 && leftCnt++;
    }
  }
  return resultArrs;
};

var arrayCombine = function arrayCombine(targetArr) {
  if (!targetArr || !targetArr.length) {
    return [];
  }
  var len = targetArr.length;
  var resultArrs = [];
  for (var n = 1; n < len; n++) {
    var flagArrs = getFlagArrs(len, n);

    var _loop = function _loop() {
      var flagArr = flagArrs.shift();
      var combArr = targetArr.reduce(function (combArr, m, index) {
        flagArr[index] && combArr.push(m);
        return combArr;
      }, []);
      resultArrs.push(combArr);
    };

    while (flagArrs.length) {
      _loop();
    }
  }
  return resultArrs;
};

exports.default = { arrayCombine: arrayCombine, getFlagArrs: getFlagArrs };