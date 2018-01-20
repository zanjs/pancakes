export default {
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
  init (skus) {
    const vm = this

    const tagDef = vm.tag
    const data = skus.reduce((obj, item) => {
      const object = Object.assign({}, obj)
      const total = item[tagDef.attribute]
      total.sort(
        (value1, value2) => parseInt(value1, 10) - parseInt(value2, 10)
      )
      object[total.join(';')] = Object.assign({}, item)
      return object
    }, {})
    const SKUResult = {}
    // 需要剔除count为 0 的库存
    const skuKeys = Object.keys(data).reduce((arr, key) => {
      if (data[key][tagDef.count] > 0) {
        arr.push(key)
      }
      return arr
    }, [])

    skuKeys.forEach(skuKey => {
      const sku = data[skuKey]
      const skuKeyAttrs = skuKey.split(';')
      const combArr = vm.arrayCombine(skuKeyAttrs)
      for (let j = 0; j < combArr.length; j++) {
        const key = combArr[j].join(';')
        if (SKUResult[key]) {
          SKUResult[key].count += sku[tagDef.count]
          SKUResult[key].prices.push(sku[tagDef.prices])
        } else {
          const price2 = sku[tagDef.prices]
          const skuId2 = sku[tagDef.id]
          SKUResult[key] = {
            count: sku[tagDef.count],
            prices: [price2],
            id: skuId2
          }
        }
      }
      let price = sku[tagDef.prices]
      let skuId = sku[tagDef.id]
      SKUResult[skuKey] = {
        count: sku[tagDef.count],
        prices: [price],
        id: skuId
      }
    })

    return SKUResult
  },
  getFlagArrs (m, n) {
    if (!n || n < 1) {
      return []
    }
    const resultArrs = []
    const flagArr = []
    let isEnd = false
    let leftCnt
    for (let i = 0; i < m; i++) {
      flagArr[i] = i < n ? 1 : 0
    }
    resultArrs.push(flagArr.concat())
    while (!isEnd) {
      leftCnt = 0
      for (let i = 0; i < m - 1; i++) {
        if (flagArr[i] === 1 && flagArr[i + 1] === 0) {
          for (let j = 0; j < i; j++) {
            flagArr[j] = j < leftCnt ? 1 : 0
          }
          flagArr[i] = 0
          flagArr[i + 1] = 1
          const aTmp = flagArr.concat()
          resultArrs.push(aTmp)
          if (aTmp.slice(-n).join('').indexOf('0') === -1) {
            isEnd = true
          }
          break
        }
        flagArr[i] === 1 && leftCnt++
      }
    }
    return resultArrs
  },
  arrayCombine (targetArr) {
    if (!targetArr || !targetArr.length) {
      return []
    }
    const vm = this
    const len = targetArr.length
    const resultArrs = []
    for (let n = 1; n < len; n++) {
      const flagArrs = vm.getFlagArrs(len, n)
      while (flagArrs.length) {
        const flagArr = flagArrs.shift()
        const combArr = targetArr.reduce((combArr, m, index) => {
          flagArr[index] && combArr.push(m)
          return combArr
        }, [])
        resultArrs.push(combArr)
      }
    }
    return resultArrs
  },
  /**
   * sku点击事件
   */
  clickHandler (item, obj) {
    const attributes = obj.skuClasses
    const selectedTemp = obj.selectedTemp
    attributes.forEach((info) => {
      let selectedTempTitle = selectedTemp[info.TypeName]
      if (selectedTempTitle && selectedTempTitle.id === item.PropId) {
        selectedTemp[info.TypeName] = null
      } else {
        info.SkuProperties.forEach((c) => {
          if (c.PropId === item.PropId) {
            c.selected = false
            selectedTemp[info.TypeName] = {}
            selectedTemp[info.TypeName].title = c.PropertieName
            selectedTemp[info.TypeName].id = c.PropId
          }
        })
      }
    })
    return selectedTemp
  },
  /**
   * 处理sku数据
   */
  endHandler (obj) {
    const tagDef = this.tag
    const selectedTemp = obj.selectedTemp || {}
    const attributes = obj.skuClasses
    const skuResult = obj.skuResult
    const skus = obj.skus
    const nextState = {}
    // 根据已选中的selectedTemp，生成字典查询selectedIds
    const selectedIds = Object.keys(selectedTemp).reduce((arr, m) => {
      if (selectedTemp[m]) {
        arr.push(selectedTemp[m].id)
      }
      return arr
    }, [])
    selectedIds.sort((value1, value2) => parseInt(value1, 10) - parseInt(value2, 10))

    // 处理attributes数据，根据字典查询结果计算当前选择情况的价格范围以及总数量。
    // 并添加selected属性，用于render判断。
    // if (attributes) {
    //   return
    // }
    attributes.forEach((m) => {
      let selectedObjId
      let nTitle = m.TypeName
      let item = m[tagDef.childAttr]
      item.forEach((a) => {
        let tempTitle = selectedTemp[nTitle]
        let aId = a.PropId
        a.selected = !!(tempTitle && selectedTemp[nTitle].id === aId)
        if (!a.selected) {
          let testAttrIds = []
          if (selectedTemp[nTitle]) {
            selectedObjId = selectedTemp[nTitle].id
            for (let i = 0; i < selectedIds.length; i++) {
              (selectedIds[i] !== selectedObjId) && testAttrIds.push(selectedIds[i])
            }
          } else {
            testAttrIds = selectedIds.concat()
          }
          testAttrIds = testAttrIds.concat(aId)
          testAttrIds.sort((value1, value2) => parseInt(value1, 10) - parseInt(value2, 10))
          let testAJoin = testAttrIds.join(';')
          let unselectable = !skuResult[testAJoin]
          a.unselectable = unselectable
        }
      })
    })
    nextState.submitalbe = false
    const selectedIdsJoin = selectedIds.join(';')
    const skuResultSelect = skuResult[selectedIdsJoin]
    if (skuResultSelect) {
      const prices = skuResultSelect.prices
      const max = Math.max.apply(Math, prices)
      const min = Math.min.apply(Math, prices)
      nextState.price = max === min ? max : `${min}~${max}`
      if (selectedIds.length === attributes.length) {
        nextState.submitalbe = true
        nextState.skuID = skuResultSelect.id
        nextState.price = skuResultSelect.prices[0]
      }
      nextState.count = skuResultSelect.count
      // nextState.skuID = skuResultSelect.id
    } else {
      nextState.count = skus.reduce((count, item) => count + item[tagDef.count], 0)
      // nextState.skuID = skuResultSelect.id
    }
    if (Object.keys(nextState).length > 0) {
      return nextState
    }
    console.error('nextState err', nextState)
    return null
  }
}
