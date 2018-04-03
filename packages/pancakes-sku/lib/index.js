'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _array = require('@pancakes/array');

var _array2 = _interopRequireDefault(_array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  tag: {
    attribute: 'PropIds',
    childAttr: 'SkuProperties',
    id: 'SkuId',
    title: 'title',
    count: 'Quantity',
    prices: 'Price',
    selected: 'selected'
  },
  /**
   * 字典查询 字典生成
   */
  init: function init(skus) {
    var vm = this;

    var tagDef = vm.tag;
    var data = skus.reduce(function (obj, item) {
      var object = Object.assign({}, obj);
      var total = item[tagDef.attribute];
      total.sort(function (value1, value2) {
        return parseInt(value1, 10) - parseInt(value2, 10);
      });
      object[total.join(';')] = Object.assign({}, item);
      return object;
    }, {});
    var SKUResult = {};
    // 需要剔除count为 0 的库存
    var skuKeys = Object.keys(data).reduce(function (arr, key) {
      if (data[key][tagDef.count] > 0) {
        arr.push(key);
      }
      return arr;
    }, []);

    skuKeys.forEach(function (skuKey) {
      var sku = data[skuKey];
      var skuKeyAttrs = skuKey.split(';');
      var combArr = _array2.default.arrayCombine(skuKeyAttrs);
      for (var j = 0; j < combArr.length; j++) {
        var key = combArr[j].join(';');
        if (SKUResult[key]) {
          SKUResult[key].count += sku[tagDef.count];
          SKUResult[key].prices.push(sku[tagDef.prices]);
        } else {
          var price2 = sku[tagDef.prices];
          var skuId2 = sku[tagDef.id];
          SKUResult[key] = {
            count: sku[tagDef.count],
            prices: [price2],
            id: skuId2
          };
        }
      }
      var price = sku[tagDef.prices];
      var skuId = sku[tagDef.id];
      SKUResult[skuKey] = {
        count: sku[tagDef.count],
        prices: [price],
        id: skuId
      };
    });

    return SKUResult;
  },

  /**
   * sku点击事件
   */
  clickHandler: function clickHandler(item, obj) {
    var attributes = obj.skuClasses;
    var selectedTemp = obj.selectedTemp;
    attributes.forEach(function (info) {
      var selectedTempTitle = selectedTemp[info.TypeName];
      if (selectedTempTitle && selectedTempTitle.id === item.PropId) {
        selectedTemp[info.TypeName] = null;
      } else {
        info.SkuProperties.forEach(function (c) {
          if (c.PropId === item.PropId) {
            c.selected = false;
            selectedTemp[info.TypeName] = {};
            selectedTemp[info.TypeName].title = c.PropertieName;
            selectedTemp[info.TypeName].id = c.PropId;
          }
        });
      }
    });
    return selectedTemp;
  },

  /**
   * 处理sku数据
   */
  endHandler: function endHandler(obj) {
    var tagDef = this.tag;
    var selectedTemp = obj.selectedTemp || {};
    var attributes = obj.skuClasses;
    var skuResult = obj.skuResult;
    var skus = obj.skus;
    var nextState = {};
    // 根据已选中的selectedTemp，生成字典查询selectedIds
    var selectedIds = Object.keys(selectedTemp).reduce(function (arr, m) {
      if (selectedTemp[m]) {
        arr.push(selectedTemp[m].id);
      }
      return arr;
    }, []);
    selectedIds.sort(function (value1, value2) {
      return parseInt(value1, 10) - parseInt(value2, 10);
    });

    // 处理attributes数据，根据字典查询结果计算当前选择情况的价格范围以及总数量。
    // 并添加selected属性，用于render判断。
    // if (attributes) {
    //   return
    // }
    attributes.forEach(function (m) {
      var selectedObjId = void 0;
      var nTitle = m.TypeName;
      var item = m[tagDef.childAttr];
      item.forEach(function (a) {
        var tempTitle = selectedTemp[nTitle];
        var aId = a.PropId;
        a.selected = !!(tempTitle && selectedTemp[nTitle].id === aId);
        if (!a.selected) {
          var testAttrIds = [];
          if (selectedTemp[nTitle]) {
            selectedObjId = selectedTemp[nTitle].id;
            for (var i = 0; i < selectedIds.length; i++) {
              selectedIds[i] !== selectedObjId && testAttrIds.push(selectedIds[i]);
            }
          } else {
            testAttrIds = selectedIds.concat();
          }
          testAttrIds = testAttrIds.concat(aId);
          testAttrIds.sort(function (value1, value2) {
            return parseInt(value1, 10) - parseInt(value2, 10);
          });
          var testAJoin = testAttrIds.join(';');
          var unselectable = !skuResult[testAJoin];
          a.unselectable = unselectable;
        }
      });
    });
    nextState.submitalbe = false;
    var selectedIdsJoin = selectedIds.join(';');
    var skuResultSelect = skuResult[selectedIdsJoin];
    if (skuResultSelect) {
      var prices = skuResultSelect.prices;
      var max = Math.max.apply(Math, prices);
      var min = Math.min.apply(Math, prices);
      nextState.price = max === min ? max : min + '~' + max;
      if (selectedIds.length === attributes.length) {
        nextState.submitalbe = true;
        nextState.skuID = skuResultSelect.id;
        nextState.price = skuResultSelect.prices[0];
      }
      nextState.count = skuResultSelect.count;
      // nextState.skuID = skuResultSelect.id
    } else {
      nextState.count = skus.reduce(function (count, item) {
        return count + item[tagDef.count];
      }, 0);
      // nextState.skuID = skuResultSelect.id
    }
    if (Object.keys(nextState).length > 0) {
      return nextState;
    }
    console.error('nextState err', nextState);
    return null;
  }
};