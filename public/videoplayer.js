Ust = {
  api_url : 'http://api.ustream.tv/json/channel/',
  iphone_url_head : 'http://iphone-streaming.ustream.tv/ustreamVideo/',
  iphone_url_tail : '/streams/live/playlist.m3u8',
  socialstream_url : 'http://www.ustream.tv/socialstream/',

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

  play : function( channel, target_id, width, height, autoplay, tl_target_id ) {
    if ( ! width ) { width = this.width }
    if ( ! height ) { height = this.height }
    if ( ! autoplay ) { autoplay = this.autoplay }

    Ust.getInfo( channel ).then( function( info ) {
      Player.playInfo( info, target_id, width, height, autoplay, tl_target_id );
    });
  },

  playInfo : function( info, target_id, width, height, autoplay, tl_target_id ) {
    if ( ! width ) { width = this.width }
    if ( ! height ) { height = this.height }
    if ( ! autoplay ) { autoplay = this.autoplay }

    // info.id / info.embedTag / info.urlTitleName
    // info.imageUrl.medium / info.socialStream.hashtag

    // iphone用のデータ
    var iphone_url = Ust.iphone_url_head + info.id + Ust.iphone_url_tail;
    var iphone_tag = '<source src="' + iphone_url + '" autobuffer>';

    // 一般用のflashのデータ
    // autoplay等の指定はgetInfoでは出来ないのでembedTagの中身をreplaceする
    var flash_tag = info.embedTag;
    flash_tag = flash_tag.replace( /autoplay=false/g, 'autoplay=' + autoplay );
    flash_tag = flash_tag.replace( /width="320" height="260"/g, 'width="' + width + '" height="' + height + '"' );

    // ソーシャルストリームのURL
    var socialstream_url = Ust.socialstream_url + info.id;
    var socialstream_tag = '<a href="' + socialstream_url + '" target="_blank" >TL</a>';

    // Ust APIで取得した内容に置き換え
    var video_id = target_id + '_video';
    var video_attr = 'width="' + width + '" height="' + height + '" controls preload';
    var target = $('#' + target_id);
    target.addClass( 'video-js-box' )
          .html( '<video id="' + video_id + '" class="video-js" ' + video_attr + '></video>' );
    var video = target.find( 'video' );
    video.append( iphone_tag )
         .append( flash_tag )
         .find( 'object' ).addClass( 'vjs-flash-fallback' ); // fallback指定
    $('#' + tl_target_id).html( socialstream_tag );
    
    // VideoJSが動く状況になった時点でPlayerを起動
    VideoJS.DOMReady( function() {
      VideoJS.setup( video_id ).play();
    });
  }
};
