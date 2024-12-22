
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Importa o middleware cors
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Ativa o CORS para todas as rotas
app.use(cors());

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para buscar dados do perfil
app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        const profileUrl = `https://www.instagram.com/${username}/`;
        await page.goto(profileUrl, { waitUntil: 'networkidle2' });

        await page.waitForSelector('meta[name="description"]');
        const description = await page.$eval('meta[name="description"]', el => el.content);

        res.json({ username, description });
    } catch (error) {
        res.json({ error: 'Erro ao buscar os dados do perfil.' });
    } finally {
        await browser.close();
    }
});

// Inicia o servidor
app.get('/', (req, res) => {
    res.send('Servidor funcionando no Railway!');
  });
  
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
