import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en un módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, 'db', 'deportes.json');

// Middleware para leer el archivo JSON
const leerDeportes = async () => {
  const data = await readFile(filePath, 'utf8');
  return JSON.parse(data);
};

// Middleware para escribir en el archivo JSON
const escribirDeportes = async (data) => {
  await writeFile(filePath, JSON.stringify(data, null, 2));
};

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Leer (JSON)
app.get('/deportes', async (req, res) => {
  try {
    const deportes = await leerDeportes();
    res.json(deportes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al leer los datos' });
  }
});

// Crear
app.post('/agregar', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    if (!nombre || !precio) {
      return res.status(400).json({ ok: false, error: 'Nombre y precio son requeridos' });
    }

    const nuevoDeporte = { nombre, precio };
    const deportes = await leerDeportes();
    deportes.push(nuevoDeporte);
    await escribirDeportes(deportes);
    res.json(nuevoDeporte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al agregar el deporte' });
  }
});

// Borrar
app.delete('/borrar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const deportes = await leerDeportes();
    const nuevosDeportes = deportes.filter((deporte) => deporte.nombre !== nombre);

    if (deportes.length === nuevosDeportes.length) {
      return res.status(404).json({ ok: false, error: 'Deporte no encontrado' });
    }
    await escribirDeportes(nuevosDeportes);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al borrar el deporte' });
  }
});

// Editar
app.put('/editar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const { nuevoPrecio } = req.body;
    if (!nuevoPrecio) {
      return res.status(400).json({ ok: false, error: 'Nuevo precio es requerido' });
    }

    const deportes = await leerDeportes();
    const indiceDeporte = deportes.findIndex((deporte) => deporte.nombre === nombre);
    if (indiceDeporte === -1) {
      return res.status(404).json({ ok: false, error: 'Deporte no encontrado' });
    }
    deportes[indiceDeporte].precio = nuevoPrecio;
    await escribirDeportes(deportes);
    res.json(deportes[indiceDeporte]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al editar el deporte' });
  }
});

// Ruta 404
app.all('*', (req, res) => {
  res.status(404).send('Sitio no encontrado...');
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
