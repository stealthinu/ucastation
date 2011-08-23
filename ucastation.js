var port = 20011;
var key = 'A1744A931A20426E5743216EB0A3379B';
var admin_password = 'pass';

var express = require( 'express' );
var app = express.createServer();

app.configure( function() {
  app.use( express.static( __dirname + '/public' ) );
});
app.set( 'view options', { layout: false } );
app.get( '/admin.js', function( req, res ) {
  res.render( 'admin.js.ejs', { port: port, key: key } );
});
app.get( '/view.js', function( req, res ) {
  res.render( 'view.js.ejs', { port: port, key: key } );
});
app.listen( port );

var io = require( 'socket.io' );
var socket = io.listen( app );

var channel; // デフォルトはチャンネル未選択

socket.on( 'connection', function( client ) {
  console.log( "connect new client." );
  var mode = 'client';

  // 接続した時既にチャンネルが選択されていたらそれを開かせる
  if ( channel ) {
    client.send( channel );
  }

  // --- イベント登録 

  client.on( 'message', function( message ) {
	console.log( "message: " + message );

    // admin
    if ( mode == 'admin' ) {
      console.log( "admin command" );
      channel = message;
      client.broadcast( channel );
    }
    // client
    else {
      if ( message == 'admin ' + admin_password ) {
        console.log( "admin login" );
        mode = 'admin';
      }
      else {
        console.log( "ignore client message" );
      }
    }
  });

  client.on( 'disconnect', function() {
	console.log( "disconnect" );
  });
});

console.log( "Server started." );
