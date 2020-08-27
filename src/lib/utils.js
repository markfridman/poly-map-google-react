function getMinY(data) {
  return data.reduce((min, p) => p.weight < min ? p.weight : min, data[0].weight);
}
function getMaxY(data) {
  return data.reduce((max, p) => p.weight > max ? p.weight : max, data[0].weight);
}

function generateRange(min, max, step) {
  let arr = [];
  for (let i = min; i <= max; i += step) {
    arr.push(i);
  }

  return arr;
}

export default { generateRange, getMaxY, getMinY }