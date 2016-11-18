#!/usr/bin/env node

console.log("\033[2J\033[1;1H")

const Docker = require('dockerode');
const program = require('commander');


program
  .version('1.0')
  .option('-p, --port <port>', 'Port')
  .option('-h, --hostname <hostname>', 'Server hostname')
  .parse(process.argv);

// Handle arguments
const hostname = program.hostname ? program.hostname : "localhost";
const port = program.port ? program.port : 27017;

const docker = new Docker({ host: hostname, port: port });

var nodes = [];
var services = [];

// Lost our default SIGINT handler...ANSI terminal characters ftw
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

