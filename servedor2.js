const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors'); // Importa o middleware cors

const app = express();
const PORT = process.env.PORT || 8080;

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

        // Aguarda o carregamento da imagem do perfil e a descrição
        await page.waitForSelector('meta[name="description"]');
        const description = await page.$eval('meta[name="description"]', el => el.content);

        // Pega a URL da foto do perfil
        const profilePicture = await page.$eval('img[alt="Instagram photo"]', img => img.src);

        // Envia os dados do perfil
        res.json({ username, description, profilePicture });
    } catch (error) {
        res.json({ error: 'Erro ao buscar os dados do perfil.' });
    } finally {
        await browser.close();
    }
});
// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});