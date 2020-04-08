const Die = require('./Die')

describe('Die', () => {
  test('map random numbers to die numbers', () => {
    let die = new Die(() => 0)
    expect(die.roll()).toEqual(1)

    die = new Die(() => 0.99999)
    expect(die.roll()).toEqual(6)
  })
})