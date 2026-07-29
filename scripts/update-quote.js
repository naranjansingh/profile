const fs = require('fs');
const quotes = [
  ['Simplicity is the ultimate sophistication.', 'Leonardo da Vinci'],
  ['Make it work, make it right, make it fast.', 'Kent Beck'],
  ['Programs must be written for people to read.', 'Harold Abelson'],
  ['Great products feel obvious after they exist.', 'Product Engineering Principle']
];
const [quote, author] = quotes[Math.floor(Date.now() / 86400000) % quotes.length];
const start='<!-- QUOTE:START -->', end='<!-- QUOTE:END -->';
let r=fs.readFileSync('README.md','utf8');
r=r.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n> “${quote}” — **${author}**\n${end}`);
fs.writeFileSync('README.md',r);
