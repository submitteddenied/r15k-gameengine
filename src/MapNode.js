const UNOWNED = 'UNOWNED'

class MapNode {
  constructor(name) {
    this.name = name
    this.edges = new Set()
    this.armyCount = 0
    this.owner = UNOWNED
  }

  addEdge(name) {
    this.edges.add(name)
  }

  setOwner(playerName, armies) {
    this.owner = playerName
    this.armyCount = armies
  }

  incrementArmyCount(count) {
    this.armyCount += count
  }
}

MapNode.UNOWNED = UNOWNED

module.exports = MapNode