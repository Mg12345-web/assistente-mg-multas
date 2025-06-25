# Usa imagem oficial do Node.js
FROM node:20

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependências para aproveitar cache
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o restante do projeto, incluindo o PDF
COPY . .

# Expondo a porta do app (Railway define automaticamente via variável de ambiente)
EXPOSE 3000

# Comando padrão para iniciar o servidor
CMD ["node", "index.js"]
