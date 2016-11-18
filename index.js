#!/usr/bin/env node

const Docker = require('dockerode');
const program = require('commander');

const getContainers = require('./lib/containers');
const getNodes = require('./lib/nodes');
const getServices = require('./lib/services');
const formatOutput = require('./lib/formatOutput');

function clear() { console.log("\033[2J\033[1;1H"); }

program
  .version('1.0')
  .option('-h, --hostname <hostname>', 'Server hostname')
  .option('-p, --port <port>', 'Port')
  .option('-r, --refresh-time <refreshTime>', 'Refresh time')
  .parse(process.argv);

// Handle arguments
const hostname = program.hostname ? program.hostname : "localhost";
const port = program.port ? program.port : 2375;
const refreshTime = program.refreshTime ? program.refreshTime : 5000;

// Only supporting HTTP connections right now, not for any real reason.
const docker = new Docker({ host: hostname, port: port });

// Lost our default SIGINT handler...ANSI terminal characters ftw
process.on('SIGINT', function() {
  process.exit(0);
});

function work() {
  getNodes(docker, (err, res) => {
    if (err) throw new Error(err);

    let nodes = res;

    getContainers(nodes, port, (err, res) => {
      if (err) throw new Error(err);

      let containers = res;
      console.log(containers);

      getServices(docker, (err, res) => {
        if (err) throw new Error(err);

        clear();
        
        let services = res;

        nodes.sort((x, y) => x.hostname > y.hostname);

        console.log("Nodes =>");
        console.log(formatOutput.formatNodes(nodes) + "\n");

        console.log("Services =>");
        console.log(formatOutput.formatServices(services) + "\n");

        console.log("Containers =>");
        console.log(formatOutput.formatContainers(containers) + "\n");
      });
    });
  });
}

clear();
work();
setInterval(work, refreshTime);

