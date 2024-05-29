const express = require('express');
const app = express();
const fs = require('fs').promises

app.listen(3000);

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.get("/deportes", async (req, res) => {
  res.sendFile(__dirname + "/data.json")
})

app.get("/agregar", async (req, res) => {
  const { nombre, precio } = req.query;
  const deportesJSON = await fs.readFile("data.json")
  const { deportes } = JSON.parse(deportesJSON);
  deportes.push({
    nombre,
    precio,
  });
  await fs.writeFile("data.json", JSON.stringify({ deportes }))
  res.send("Agregado con éxito")
})


app.get("/editar", async (req, res) => {
  const { nombre, precio } = req.query;
  const deportesJSON = await fs.readFile("data.json")
  let { deportes } = JSON.parse(deportesJSON);
  deportes = deportes.map((d) => {
    if (d.nombre == nombre) {
      d.precio = precio;
      return d;
    }
    return d;
  });
  await fs.writeFile("data.json", JSON.stringify({ deportes }))
  res.send("Editado con éxito con éxito")
})

app.get("/eliminar", async (req, res) => {
  const { nombre } = req.query;
  const deportesJSON = await fs.readFile("data.json")
  let { deportes } = JSON.parse(deportesJSON);
  deportes = deportes.filter((d) => d.nombre !== nombre);
  await fs.writeFile("data.json", JSON.stringify({ deportes }))
  res.send("Eliminado con éxito con éxito")
})


