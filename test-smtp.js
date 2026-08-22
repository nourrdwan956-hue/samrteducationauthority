fetch('https://smtpjs.com/v1/smtp.aspx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    Host: 'smtp.gmail.com',
    Username: 'nourrdwan956@gmail.com',
    Password: 'nefv liot lydk ewns',
    To: 'nourrdwan956@gmail.com',
    From: 'nourrdwan956@gmail.com',
    Subject: `Test`,
    Body: 'Test',
    Port: '587'
  }).toString()
}).then(async r => console.log(r.status, await r.text()))
