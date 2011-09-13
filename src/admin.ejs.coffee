port = "<%= port %>"
password = "pass"
socket = io.connect("/admin", port: port)

socket.emit "admin login", password, (reply) ->
  $("#condition").html "<div class='alert-message success'>管理者認証成功</div>" if reply == "OK admin login"

socket.on "connect", ->

socket.on "disconnect", ->
  $("#condition").html "<div class='alert-message error'>切断</div>"

socket.on "board", (text) ->
  text = text.replace(/<br>/g, "\n")
  $("#board").html text

socket.on "viewnum", (num) ->
  $("#view_num").html "<div class='alert-message info'>接続数：" + num + "</div>"

sendChannel = (channel) ->
  $("#condition").html "<div class='alert-message info'>チャンネル送信中...</div>"
  socket.emit "admin channel", channel, (reply) ->
    $("#condition").html "<div class='alert-message success'>チャンネル送信成功</div>" if reply == "OK admin channel"

sendBoard = (text) ->
  text = text.replace(/(\r\n|\n|\r)/g, "<br>")
  $("#condition").html "<div class='alert-message info'>告知送信中...</div>"
  socket.emit "admin board", text, (reply) ->
    $("#condition").html "<div class='alert-message success'>告知送信成功</div>" if reply == "OK admin board"
