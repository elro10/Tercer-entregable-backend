import * as fs from 'fs/promises';
import { Router } from "express";

class ProductManager {

  #nextId
  #products

  constructor() {
    this.#nextId = 0;
    this.#products = [];
    this.path = './products.json'
  }

  async addProduct({ title, description, price, thumbnail, code, stock }) {
    try {
      if (!title || !description || !price || !thumbnail || !code || !stock) throw new Error('Todos los campos son obligatorios');

      const isExist = this.getProductExists('code', code);
      if (isExist) throw new Error(`El codigo: ${code} ingresado ya existe`);

      this.#products.push({
        id: this.#nextId++,
        title,
        description,
        price,
        thumbnail,
        code,
        stock
      });

      await fs.writeFile(this.path, JSON.stringify(this.#products));

      return `Producto creado con exito`;

    } catch (error) {
      return error;
    }
  }

  async getLastId() {
    try {
      let lastId = this.#nextId;
      const data = await this.getProducts();
      for (let i = 0; i < data.length; i++) {
        if (data[i].id > lastId) {
          lastId = data[i].id
        }
      }
      return lastId + 1;

    } catch (error) {
      return error;
    }
  }

  async getProducts() {
    try {
      const data = await this.readFile();
      return JSON.parse(data);

    } catch (error) {
      return { message: error.toString() }
    }
  }

  async getProductById(id) {
    try {
      const data = await this.readFile();
      const product = JSON.parse(data).find(product => product.id === id);

      if (!product) throw new Error("El producto no existe");

      return product;

    } catch (error) {
      return { message: error.toString() }
    }
  }

  async updateProductById(obj) {
    try {
      this.#products = this.#products.map(item => item.id === obj.id ? { ...item, ...obj } : item)
      await fs.writeFile(this.path, JSON.stringify(this.#products));
      return `Producto ID: ${obj.id} actualizado con exito`;

    } catch (error) {
      return error;
    }

  }

  async deleteProductById(id) {
    try {
      const isExist = this.getProductExists('id', id);
      if (!isExist) throw new Error(`No se encontro el id: ${id} para eliminar.`);

      this.#products = this.#products.filter(product => product.id !== id);
      await fs.writeFile(this.path, JSON.stringify(this.#products));
      return `Producto ID: ${id} eliminado con exito`;

    } catch (error) {
      return error;
    }
  }

  getProductExists(key, value) {
    return this.#products.find(product => product[key] === value);
  }

  async createFile() {
    try {
      await fs.readFile(this.path, { encoding: 'utf-8' });
      await this.loadProducts();
      this.#nextId = await this.getLastId();
      return 'El archivo ya se encuentra creado';
    } catch (error) {
      await fs.writeFile(this.path, '[]',);
      return 'Archivo creado con exito';
    }
  }

  async readFile() {
    try {
      const data = await fs.readFile(this.path, { encoding: 'utf-8' });
      return data;

    } catch (error) {
      return error;
    }
  }

  async loadProducts() {
    try {
      this.#products = await this.getProducts();
    } catch (error) {
      return error;
    }
  }
}



const productManager = new ProductManager();
const router = Router();

router.get('/products', async (req, res) => {
    const { limit } = req.query;
    const data = await productManager.getProducts();
    const result = limit ? data.slice(0, Number(limit)) : data;

    res.send(result)
});

router.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const data = await productManager.getProductById(Number(id));
    res.send(data);
})
export default router;