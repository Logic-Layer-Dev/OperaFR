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
  PORT=2111 
  MAX_FILE_SIZE=5 
  DATABASE_URL="postgresql://postgres:root@localhost:5432/operafr?schema=public"      
  JWT_SECRET="operafr" 
  CORS=["http://localhost"] 
  VALID_ORIGIN_PUBLIC_URL=["*"] 
```
You may want to change: 

- **PORT**: Port for the system instantiate
- **MAX_FILE_SIZE**: Max size of a file that can be uploaded
- **DATABASE_URL**: The postgres connect url (You dont need to change de database, just creds)
- **JWT_SECRET**: The auth secret. **(CHANGE THIS!)**
- **CORS**: Insert the authorized domains for make requests to server
- **VALID_ORIGIN_PUBLIC_URL**: If you want to authorize only some domain to get the files

#### 4. Generate the prisma client
```shell
npx prisma generate
```

#### 5. Create the migrations on the real database
```shell
npx prisma migrate dev
```
## 📚 Documentation

Access the current documentation [here](https://documenter.getpostman.com/view/10123907/2s9Y5WyjGL).


## ⚖️ License

This project uses the [ GNU GPLv3 ](https://choosealicense.com/licenses/gpl-3.0/) licensing. For more information, read the LICENSE file.


## 🤝 Contributions

Contributions are welcome! We are in the early versions of the project, and we gonna study for the contribute restrictions in the new versions.

