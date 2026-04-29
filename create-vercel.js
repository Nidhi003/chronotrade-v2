const fs = require('fs');
const obj = {
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
};
fs.writeFileSync('C:/Users/nithe/Desktop/chronotrade-v2/frontend/vercel.json', JSON.stringify(obj, null, 2));
console.log('Done - vercel.json created');
