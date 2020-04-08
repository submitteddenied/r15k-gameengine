const MapNode = require('./MapNode')

describe('MapNode', () => {
  test('edges', () => {
    const node = new MapNode('a')
    node.addEdge('b')
    node.addEdge('c')

    expect(node.edges).toEqual(new Set(['b', 'c']))
  })

  test('owner', () => {
    const node = new MapNode('neverland')
    node.setOwner('michael', 2)

    expect(node.owner).toEqual('michael')
    expect(node.armyCount).toEqual(2)
  })

  test('increment armies', () => {
    const node = new MapNode('neverland')
    node.setOwner('michael', 2)

    node.incrementArmyCount(5)

    expect(node.armyCount).toEqual(7)
  })
})