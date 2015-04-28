# easyLocator


EasyLocator is a jquery plugin to load locations with Google Maps in any website using a google spreadsheet or an array of objects.

Dependencies : [markerclusterer](https://googlemaps.github.io/js-marker-clusterer/docs/reference.html) , [Jquery](https://jquery.com/)


Examples:

 1. [Basic example](http://saulburgos.com/apps/easylocator/simple.html)
 2. [Array of object](http://saulburgos.com/apps/easylocator/array.html)

Add the plugin to your web

    <script src="easyLocator.js"></script>

How to use it.
--------------

1. Create a Google spreadsheet like [this](https://docs.google.com/spreadsheets/d/1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU/edit?usp=sharing) , columns names need to be the same.
2. Go to:  "file > publish to the web" and verify the following fields 

	![enter image description here](http://i.imgur.com/0GIrxtA.jpg?1) 
	
3. Copy the url and extract the spreadsheetId:
     example: 
     docs.google.com/spreadsheets/d/**1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU**/pubhtml
     (bold text is the ID)
4. Call easyLocator with your selector and pass your spreadsheetId

	$(*yourContainer*).**easyLocator**({
           spreadsheetId: '1QM92ghpvJpRBryStWI-PWcRhpBSsYPva4XCXUxieXNU'                     

	*"youcontainer" must have height*

5. Done.
	  

**Note:   before of using this plugin, you must insert the CSS and dependencies**

    <link rel="stylesheet" type="text/css" href="easyLocator.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="markerclusterer.min.js"></script>


SpreadSheet columns:
--------------------

**title:**   Title each locations, this will be use in the list.
**description:**  Description will only appear inside the infowindow
**lat:**  Coordinate use by google maps (latitude)
**lng:**  Coordinate use by google maps (longitude)
**image:**  Image of your location
**link:**  If you want add a link, it will appear after the description
**iconmarker:**  If you want to customize the icon marker, you can use a url. Size recommended 30x30 pixels (png,jpeg, jpg)

*The most important part  when you add a location  in your spreadsheet, are the coordinates (lat, lng) together describe the exact location of a place in Google map.*

*If you want to know these coordinates,  you can use [this example](http://jsfiddle.net/kjy112/QvNUF/), just drag the marker and you will see the coordinates*

easyLocator properties:
-----------------------
**spreadsheetId (string):**  Google spreadsheetId 
**useMarkerCluster (boolean):**  If you want use the [cluster marker](https://googlemaps.github.io/js-marker-clusterer/docs/reference.html)
**markerClustererOptions (object):**  Marker clusterer options
**openInfowindowAfterClick (boolean):**  If you what open the infowindows after click on ine item in the list.
**myLocations (array objects):**  array of object with your locations instead of the Google Spreadsheed.
 
 example array : 

    var data = [{
            title: '',
            description: '',
            image: '', 
            link: '',
            iconMarker: '',
            lat: 12.9232,
            lng: -85.9206
         }]

**easyLocator is 100% free to use. If you're using easyLocator on a commercial project and feeling generous, consider a donation. Thanks!**

[Donate :)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QBMMNFS76EMYU)
---------
