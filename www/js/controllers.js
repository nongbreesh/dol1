angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout,$ionicHistory,$state,$ionicSideMenuDelegate,$window) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  $scope.landinfo = null;
  //// Create the login modal that we will use later
  //$ionicModal.fromTemplateUrl('templates/login.html', {
  //  scope: $scope
  //}).then(function (modal) {
  //  $scope.modal = modal;
  //});
  //
  //// Triggered in the login modal to close it
  //$scope.closeLogin = function () {
  //  console.log('xx');
  //  $scope.modal.hide();
  //};
  //
  //// Open the login modal
  //$scope.login = function () {
  //  $scope.modal.show();
  //};
  //
  //
  $scope.activelayer = "ไม่มี";

  $scope.fullname = $window.localStorage.getItem('username');
  $scope.$on('loginsuccess', function (event, args) {
    $scope.fullname = $window.localStorage.getItem('username');
  });

  
  $scope.$on('layerchanged', function (event, args) {
    $scope.activelayer = args.title;
  });
  //
  //// Perform the login action when the user submits the login form
  $scope.doLogout = function () {
    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $window.localStorage.removeItem('user');
    $timeout(function () {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $('.left-buttons').hide();
      $('.right-buttons').hide();
      $ionicSideMenuDelegate.canDragContent(false);
      $state.go('app.login');
    }, 1000);
  };


})

.controller('PlaylistsCtrl', function ($scope) {
  $scope.playlists = [
    {title: 'Reggae', id: 1},
    {title: 'Chill', id: 2},
    {title: 'Dubstep', id: 3},
    {title: 'Indie', id: 4},
    {title: 'Rap', id: 5},
    {title: 'Cowbell', id: 6}
  ];
})
.controller('landingCtrl', function ($scope,$window,Loading,$timeout,$ionicHistory,$state) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $('.left-buttons').hide();
  $('.right-buttons').hide();
  var user = $window.localStorage.getItem('user');
  Loading.show('กรุณารอสักครู่');
  if(user){
    loginsuccess();
  }
  else{
    $timeout(function () {
      Loading.hide();
      $state.go('app.login');

    }, 3*1000);

  }
  function loginsuccess(){
    $timeout(function () {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $('.left-buttons').show();
      $('.right-buttons').show();
      Loading.hide();
      $state.go('app.map');
    }, 1000);
  }

})
.controller('loginCtrl', function ($scope, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService,$ionicSideMenuDelegate,$state,$ionicHistory,$window,$rootScope) {
  $('.left-buttons').hide();
  $('.right-buttons').hide();
  $ionicSideMenuDelegate.canDragContent(false);
  // Form data for the login modal
  $scope.loginData = {};

  Object.toparams = function ObjecttoParams(obj) {
    var p = [];
    for (var key in obj) {
      p.push(key + '=' + encodeURIComponent(obj[key]));
    }
    return p.join('&');
  };

  $scope.activelayer = "ไม่มี";
  $scope.$on('layerchanged', function (event, args) {
    $scope.activelayer = args.title;
  });

  // Perform the login action when the user submits the login form
  $scope.doLogin = function () {
    Loading.show('กรุณารอสักครู่');

    $scope.prms = $.param({
      username: $scope.loginData.username,
      password: $scope.loginData.password
    });
    ApiService.query('POST', 'http://110.164.49.42:82/dolapp/service/login',null,$scope.prms).then(function (respond) {
      console.log(respond.data);
      if(respond.data.result != null){
        $window.localStorage.setItem('user', respond.data.result);
        $window.localStorage.setItem('username', respond.data.result.username);
        $window.localStorage.setItem('first_name', respond.data.result.first_name);
        $window.localStorage.setItem('last_name', respond.data.result.last_name);
        $rootScope.$broadcast('loginsuccess');
        registerLog(respond.data.result.id,$scope.loginData.username);
        loginsuccess();
      }
      else{
        alert('ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบใหม่อีกครั้ง');
        Loading.hide();
      }

    });
  };

  function registerLog(userid , username){
    $scope.prms = $.param({
      userid: userid,
      username: username,
      ipaddr: '',
      platform: 'mobile',
    });

    ApiService.query('POST', 'http://110.164.49.42:82/dolapp/service/dolapp_saveuserlog', null, $scope.prms).then(function (respond) {

      if (respond.data.result != null) {

      }

    });


  }


  function loginsuccess(){
    $timeout(function () {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $('.left-buttons').show();
      $('.right-buttons').show();
      Loading.hide();
      $state.go('app.map');
    }, 1000);
  }
})
.controller('MapCtrl', function ($scope, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService,$ionicSideMenuDelegate) {
  $ionicSideMenuDelegate.canDragContent(true);

  cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
    //alert("Location is " + (enabled ? "enabled" : "disabled"));
    if(!enabled){
      alert('กรุณาเปิดการใช้งาน Location service');
      cordova.plugins.diagnostic.switchToLocationSettings();
    }
  }, function(error) {
    alert("The following error occurred: " + error);
  });

  $scope.doMapInit = function() {

    angular.extend($scope, {
      tiles: {
        url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
      },
      defaults: {
        scrollWheelZoom: false
      }
    });


  };


  $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    $scope.map = {
      eeuu: {
        lat: 39,
        lng: -100,
        zoom: 4
      },
      layers: {
        baselayers: {
          xyz: {
            name: 'OpenStreetMap (XYZ)',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            type: 'xyz'
          },
          recentimagery: {
            name: 'Digital Globe (Recent Imagery)',
            url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0mpda/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
            type: 'xyz'
          }
          ,  recent_imagery_with_streets: {
            name: 'Digital Globe (Recent Imagery with Streets)',
            url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
            type: 'xyz'
          },
          bingAerial: {
            name: 'Bing Aerial',
            type: 'bing',
            key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
            layerOptions: {
              type: 'Aerial'
            }
          },
          bingRoad: {
            name: 'Bing Road',
            type: 'bing',
            key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
            layerOptions: {
              type: 'Road'
            }
          },
          bingAerialWithLabels: {
            name: 'Bing Aerial With Labels',
            type: 'bing',
            key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
            layerOptions: {
              type: 'AerialWithLabels'
            }
          }
          ,

        },
        overlays: {
          parcellat: {
            name: 'PARCEL',
            type: 'wms',
            url: 'http://wms.dol.go.th/dol/parcel/wms',
            visible: false,
            layerOptions: {
              layers: 'PARCEL',
              format: 'image/png',
              opacity:.5,
              //crs: L.CRS.EPSG900913
            }
          },
          ortho: {
            name: 'ORTHO',
            type: 'wms',
            url: 'http://wms.dol.go.th/dol/ortho/wms?',
            visible: false,
            layerOptions: {
              layers: 'ORTHO_2554',
              format: 'image/png',
              opacity:.5,
            }
          },
          landuse: {
            name: 'LANDUSE',
            type: 'wms',
            url: 'http://landsmms.dol.go.th:8080/geoserver/Landuse/wms?',
            visible: false,
            layerOptions: {
              layers: 'landuse',
              format: 'image/png',
              opacity:.5,
            }
          },
          building: {
            name: 'BUILDING',
            type: 'wms',
            url: 'http://landsmms.dol.go.th:8080/geoserver/building/wms?',
            visible: false,
            layerOptions: {
              layers: 'building_data',
              format: 'image/png',
              opacity:.7,
            }
          },

        }
      },
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 18,
        zoomControlPosition: 'bottomleft'
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      }
    };
    $scope.map.center = {};


    //




    console.log($scope.map);



    console.log($scope.map.layers.overlays);



    if (toState.name == "app.map") {

      activeland();
      if ($scope.activelayer == "ไม่มี") {

      }
      else {
        for(i = 0;i < $scope.activelayer.length;i++){
          $scope.map.layers.overlays[$scope.activelayer[i]] = {
            name: $scope.activelayer[i],
            type: 'wms',
            visible: true,
            url: 'http://landsportal.dol.go.th/geoserver/dol/wms?',
            layerParams: {
              layers: $scope.activelayer[i],
              format: 'image/png',
              transparent: true,
              opacity:.5,
            }
          };

        }
        // $scope.map.layers.overlays.wms = {
        //   name: $scope.activelayer,
        //   type: 'wms',
        //   visible: true,
        //   url: 'http://landsportal.dol.go.th/geoserver/dol/wms',
        //   layerParams: {
        //     layers: $scope.activelayer,
        //     format: 'image/png',
        //     transparent: true
        //   }
        // };


      }
    }

  }),


  locate();

  /**
  * Center map on user's current position
  */
  $scope.locate = function () {
    locate();
  };


  function locate() {
    Loading.show('กรุณารอสักครู่...');
    $scope.locname = 'finding location';
    $scope.locname2 = 'Loading...';
    $cordovaGeolocation
    .getCurrentPosition()
    .then(function (position) {
      console.log($scope.map);
      $scope.map.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 15
      };
      //$scope.map.center.lat  = position.coords.latitude;
      //$scope.map.center.lng = position.coords.longitude;
      //$scope.map.center.zoom = 15;

      $scope.map.markers.now = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        focus: true,
        draggable: true
      };
      Loading.hide();
      //updatelocation(position.coords.latitude, position.coords.longitude);

    }, function (err) {
      // error
      //alert('กรุณาตรวจสอบ Location service ของท่านว่าเปิดอยู่หรือไม่');
      $timeout(function() {
        Loading.hide();
        console.log("Location error!");
        console.log(err);
      }, 3000);


    });
  }


  // function updatelocation(lat, lng, callback) {
  //   Loading.show('finding your location...');
  //
  //   navigator.geolocation.getCurrentPosition(onSuccess, onError);
  //   function onSuccess(position) {
  //     $scope.lat = position.coords.latitude;
  //     $scope.lng = position.coords.longitude;
  //     ApiService.query('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false', null, null).then(function (respond) {
  //       $scope.locname = respond.data.results[0].formatted_address;
  //       $scope.locname2 = respond.data.results[0].address_components[3].long_name;
  //     });
  //     Loading.hide();
  //     callback && callback();
  //   }
  //
  //   function onError(error) {
  //         Loading.hide();
  //   }
  //
  // }


  $scope.searchData = {};

  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function () {
    $scope.modal.hide();

    activeland();
  };

  function activeland() {
    if ($scope.landinfo != null) {
      angular.forEach($scope.landinfo, function (value, key) {
        console.log(value);
        $scope.map.markers.now = {
          lat: parseFloat(value.parcellat),
          lng: parseFloat(value.parcellon),
          message: "<a href='#/app/map/" + value.provid.trim() + "/" + value.amphurid.trim() + "/" + value.parcelno.trim() + "'>ดูรายละเอียด</a>",
          focus: true,
          draggable: true
        };

        $scope.map.center = {
          lat: parseFloat(value.parcellat),
          lng: parseFloat(value.parcellon),
          zoom: 15
        };

      });
    }
  }

  // Open the login modal
  $scope.search = function () {
    $scope.modal.show();
  };


  $scope.provincecode = "0";
  $scope.aumpurecode = "0";
  $scope.chanode = "";
  $scope.provinceidselected = "0";
  $scope.selectedprovince = function () {
    Loading.show('กรุณารอสักครู่...');
    $scope.provinceidselected = $(".province").val();

    ApiService.query('GET', 'http://110.164.49.42:82/dolapp/service/GetAmphur/' + $scope.provinceidselected, null, null).then(function (respond) {
      $scope.aumpurelist = respond.data;
      Loading.hide();
    });
    $scope.selectedaumpure();
  }


  $scope.selectedaumpure = function () {
    $scope.aumpurecode = $(".aumpure").val();
  }

  //$(".province").click(function () {
  //  alert("Handler for .change() called.");
  //});

  $scope.doSearch = function () {
    Loading.show('กรุณารอสักครู่...');
    $scope.chanode = $(".chanode").val();
    console.log('Doing search', $scope.provinceidselected);
    console.log('Doing search', $scope.aumpurecode);
    console.log('Doing search', $scope.chanode);


    if ($scope.provinceidselected == "" || $scope.aumpurecode == "" || $scope.chanode == "") {
      alert('กรุณาระบุข้อมูลให้ครบถ้วน');
      Loading.hide();
    }
    else {
      ApiService.query('GET', 'http://110.164.49.42:82/dolapp/service/GetLandsInformations/' + $scope.provinceidselected + '/' + $scope.aumpurecode.substr(2, 4) + '/' + $scope.chanode, null, null).then(function (respond) {
        Loading.hide();
        if (respond.data != null) {
          $scope.landinfo = respond.data;
          $scope.closeLogin();
        }
        else {
          alert('ไม่พบข้อมูล');
        }

      });

    }

  };
})
.controller('MaplistCtrl', function ($scope, $stateParams, ApiService, $rootScope, $ionicHistory, $http,Loading) {

  $scope.selectedlayers = [];
  $scope.layerselected={}
  $scope.activelayer = function (title) {
    $scope.selectedlayers = [];
    for(var i = 0; i <   $scope.layerlist.length;i++){
      if($scope.layerselected[$scope.layerlist[i].name] == true){
        $scope.selectedlayers.push($scope.layerlist[i].name);
      }

    }

    //console.log($scope.selectedlayers);
    $ionicHistory.goBack()
    $rootScope.$broadcast('layerchanged', {title: $scope.selectedlayers});
  };

  $scope.clearlayer = function (title) {
    $ionicHistory.goBack()
    $rootScope.$broadcast('layerchanged', {title:[]});
  };


  // $scope.selectlayer = function (title) {
  //     $scope.selectedlayers.push(title);
  //     console.log($scope.selectedlayers);
  // };

  Loading.show('กรุณารอสักครู่...');
  ApiService.query('GET', 'http://110.164.49.42:82/dolapp/service/dolapp_layersformobile', null, null).then(function (respond) {
    Loading.hide();
    if (respond.data != null) {
      console.log(respond.data);
      $scope.layerlist = respond.data.result;
    }

  });


  // var layerUrl = "http://110.164.49.42/api/layers/";
  // $http({
  //   method: 'jsonp',
  //   url: layerUrl,
  //   params: {
  //     format: 'jsonp',
  //     callback: 'JSON_CALLBACK'
  //   }
  // }).then(function (response) {
  //   console.log(response);
  //   $scope.layerlist = response.data.objects;
  // });

  //$scope.layerlist = [
  //  {
  //    title: "prof_est_04",
  //    thumbnail_url: "http://demo.geonode.org/uploaded/thumbs/layer-0908d150-50b7-11e6-9a24-0e23392a5c01-thumb.png",
  //    abstract: "No abstract provided"
  //  },
  //  {
  //    title: "mv_substation",
  //    thumbnail_url: "http://demo.geonode.org/uploaded/thumbs/layer-7b146844-5027-11e6-a524-0e23392a5c01-thumb.png",
  //    abstract: "No abstract provided"
  //  }
  //];


})

.controller('LayerDetailCtrl', function ($scope, $stateParams) {
})

.controller('HowtoCtrl', function ($scope, $stateParams) {
})

.controller('MapDetailCtrl', function ($scope, $stateParams, ApiService, Loading, LocationsService, $cordovaGeolocation) {
  Loading.show("กรุณารอสักครู่...");
  console.log($stateParams);
  ApiService.query('GET', 'http://110.164.49.42:82/dolapp/service/GetLandsInformations/' + $stateParams.provid + '/' + $stateParams.amphurid + '/' + $stateParams.parcelno, null, null).then(function (respond) {
    Loading.hide();
    console.log(respond);
    if (respond.data != null) {
      $scope.landval = respond.data[0];
      $scope.ggland = "http://maps.google.com/?q=" + parseFloat($scope.landval.parcellat) + "," + parseFloat($scope.landval.parcellon);

      console.log($scope.landval);

      $scope.launchggmap = function () {
        var location = parseFloat($scope.landval.parcellat) + ',' + parseFloat($scope.landval.parcellon);
        if(ionic.Platform.isIOS()){
          window.open('comgooglemaps://?q=' + location, '_system');
        }
        else{
          window.open('http://maps.apple.com/maps?q=' + location, '_system');
        }
      }

      $scope.gotolandoffice = function () {
        var from = parseFloat($scope.landval.parcellat) + ',' + parseFloat($scope.landval.parcellon);
        var to = parseFloat($scope.landval.landofficelat) + ',' + parseFloat($scope.landval.landofficelon);
        if(ionic.Platform.isIOS()){
          window.open('comgooglemaps://?saddr=' + from +'&daddr='+ to, '_system');
        }
        else{
          window.open('http://maps.apple.com/maps?saddr=' + from +'&daddr=' + to, '_system');
        }
      }
      $scope.gotoland = function () {
        var to = parseFloat($scope.landval.parcellat) + ',' + parseFloat($scope.landval.parcellon);
        if(ionic.Platform.isIOS()){
          window.open('comgooglemaps://?q=' + to, '_system');
        }
        else{
          window.open('http://maps.apple.com/maps?q=' + to, '_system');
        }



      }

    }
    else {
      alert('ไม่พบข้อมูล');
    }

  });


})
.controller('MapLayerDetailCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet, $timeout) {
  console.log($stateParams);
  $scope.title = $stateParams.id;
  $scope.actionsheetshow = function () {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        {text: 'ดู'},
        {text: 'เพิ่ม'},
        {text: 'แก้ไข'}
      ],
      titleText: 'Modify layer',
      cancelText: 'Cancel',
      cancel: function () {
        // add cancel code..
      },
      buttonClicked: function (index) {
        console.log(index);

        return true;
      }
    });

  };

  $scope.activetool = function (type) {
    alert(type);
  }


  $scope.map = {
    defaults: {
      tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      maxZoom: 18,
      zoomControlPosition: 'bottomleft'
    },
    markers: {},
    events: {
      map: {
        enable: ['context'],
        logic: 'emit'
      }
    }
  };
  $scope.map.center = {};

  locate();

  $scope.locate = function () {
    locate();
  };


  function locate() {
    Loading.show('กรุณารอสักครู่...');
    $scope.locname = 'finding location';
    $scope.locname2 = 'Loading...';
    $cordovaGeolocation
    .getCurrentPosition()
    .then(function (position) {
      console.log($scope.map);
      $scope.map.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        zoom: 15
      };

      $scope.map.markers.now = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        message: "<a href='#/app/layerdetail/1'>ดูรายละเอียด</a>",
        focus: true,
        draggable: true
      };
      Loading.hide();

    }, function (err) {
      // error
      console.log("Location error!");
      console.log(err);
      $scope.hide($ionicLoading);
    });
  }
});
;
