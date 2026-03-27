'use strict';

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Blog
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});
app.get('/blog/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blog', `${req.params.slug}.html`), err => {
    if (err) res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// API: Formulario de contacto
app.post('/api/contacto', (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ ok: false, mensaje: 'Todos los campos son obligatorios.' });
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, mensaje: 'El correo electrónico no es válido.' });
  }

  // Aquí se integraría un servicio de envío de emails (nodemailer, SendGrid, etc.)
  console.log(`Nuevo mensaje de contacto de: ${nombre} <${email}> — Asunto: ${asunto}`);

  res.json({ ok: true, mensaje: '¡Mensaje recibido! Nos pondremos en contacto contigo pronto.' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor IoTeC corriendo en http://localhost:${PORT}`);
});
