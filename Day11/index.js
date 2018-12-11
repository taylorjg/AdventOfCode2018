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

const calculatePowerLevelOfRegion = (serialNumber, size, previousMap, region) => {
  const key = makeKey(region)
  const { x, y } = region
  if (previousMap.has(key)) {
    const maxX = x + size - 1
    const maxY = y + size - 1
    const xysLastCol = R.range(y, y + size - 1).map(y => ({ x: maxX, y }))
    const xysLastRow = R.range(x, x + size).map(x => ({ x, y: maxY }))
    const sumLastCol = R.sum(xysLastCol.map(calculatePowerLevelOfFuelCell(serialNumber)))
    const sumLastRow = R.sum(xysLastRow.map(calculatePowerLevelOfFuelCell(serialNumber)))
    return previousMap.get(key) + sumLastCol + sumLastRow
  } else {
    const xs = R.range(x, x + size)
    const ys = R.range(y, y + size)
    const fuelCells = R.chain(x => R.map(y => ({ x, y }), ys), xs)
    return R.sum(fuelCells.map(calculatePowerLevelOfFuelCell(serialNumber)))
  }
}

const calculatePowerLevelsOfRegionsWithSize = (serialNumber, size, previousMap) => {
  const max = 300 - size + 2
  const xs = R.range(1, max)
  const ys = R.range(1, max)
  const regions = R.chain(x => R.map(y => ({ x, y }), ys), xs)
  return regions.map(region => ({
    region,
    size,
    powerLevel: calculatePowerLevelOfRegion(serialNumber, size, previousMap, region)
  }))
}

const makeKey = region => `${region.x}-${region.y}`

const bestRegionWithSize = (serialNumber, size, previousMap) => {
  console.log(`[bestRegionWithSize] serialNumber: ${serialNumber}; size: ${size}`)
  const powerLevels = calculatePowerLevelsOfRegionsWithSize(serialNumber, size, previousMap)
  const map = new Map(powerLevels.map(pl => [makeKey(pl.region), pl.powerLevel]))
  const sorted = powerLevels.sort((a, b) => b.powerLevel - a.powerLevel)
  return [R.head(sorted), map]
}

const part1 = serialNumber => {
  const [best] = bestRegionWithSize(serialNumber, 3, new Map())
  const answer = `${best.region.x},${best.region.y}`
  console.log(`part 1 answer: ${answer}`)
}

const part2 = serialNumber => {
  const sizes = R.range(1, 301)
  const reducer = (acc, size) => {
    const [best, previousMap] = bestRegionWithSize(serialNumber, size, acc.previousMap)
    return {
      bests: [...acc.bests, best],
      previousMap
    }
  }
  const init = {
    bests: [],
    previousMap: new Map()
  }
  const { bests } = sizes.reduce(reducer, init)
  const sorted = bests.sort((a, b) => b.powerLevel - a.powerLevel)
  const best = R.head(sorted)
  const answer = `${best.region.x},${best.region.y},${best.size}`
  console.log(`part 2 answer: ${answer}`)
}

part1(7139)
part2(7139)
