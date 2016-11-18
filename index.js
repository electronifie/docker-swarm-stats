#!/usr/bin/env node

console.log("\033[2J\033[1;1H")

var Docker = require('dockerode');
var docker = new Docker({ host: process.argv[2], port: process.argv[3] });

var nodes = [];
var services = [];

process.on('SIGINT', function() {
  process.exit(0);
});

function work() {
  docker.listNodes((err, res) => {
    nodes = !res ? [] : res.map((e) => {
      return {
        hostname: e.Description.Hostname,
        memory: e.Description.Resources.MemoryBytes / 1024. / 1024.,
        labels: e.Description.Engine.Labels,
        role: e.Spec.Role
      };
    });

    docker.listServices((err, res) => {
      services = !res ? [] : res.map((e) => {
        return { 
          id: e.ID,
          name: e.Spec.Name,
          replicas: e.Spec.Mode.Replicated.Replicas
        };
      });

      console.log("\033[2J\033[1;1H")

      node = nodes.sort((x, y) => x.hostname > y.hostname);
      console.log("Nodes =>");
      console.log(nodes.map((e) => {
        return `Hostname: ${e.hostname}\tRole: ${e.role}\tLabels: ` + 
          Object.keys(e.labels).map((k) => `${k}=${e.labels[k]}`).join(", ")
      }).join("\n"));
      console.log("");

      console.log("Services =>");
      console.log(services.map((e) => {
        return `Service: ${e.name}\t\tReplicas: ${e.replicas}\tID: ${e.id}`;
      }).join("\n"));


    });
  });
}

setInterval(work, 1000)

