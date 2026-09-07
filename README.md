# Global Truck Cargas

Mini site para uma empresa virtual do Global Truck Simulator.

## Funcionalidades

- Página pública para seus amigos visualizarem as cargas.
- Somente o administrador consegue criar, editar e excluir.
- Login simples por senha.
- Cadastro de carga, valor, coleta, entrega, placa, motorista, data, observação e status.
- PostgreSQL para salvar as cargas.
- Atualização automática da lista a cada 15 segundos.
- Responsivo para celular.

## Publicar no Render

1. Crie um banco PostgreSQL no Render.
2. Crie um Web Service usando este projeto.
3. Configure as variáveis:
   - `DATABASE_URL` = URL interna/externa do seu PostgreSQL fornecida pelo Render.
   - `ADMIN_PASSWORD` = sua senha de administrador.
   - `JWT_SECRET` = uma chave secreta longa. Se usar `render.yaml`, o Render pode gerar automaticamente.
4. Build Command: `npm install`
5. Start Command: `npm start`

## Importante

Não deixe a senha padrão `123456` em produção. Defina `ADMIN_PASSWORD` no Render.

O banco cria automaticamente a tabela `cargas` na primeira inicialização.

## Estrutura

- `server.js` — servidor e API.
- `public/index.html` — página.
- `public/style.css` — visual.
- `public/app.js` — funcionamento do painel.
- `package.json` — dependências.
- `render.yaml` — configuração opcional do Render.
