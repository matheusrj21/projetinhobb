const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']  // Adicionando a opção para evitar o erro
    });
    const page = await browser.newPage();

    try {
        const profileUrl = `https://www.instagram.com/${username}/`;
        await page.goto(profileUrl, { waitUntil: 'networkidle2' });

        // Espera o seletor da foto do perfil aparecer e pega a URL da imagem
        await page.waitForSelector('img[alt^="Foto do perfil"]');
        const profilePic = await page.$eval('img[alt^="Foto do perfil"]', (img) => img.src);

        // Extração da descrição do perfil
        await page.waitForSelector('meta[name="description"]');
        const description = await page.$eval('meta[name="description"]', el => el.content);

        res.json({
            username,
            description,
            profilePic, // Passa a URL da imagem do perfil
        });
    } catch (error) {
        res.json({ error: 'Erro ao buscar os dados do perfil.' });
    } finally {
        await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});