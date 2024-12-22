const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para buscar dados do perfil
app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Adiciona essas opções
    });
    const page = await browser.newPage();

    try {
        const profileUrl = `https://www.instagram.com/${username}/`;
        await page.goto(profileUrl, { waitUntil: 'networkidle2' });

        await page.waitForSelector('meta[name="description"]');
        const description = await page.$eval('meta[name="description"]', el => el.content);

        res.json({ username, description });
    } catch (error) {
        console.error('Erro ao buscar perfil do Instagram:', error);
        res.json({ error: 'Erro ao buscar os dados do perfil.' });
    } finally {
        await browser.close();
    }
});

// Teste simples de funcionamento
app.get('/', (req, res) => {
    res.send('Servidor funcionando no Railway!');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});