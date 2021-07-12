const { Server } = require("net");

const END = "end";
const host = "0.0.0.0";

const connections = new Map();

const errorHandler = (err) => {
  console.error(err);
  process.exit(1);
};

const sendMessage = (message, origin) => {
  for (const socker of connections.keys()) {
    if (socker !== origin) {
      socker.write(message);
    }
  }
}

const listen = (port) => {
  const server = new Server();
  server.on("error", (err) => errorHandler(err.message));

  server.on("connection", (socker) => {
    server.on("error", (err) => errorHandler(err.message));
    socker.setEncoding("utf-8");

    const remoteSocket = `${socker.remoteAddress} on port ${socker.remotePort}`;
    console.log(`New connection from ${remoteSocket}`);

    socker.on("data", (message) => {
      if (!connections.has(socker)) {
	console.log(`Username ${message} set for connection ${remoteSocket}`)
	connections.set(socker, message)
      }
      else if (message === END) {
	connections.delete(socker)
        socker.end();
      } else {
	const fullMessage = `[${connections.get(socker)}]: ${message}`
	console.log(`${remoteSocket} -> ${fullMessage}`);
	sendMessage(fullMessage, socker);
      }
    });

    socker.on("close", () => {
      console.log(`Connection with ${remoteSocket} closed`);
    });
  });

  server.listen({ port, host }, () => {
    console.log("Listening on port 8000");
  });
};

const main = () => {
  if (process.argv.length !== 3) {
    errorHandler(`USAGE: node ${__filename} port`);
  }

  let port = process.argv[2];

  if (isNaN(port)) {
    errorHandler(`Invalid port ${port}`);
  }

  port = Number(port);

  listen(port);
};

if (require.main === module) {
  main();
}
