# Usa imagem oficial do Node.js
FROM node:20

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências para aproveitar cache de build
COPY package*.json ./

# Instala dependências declaradas no package.json (inclui pdf-parse se já estiver listado)
RUN npm install

# Copia todos os arquivos do projeto (incluindo MBVT20222.pdf)
COPY . .

# Expondo a porta do app (caso use Railway, ela vai setar automaticamente via env)
EXPOSE 3000

# Comando padrão para iniciar o servidor
CMD ["node", "index.js"]
