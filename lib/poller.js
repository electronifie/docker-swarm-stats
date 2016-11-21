#!/usr/bin/env node


const getContainers = require('./containers');
const getNodes = require('./nodes');
const getServices = require('./services');
const formatOutput = require('./formatOutput');

module.exports = function poller (docker, statsCollector, port, cb) {
  var data = {};

  getNodes(docker, (err, res) => {
    if (err) return cb(err);

    let nodes = res;
    data.nodes = res;

    getContainers(nodes, port, (err, res) => {
      if (err) return cb(err);

      let containers = res;
      data.containers = res;

      statsCollector.updateContainerIds(containers.map((e) => e.id));

      getServices(docker, (err, res) => {
        if (err) return cb(err);

        data.services = res;
        data.stats = statsCollector.stats;

        cb(null, data);
      });
    });
  });
}


