# Usa imagem oficial do Node.js
FROM node:20

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas arquivos de dependência para aproveitar cache
COPY package*.json ./

# Instala dependências (com pdf-parse corrigido)
RUN npm install pdf-parse@1.0.1 && npm install

# Copia todos os arquivos do projeto, incluindo o PDF
COPY . .

# Expondo a porta usada pelo app
EXPOSE 3000

# Comando padrão para iniciar o servidor
CMD ["node", "index.js"]
