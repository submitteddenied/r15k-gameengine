const Map = require('./Map')

describe('Map', () => {
  test('can be constructed', () => {
    const map = new Map()
    map.addNode('a')
    map.addNode('b')
    map.connectNodes('a', 'b')

    expect(map.getNeighbors('a')).toEqual(new Set('b'))
    expect(map.getNeighbors('b')).toEqual(new Set('a'))
  })

  test('computes unowned nodes', () => {
    const map = new Map()
    map.addNode('a')

    expect(map.getUnownedNodes()).toEqual(['a'])
  })
})