# What is this project about

This is an attempt to create a minimal api with login/register user functionality.
It also uses JWT authentication

# Requirements
* MongoDB (Storing users)
* Reddis (Storing refresh tokens)

# How to run

Before starting the api for the first time run `npm run setup`.

The script will ask you about some configuration options regarding the mongodb server and the jwt signing and create the necessary configuration file