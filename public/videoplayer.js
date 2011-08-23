Ust = {
  api_url : 'http://api.ustream.tv/json/channel/',
  iphone_url_head : 'http://iphone-streaming.ustream.tv/ustreamVideo/',
  iphone_url_tail : '/streams/live/playlist.m3u8',

  getInfo : function( channel ) {
    var dfr = $.Deferred();
    var api = Ust.api_url + encodeURIComponent( channel ) + '/getInfo?callback=?';
    $.getJSON( api, dfr.resolve );
    return dfr.promise();
  }
};

Player = {
  width : '480',
  height : '386',
  autoplay : 'true',

  play : function( channel, target_id ) {
    Ust.getInfo( channel ).then( function( info ) {
      Player.playInfo( info, target_id );
    });
  },

  playInfo : function( info, target_id ) {
    // info.id / info.embedTag / info.urlTitleName
    // info.imageUrl.medium / info.socialStream.hashtag

    // iphone用のデータ
    var iphone_url = Ust.iphone_url_head + info.id + Ust.iphone_url_tail;
    var iphone_tag = '<source src="' + iphone_url + '" autobuffer>';

    // 一般用のflashのデータ
    // autoplay等の指定はgetInfoでは出来ないのでembedTagの中身をreplaceする
    var flash_tag = info.embedTag;
    flash_tag = flash_tag.replace( /autoplay=false/g, 'autoplay=' + Player.autoplay );
    flash_tag = flash_tag.replace( /width="320" height="260"/g, 'width="' + Player.width + '" height="' + Player.height + '"' );

    // Ust APIで取得した内容に置き換え
    var target = $('#' + target_id);
    target.addClass( 'video-js-box' );
    var video_id = target_id + '_video';
    var video_attr = 'width="' + Player.width + '" height="' + Player.height + '" controls preload';
    target.html( '<video id="' + video_id + '" class="video-js" ' + video_attr + '></video>' );
    var video = target.find( 'video' );
    video.append( iphone_tag );
    video.append( flash_tag );
    video.find( 'object' ).addClass( 'vjs-flash-fallback' ); // fallback指定

    // VideoJSが動く状況になった時点でPlayerを起動
    VideoJS.DOMReady( function() {
      VideoJS.setup( video_id ).play();
    });
  }
};
