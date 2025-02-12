<h1 align="center"><b>BRIG</b></h1>
<h4 align="center">A web application to stream files between remote FTP servers.</h4>
<p align="center">
<a href="https://www.gnu.org/licenses/gpl-3.0" alt="License: GPLv3"><img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg"></a>
</p>
<hr>

> [!warning]
> This project is under **active development** and is not fully ready for use.
> Entire segments of the application are likely to **evolve, appear or disappear**.
> Please be careful if you plan to use it.


## Description

Brig is a web application acting as a gateway to transfer files between two FTP servers.

As FTP specification does not allow to initiate a direct transfer between two remote FTP servers, the usual process to transfer files between two remote hosts using FTP involves a download from one server (with files beeing written to the local disk) and a re-upload to the second server.

Brig allows to connect to two servers at a time and to initiate a transfer with no write operation on local disk as the files are directly **streamed** from one server to the other. The backend of the application acts as a simple **gateway to pipe the data**.

### Features

- Register users *(in progress)*
- Store FTP server connection information
- Connect to FTP servers and perform basic operations (browse, create directory, delete file/directory...)
- Transfer file/directory from a FTP server to another
- *Administrators*: Manage users and servers information *(in progress)*


## Installation

### Prerequisites

You need **MongoDB** and **Redis** instances up and running for Brig to work.

A composefile is provided so you can launch some docker container for these apps using
```
docker compose -f composefiles/dev.yml up
```

Please see [MongoDB download page](https://www.mongodb.com/try/download/community) and [Redis download page](https://redis.io/downloads/) for other installation options.

### Setup and startup

In the future, a Docker image will be provided to simplify retrieval and deployment of the application.

For now, if you want to try the app despite the fact that it is still in development, you can clone this repo and perform the following operations:

- Create `backend/.env.production` and `frontend/.env.production` files based on provided templates and replace values appropriately
- Run `yarn start`
- Perform a POST request (using a tool like [Postman](https://www.postman.com/) for example) to `http://localhost:5000/api/auth/register` with the following body to create a first user:

  ```
  {
      "username": <<USERNAME>>,
      "password": <<PASSWORD>>
  }
  ```
- Browse `http://localhost:5000` and connect using the created user
