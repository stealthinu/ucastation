port = "<%= port %>"
socket = io.connect("/view", port: port)

socket.on "connect", ->

socket.on "channel", (channel) ->
  Player.play channel, "ust_main"

socket.on "board", (text) ->
  $("#admin_board").html text
