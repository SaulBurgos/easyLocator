(function ( $ ) {  
   var that = this;
   var deferEvents = $.Deferred();

   this.easyLocatorMethods = {
      locations: [],
      onEvents: deferEvents.promise(),
      locationActive: null,
      htmlPlug:   '<div class="locatorMap_loader">Loading...</div>' + 
                  '<div id="mapContainer_map" class="locatorMap_map"></div>' + 
                  '<div class="locatorMap_listContainer locatorMap_list--desktop js-locatorMap_listContainerDesktop">' + 
                     '<div class="locatorMap_listContainer_filter">  ' +
                        '<input class="locatorMap_listContainer_filter_input" type="text" placeholder="filter..">' + 
                     '</div>' + 
                     '<ul class="locatorMap_list js-locatorMap_list"></ul>' + 
                  '</div>' + 
                  '<div class="locatorMap_listContainer locatorMap_list--mobile js-locatorMap_listContainerMobile" style="display:none">' + 
                     '<div class="locatorMap_list_close js-locatorMap_list_Close"><i class="fa fa-chevron-down"></i></div>' + 
                     '<ul class="locatorMap_list"></ul>' + 
                  '</div>' + 
                  '<div class="locatorMap_template">' +                       
                  '</div>',
      options: {
         mapContainer: undefined,
         map: undefined,
         mapOptions: undefined,    
         isAPIloaded: false,
         myLocations: [],
         openInfowindowAfterClick: false,
         showListOnDesktop: true,
         showListOnMobile: true,
         itemListActiveCustomClass: '',
         infoWindowCustomClass: '',
         contentTemplate: '',
         useMarkerCluster: false,         
         mapType: undefined, //remove this
         centerMapOnLocation: true,      
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
         style.href = "https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css";
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

         that.easyLocatorMethods.triggerEvent({
            eventName: 'loadingMap',
            data: {}
         });

         this.options.isAPIloaded = true;
         var mapOptions;
         
         if(typeof this.options.mapOptions == 'undefined') {
            mapOptions = {
               zoom: 8,
               center: new google.maps.LatLng(-34.397, 150.644),
               mapTypeId: google.maps.MapTypeId.ROADMAP
            };
         } else {
            mapOptions = this.options.mapOptions;
         }

         this.options.map = new google.maps.Map(document.getElementById('mapContainer_map'), mapOptions);        
         this.options.map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.createButtonList());
         
         this.options.markerClusterer = new MarkerClusterer(this.options.map, null,this.options.markerClustererOptions);
         
         google.maps.event.addListenerOnce(this.options.map, 'idle', function() { 

            that.easyLocatorMethods.triggerEvent({
               eventName: 'mapLoaded',
               data: {}
            });

            if(typeof that.easyLocatorMethods.options.spreadsheetId !== 'undefined') {
               that.easyLocatorMethods.getJsonData();               
               return;
            }

            if(that.easyLocatorMethods.options.myLocations.length > 0) {
               that.easyLocatorMethods.loadMyLocations();
            }    

         });

         if(this.options.contentTemplate == '') {            
            this.options.infoWindow = new google.maps.InfoWindow({ maxWidth: 400 }); 

            google.maps.event.addListener(this.options.infoWindow,'closeclick',function(){            
               that.easyLocatorMethods.removeAllIconsActive();
            });
         }
         
      },
      createEvents: function() {
         $('.js-locatorMap_list_Close').on('click',function() {            
               $('.js-locatorMap_listContainerMobile').slideToggle( "fast");        
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
         if(!that.easyLocatorMethods.options.showListOnMobile) {
            return;
         }

         var buttonOpenList = $.parseHTML('<div id="locatorMap_openList"><i class="fa fa-list"></i></div>')[0];        
         
         google.maps.event.addDomListener(buttonOpenList, 'click', function() {
            $('.js-locatorMap_listContainerMobile').slideToggle( "fast");
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
      getContentITemList: function(i,title,itemInfo) {

         if(typeof itemInfo.gsx$iconmarker !== 'undefined') {
            itemInfo.iconMarker = itemInfo.gsx$iconmarker.$t;
         }

         var htmlContent =  '<li class="locatorMap_list_item" data-indexarray="' + i + '" data-isactive="false">' + 
               '<span class="ocatorMap_list_itemPlaceHolder"></span>'+                
               ' <span class="locatorMap_list_item_title">' + title + '</span>' +
               '</li>';         
         
         if(itemInfo.iconMarker == '' || typeof itemInfo.iconMarker == 'undefined' ) {
            htmlContent = htmlContent.replace('<span class="ocatorMap_list_itemPlaceHolder"></span>','<i class="locatorMap_list_item_icon fa fa-map-marker"></i>')
         }

         if(itemInfo.iconMarker != '') {
            htmlContent = htmlContent.replace(
               '<span class="ocatorMap_list_itemPlaceHolder"></span>',
               '<img src="' + itemInfo.iconMarker + '" class="locatorMap_list_item_iconImage" />')
         }
         
         return htmlContent;
      },
      successGetJsonData: function(json) {
         var listLocations = $('.locatorMap_list');
         listLocations.empty();
         var itemsHtml = '';
         
         for(var i = 0; i < json.feed.entry.length; i++) {
            var entry = json.feed.entry[i];    
            itemsHtml = itemsHtml + this.getContentITemList(i,entry.gsx$title.$t , entry);            
            
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
               index: i,
               title: entry.gsx$title.$t,
               description: entry.gsx$description.$t,
               image: entry.gsx$image.$t, 
               link: entry.gsx$link.$t,
               iconMarker: entry.gsx$iconmarker.$t,
               iconMarkerActive: entry.gsx$iconmarkeractive.$t,               
               marker: marker, 
               active: false 
            });
            
            if(this.options.useMarkerCluster) {
               this.options.markerClusterer.addMarker(marker);
            }
         }

         this.loadItemsOnList(listLocations,itemsHtml);         
      },
      loadMyLocations: function() {
         var listLocations = $('.locatorMap_list');
         listLocations.empty();
         var itemsHtml = '';
         
         for(var i = 0; i < this.options.myLocations.length; i++) {
            var entry = this.options.myLocations[i];       
            itemsHtml = itemsHtml + this.getContentITemList(i,entry.title ,entry);
            
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
               index: i,
               title: entry.title,
               description: entry.description,
               image: entry.image, 
               link: entry.link,
               iconMarker: entry.iconMarker,               
               iconMarkerActive: entry.iconMarkerActive,               
               marker: marker,
               active: false 
            });
            
            if(this.options.useMarkerCluster) {
               this.options.markerClusterer.addMarker(marker);
            }
         }         

         this.loadItemsOnList(listLocations,itemsHtml);         
      },
      loadItemsOnList: function(listLocations,itemsHtml) {
         listLocations.html(itemsHtml);
         that.easyLocatorMethods
         this.attachEventLocations();
         this.showHideLoader('hide');

         if(this.options.centerMapOnLocation) {
            this.centerMapOnLocations();
         }
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

               if(that.easyLocatorMethods.options.contentTemplate == '' ) {
                  that.easyLocatorMethods.openInfoWindow(location);
               } else {
                  that.easyLocatorMethods.openTemplate(location);   
               }      

               that.easyLocatorMethods.setIconsActiveOnItem({
                  elementClicked: $('.locatorMap_list_item')[location.index],
                  location: location
               });

               that.easyLocatorMethods.triggerEvent({
                  eventName: 'locationClicked',
                  data: location
               });
            });
         }
         
         for (var i = 0; i < this.locations.length; i++) {
            createEvent(this.locations[i]);
         };
         
         $('.locatorMap_list_item').on('click',function() {

            that.easyLocatorMethods.removeAllIconsActive();
            /*remove all active first*/
            $('.locatorMap_list_item').removeClass(that.easyLocatorMethods.options.itemListActiveCustomClass);      

            var locationClicked = that.easyLocatorMethods.locations[$(this).attr('data-indexarray')];
            that.easyLocatorMethods.options.map.setCenter(locationClicked.marker.getPosition());

            if(that.easyLocatorMethods.options.openInfowindowAfterClick && that.easyLocatorMethods.options.contentTemplate == '' ) {
               that.easyLocatorMethods.openInfoWindow(locationClicked);                
            } 

            if(that.easyLocatorMethods.options.contentTemplate != '') {
               that.easyLocatorMethods.openTemplate(locationClicked);
            }
            
            if( $(window).width() <= 768) {//according to media query              
               $('.js-locatorMap_listContainerMobile').slideToggle( "fast");   
            }

            if(that.easyLocatorMethods.options.itemListActiveCustomClass != '') {               
               $(this).addClass(that.easyLocatorMethods.options.itemListActiveCustomClass);
            };

            that.easyLocatorMethods.setIconsActiveOnItem({
               elementClicked: this,
               location: locationClicked
            });

            that.easyLocatorMethods.triggerEvent({
               eventName: 'locationClicked',
               data: locationClicked
            });
         });

         $(this.options.mapContainer).on('click','.locatorMap_template_close',function() {
            that.easyLocatorMethods.closeTemplate();
         });
      },
      setIconsActiveOnItem: function(data) {
         $(data.elementClicked).addClass('locatorMap_list_item--active');
         $(data.elementClicked).attr('data-isactive','true');
         data.location.active = true;

         if(data.location.iconMarkerActive != '' &&  typeof data.location.iconMarkerActive !== 'undefined') {
            $(data.elementClicked).find('img').attr('src',data.location.iconMarkerActive);

            
            data.location.marker.setOptions({
               icon: {
                  url: data.location.iconMarkerActive,
                  scaledSize: new google.maps.Size(42,42)
               }
            });
         }
      },
      removeAllIconsActive: function() {

         $('.locatorMap_list_item[data-isactive=true]').each(function( index ) {           
            var location = that.easyLocatorMethods.locations[$(this).attr('data-indexarray')];
            
            $(this).removeClass('locatorMap_list_item--active');
            location.active = false;

            if(location.iconMarker != '' &&  typeof location.iconMarker !== 'undefined') {

               $(this).find('img').attr('src',location.iconMarker);

               location.marker.setIcon({
                  url: location.iconMarker,
                  scaledSize: new google.maps.Size(32,32)
               });
               
            } else {
               location.marker.setIcon(null);
            }
         });

      },
      openTemplate : function(location) { 
         var compiled = _.template(this.options.contentTemplate);
         var containerTemplate = $(this.options.mapContainer).find('.locatorMap_template');
         containerTemplate.html(compiled(location));
         containerTemplate.show();
      },
      triggerEvent: function(data) {
         deferEvents.notify(data);
      },
      closeTemplate : function() {
         $(this.options.mapContainer).find('.locatorMap_template').hide();
      },      
      openInfoWindow: function(location) {
         var locationLink = '';
         var locationImage = '';
         this.locationActive = location;
         
         if(location.link != '') {
            locationLink = '<p><a href="' + location.link + '" target="_blank">View</a></p>';
         }
         
         if(location.image != '') {
            locationImage = '<img src="' + location.image + '" class="locatorMap_responsiveImg"/>';
         }
         
         var contentHTMl = '<div id="locatorMap_contentInfoWindow" class="' + that.easyLocatorMethods.options.infoWindowCustomClass  + ' ">' + locationImage + 
             '<p class="locatorMap_contentInfoWindow_title"><b>' + location.title + '</b></p><p>' + 
             location.description + '</p>' + locationLink + '</div>';
         this.options.infoWindow.setContent(contentHTMl);
         this.options.infoWindow.open(this.options.map, location.marker);
      },
      getMapInstance: function() {
         return this.options.map;
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

      if(!that.easyLocatorMethods.options.showListOnDesktop) {
         $('#mapContainer_map').addClass('locatorMap_map--fullWidth');
         $('.js-locatorMap_listContainerDesktop').hide();
      }

      //testing
      
      return that.easyLocatorMethods;
   };
 
}(jQuery));


