
var config = {
    targetStatus:"",
    refreshTimer:0,
    photoContainerIdName:"UNKNOWN",
    photoRootParent: null,
    setPhotoPrivateDiv: null,
    timeBetweenLoadingPhotosMS: 1500,
    userId:null
};

function GetAndChangeAllPhotosStatus(status)
{
  // Find the root container for the photos. The actual container is a child of this.
  var targetPhotoContainerParent = document.getElementById("fbTimelinePhotosContent");
  if(targetPhotoContainerParent == null) {
    console.log("FAILED TO FIND PARENT CONTAINER. EXITING.");
    return;
  }
  var photoContainer = targetPhotoContainerParent.children[0];
  console.log("Found parent container");
  console.log(photoContainer);
  
  // get the child div, which is the one that contains all the divs for photos
  var photos = GetPhotosLoaded(photoContainer);
  console.log("Found " + photos.length + " photos");
  // Grab the users ID.
  config.userId = GetUsersId();
  var i;
  for (i = 0; i < photos.length; i++) { 
    // The container is for creating a new variable, if you don't do this, it's going to share it among all instances of the function.
    SetPhotoStatusContainer(photos[i], status, config.timeBetweenLoadingPhotosMS * i);
  };
};

function GetUsersId()
{
   var metas = document.getElementsByTagName('meta'); 

   for (var i=0; i < metas.length; i++) { 
     // We're going to grab the users id by getting the android url. This is just a simple meta tag.
      if (metas[i].getAttribute("property") == "al:android:url") { 
         return metas[i].getAttribute("content").substr(13);
      } 
   } 
}

function GetPhotosLoaded(container)
{
  return container.children;
}

function SetPhotoStatusContainer(photoDiv, status, time)
{
  setTimeout(function() {SetPhotoStatus(photoDiv, status)}, time);
}

function SetPhotoStatus(photoDiv, status)
{
  console.log("Loading photo div");
  console.log(photoDiv);
  // Load up the DIV, as the private fbid doesn't load unless we do this. TODO: Figure out how private photo ID is grabbed, as the HTTP requests do not expose this. The public photo ID will return an error, so this is a requirement at this stage.
  photoDiv.children[1].click();
  // Send post event to facebook, as button presses will not work from album overview.
  // needs a delay, since the div may not yet be loaded, this can be optimized (only needs to be done on the first div load)
  setTimeout(function() {SendSetPrivateEvent(photoDiv, status)}, 500);
}

function SendSetPrivateEvent(photoDiv, status)
{
  console.log("id");
  var privacyPhotoId = document.getElementsByName("ft_ent_identifier")[1].value;
  // This is a field that's required for the post request. It's one of the only ones required, other than the userid. All the others(about 10 of them) do not produce any different results upon replication.
  var dtsg = document.getElementsByName('fb_dtsg')[0].value;;
  console.log("Privacy photo id is: " + privacyPhotoId);
  
  var http = new XMLHttpRequest();
  var url = "/privacy/selector/update/" + "?privacy_fbid=PHOTOID&post_param=286958161406148&render_location_enum=stream&is_saved_on_select=true&should_return_tooltip=false&prefix_tooltip_with_app_privacy=false&replace_on_select=false&ent_id=PHOTOID&dpr=1.".replace("PHOTOID", privacyPhotoId);
  var params = "__user=" + config.userId + "&__a=1&fb_dtsg=" + dtsg;
  http.open("POST", url, true);

  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.onreadystatechange = function() {
      if(http.readyState == 4 && http.status == 200) {
          console.log(http.responseText);
      }
  }
  http.send(params);
  console.log("Sent request!");
}

GetAndChangeAllPhotosStatus(config.targetStatus);
