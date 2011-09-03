Tweet = {
  name : "Tweet", // 自身の名前
  // デフォルト値
  timeline_id : "timeline", // 表示場所のid
  count : 20, // 表示tweet数
  update_time : 120, // 更新間隔(sec)

  updateLoopSearch : function( search_word, timeline_id, count, update_time ) {
    if ( timeline_id ) { this.timeline_id = timeline_id }
    if ( ! count ) { count = this.count }
    if ( ! update_time ) { update_time = this.update_time }

    var callback_func = this.name + ".twitterSearchCallback";
    var api_url = "http://search.twitter.com/search.json?q="
      + encodeURIComponent(search_word) + "&rpp=" + count + "&callback=" + callback_func;
    this.callJSONP( api_url );
    setInterval( function() { Tweet.callJSONP( api_url ) }, update_time*1000 );
  },

  updateLoopUser : function( user, timeline_id, count, update_time ) {
    if ( timeline_id ) { this.timeline_id = timeline_id; }
    if ( ! count ) { count = this.count }
    if ( ! update_time ) { update_time = this.update_time }

    var callback_func = this.name + ".twitterUserCallback";
    var api_url = "http://twitter.com/statuses/user_timeline/"
      + encodeURIComponent(user) + ".json?count=" + count + "&callback=" + callback_func;
    this.callJSONP( api_url );
    setInterval( function() { this.callJSONP( api_url ) }, update_time*1000 );
  },

  twitterSearchCallback : function( searchs ) {
    var s = this.convertSearchedTweets( searchs );
    document.getElementById( this.timeline_id ).innerHTML = s;
  },

  twitterUserCallback : function( tweets ) {
    var s = this.convertUserTweets( tweets );
    document.getElementById( this.timeline_id ).innerHTML = s;
  },

  convertSearchedTweets : function( searchs ) {
    var s = "";
    for ( var i in searchs["results"] ) {
      if (! i.match(/[^0-9]+/)) { // IE8だとなぜか"filter"と"indexOf"が入るので対策
      var username = searchs["results"][i].from_user;
      var id = searchs["results"][i].id;
      var profile_image_url = searchs["results"][i].profile_image_url;
      var created_at = searchs["results"][i].created_at;
      var status = searchs["results"][i].text;
      var tweet_html = this.makeTweetTag( username, id, profile_image_url, created_at, status );
      s += tweet_html;
      }
    }
    return s;
  },

  convertUserTweets : function( tweets ) {
    var s = "";
    for ( var i = 0; i < tweets.length; i++ ) {
      var username = tweets[i].user.screen_name;
      var id = tweets[i].id;
      var profile_image_url = tweets[i].user.profile_image_url;
      var created_at = tweets[i].created_at;
      var status = tweets[i].text;
      var tweet_html = this.makeTweetTag( username, id, profile_image_url, created_at, status );
      s += tweet_html;
    }
    return s;
  },

  makeTweetTag : function( username, id, profile_image_url, created_at, status ) {
    var reltime = this.getRelativeTime( created_at );
    var status_html = status.replace(
        /((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g,
      function(url) {
        return '<a href="'+url+'">'+url+'</a>';
      }).replace(/\B@([_a-z0-9]+)/ig, function(reply) {
        return  reply.charAt(0)+'<a href="http://twitter.com/'+reply.substring(1)+'">'+reply.substring(1)+'</a>';
      });
    var image_html =
      '<span class="thumb vcard author"><a href="http://twitter.com/' + username + '" class="tweet-url profile-pic url"><img alt="' + username + '" class="photo fn" src="' + profile_image_url + '" height="48" width="48"></a></span>';
    var tweet_html =
      '<li> ' + image_html + ' <span class="status-body"><span class="status-content"><strong><a href="http://twitter.com/' + username + '" class="tweet-url screen-name">' + username + '</a></strong> <span class="entry-content">' + status_html + '</span></span> <span class="meta entry-meta" data="{}"><a class="entry-date" rel="bookmark" href="http://twitter.com/' + username + '/status/' + id + '"><span class="published timestamp" data="{time:\'' + created_at + '\'}">' + reltime + '</span></a></span></span></li>';

    return tweet_html;
  },

  getRelativeTime : function( time_value ) {
    if ( ! time_value.indexOf(",") ) {
      // ","が無い場合はuser_timeline APIの "Wed Aug 24 06:47:15 +0000 2011" の形式
      // なのでsearch APIと同じ "Wed, 24 Aug 2011 07:07:25 +0000" の形式に変更
      var wc = time_value.split(" ");
      time_value = [wc[0],",",wc[2],wc[1],wc[5],wc[3],wc[4]].join(" ");
    }
    
    var parsed_sec = parseInt( Date.parse(time_value) / 1000 );
    var now = new Date();
    var now_sec = parseInt( now.getTime() / 1000 );
    var delta = now_sec - parsed_sec;

    if ( delta < 60 ) {
      return "1分以内";
    } else if ( delta < (60*60) ) {
      return (parseInt(delta / 60)).toString() + "分前";
    } else if( delta < (24*60*60) ) {
      return (parseInt(delta / 3600)).toString() + "時間前";
    } else {
      return (parseInt(delta / 86400)).toString() + "日前";
    }
  },

  callJSONP : function( url ) {
    var target = document.createElement( 'script' );
    target.charset = 'utf-8';
    target.src = url;
    document.body.appendChild( target );
  },
};

