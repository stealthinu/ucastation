conf = require("./ucastation.ini")
# conf =
#   port : 20080
#   key : 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
#   admin_password : '***password***'
express = require("express")
app = express.createServer()
io = require("socket.io").listen(app)
io.set "log level", 1

# expressの設定
app.configure ->
  app.use express.static(__dirname + "/public")
app.set "view options", layout: false
app.get "/admin.js", (req, res) ->
  res.render "admin.js.ejs",
    port: conf.port
    key: conf.key
app.get "/view.js", (req, res) ->
  res.render "view.js.ejs",
    port: conf.port
    key: conf.key
app.listen conf.port

view_num = 0    # view用で接続してるクライアント数
channel = false # デフォルトはチャンネル未選択
board = ""      # 管理者からのお知らせ

console.log "Server started."


# 閲覧者との通信
view = io.of("/view").on("connection", (client) ->
  logClient "connect new client.", client

  # 新しい接続があったら管理者へ現在の接続数を送信
  view_num++
  admin.emit "viewnum", view_num
  # 接続時、クライアントに現在のチャンネルと管理者からのお知らせを送信
  client.emit "channel", channel  if channel
  view.emit "board", board

  # 切断処理
  client.on "disconnect", ->
    logClient "disconnect", client
    # 管理者へ減った接続数を送信
    view_num--
    admin.emit "viewnum", view_num
)

# 管理者との通信
admin = io.of("/admin").on("connection", (client) ->
  logClient "connect new admin.", client

  login = false;

  # 管理者のログインリクエスト処理
  client.on "admin login", (password, fn) ->
    if password == conf.admin_password
      logClient "admin login success.", client
      login = true;
      # 現在のチャンネルと告知内容、接続数を管理者へ送る
      admin.emit "board", board
      admin.emit "viewnum", view_num
      fn "OK admin login"
    else
      logClient "warning! admin password failer.", client
      fn "NG admin login"

  # チャンネル切り替え処理
  client.on "admin channel", (ch, fn) ->
    if login
      logClient "admin channel", client
      channel = ch
      view.emit "channel", channel
      fn "OK admin channel"

  # 管理者からのお知らせ処理
  client.on "admin board", (text, fn) ->
    if login
      logClient "admin board", client
      board = text
      view.emit "board", board
      fn "OK admin board"

  # 切断処理
  client.on "disconnect", ->
    logClient "disconnect", client
)

logClient = (message, client) ->
  now = new Date()
  address = client.handshake.address
  console.log now.toString() + " " + address.address + " " + message
