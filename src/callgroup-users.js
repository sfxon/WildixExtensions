const axios = require("axios");
const dotenv = require("dotenv").config();
const express = require("express");
const https = require("https");

const app = express();
const HOST = "0.0.0.0";
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

const API_TOKEN = process.env.WILDIX_API_SIMPLE_TOKEN;
const BASE_URL = process.env.WILDIX_BASE_URL;

const client = axios.create({
    baseURL:BASE_URL,
    headers: {
        Accept: "application/json"
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

// SORTIERUNG DER QUEUES (bspw.:)
const orderMap = {
    "group-name-1": 1,
    "another-group": 2,
    "general":3,
};

function normalize(name) {
    return (name || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
}

// MAIN DASHBOARD
app.get("/", async (req, res) => {
    try {
        const colleagues = (await client.get(
            `/api/v1/Colleagues/?token=${API_TOKEN}`
        )).data.result.records;

        const map = Object.fromEntries(
            colleagues.map(c => [c.extension, c.name])
        );

        const queues = (await client.get(
            `/api/v1/PBX/settings/CallQueues/?token=${API_TOKEN}`
        )).data.result.records;

        const result = await Promise.all(
            queues.map(async q => {

                const detail = (await client.get(
                    `/api/v1/PBX/settings/CallQueues/${q.id}/?token=${API_TOKEN}`
                )).data.result;

                const members = (detail.members || [])
                    .map(m => m.stateInterface?.split("/")[1])
                    .filter(Boolean)
                    .map(ext => ({
                        extension: ext,
                        name: map[ext] || ext
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                const norm = normalize(detail.name);

                return {
                    id: q.id,
                    name: detail.name,
                    normName: norm,
                    order: orderMap[norm] ?? 999,
                    members
                };
            })
        );

        // 📊 SORTIERUNG DER QUEUES
        result.sort((a, b) => a.order - b.order);

        res.render("callgroup-users", {
            title: "Dashboard",
            queues: result
        });

    } catch (e) {
        console.error(e.response?.data || e.message);
        res.status(500).send("Error");
    }
});

// PRESENCE API
app.get("/presence", async (req, res) => {
    try {
        if (!req.query.ext) {
            return res.json([]);
        } 

        const exts = req.query.ext.split(",");
        const data = await Promise.all(
            exts.map(async ext => {
                const r = await client.get(
                    `/api/v1/User/${ext}/Presence/?token=${API_TOKEN}`
                );

                return {
                    extension: ext,
                    online: r.data.result?.online ?? false,
                    show: r.data.result?.show ?? ""
                };
            })
        );

        res.json(data);

    } catch (e) {
        console.error("presence error", e.message);
        res.status(500).json([]);
    }
});

// START SERVER
app.listen(PORT, HOST, () => {
  console.log(`http://${HOST}:${PORT}`);
});