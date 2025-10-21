FROM node:18-alpine
WORKDIR /app

# Instala dependencias primero para aprovechar cache
COPY package*.json ./
RUN npm install

# Copia el resto del código (en desarrollo se usa volumen)
COPY . .

# Expone el puerto de Vite (por defecto 5173)
EXPOSE 5173

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev", "--", "--host"]
