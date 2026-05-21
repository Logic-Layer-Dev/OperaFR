# OperaFR

Official repository of the open source project of the Opera. This software is a "bucket" system, with all the core functions for a file repository. 

You can create different partitions internally on a folder based system, and use only this software for all different systems that you control and need a centralized repository for controlling your files.


<div align="center">
    <img width="50%" src="https://raw.githubusercontent.com/Logic-Layer-Dev/.github/main/images/operafr_logo.png" alt="Logo">
</div>

## Requirements

**postgresql:** Version v14.0 or above recommended

**nodejs:** Version v16.14.2 or above recommended


## ⚙️ Installation

This project can be installed by cloning this repository on your current server (We are working on a .sh file)

#### 1. Clone (or fork initially) the repository
```bash
  git clone https://github.com/Logic-Layer-Dev/OperaFR.git
```
#### 2. Enter in the folder and install de dependencies
```bash
  cd OperaFR
  npm i
```
#### 3. Create de .env File based on .env.example
```shell 
  PORT=2111 #port to listen on
  MAX_FILE_SIZE=10 #MB
  DATABASE_URL="postgresql://postgres:root@localhost:5432/operafr?schema=public" #database url
  JWT_SECRET="operafr" #jwt secret
  CORS=["http://localhost"] #cors origin

  #Validation rules for servers
  VALID_ORIGIN_PUBLIC_URL=["*"] #valid ip to access public url of files. * for all
  VALID_SENDER_IPS=["*"] #valid ip to send files. * for all

  #ZeroMQ configuration
  ZMQ_REPLY_PORT=5555 #port for req-rep
  ZMQ_PUSH_PORT=5556 #port to pull-push

  #Current server ip
  SERVER_IP="http://localhost:2111" #You can put a DNS/Domain here if you have one linked to the server

  # USERS CREDENTIALS
  SUPERUSER_EMAIL=email@gmail.com
  SUPERUSER_USER=root
  SUPERUSER_PASSWORD=root

  # TOKEN DETAILS
  TOKEN_DAYS_EXPIRATION=365
```
You may want to change: 

- **PORT**: Port for the system instantiate
- **MAX_FILE_SIZE**: Max size of a file that can be uploaded
- **DATABASE_URL**: The postgres connect url (You dont need to change de database, just creds)
- **JWT_SECRET**: The auth secret. **(CHANGE THIS!)**
- **CORS**: Insert the authorized domains for make requests to server
- **VALID_ORIGIN_PUBLIC_URL**: If you want to authorize only some domain to get the files
- **VALID_SENDER_IPS**: If you want to authorize only some IP to send the files
- **ZMQ_REPLY_PORT**: Port for Req/Reply service
- **ZMQ_PUSH_PORT**: Port for Push/Pull service
- **SERVER_IP**: URL of the server
- **SUPERUSER_EMAIL**: User e-mail
- **SUPERUSER_USER**: Username
- **SUPERUSER_PASSWORD**: User password
- **TOKEN_DAYS_EXPIRATION**: Token Expiration days

#### 4. Generate the prisma client
```shell
npx prisma generate
```

#### 5. Create the migrations on the real database
```shell
npx prisma migrate dev
```

#### 6. Create initial superuser (new script)

```bash
node scripts/create-user.js
```

This script reads `SUPERUSER_EMAIL`, `SUPERUSER_USER`, and `SUPERUSER_PASSWORD` from `.env` and creates a superuser in the database.

#### 7. Start the API

```bash
npm start
```

## Instalation with Docker

Follow the normal installation only until step 3 (including step 3).  
After that, use the Docker flow below.

#### 1. Build and start containers
```bash
docker compose up -d --build
```

This will start:
- `operafr-db` (PostgreSQL)
- `operafr-app` (API), already running `prisma migrate dev`, `create-user`, and `npm start`

#### 2. Generate and persist `USER_API_KEY`

After everything is up, run:

```bash
docker exec -it operafr-app node scripts/generate-token-cli.js
```

This command logs in with the configured credentials and saves `USER_API_KEY` in `.env`.

## 📚 Documentation

Access the current documentation [here](https://documenter.getpostman.com/view/10123907/2s9Y5WyjGL).


## ⚖️ License

This project uses the [ GNU GPLv3 ](https://choosealicense.com/licenses/gpl-3.0/) licensing. For more information, read the LICENSE file.


## 🤝 Contributions

Contributions are welcome! We are in the early versions of the project, and we gonna study for the contribute restrictions in the new versions.

