const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5432;  

// Configuração do CORS
const corsOptions = {
    origin: 'http://localhost:3000',  // Permite requisições do frontend local
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para buscar dados do perfil
app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;

    // Validação do nome de usuário
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return res.json({ error: 'Nome de usuário inválido.' });
    }

    let browser;
    try {
        // Inicia o Puppeteer com as opções para contornar restrições
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']  // Adiciona argumentos necessários para rodar em ambientes locais
        });
        const page = await browser.newPage();

        const profileUrl = `https://www.instagram.com/${username}/`;
        
        console.log(`Acessando: ${profileUrl}`);

        // Tenta acessar o perfil e aguardar o carregamento da página
        await page.goto(profileUrl, { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000  // Aumentando o tempo de timeout para 60 segundos
        });

        // Aguarda a presença do seletor meta-description
        await page.waitForSelector('meta[name="description"]', { timeout: 30000 });

        // Extrai as informações do perfil
        const description = await page.$eval('meta[name="description"]', el => el.content);
       

        console.log(`Descrição: ${description}`);
        

        // Retorna as informações como JSON
        res.json({ username, description });

    } catch (error) {
        console.error(`Erro ao buscar perfil do Instagram para o usuário ${username}:`, error);
        res.json({ error: 'Erro ao buscar os dados do perfil. Pode ser que o perfil esteja privado ou não exista.' });
    } finally {
        // Garante que o browser seja fechado mesmo em caso de erro
        if (browser) {
            await browser.close();
        }
    }
});

// Teste simples de funcionamento
app.get('/', (req, res) => {
    res.send('Servidor funcionando no localhost!');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
