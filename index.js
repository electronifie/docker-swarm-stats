#!/usr/bin/env node

const Docker = require('dockerode');
const term = require('terminal-kit').terminal;
const program = require('commander');
const poller = require('./lib/poller');
const StatsCollector = require('./lib/statsCollector');

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

// Create StatsCollector for streaming stats api
const statsCollector = new StatsCollector(`http://${hostname}:${port}`);

// Generic terminate function
function terminate() {
  term.grabInput(false);
  process.exit(0);
}

// trivial trimmer/right-padder
function padTrim(orig, len) {
  let dest = " ".repeat(len).split("");

  for (let i = 0; i < len && i < orig.length; i++) {
    dest[i] = orig[i];
  }

  return dest.join("");
}

// Set up our exit keys
term.grabInput(true)
term.on( 'key' , function(name, matches, data ) {
  if (name === 'CTRL_C' || name === "q") terminate();
});

function drawScreen(data) {
  let [ height, width ] = [ term.height, term.width ];
 
  // header summary
  term
    .clear()
    .moveTo(1, 1)
    .blue()
    .bold("Nodes: ")
    .styleReset()
    .defaultColor(data.nodes.length);
  
  term
    .moveTo(12, 1)
    .magenta()
    .bold("Services: ")
    .styleReset()
    .defaultColor(data.services.length);
  
  term
    .moveTo(28, 1)
    .cyan()
    .bold("Containers: ")
    .styleReset()
    .defaultColor(data.containers.length);

  // nodes header
  term
    .blue()
    .bold("\n\n=== Nodes === ")
    .styleReset();

  // Print at most 10 nodes
  for (let i = 0; i < 10 && i < data.nodes.length; i++) {
    term
      .bold("\nHostname: ")
      .styleReset()
      .defaultColor(padTrim(data.nodes[i].hostname, 10))
      .bold("   Memory: ")
      .styleReset()
      .defaultColor(padTrim(data.nodes[i].memory + "mb", 10))
      .bold("   Role: ")
      .styleReset()
      .defaultColor(padTrim(data.nodes[i].role, 10))
      .bold("   Labels: ")
      .styleReset()
      .defaultColor(Object.keys(data.nodes[i].labels).map((k) => `${k}=${data.nodes[i].labels[k]}`).join(", "));
  }

  // services header
  term
    .magenta()
    .bold("\n\n=== Services === ")
    .styleReset();

  // Print at most 10 services
  for (let i = 0; i < 10 && i < data.services.length; i++) {
    term
      .bold("\nName: ")
      .styleReset()
      .defaultColor(padTrim(data.services[i].name, 14))
      .bold("   Replicas: ")
      .styleReset()
      .defaultColor(data.services[i].replicas)
  }


  // update with cpu/memory stats
  for (let i = 0; i < data.containers.length; i++) {
    data.containers[i].cpu = 
        statsCollector.stats[data.containers[i].id].cpuPercent > 0.
      ? statsCollector.stats[data.containers[i].id].cpuPercent
      : 0.

    data.containers[i].memory = 
        statsCollector.stats[data.containers[i].id].memory
      ? statsCollector.stats[data.containers[i].id].memory.total / 1024 / 1024
      : 0.00;

  }

  data.containers.sort((x, y) => x.cpu < y.cpu);

  // containers header
  term
    .cyan()
    .bold("\n\n=== Containers === ")
    .styleReset();

  // Print at most 10 nodes
  for (let i = 0; i < 10 && i < data.services.length; i++) {
    term
      .bold("\nHostname: ")
      .styleReset()
      .defaultColor(padTrim(data.containers[i].name, 14))
      .bold("   Name: ")
      .styleReset()
      .defaultColor(padTrim(data.containers[i].name, 10))
      .bold("   Image: ")
      .styleReset()
      .defaultColor(padTrim(data.containers[i].image, 10))
      .bold("   Status: ")
      .styleReset()
      .defaultColor(padTrim(data.containers[i].status, 10))
      .bold("   CPU%: ")
      .styleReset()
      .defaultColor(padTrim(String(data.containers[i].cpu), 10))
      .bold("   Memory%: ")
      .styleReset()
      .defaultColor(data.containers[i].memory.toFixed(2) + "mb")
  }

  term.moveTo(1, 1)
  
}

setInterval(() => {
  poller(docker, statsCollector, port, (err, res) => {
    if (err) {
      term.clear();
      console.error(err);
      terminate();
    }

    drawScreen(res);
  })
}, refreshTime);


