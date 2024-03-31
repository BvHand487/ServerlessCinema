// Returns true if all of the elements are contained in a target array.
module.exports.containsAll = (array, elems) => {
    return elems.every(e => array.includes(e))
}