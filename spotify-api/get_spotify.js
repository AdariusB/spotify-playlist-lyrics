const credentials = require('./credentials.json');
var request = require('request');
const musix_root = "https://api.musixmatch.com/ws/1.1/";

var access_token = "";
var options = {
  'method': 'POST',
  'url': 'https://accounts.spotify.com/api/token',
  'headers': {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie': '__Host-device_id=AQCKTYGEuHiFlU7yfqqQDzvPtDVZi_mQ6dnHYSCAnbZNCd-MReX85fH69zc6dnsn73k6UnnX8xd6kZoAU3JfG-uNsXKansOVr0o; sp_tr=false'
  },
  form: {
    'grant_type': 'client_credentials',
    'client_id': credentials["client_id"],
    'client_secret': credentials["client_secret"]
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  access_token = JSON.parse(response.body)["access_token"];

  var playlist_options = {
    'method': 'GET',
    'url': 'https://api.spotify.com/v1/playlists/7e61hrMtwsApDZGvHm8ySi',
    'headers': {
      'Authorization': 'Bearer ' + access_token
    }
  };
  request(playlist_options, function (error, response) {
    if (error) throw new Error(error);
    jsonPlaylist = JSON.parse(response.body);
    getPlaylistSongs(jsonPlaylist);
  });
});

function getPlaylistSongs(playlist) {
  playlistTracks = playlist["tracks"]["items"];
  for(var i = 0; i < playlistTracks.length; i++) {
    songName = playlistTracks[i]["track"]["name"];
    songArtist = playlistTracks[i]["track"]["artists"][0]["name"];
    songAlbum = playlistTracks[i]["track"]["album"]["name"];
    findTrackId(songName, songArtist, songAlbum);
  }
}

function findTrackId(songName, songArtist, songAlbum) {
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': `https://api.musixmatch.com/ws/1.1/track.search?q_artist=${songArtist}&q_track=${songName}&page_size=100&s_track_rating=desc&apikey=${credentials['musixmatch_api']}`,
    'headers': {
      'Authorization': `Bearer ${credentials['musixmatch_api']}`
    },
    form: {

    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    var track_response = JSON.parse(response.body);
    var track_list = track_response['message']['body']['track_list'];
    var track_id;
    var foundTrack = false;
    var tempTrack;
    for (var i = 0; i < track_list.length; i++) {
      var track_name = track_list[i]['track']['track_name'];
      var track_artist = track_list[i]['track']['artist_name'];
      var track_album = track_list[i]['track']['album_name'];

      if(track_name == songName && track_album == songAlbum && track_artist.includes(songArtist)) {
        track_id = track_list[i]['track']['track_id'];
        foundTrack = true;
        console.log("Found the track id " + track_id + " for the song, " + songName);
      }
      if(!tempTrack || (tempTrack["track_rating"] < track_list[i]['track']["track_rating"])) {
        tempTrack = track_list[i]['track'];
      }
    }
    if(!foundTrack) {
      // Send message clarifying that album is not the same
      track_id = tempTrack['track_id'];
      console.log("Found the track id " + track_id + " for the song, " + songName + " but from the album, " + tempTrack['album_name']);
    }
  });
}

function findLyrics(track_id) {

}

//musixmatch_api