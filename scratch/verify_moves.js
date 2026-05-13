const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
const dest = path.join(__dirname, 'chess.min.js');

const file = fs.createWriteStream(dest);
https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close(() => {
      console.log('Downloaded chess.js!');
      runVerification();
    });
  });
}).on('error', function(err) {
  fs.unlink(dest, () => {});
  console.error('Download error:', err.message);
});

function runVerification() {
  const { Chess } = require('./chess.min.js');
  const game = new Chess();
  
  const moves = [
    'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5',
    'd4', 'exd4', 'O-O', 'd3', 'Qb3', 'Qf6', 'e5', 'Qg6', 'Re1', 'Nge7',
    'Ba3', 'b5', 'Qxb5', 'Rb8', 'Qa4', 'Bb6', 'Nbd2', 'Bb7', 'Ne4', 'Qf5',
    'Bxd3', 'Qh5', 'Nf6+', 'gxf6', 'exf6', 'Rg8', 'Rad1', 'Qxf3', 'Rxe7+', 'Nxe7',
    'Qxd7+', 'Kxd7', 'Bf5+', 'Ke8', 'Bd7+', 'Kf8', 'Bxe7#'
  ];

  for (let i = 0; i < moves.length; i++) {
    const move = game.move(moves[i]);
    if (!move) {
      console.error(`ERROR on move ${i+1}: ${moves[i]} is illegal!`);
      console.log('Current board FEN:', game.fen());
      console.log('History played so far:', game.history());
      return;
    }
    console.log(`${i+1}. ${moves[i]} -> OK`);
  }
  console.log('ALL MOVES ARE PERFECTLY LEGAL!');
}
