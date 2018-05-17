export function arrToMapJs(arr) {
    return arr.reduce((acc, item) => {
        acc[item.id] = item
        return acc
    }, {})
}
export function mapToArrJs(obj) {
    return Object.keys(obj).map(id => obj[id])
}