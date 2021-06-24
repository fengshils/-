/**
 * 判断value是否在list里
 * @param {*} search 
 * @param {*} array 
 * @returns 
 */
function in_array(search,array){
    for(var i in array){
        if(array[i]==search){
            return true;
        }
    }
    return false;
}


/**
 * 时间戳转换方法    date:时间戳数字
 * @param {*} date 
 * @returns 
 */
function formatDate (date) {
    // eslint-disable-next-line no-redeclare
    var date = new Date(date)
    var YY = date.getFullYear() + '-'
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    return YY + MM + DD + ' ' + hh + mm + ss
  }

module.exports = {
   in_array,
   formatDate
}
