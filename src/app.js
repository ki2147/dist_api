const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {

  // Get the number of available CPU cores
  const numCPUs = os.cpus().length;

  // Create a worker for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });

} else {

  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  const appRoutes = require('./routes/approutes');
  const swaggerUi = require('swagger-ui-express');
  const swaggerJsDoc = require('swagger-jsdoc');

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Text Processor',
        version: '1.0.0',
        description: 'Check text sentiment and hide profanities.',
      },
    },
    apis: ['./src/routes/approutes.js'], 
  };
  
  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  app.use(bodyParser.json());
  app.use('/', appRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const port = 3000;
  app.listen(port, () => {
    console.log(`Worker ${process.pid} listening on port ${port}`);
  });
  
}
