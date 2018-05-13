export function arrToMapJs(arr) {
    return arr.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {})
}
export function mapToArrJs(obj) {
    return Object.keys(obj).map(id => obj[id])
}
export function formatDateDMY(date) {
    let dd = date.getDate()
    if (dd < 10) dd = '0' + dd
    let mm = date.getMonth() + 1
    if (mm < 10) mm = '0' + mm
    let yy = date.getFullYear() % 100
    if (yy < 10) yy = '0' + yy
    return dd + '.' + mm + '.' + yy
}
export function formatDMYDate(date) {
    const arr = date.split('.')
    return new Date(Date.UTC('20' + arr[2], arr[1] - 1, arr[0], 0, 0, 0))
}
