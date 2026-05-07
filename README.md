# Wildix Extensions

**DE:**

In diesem Repository lege ich verschiedene Scripte ab, welche die Funktionalität einer Wildix Telefonanlage erweitern.

Kompatibilität: Wildix PBX 6.x

Die Scripte verwenden die API.

Aktuell umgesetzte Services:

callgroup-users.js | Zeigt eine Liste aller hinterlegter Anrufgruppen an, sowie, welche Benutzer darin registriert sind.



**EN:**

This repository contains a couple of scripts, that extend the functionality of a Wildix PBX.

Compatibility: Wildix PBX 6.x.

The scripts use the Wildix API.


## System requirements 

1. NodeJS
2. NPM


## Installation

1. Install node js 

2. Install npm

3. Clone project

4. Run npm install

```
npm install
```

5. Install dependencies:

```
npm install dotenv express axios https

```


## Running a service.

Custom Services for the Wildix PBX.

```
# Start with:
npm run callgroup-users.js

```