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

var view_num = 0; // view用で接続してるクライアント数
var channel; // デフォルトはチャンネル未選択
var board = ""; // 管理者からのお知らせ

// viewとの通信
var view = io.of( '/view' ).on( 'connection', function( client ) {
  var address = client.handshake.address;
  console.log( "connect new client. " +
               "address:" + address.address + " port:" + address.port );

  // 新しい接続があったら管理者へ現在の接続数を送信
  view_num ++;
  admin.emit( 'viewnum', view_num );
  
  // 接続時、クライアントに現在のチャンネルと管理者からのお知らせを送信
  if ( channel ) {
    client.emit( 'channel', channel );
  }
  view.emit( 'board', board );

  // 切断処理
  client.on( 'disconnect', function() {
	console.log( "disconnect" );
    // 管理者へ減った接続数を送信
    view_num --;
    admin.emit( 'viewnum', view_num );
  });
});

// adminとの通信
var admin = io.of( '/admin' ).on( 'connection', function( client ) {
  var address = client.handshake.address;
  console.log( "connect new admin. " +
               "address:" + address.address + " port:" + address.port );

  // 管理者のログインリクエスト
  client.on( 'admin login', function( password, fn ) {
    if ( password == conf.admin_password ) {
      console.log( "admin login success." );
      // 現在のチャンネルと告知内容、接続数を管理者へ送る
      //admin.emit( 'channel', channel );
      admin.emit( 'board', board );
      admin.emit( 'viewnum', view_num );
      fn( "OK admin login" );
    }
    else {
      console.log( "warning! admin password failer." );
      fn( "NG admin login" );
    }
  });

  // チャンネル変更
  client.on( 'admin channel', function( ch, fn ) {
    console.log( "admin channel" );
    channel = ch;
    view.emit( 'channel', channel );
    fn( "OK admin channel" );
  });

  // 管理者からのお知らせ変更
  client.on( 'admin board', function( text, fn ) {
    console.log( "admin board" );
    board = text;
    view.emit( 'board', board );
    fn( "OK admin board" );
  });

  // 切断処理
  client.on( 'disconnect', function() {
	console.log( "disconnect" );
  });
});

console.log( "Server started." );
