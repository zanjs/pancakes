const getFlagArrs = (m, n) => {
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
}

const arrayCombine = (targetArr) => {
  if (!targetArr || !targetArr.length) {
    return []
  }
  const len = targetArr.length
  const resultArrs = []
  for (let n = 1; n < len; n++) {
    const flagArrs = getFlagArrs(len, n)
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
}

export default {arrayCombine, getFlagArrs}
