var conf = require( './ucastation.ini' );
// var conf = {
//   port : 20080,
//   key : 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
//   admin_password : '***password***'
// };

var express = require( 'express' );
var app = express.createServer();
var io = require( 'socket.io' ).listen( app );

app.configure( function() {
  app.use( express.static( __dirname + '/public' ) );
});
app.set( 'view options', { layout: false } );
app.get( '/admin.js', function( req, res ) {
  res.render( 'admin.js.ejs', { port: conf.port, key: conf.key } );
});
app.get( '/view.js', function( req, res ) {
  res.render( 'view.js.ejs', { port: conf.port, key: conf.key } );
});
app.listen( conf.port );

io.set( "log level", 1 );

var channel; // デフォルトはチャンネル未選択

io.sockets.on( 'connection', function( client ) {
  var address = client.handshake.address;
  console.log( "connect new client. " +
               "address:" + address.address + " port:" + address.port );

  var mode = 'client';

  // 接続した時既にチャンネルが選択されていたらそれを開かせる
  if ( channel ) {
    client.emit( 'channel', channel );
  }

  // --- イベント登録 

  client.on( 'admin login', function( password, fn ) {
    if ( password == conf.admin_password ) {
      console.log( "admin login success." );
      mode = 'admin';
      fn( "OK admin login" );
    }
    else {
      console.log( "warning! admin password failer." );
      fn( "NG admin login" );
    }
  });

  client.on( 'admin channel', function( ch, fn ) {
    if ( mode != 'admin' ) {
      console.log( "warning! not admin." );
      return;
    }
    console.log( "admin channel" );
    channel = ch;
    client.broadcast.emit( 'channel', channel );
    fn( "OK admin channel" );
  });

  client.on( 'disconnect', function() {
	console.log( "disconnect" );
  });
});

console.log( "Server started." );
