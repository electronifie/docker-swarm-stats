const inherits = require("inherits");
const Writable = require('stream').Writable;

module.exports = function (collector, containerId) {
  let ws = Writable({ objectMode: true });

  ws._write = function(data, enc, cb) {
    //console.log("data: %j", data);
    
    collector.handle({
      id: containerId,
      ts: new Date(data.read).getTime(),
      cpu: {
        total: data.cpu_stats.cpu_usage.total_usage,
        user: data.cpu_stats.cpu_usage.usage_in_usermode,
        kernel: data.cpu_stats.cpu_usage.usage_in_kernelmode
      },
      memory: { 
        total: data.memory_stats.usage,
        rss: data.memory_stats.rss,
        max_usage: data.memory_stats.max_usage
      }
    });

    return cb();
  };

  return ws;
};

