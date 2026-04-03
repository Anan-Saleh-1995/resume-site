const net = require('node:net');

const findOpenPort = (startPort, host = '0.0.0.0') =>
  new Promise((resolve, reject) => {
    const tryPort = (port) => {
      const server = net.createServer();

      server.unref();
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          tryPort(port + 1);
          return;
        }

        reject(error);
      });

      server.listen(port, host, () => {
        const address = server.address();
        const freePort =
          typeof address === 'object' && address ? address.port : port;

        server.close(() => resolve(freePort));
      });
    };

    tryPort(startPort);
  });

module.exports = { findOpenPort };
