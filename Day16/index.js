const R = require('ramda')
const util = require('util')
const fs = require('fs')

const readFile = util.promisify(fs.readFile)

const parseSample = lines => {
  return {
    registersBefore: parseRegisters(lines[0]),
    instruction: parseInstruction(lines[1]),
    registersAfter: parseRegisters(lines[2])
  }
}

const parseSamples = lines =>
  R.splitEvery(4, lines).map(parseSample)

const parseRegisters = line => {
  const match = /\[(\d+), (\d+), (\d+), (\d+)\]/.exec(line)
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4])
  ]
}

const parseInstruction = line => {
  const match = /(\d+) (\d+) (\d+) (\d+)/.exec(line)
  return {
    opcode: Number(match[1]),
    input1: Number(match[2]),
    input2: Number(match[3]),
    output: Number(match[4])
  }
}

const parseInstructions = lines => lines.map(parseInstruction)

const findDivider = lines => {
  let numBlankLinesSeen = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length === 0)
      numBlankLinesSeen++
    else
      numBlankLinesSeen = 0
    if (numBlankLinesSeen === 3) return i - 2
  }
}

const setRegister = (registers, output, value) =>
  R.update(output, value, registers)

const addr = (instruction, registers) => {
  const value = registers[instruction.input1] + registers[instruction.input2]
  return setRegister(registers, instruction.output, value)
}

const addi = (instruction, registers) => {
  const value = registers[instruction.input1] + instruction.input2
  return setRegister(registers, instruction.output, value)
}

const mulr = (instruction, registers) => {
  const value = registers[instruction.input1] * registers[instruction.input2]
  return setRegister(registers, instruction.output, value)
}

const muli = (instruction, registers) => {
  const value = registers[instruction.input1] * instruction.input2
  return setRegister(registers, instruction.output, value)
}

const banr = (instruction, registers) => {
  const value = registers[instruction.input1] & registers[instruction.input2]
  return setRegister(registers, instruction.output, value)
}

const bani = (instruction, registers) => {
  const value = registers[instruction.input1] & instruction.input2
  return setRegister(registers, instruction.output, value)
}

const borr = (instruction, registers) => {
  const value = registers[instruction.input1] | registers[instruction.input2]
  return setRegister(registers, instruction.output, value)
}

const bori = (instruction, registers) => {
  const value = registers[instruction.input1] | instruction.input2
  return setRegister(registers, instruction.output, value)
}

const setr = (instruction, registers) => {
  const value = registers[instruction.input1]
  return setRegister(registers, instruction.output, value)
}

const seti = (instruction, registers) => {
  const value = instruction.input1
  return setRegister(registers, instruction.output, value)
}

const gtir = (instruction, registers) => {
  const value = instruction.input1 > registers[instruction.input2] ? 1 : 0
  return setRegister(registers, instruction.output, value)
}

const gtri = (instruction, registers) => {
  const value = registers[instruction.input1] > instruction.input2 ? 1 : 0
  return setRegister(registers, instruction.output, value)
}

const gtrr = (instruction, registers) => {
  const value = registers[instruction.input1] > registers[instruction.input2] ? 1 : 0
  return setRegister(registers, instruction.output, value)
}

const eqir = (instruction, registers) => {
  const value = instruction.input1 === registers[instruction.input2] ? 1 : 0
  return setRegister(registers, instruction.output, value)
}

const eqri = (instruction, registers) => {
  const value = registers[instruction.input1] === instruction.input2 ? 1 : 0
  return setRegister(registers, instruction.output, value)
}

const eqrr = (instruction, registers) => {
  const value = registers[instruction.input1] === registers[instruction.input2] ? 1 : 0
  return setRegister(registers, instruction.output, value)
}

const testInstruction = sample => {
  const { instruction, registersBefore, registersAfter } = sample
  const fns = [
    addr,
    addi,
    mulr,
    muli,
    bani,
    banr,
    borr,
    bori,
    setr,
    seti,
    gtir,
    gtri,
    gtrr,
    eqir,
    eqri,
    eqrr
  ]
  let count = 0
  for (fn of fns) {
    const result = fn(instruction, registersBefore)
    if (R.equals(result, registersAfter)) count++
  }
  return count
}

const parseLines = lines => {
  const pos = findDivider(lines)
  const samplesLines = lines.slice(0, pos)
  const instructionsLines = lines.slice(pos + 3)
  const samples = parseSamples(samplesLines)
  const instructions = parseInstructions(instructionsLines)
  return [samples, instructions]
}

const part1 = samples => {
  const counts = samples.map(testInstruction)
  const answer = counts.filter(count => count >= 3).length
  console.log(`part 1 answer: ${answer}`)
}

const main = async () => {
  const buffer = await readFile('Day16/input.txt', 'utf8')
  // const buffer = await readFile('Day16/test.txt', 'utf8')
  const lines = buffer.trim().split('\n')
  const [samples, instructions] = parseLines(lines)
  part1(samples)
}

main()
