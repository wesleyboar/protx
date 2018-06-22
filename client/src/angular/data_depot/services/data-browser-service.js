import _ from 'underscore';
import angular from 'angular';
import $ from 'jquery';
import copyModalTemplate from '../modals/data-browser-service-copy.html';
import moveModalTemplate from '../modals/data-browser-service-move.html';
import mkdirModalTemplate from '../modals/data-browser-service-mkdir.html';
import previewModalTemplate from '../modals/data-browser-service-preview.html';
import renameModalTemplate from '../modals/data-browser-service-rename.html';
import uploadModalTemplate from '../modals/data-browser-service-upload.html';

// var $ = require('jquery');

function DataBrowserService($rootScope, $http, $q, $timeout, $uibModal, $state, Django, FileListing) {
  'ngInject';

  /**
   * @type {{busy: boolean, listing: FileListing, selected: Array}}
   */
  var currentState = {
    busy: false,
    busyListing: false,
    error: null,
    listing: null,
    selected: [],
    loadingMore: false,
    reachedEnd: false,
    page: 0,
    showMainListing: true,
    showPreviewListing: false,
    ui: {
        message: {}
    }
  };

  var apiParams = {
    fileMgr : 'agave',
    baseUrl : '/api/files'
  };

  var toolbarOpts = {};
  var currentBrowseRequest = null;
  /**
   * Enumeration of event `DataBrowserService::Event` types
   *
   * @readonly
   * @enum {string}
   */
  var FileEvents = {
    FILE_ADDED: 'FileAdded',
    FILE_COPIED: 'FileCopied',
    FILE_MOVED: 'FileMoved',
    FILE_REMOVED: 'FileRemoved',
    FILE_SELECTION: 'FileSelection',
    FILE_META_UPDATED: 'MetadataUpdated'
  };

  /**
   * Enumeration of event `DataBrowserService::EventMessage` strings
   *
   * @readonly
   * @enum {string}
   */
  var FileEventsMsg = {
    FILE_ADDED: 'Your file was added.',
    FILE_COPIED: 'Your file was copied.',
    FILE_MOVED: 'Your file was moved.',
    FILE_REMOVED: 'Your file was remove.',
    FILE_SELECTION: 'Your file has been selected.',
    FILE_META_UPDATED: 'Metadata object updated.',
  };

  // TODO figure out how to make this more programmatic. Just hacking for now.
  function toolbarOptions() {
    $http.get('/api/data-depot/toolbar/params')
      .then(function(resp) {
          var toolbarOpts = {
            trash_enabled: resp.data.response.trash_enabled,
            share_enabled: resp.data.response.share_enabled,
            preview_enabled: resp.data.response.preview_enabled,
            preview_images_enabled: resp.data.response.preview_images_enabled,
            copy_enabled: resp.data.response.copy_enabled,
            move_enabled: resp.data.response.move_enabled,
            rename_enabled: resp.data.response.rename_enabled,
            tag_enabled: resp.data.response.tag_enabled
          };
          return toolbarOpts;
        },
        function(error) {
          console.log('$http.get Error', error);
        });
  }

  /**
   * Gets the apiParams of the DataBrowserService.
   */
  function apiParameters(){
    return apiParams;
  }

  /**
   * Gets the state of the DataBrowserService.
   *
   * @return {{busy: boolean, listing: FileListing, selected: Array}}
   */
  function state() {
    return currentState;
  }


  /**
   *
   * @param {FileListing[]} files FileListing objects to select
   * @param {boolean} [reset] If true, clears current selection before selecting the passed files.
   */
  function select(files, reset) {
    if (reset) {
      deselect(currentState.selected);
    }
    _.each(files, function(f) {
      f._ui = f._ui || {};
      f._ui.selected = true;
    });
    currentState.selected = _.union(currentState.selected, files);
    notify(FileEvents.FILE_SELECTION, FileEventsMsg.FILE_SELECTION,
           currentState.selected);
  }


  /**
   *
   * @param {FileListing[]} files FileListing objects to de-select
   */
  function deselect(files) {
    _.each(files, function(f) {
      f._ui = f._ui || {};
      f._ui.selected = false;
    });
    currentState.selected = _.difference(currentState.selected, files);
    notify(FileEvents.FILE_SELECTION, FileEventsMsg.FILE_SELECTION,
           currentState.selected);
  }


  /**
   * Tests for the DataBrowser actions allowed on the given file(s) from the current listing.
   *
   * @param {FileListing|FileListing[]} files Files to test
   * @return {{canDownload: {boolean}, canPreview: {boolean}, canViewMetadata: {boolean}, canShare: {boolean}, canCopy: {boolean}, canMove: {boolean}, canRename: {boolean}, canTrash: {boolean}, canDelete: {boolean}}}
   */
  function allowedActions (files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    var tests = {};
    tests.canDownload = files.length >= 1 && hasPermission('READ', files) && !containsFolder(files);
    tests.canPreview = files.length === 1 && hasPermission('READ', files);
    tests.canPreviewImages = files.length >= 1 && hasPermission('READ', files);
    tests.canViewMetadata = files.length >= 1 && hasPermission('READ', files);
    tests.canShare = files.length === 1 && $state.current.name === 'myData';
    tests.canCopy = files.length >= 1 && hasPermission('READ', files);
    tests.canMove = files.length >= 1 && hasPermission('WRITE', [currentState.listing].concat(files)) && ($state.current.name !== 'dropboxData' && $state.current.name !== 'boxData');
    tests.canRename = files.length === 1 && hasPermission('WRITE', [currentState.listing].concat(files));
    tests.canViewCategories = files.length >=1 && hasPermission('WRITE', files);

    var trashPath = _trashPath();
    tests.canTrash = ($state.current.name === 'wb.data_depot.db' || $state.current.name === 'db.projects.view.data') && files.length >= 1 && currentState.listing.path !== trashPath && !_.some(files, function(sel) { return isProtected(sel); });
    tests.canDelete = $state.current.name === 'wb.data_depot.db' && files.length >= 1 && currentState.listing.path === trashPath;

    return tests;
  }

  function showListing(){
    currentState.showMainListing = true;
    currentState.showPreviewListing = false;
  }

  function showPreview(){
    currentState.showMainListing = false;
    currentState.showPreviewListing = true;
  }

  /**
  *
  * @param options
  * @param options.system
  * @param options.path
  */
  function browse (options) {
    // debugger
    if (currentBrowseRequest) {
      currentBrowseRequest.stopper.resolve();
      currentBrowseRequest = null;
      // $timeout.cancel(currentBrowseRequest);
    }

    currentState.busy = true;
    currentState.busyListing = true;
    currentState.error = null;
    currentState.loadingMore = true;
    currentState.reachedEnd = false;
    currentState.busyListingPage = false;
    currentState.page = 0;
    currentBrowseRequest =  FileListing.get(options, apiParams);

    currentBrowseRequest.then(function (listing) {
      select([], true);
      currentState.busy = false;
      currentState.busyListing = false;
      currentState.loadingMore = false;
      currentState.reachedEnd = false;
      currentState.listing = listing;
      return listing;
    }, function (err) {
      // This is for a cancelled promise...
      if (err.status == -1) {
        currentState.busyListing = true;
        currentState.busy = true;
      } else {
        currentState.busy = false;
        currentState.busyListing = false;
      }
      currentState.listing = null;
      currentState.error = err;
      currentState.loadingMore = false;
      currentState.reachedEnd = false;
      return err;
    });
    return currentBrowseRequest;
  }

  /**
   *
   * @param options
   * @param options.system
   * @param options.path
   * @param options.page
   */
  function browsePage (options) {
    currentState.busy = true;
    currentState.busyListingPage = true;
    currentState.error = null;
    var limit = 100;
    var offset = 0;
    if (options.page){
      offset += limit * options.page;
    }
    var params = {limit: limit, offset: offset};
    return FileListing.get(options, apiParams, params).then(function (listing) {
      select([], true);
      currentState.busy = false;
      currentState.busyListingPage = false;
      currentState.listing.children = currentState.listing.children.concat(listing.children);
      return listing;
    }, function (err) {
      currentState.busy = false;
      currentState.busyListingPage = false;
    });
  }


  /**
   *
   * @param {FileListing|FileListing[]} files
   * @return {*}
   */
  function copy (files) {
    if (!Array.isArray(files)) {
      files = [files];
    }

    var modal = $uibModal.open({
      template: copyModalTemplate,
      controller: 'ModalMoveCopy',
      resolve: {
        data: {
          files: function () {return files;}
        }
      }
    });

    return modal.result.then(
      function (result) {
        currentState.busy = true;
        var copyPromises = _.map(files, function (f) {
          var system = result.system || f.system;
          return f.copy({system: result.system, path: result.path, resource: result.resource}).then(function (result) {
            //notify(FileEvents.FILE_COPIED, FileEventsMsg.FILE_COPIED, f);
            return result;
          });
        });
        return $q.all(copyPromises).then(function (results) {
          currentState.busy = false;
          return results;
        });
      }
    );
  }


  // /**
  //  *
  //  */
  // function details () {
  //   throw new Error('not implemented')
  // }


  /**
   * Download files. Returns a promise that is resolved when all downloads have been
   * _started_. Resolved with the download URL for each file.
   *
   * @param {FileListing|FileListing[]} files
   * @return {Promise}
   */
  function download (files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    var download_promises = _.map(files, function(file) {
      return file.download().then(function (resp) {
        var link = document.createElement('a');
        link.style.display = 'none';
        link.setAttribute('href', resp.response.href);
        link.setAttribute('download', "null");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return resp;
      });
    });
    return $q.all(download_promises);
  }


  /**
   * TODO
   *
   * @returns {*}
   */
  function getFileManagers () {
    return $http.get('/api/files/file-managers/').then(function (resp) {
      return resp.data;
    });
  }


  /**
   *
   * @param {FileListing|FileListing[]} files
   */
  function containsFolder (files) {
    if (!Array.isArray(files)) {
      files = [files];
    }

    var folders = _.filter(files, {type:'dir'});
    return (folders.length > 0);
  }
  /**
   *
   * @param {string} permission
   * @param {FileListing|FileListing[]} files
   */
  function hasPermission (permission, files) {
    if (!Array.isArray(files)) {
      files = [files];
    }
    return _.reduce(files, function(memo, file) {
      var pem = file.permissions === 'ALL' || file.permissions.indexOf(permission) > -1;
      if (memo !== null) {
        pem = memo && pem;
      }
      return pem;
    }, null);
  }


  /**
   * This is not a great implementation, need to be more extensible...
   * @param {FileListing} file
   */
  function isProtected (file) {
    if (file.system === 'designsafe.storage.default') {
      if (file.trail.length === 3 && file.name === '.Trash') {
        return true;
      }
    }
    return false;
  }


  /**
   * Create a directory in the current listing directory.
   *
   * @returns {Promise}
   */
  function mkdir () {
    var modal = $uibModal.open({
      template: mkdirModalTemplate,
      controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
        $scope.form = {
          folderName: 'Untitled_folder'
        };

        $scope.doCreateFolder = function($event) {
          $event.preventDefault();
          $uibModalInstance.close($scope.form.folderName);
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      }]
    });

    return modal.result.then(function(folderName) {
      currentState.busy = true;
      currentState.listing.mkdir({
        name: folderName
      }).then(function(newDir) {
        currentState.busy = false;
        //notify(FileEvents.FILE_ADDED, FileEventsMsg.FILE_ADDED, newDir);
      }, function(err) {
        // TODO better error handling
        currentState.busy = false;
      });
    });
  }


  /**
   *
   * @param {FileListing|FileListing[]} files
   * @param {FileListing} initialDestination
   * @returns {Promise}
   */
  function move (files, initialDestination) {
    if (!Array.isArray(files)) {
      files = [files];
    }

    var modal = $uibModal.open({
      template: moveModalTemplate,
      controller: 'ModalMoveCopy',
      resolve: {
        data: {
          files: function () {return files;},
          // initialDestination: function () { return initialDestination; }
        }
      }
    });

    return modal.result.then(
      function (result) {
        currentState.busy = true;
        //if (result.system !== files[0].system){
        //  return $q.when(files);
        //}
        var movePromises = _.map(files, function (f) {
          return f.move({system: result.system, path: result.path}).then(function (result) {
            deselect([f]);
            //notify(FileEvents.FILE_MOVED, FileEventsMsg.FILE_MOVED, f);
            return result;
          });
        });
        return $q.all(movePromises).then(function (results) {
          currentState.busy = false;
          return results;
        });
      }
    );
  }


  /**
   *
   * @param {FileListing} file
   * @return {Promise}
   */
  function preview (file, listing) {
    var modal = $uibModal.open({
      template: previewModalTemplate,
      controller: ['$scope', '$uibModalInstance', '$sce', 'file', function ($scope, $uibModalInstance, $sce, file) {
        $scope.file = file;
        if (typeof listing !== 'undefined' &&
            typeof listing.metadata !== 'undefined' &&
            !_.isEmpty(listing.metadata.project)){
          var _listing = angular.copy(listing);
          $scope.file.metadata = _listing.metadata;
        }
        $scope.busy = true;

        file.preview().then(
          function (data) {
            $scope.previewHref = $sce.trustAs('resourceUrl', data.href);
            $scope.busy = false;
          },
          function (err) {
            var fileExt = file.name.split('.').pop();
            var videoExt = ['webm', 'ogg', 'mp4'];

            //check if preview is video
            if (videoExt.includes(fileExt) ) {
              $scope.prevVideo = true;
              file.download().then(
                function(data){
                  var postit = data.href;
                  var oReq = new XMLHttpRequest();
                  oReq.open("GET", postit, true);
                  oReq.responseType = 'blob';

                  oReq.onload = function() {
                    if (this.status === 200) {
                      var videoBlob = this.response;
                      var vid = URL.createObjectURL(videoBlob);

                      // set video source and mimetype
                      document.getElementById("videoPlayer").src=vid;
                      document.getElementById("videoPlayer").setAttribute('type', `video/${fileExt}`);
                    };
                  };
                  oReq.onerror = function() {
                    $scope.previewError = err.data;
                    $scope.busy = false;
                  };
                  oReq.send();
                  $scope.busy = false;
                },
                function (err) {
                  $scope.previewError = err.data;
                  $scope.busy = false;
                });
            // if filetype is not video or ipynb
            } else if (fileExt != 'ipynb') {
              $scope.previewError = err.data;
              $scope.busy = false;
            // if filetype is ipynb
            } else {
                file.download().then(
                  function(data){
                    var postit = data.href;
                    var oReq = new XMLHttpRequest();

                    oReq.open("GET", postit, true);

                    oReq.onload = function(oEvent) {
                      var blob = new Blob([oReq.response], {type: "application/json"});
                      var reader = new FileReader();

                      reader.onload = function(e){
                        var content = JSON.parse(e.target.result);
                        var target = $('.nbv-preview')[0];
                        // nbv.render(content, target);
                      };

                      reader.readAsText(blob);
                    };

                    oReq.send();
                  },
                  function (err) {
                    $scope.previewError = err.data;
                    $scope.busy = false;
                  });
            }
          }
        );

        $scope.tests = allowedActions([file]);

        $scope.download = function() {
          download(file);
        };
        $scope.share = function() {
          // share(file);
        };
        $scope.copy = function() {
          copy(file);
        };
        $scope.move = function() {
          move(file, currentState.listing);
        };
        $scope.rename = function() {
          rename(file);
        };
        $scope.viewMetadata = function() {
          $scope.close();
          // viewMetadata([file]);
        };
        $scope.trash = function() {
          trash(file);
        };
        $scope.rm = function() {
          // rm(file);
        };

        $scope.close = function () {
          $uibModalInstance.dismiss();
        };

      }],
      size: 'lg',
      resolve: {
        file: function() { return file; }
      }
    });

    return modal.result;
  }

  /**
   *
   * @param {FileListing} file
   * @return {Promise}
   */
  function rename (file) {
    var modal = $uibModal.open({
      template: renameModalTemplate,
      controller: ['$scope', '$uibModalInstance', 'file', function ($scope, $uibModalInstance, file) {
        $scope.form = {
          targetName: file.name
        };

        $scope.file = file;

        $scope.doRenameFile = function($event) {
          $event.preventDefault();
          $uibModalInstance.close({file: file, renameTo: $scope.form.targetName});
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      }],
      resolve: {
        file: file
      }
    });

    return modal.result.then(function (result) {
      currentState.busy = true;
      return result.file.rename({name: result.renameTo})
        .then(
          function (result) {
            currentState.busy = false;
            // $rootScope.$broadcast('DataBrowserService::Refresh', {
            //   type: 'rename',
            //   context: result,
            //   msg: result
            // });
            $state.reload();
          },
          function (err) {
            currentState.busy = false;
          });
    });
  }


  /**
   * TODO
   *
   * @param options
   */
  function search (options) {
    currentState.busy = true;
    currentState.busyListing = true;
    currentState.error = null;
    return FileListing.search(options, apiParams).then(function (listing) {
      select([], true);
      currentState.busy = false;
      currentState.busyListing = false;
      currentState.listing = listing;
      return listing;
    }, function (err) {
      currentState.busy = false;
      currentState.busyListing = false;
      currentState.listing = null;
      currentState.error = err.data;
    });
  }
  // Trash files does not work
  /**
   *
   * @param {FileListing|FileListing[]} files The files to move to Trash
   * @return {Promise} A promise that is resolved with the trashed files when _all_ files have been
   * successfully Trashed.
   */
  function trash (files) {
    if (!Array.isArray(files)) {
      files = [files];
    }

    currentState.busy = true;
    var trashPromises = _.map(files, function(file) {
      return file.trash().then(function(trashed) {
        //notify(FileEvents.FILE_MOVED, FileEventsMsg.FILE_MOVED, trashed);
        return trashed;
      });
    });
    return $q.all(trashPromises).then(function(val) {
      currentState.busy = false;
      browse(currentState.listing, apiParams);
      return val;
    }, function(err) {
      currentState.busy = false;
    });
  }


  function _trashPath() {
    if (currentState.listing && currentState.listing.system) {
      switch (currentState.listing.system) {
        case 'designsafe.storage.default':
          return ['', Django.user, '.Trash'].join('/');
        case 'designsafe.storage.projects':
          var projectDir = currentState.listing.path.split('/')[1];
          return ['', projectDir, '.Trash'].join('/');
        default:
          return undefined;
      }
    }
    return undefined;
  }


  /**
   * Upload files or folders to the currently listed destination
   *
   * @param {boolean} directoryUpload
   * @param {FileList} [files] Initial selected file(s) to upload
   */
  function upload(directoryUpload, files) {
    var modal = $uibModal.open({
      template: uploadModalTemplate,
      controller: 'ModalUpload',
      size: 'lg',
      resolve: {
        directoryUpload: function() { return directoryUpload; },
        destination: function() { return currentState.listing; },
        files: function() { return files; },
        currentState: function() { return currentState; },
      }
    });
  }


  /**
   * @callback subscribeCallback
   * @param {object} $event
   * @param {object} eventData
   * @param {FileEvents} eventData.type
   * @param {object} eventData.context
   */
  /**
   *
   * @param {object} scope
   * @param {subscribeCallback} callback
   */
  function subscribe(scope, callback) {
    var handler = $rootScope.$on('DataBrowserService::Event', callback);
    scope.$on('$destroy', handler);
  }

  /**
   *
   * @param {FileEvents} eventType The event
   * @param {object} eventContext The object/context of the event. The value of this parameter depends on the `eventType`
   */
  function notify(eventType, eventMsg, eventContext) {
    $rootScope.$emit('DataBrowserService::Event', {
      type: eventType,
      context: eventContext,
      msg: eventMsg
    });
  }

  function scrollToTop(){
    return;
  }

  function scrollToBottom(){
    if (currentState.loadingMore || currentState.reachedEnd){
      return;
    }
    currentState.loadingMore = true;
    if (currentState.listing && currentState.listing.children &&
        currentState.listing.children.length < 95){
      currentState.reachedEnd = true;
      return;
    }
    currentState.page += 1;
    currentState.loadingMore = true;
    browsePage({system: currentState.listing.system,
                path: currentState.listing.path,
                page: currentState.page})
    .then(function(listing){
        currentState.loadingMore = false;
        if (listing.children.length < 95) {
          currentState.reachedEnd = true;
        }
      }, function (err){
           currentState.loadingMore = false;
           currentState.reachedEnd = true;
      });
  }

  return {
    /* properties */
    FileEvents: FileEvents,
    state: state,
    apiParameters: apiParameters,
    toolbarOptions: toolbarOptions,

    /* data/files functions */
    allowedActions: allowedActions,
    browse: browse,
    browsePage: browsePage,
    scrollToTop: scrollToTop,
    scrollToBottom: scrollToBottom,
    copy: copy,
    deselect: deselect,
    // details: details,
    download: download,
    getFileManagers: getFileManagers,
    hasPermission: hasPermission,
    isProtected: isProtected,
    mkdir: mkdir,
    move: move,
    preview: preview,
    rename: rename,
    search: search,
    select: select,
    trash: trash,
    upload: upload,


    /* events */
    subscribe: subscribe,
    notify: notify,
    apiParams: apiParams,
    toolbarOpts: toolbarOpts,
    showListing: showListing,
    showPreview: showPreview,
  };

};

export default DataBrowserService;
