// moveIndex moves an item from fromIndex to toIndex in an array, returning the array
export function moveIndex(array = [], fromIndex, toIndex, mutate = false) {
  if (fromIndex == null || toIndex == null) return array;

  let result;
  if (!mutate) {
    result = array.slice();
  } else {
    result = array;
  }

  let item;
  [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}
