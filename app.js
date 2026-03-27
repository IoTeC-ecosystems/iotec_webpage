'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const EMAIL         = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: EMAIL_PASSWORD,
  },
});

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
app.post('/api/contacto', async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ ok: false, mensaje: 'Todos los campos son obligatorios.' });
  }
  console.log(`Intento de contacto: ${nombre} <${email}> — Asunto: ${asunto}, Mensaje: ${mensaje.substring(0, 50)}...`);
  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, mensaje: 'El correo electrónico no es válido.' });
  }

  const mailOptions = {
    from: `"IoTeC Contacto" <${EMAIL}>`,
    to: EMAIL,
    subject: asunto ? `[Contacto IoTeC] ${asunto}` : '[Contacto IoTeC] Nuevo mensaje',
    text: `Nombre: ${nombre}\nCorreo: ${email}\n\n${mensaje}`,
    html: `<p><strong>Nombre:</strong> ${nombre}</p><p><strong>Correo:</strong> ${email}</p><hr><p>${mensaje.replace(/\n/g, '<br>')}</p>`,
  };

  try {
    console.log(`Enviando correo de contacto`);
    await transporter.sendMail(mailOptions);
    console.log(`Mensaje de contacto enviado, Asunto: ${asunto}`);
    res.json({ ok: true, mensaje: '¡Mensaje recibido! Nos pondremos en contacto contigo pronto.' });
  } catch (err) {
    console.error('Error al enviar el correo:', err);
    res.status(500).json({ ok: false, mensaje: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.' });
  }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor IoTeC corriendo en http://localhost:${PORT}`);
});
