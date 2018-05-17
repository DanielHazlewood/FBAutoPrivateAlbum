
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
  config.userId = GetUsersId();
  var i;
  for (i = 0; i < photos.length; i++) { 
    // The container is becasue if we don't create a new variable, this will be shared among all instances of setTimeout.
    SetPhotoStatusContainer(photos[i], status, config.timeBetweenLoadingPhotosMS * i);
  };
};

function GetUsersId()
{
   var metas = document.getElementsByTagName('meta'); 

   for (var i=0; i<metas.length; i++) { 
      if (metas[i].getAttribute("property") == "al:android:url") { 
         return metas[i].getAttribute("content").substr(13);
      } 
   } 
}

function GetPhotosLoaded(container)
{
  return container.children;
}

function ClickOnButton(statusButtonDiv)
{
  // Generic method as we make may make this more generic in future by reverse engineering the scripts involved
    statusButtonDiv.click();
}

function GetPrivateButtonDiv()
{
  var divs = document.getElementsByTagName("div");
  var elementText = "Only me";
  var divObject;

  for (var i = 0; i < divs.length; i++) {
    if (divs[i].textContent == elementText) {
      divObject = divs[i];
      break;
    }
  }
  // Go up the treeeeee until we find the root list element
  divObject = divObject.parentElement.parentElement.parentElement;
  console.log("Found button to set to private");
  console.log(divObject);
  return divObject;
}

function SetPhotoStatusContainer(photoDiv, status, time)
{
  setTimeout(function() {SetPhotoStatus(photoDiv, status)}, time);
}

function SetPhotoStatus(photoDiv, status)
{
  console.log("Loading photo div");
  console.log(photoDiv);
  photoDiv.children[1].click();
  // Send post event to facebook
  setTimeout(function() {SendSetPrivateEvent(photoDiv, status)}, 500);
}

function SendSetPrivateEvent(photoDiv, status)
{
  console.log("id");
  var privacyPhotoId = document.getElementsByName("ft_ent_identifier")[1].value;
  var dtsg = document.getElementsByName('fb_dtsg')[0].value;;
  console.log("Privacy photo id is: " + privacyPhotoId);
  
  var http = new XMLHttpRequest();
  var url = "/privacy/selector/update/" + "?privacy_fbid=PHOTOID&post_param=286958161406148&render_location_enum=stream&is_saved_on_select=true&should_return_tooltip=false&prefix_tooltip_with_app_privacy=false&replace_on_select=false&ent_id=PHOTOID&dpr=1.".replace("PHOTOID", privacyPhotoId).replace("PRIVACYTYPE", "286958161406148");;
  var params = "__user=" + config.userId + "&__a=1&fb_dtsg=" + dtsg;
  http.open("POST", url, true);

  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
          console.log(http.responseText);
      }
  }
  http.send(params);
  console.log("Sent!");
}
GetAndChangeAllPhotosStatus(config.targetStatus);

