const { spawn } = require('child_process');
const path = require('path');

const child = spawn('node', ['server.js'], {
  cwd: path.resolve(__dirname, '../backend'),
  env: { ...process.env, PORT: '5055' }
});

child.stdout.on('data', d => console.log('STDOUT:', d.toString()));
child.stderr.on('data', d => console.log('STDERR:', d.toString()));

setTimeout(() => {
  child.kill();
  console.log('Killed test child');
}, 5000);
