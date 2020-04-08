const MapNode = require('./MapNode')

class Map {
  constructor() {
    this.nodes = {}
  }

  getNodes() {
    return Object.values(this.nodes)
  }

  getUnownedNodes() {
    return this.getNodes()
      .filter(n => n.owner === MapNode.UNOWNED)
      .map(n => n.name)
  }

  getNeighbors(name) {
    return this.nodes[name].edges
  }

  getNode(name) {
    return this.nodes[name]
  }

  addNode(name) {
    this.nodes[name] = new MapNode(name)
  }

  connectNodes(nameA, nameB) {
    this.nodes[nameA].addEdge(nameB)
    this.nodes[nameB].addEdge(nameA)
  }

  addArmies(node, count) {
    this.nodes[node].incrementArmyCount(count)
  }

  removeArmies(node, count) {
    this.nodes[node].incrementArmyCount(-count)
  }

  claim(node, player, armies) {
    this.nodes[node].setOwner(player, armies)
  }
}

module.exports = Map