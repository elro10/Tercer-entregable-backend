import express from 'express';
import router from './ProductManager.js';

class Server {
    
    constructor() {
        this.app = express();
        this.port = 8080;

        this.middlewares();
        this.routes();
    }


    middlewares() {
        this.app.use(express.urlencoded({ extended: true }));
    }
    routes() {
        this.app.use('', router);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        })
    }
}

const server = new Server();

server.listen();