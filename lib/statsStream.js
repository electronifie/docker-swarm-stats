const inherits = require("inherits");
const Writable = require('stream').Writable;

module.exports = function (collector, containerId) {
  let ws = Writable({ objectMode: true });

  ws._write = function(data, enc, cb) {
    if (data.cpu_stats && data.precpu_stats) {
      collector.handle({
        id: containerId,
        cpu: {
          cpus: data.cpu_stats.cpu_usage.percpu_usage.length,
          
          total: data.cpu_stats.cpu_usage.total_usage,
          totalPre: data.precpu_stats.cpu_usage.total_usage,
          
          system: data.cpu_stats.system_cpu_usage,
          systemPre: data.precpu_stats.system_cpu_usage,
          
          user: data.cpu_stats.cpu_usage.usage_in_usermode,
          kernel: data.cpu_stats.cpu_usage.usage_in_kernelmode
        },
        memory: { 
          total: data.memory_stats.usage,
          rss: data.memory_stats.rss,
          max_usage: data.memory_stats.max_usage
        }
      });
    } else {
      collector.handle({
        id: containerId,
        cpu: {
          cpus: 1,
          
          total: 0,
          totalPre: 0,
          
          system: 1,
          systemPre: 1,
          
          user: 0,
          kernel: 0,
        },
        memory: { 
          total: 0,
          rss: 0,
          max_usage: 0
        }
      });
    }

    return cb();
  };

  return ws;
};

