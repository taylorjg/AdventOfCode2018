const R = require('ramda')

const extractHundereds = n => {
  const s = n.toString()
  const length = s.length
  return length >= 3 ? parseInt(s[length - 3], 10) : 0
}

const calculatePowerLevelOfFuelCell = serialNumber => ({ x, y }) => {
  const rackId = x + 10
  return extractHundereds(((rackId * y) + serialNumber) * rackId) - 5
}

const calculatePowerLevelOfRegion = (serialNumber, { x, y }) => {
  const xs = R.range(x, x + 3)
  const ys = R.range(y, y + 3)
  const fuelCells = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  return R.sum(fuelCells.map(calculatePowerLevelOfFuelCell(serialNumber)))
}

const part1 = serialNumber => {
  const xs = R.range(0, 299)
  const ys = R.range(0, 299)
  const regions = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  const powerLevels = regions.map(region => ({
    region,
    powerLevel: calculatePowerLevelOfRegion(serialNumber, region)
  }))
  const sorted = powerLevels.sort((a, b) => b.powerLevel - a.powerLevel)
  const bestRegion = R.head(sorted).region
  const answer = `${bestRegion.x},${bestRegion.y}`
  console.log(`part 1 answer: ${answer}`)
}

part1(18)
part1(42)
part1(7139)
