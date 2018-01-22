const GetRequest = (urlSearch) => {
  let theRequest = new Object() 
   if (urlSearch.indexOf('?') != -1) {
      var str = urlSearch.substr(1)
      strs = urlSearch.split('&')
      for(let i = 0; i < strs.length; i ++) {
         theRequest[strs[i].split('=')[0]]=unescape(strs[i].split('=')[1])
      }
   }
   return theRequest
}

const GetQueryString = (urlSearch, name) => {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
  var r = urlSearch.substr(1).match(reg)
  if (r != null) return unescape(r[2])
  return null
}

export default {
  GetRequest
}
