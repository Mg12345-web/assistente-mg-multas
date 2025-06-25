# Usa imagem oficial do Node.js
FROM node:20

# Cria diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o projeto
COPY . .

# Expõe a porta usada pelo app
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "index.js"]
