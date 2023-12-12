const Router = require("express").Router;
const router = Router();
//const path = require("path");
const fs = require("fs");

const mongoose = require("mongoose");

// CONECCION A MONGODB
const productosController = require("../controllers/productos.controller.js");
const productosModelo = require("../dao/DB/models/productos.modelo");
const tiposDeError = require("../utils/tiposDeError.js");

//------------------------------------------------------------------------ PETICION GET

router.get("/", async (req, res) => {
  try {
    const productos = await productosController.listarProductos(req, res);
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ productos });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//------------------------------------------------------------------------ PETICION GET con /:ID

router.get("/:id", productosController.obtenerProducto, (req, res) => {
  try {
    const productoDB = res.locals.productoDB;
    if (!productoDB) {
      return res.status(404).send("Producto no encontrado");
    }
    res.header("Content-type", "application/json");
    res.status(200).json({ productoDB });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
    
  }
});


//------------------------------------------------------------------------ PETICION POST

router.post("/", async (req, res) => {
  try {
    await productosController.crearProducto(req, res);
  } catch (error) {
    res.status(500).json({ error: "Error inesperado", detalle: error.message });
  }
});


//------------------------------------------------------------------------ PETICION PUT

router.put("/:id", async (req, res) => {
  let id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: "id inválido" });

  let modifica = req.body;

  if (
    !modifica.title ||
    !modifica.description ||
    !modifica.price ||
    !modifica.thumbnail ||
    !modifica.code ||
    !modifica.stock
  )
    return res.status(400).json({ error: "Faltan datos" });

  let validaCode = await productosModelo.findOne({
    code: modifica.code,
    _id: { $ne: id },
  });
  if (validaCode)
    return res
      .status(400)
      .json({ error: `Ya existe otro producto con code ${modifica.code}` });

  let existe = await productosModelo.findById(id);

  if (!existe)
    return res.status(404).json({ error: `Producto con id ${id} inexistente` });
  let resultado = await productosModelo.updateOne({ _id: id }, modifica);

  res.status(200).json({ resultado });
});

//------------------------------------------------------------------------ PETICION DELETE

router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: "id inválido" });

  let existe = await productosModelo.findById(id);

  if (!existe)
    return res.status(404).json({ error: `Producto con id ${id} inexistente` });
  let resultado = await productosModelo.deleteOne({ _id: id });

  res.status(200).json({ resultado });
  // res.redirect("/DBproducts");
});

module.exports = router;
