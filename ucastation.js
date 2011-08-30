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

var view_num = 0;
var channel; // デフォルトはチャンネル未選択

var view = io.of( '/view' ).on( 'connection', function( client ) {
  var address = client.handshake.address;
  console.log( "connect new client. " +
               "address:" + address.address + " port:" + address.port );

  view_num ++;
  admin.emit( 'view num', view_num );
  
  // 接続した時既にチャンネルが選択されていたらそれを開かせる
  if ( channel ) {
    client.emit( 'channel', channel );
  }

  client.on( 'disconnect', function() {
	console.log( "disconnect" );
    view_num --;
    admin.emit( 'view num', view_num );
  });
});

var admin = io.of( '/admin' ).on( 'connection', function( client ) {
  var address = client.handshake.address;
  console.log( "connect new admin. " +
               "address:" + address.address + " port:" + address.port );

  client.on( 'admin login', function( password, fn ) {
    if ( password == conf.admin_password ) {
      console.log( "admin login success." );
      fn( "OK admin login" );
    }
    else {
      console.log( "warning! admin password failer." );
      fn( "NG admin login" );
    }
  });

  client.on( 'admin channel', function( ch, fn ) {
    console.log( "admin channel" );
    channel = ch;
    view.emit( 'channel', channel );
    fn( "OK admin channel" );
  });

  client.on( 'disconnect', function() {
	console.log( "disconnect" );
  });
});

console.log( "Server started." );
