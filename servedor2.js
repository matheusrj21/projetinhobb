const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5432;

app.use(cors());

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para buscar dados do perfil
app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;

    // Validação do nome de usuário
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.json({ error: 'Nome de usuário inválido.' });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        const profileUrl = `https://www.instagram.com/${username}/`;
        
        // Log para verificar se o navegador está indo para a URL correta
        console.log(`Acessando: ${profileUrl}`);
        
        await page.goto(profileUrl, { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
        });

        // Aguarda a presença da meta descrição
        await page.waitForSelector('meta[name="description"]', { timeout: 15000 });
        const description = await page.$eval('meta[name="description"]', el => el.content);

        // Log para verificar se o seletor da imagem está correto
        const profilePicture = await page.$eval(
            'img[alt^="Foto do perfil de"]',
            el => el.src
        );
        
        console.log(`Imagem do perfil: ${profilePicture}`);

        res.json({ username, description, profilePicture });
    } catch (error) {
        console.error(`Erro ao buscar perfil do Instagram para o usuário ${username}:`, error);
        res.json({ error: 'Erro ao buscar os dados do perfil. Pode ser que o perfil esteja privado ou não exista.' });
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