const fs = require("fs");
const path = require("path");
const polka = require("polka");
const send = require("@polka/send-type");
const sirv = require("sirv");
const { json } = require("body-parser");
// const got = require("got");
const fetch = require("node-fetch");
const os = require("os");
const opn = require("opn");

function read_config() {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "./config.json"))
    );
  } catch (e) {
    const data = {
      companies: [],
      lastid: -1
    };
    write_config(data);
    return data;
  }
}

function write_config(json) {
  fs.writeFileSync(
    path.join(process.cwd(), "./config.json"),
    JSON.stringify(json, void 0, 2)
  );
}

let config = read_config();

polka()
  .use(json(), sirv(path.join(__dirname, "phone"), { dev: true }), sirv(path.join(__dirname, "public"), { dev: true }))
  .get("/api/company", (req, res) => {
    send(res, 200, { companies: config.companies });
  })
  .get("/api/company/:id", (req, res) => {
    send(res, 200, { company: config.companies[parseInt(req.params.id, 10)] });
  })
  .get("/api/company/:id/phones", (req, res) => {
    const company = config.companies[parseInt(req.params.id, 10)];
    if (!company) {
      return send(res, 404, { error: true });
    }

    send(res, 200, { phones: company.phones });
  })
  .post("/api/company", (req, res) => {
    const data = req.body;
    config.companies.push(
      Object.assign(
        { name: "", phones: [], id: ++config.lastid, offset: 1 },
        data
      )
    );
    write_config(config);
    send(res, 200, { ok: true, id: config.lastid });
  })
  .put("/api/company/:id/phones", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const company = config.companies[id];
    if (!company) {
      return send(res, 404);
    }
    company.phones = req.body;
    await update_phones(company);
    write_config(config);

    send(res, 200, { ok: true });
  })
  .put("/api/company/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const company = config.companies[id];
    if (!company) {
      return send(res, 404);
    }
    const data = req.body;

    config.companies[id] = data;
    await update_phones(data);
    write_config(config);

    send(res, 200, { ok: true });
  })
  .get("/assets/phone/aastra.cfg", (req, res) => {
    send(res, 200, default_settings);
  })
  .listen(8000)
  .then(() => {
    console.log("Api listening on localhost:8000");
    opn("http://localhost:8000");
  });

async function update_phones(company) {
  const ips = Object.values(os.networkInterfaces())
    .reduce((acc, val) => acc.concat(val), [])
    .filter(iface => iface.internal === false && iface.family === "IPv4")
    .map(iface => iface.address.split("."));

  await Promise.all(
    company.phones.map(async (p, i) => {
      if (!p.ip) {
        return;
      }
      const list = company.phones.slice();
      list.splice(i, 1);
      const xml = `xml=${config_to_xml(p, list, company.offset)}`;

      try {
        const phoneIp = p.ip.split(".");
        const localIp = ips.find(
          ip =>
            ip[0] === phoneIp[0] && ip[1] === phoneIp[1] && ip[2] === phoneIp[2]
        )[0];

        if (!localIp) {
          throw new Error("Could not find shared subnet for: " + p.ip);
        }

        await fetch(`http://${p.ip}`, {
          headers: {
            Authorization: "Basic YWRtaW46MjIyMjI="
          }
        });

        await fetch(`http://${p.ip}/reset.html`, {
          method: "POST",
          headers: {
            Authorization: "Basic YWRtaW46MjIyMjI="
          },
          body: new URLSearchParams({
            resetOption: 1
          })
        });

        await fetch(`http://${p.ip}/reset.html`, {
          method: "POST",
          headers: {
            Authorization: "Basic YWRtaW46MjIyMjI="
          },
          body: new URLSearchParams({
            resetOption: 2
          })
        });

        const res1 = await fetch(`http://${p.ip}/configurationServer.html`, {
          method: "POST",
          headers: {
            Authorization: "Basic YWRtaW46MjIyMjI="
          },
          body: new URLSearchParams({
            protocol: "HTTP",
            httpserv: localIp.join("."),
            httppath: "/",
            httpport: 8000,
            postList: localIp.join(".")
          })
        });
        const text1 = await res1.text();

        const res2 = await fetch(`http://${p.ip}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: xml
        });
        const text2 = await res2.text();

        await fetch(`http://${p.ip}/reset.html`, {
          method: "POST",
          headers: {
            Authorization: "Basic YWRtaW46MjIyMjI="
          },
          body: new URLSearchParams({
            resetOption: 0
          })
        });

        console.log(res1.status);
        console.log(
          text1
            .split("<div id='content'>")[1]
            .split("</div>")[0]
            .trim()
        );
        console.log(res2.status);
        console.log(
          text2
            .split("<div id='content'>")[1]
            .split("</div>")[0]
            .trim()
        );
      } catch (e) {
        console.error(e);
      }
    })
  );
}

function config_to_xml(phone, list = [], offset = 0) {
  const out = {
    ...Array.from({ length: 20 }, (v, i) => i + 1)
      .map(n => ({
        [`topsoftkey${n} type`]: ""
      }))
      .reduce((acc, val) => Object.assign(acc, val), {}),
    ...list
      .map((p, i) => {
        const n = i + offset + 1;
        return {
          [`topsoftkey${n} type`]: "blf",
          [`topsoftkey${n} label`]: list[i].name,
          [`topsoftkey${n} value`]: list[i].number,
          [`topsoftkey${n} line`]: "1"
        };
      })
      .reduce((acc, val) => Object.assign(acc, val), {}),
    ...phone.config.topsoftkeys
      .map((key, i) => {
        const n = i + 1;
        return {
          [`topsoftkey${n} type`]: key.type,
          [`topsoftkey${n} label`]: key.label,
          [`topsoftkey${n} value`]: key.value,
          [`topsoftkey${n} line`]: "1"
        };
      })
      .reduce((acc, val) => Object.assign(acc, val), {})
  };

  return `<AastraIPPhoneConfiguration setType="local">${Object.entries(out)
    .map(
      ([k, v]) =>
        `<ConfigurationItem><Parameter>${k}</Parameter><Value>${v}</Value></ConfigurationItem>`
    )
    .join("")}</AastraIPPhoneConfiguration>`;
}

const default_settings = `
language 1: http://firmware.dtst.de/lang_de.txt
Input language: German
language: 1
web language: 1

sip dial plan: "[0-9*#]+^"
sip dial plan terminator: 1
sip digit timeout: 5

sip intercom mute mic: 0

time server disabled: 0

time zone name: Custom
dst minutes: 0
time zone minutes: -120

time format: 1
date format: 3

directed call pickup: 1
directed call pickup prefix: **

ring tone: 1
tone set: Germany`;
