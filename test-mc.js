fetch('https://api.mailchannels.net/tx/v1/send', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email: "nourrdwan956@gmail.com", name: "Test" }]
    }],
    from: { email: "no-reply@samrteducationauthority.nourrdwan956.workers.dev", name: "SEA" },
    subject: "Test",
    content: [{ type: "text/plain", value: "Test" }]
  })
}).then(async r => console.log(r.status, await r.text()))
