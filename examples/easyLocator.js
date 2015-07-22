(function ( $ ) {  
   var that = this;
   this.easyLocatorMethods = {
      locations: [],
      htmlPlug: '<div class="locatorMap_loader">Loading...</div><div id="mapContainer_map" class="locatorMap_map"> </div><div class="locatorMap_listContainer locatorMap_list--desktop"><div class="locatorMap_listContainer_filter"> <input class="locatorMap_listContainer_filter_input" type="text" placeholder="filter.."> </div><ul class="locatorMap_list js-locatorMap_list"></ul> </div><div class="locatorMap_listContainer locatorMap_list--mobile js-locatorMap_listContaineMobile" style="display:none"> <div class="locatorMap_list_close js-locatorMap_list_Close"> <i class="fa fa-chevron-down"></i> </div><ul class="locatorMap_list"></ul> </div>',
      options: {
         mapContainer: undefined,
         map: undefined,         
         isAPIloaded: false,
         myLocations: [],
         openInfowindowAfterClick: false,
         useMarkerCluster: false,
         afterCLick: undefined,
         mapType: undefined,
         markerClustererOptions: { 
            maxZoom: 12
         }     
      },
      loadScripts : function(container) { 
         this.showHideLoader('show');
         var scriptMapUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true' +
            '&signed_in=true&language=en&callback=window.easyLocatorMethods.loadMap';
         
         var style = document.createElement('link');
         style.rel = "stylesheet";
         style.href = "//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css";
         var firstLink = document.getElementsByTagName('link')[0];
         firstLink.parentNode.insertBefore(style, firstLink);
         
        
         if(typeof google === 'object' && typeof google.maps === 'object') {
            that.easyLocatorMethods.options.isAPIloaded = true;
            this.loadMap();
         } else {
            
            if(typeof this.options.apiKey !== 'undefined') {
               scriptMapUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places&signed_in=true' +
               '&signed_in=true&language=en&key=' + this.options.apiKey + '&callback=window.easyLocatorMethods.loadMap';
            }            
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = scriptMapUrl
            document.body.appendChild(script);            
         }        
         
      },
      loadMap : function() {             
         this.options.isAPIloaded = true;         
         var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(-34.397, 150.644),
            mapTypeId: google.maps.MapTypeId.ROADMAP
         };

         if(typeof this.options.mapType !== 'undefined') {
            mapOptions.mapTypeId = google.maps.MapTypeId[this.options.mapType];
         }

         this.options.map = new google.maps.Map(document.getElementById('mapContainer_map'), mapOptions);        
         this.options.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.createButtonList());
         this.options.infoWindow = new google.maps.InfoWindow({ maxWidth: 400 });      
         this.options.markerClusterer = new MarkerClusterer(this.options.map, null,this.options.markerClustererOptions);
         
          google.maps.event.addListenerOnce(this.options.map, 'idle', function() { 
             if(typeof that.easyLocatorMethods.options.spreadsheetId !== 'undefined') {
                that.easyLocatorMethods.getJsonData();               
                return;
             }
             
             if(that.easyLocatorMethods.options.myLocations.length > 0) {
                that.easyLocatorMethods.loadMyLocations();
             }
                          
          });
         
      },
      createEvents: function() {
         $('.js-locatorMap_list_Close').on('click',function() {            
               $('.js-locatorMap_listContaineMobile').slideToggle( "fast");        
         });
         
         $('.locatorMap_listContainer_filter_input').change( function () {
            that.easyLocatorMethods.filterList(this);
         }).keyup( function () {
            that.easyLocatorMethods.filterList(this);
         });
      },
      filterList: function(input) {
         var filterTerm = $(input).val();
         
         if (filterTerm != '') {
            $('.js-locatorMap_list').find('.locatorMap_list_item_title:not(:contains_("' + filterTerm + '"))')
            .parent().slideUp();
            $('.js-locatorMap_list').find('.locatorMap_list_item_title:contains_("' + filterTerm + '")')
            .parent().slideDown();            
         } else {
            $('.js-locatorMap_list').find("li").slideDown();
         }
         
         
      },
      createButtonList: function(controlDiv) {
         var buttonOpenList = $.parseHTML('<div id="locatorMap_openList"><i class="fa fa-list"></i></div>')[0];        
         
         google.maps.event.addDomListener(buttonOpenList, 'click', function() {
            $('.js-locatorMap_listContaineMobile').slideToggle( "fast");
         });
         return buttonOpenList;
      },
      showHideLoader: function(action) {
         if(action == 'show') {
            $('.locatorMap_loader').show();   
         } else {
            $('.locatorMap_loader').hide();   
         }        
      },
      getJsonData: function() {
         var script = document.createElement('script');
         script.type = 'text/javascript';
         script.src = 'https://spreadsheets.google.com/feeds/list/' + this.options.spreadsheetId + '/od6/public/values?hl=en_US&alt=json' + 
          '&callback=window.easyLocatorMethods.successGetJsonData';
         script.async = true;
         document.body.appendChild(script);
         
      },
      getContentITemList: function(i,title){
         var htmlContent =  '<li class="locatorMap_list_item" data-indexarray="' + i + '">' + 
               '<i class="locatorMap_list_item_icon fa fa-map-marker"></i>' + 
               ' <span class="locatorMap_list_item_title">' + title + '</span>' +
               '</li>';
         return htmlContent;
      },
      successGetJsonData: function(json) {
         var listLocations = $('.locatorMap_list');
         listLocations.empty();
         var itemsHtml = '';
         
         for(var i = 0; i < json.feed.entry.length; i++) {
            var entry = json.feed.entry[i];    
            itemsHtml = itemsHtml + this.getContentITemList(i,entry.gsx$title.$t);            
            
            var marker = new google.maps.Marker({
               position: new google.maps.LatLng(entry.gsx$lat.$t,entry.gsx$lng.$t),               
               map: this.options.map,
               title: entry.gsx$title.$t               
            });            
            
            if(entry.gsx$iconmarker.$t != '') {
               marker.setOptions({
                  icon: {
                     url: entry.gsx$iconmarker.$t,
                     scaledSize: new google.maps.Size(32,32)
                   }
               });
            }
                      
            this.locations.push({
               title: entry.gsx$title.$t,
               description: entry.gsx$description.$t,
               image: entry.gsx$image.$t, 
               link: entry.gsx$link.$t,
               iconMarker: entry.gsx$iconmarker.$t,
               marker: marker 
            });
            
            if(this.options.useMarkerCluster) {
               this.options.markerClusterer.addMarker(marker);
            }
         }         
         listLocations.html(itemsHtml);     
         this.centerMapOnLocations();
         this.attachEventLocations();
         this.showHideLoader('hide');
      },
      loadMyLocations: function() {
         var listLocations = $('.locatorMap_list');
         listLocations.empty();
         var itemsHtml = '';
         
         for(var i = 0; i < this.options.myLocations.length; i++) {
            var entry = this.options.myLocations[i];       
            itemsHtml = itemsHtml + this.getContentITemList(i,entry.title);
            
            var marker = new google.maps.Marker({
               position: new google.maps.LatLng(entry.lat,entry.lng),               
               map: this.options.map,
               title: entry.title               
            });          
            
            if(typeof entry.iconMarker !== 'undefined') {
               marker.setOptions({
                  icon: {
                     url: entry.iconMarker,
                     scaledSize: new google.maps.Size(32,32)
                   }
               });
            }
                      
            this.locations.push({
               title: entry.title,
               description: entry.description,
               image: entry.image, 
               link: entry.link,
               iconMarker: entry.iconmarker,
               marker: marker 
            });
            
            if(this.options.useMarkerCluster) {
               this.options.markerClusterer.addMarker(marker);
            }
         }         
         listLocations.html(itemsHtml);     
         this.centerMapOnLocations();
         this.attachEventLocations();
         this.showHideLoader('hide');
      },
      centerMapOnLocations: function() {
         var bounds = new google.maps.LatLngBounds();
         for (var i = 0; i < this.locations.length; i++) {
            bounds.extend(this.locations[i].marker.getPosition());   
         }; 
         this.options.map.fitBounds(bounds);  
      },
      attachEventLocations: function() {
         
         function createEvent (location) {
            google.maps.event.addListener(location.marker,'click', function () {
               that.easyLocatorMethods.openInfoWindow(location);
            });
         }
         
         for (var i = 0; i < this.locations.length; i++) {
            createEvent(this.locations[i]);
         };
         
         $('.locatorMap_list_item').on('click',function() {
            var locationClicked = that.easyLocatorMethods.locations[$(this).attr('data-indexarray')];
            that.easyLocatorMethods.options.map.setCenter(locationClicked.marker.getPosition());
            
            if(that.easyLocatorMethods.options.openInfowindowAfterClick) {
               that.easyLocatorMethods.openInfoWindow(locationClicked);   
            }            
            
            if( $(window).width() <= 768) {//according to media query              
               $('.js-locatorMap_listContaineMobile').slideToggle( "fast");   
            }
            
         });
      },
      openInfoWindow: function(location) {
         var locationLink = '';
         var locationImage = '';
         
         if(location.link != '') {
            locationLink = '<p><a href="' + location.link + '" target="_blank">Link</a></p>';
         }
         
         if(location.image != '') {
            locationImage = '<img src="' + location.image + '" class="locatorMap_responsiveImg"/>';
         }
         
         var contentHTMl = '<div id="locatorMap_contentInfoWindow">' + locationImage + 
             '<p class="locatorMap_contentInfoWindow_title"><b>' + location.title + '</b></p><p>' + 
             location.description + '</p>' + locationLink + '</div>';
         this.options.infoWindow.setContent(contentHTMl);
         this.options.infoWindow.open(this.options.map, location.marker);
         
         if(typeof this.options.afterCLick !== 'undefined') {
            if(typeof this.options.afterCLick === 'function') {
               this.options.afterCLick(location);   
            }            
         }
      }
      
   };   
   
   $.fn.easyLocator = function(options) {
      //custom contain selector to convert to handle Case-Insensitive
      jQuery.expr[':'].contains_ = function(a,i,m){
          return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
      };
      this.addClass('locatorMap');
      this.html(that.easyLocatorMethods.htmlPlug);
      // This is the easiest way to have default options.
      that.easyLocatorMethods.options = $.extend(that.easyLocatorMethods.options,options);     
      that.easyLocatorMethods.options.mapContainer = this;   
      that.easyLocatorMethods.loadScripts();
      that.easyLocatorMethods.createEvents();       
      return this;
   };
 
}(jQuery));


