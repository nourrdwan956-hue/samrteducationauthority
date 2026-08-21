const { exec } = require('child_process');
exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
  } else {
    console.log("No errors");
  }
});
