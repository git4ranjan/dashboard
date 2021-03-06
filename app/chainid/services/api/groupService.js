angular.module('chainid.app')
.factory('GroupService', ['$q', 'EndpointGroups',
function GroupService($q, EndpointGroups) {
  'use strict';
  var service = {};

  service.group = function(groupId) {
    var deferred = $q.defer();

    EndpointGroups.get({ id: groupId }).$promise
    .then(function success(data) {
      var group = new EndpointGroupModel(data);
      deferred.resolve(group);
    })
    .catch(function error(err) {
      deferred.reject({ msg: 'Unable to retrieve group', err: err });
    });

    return deferred.promise;
  };

  service.groups = function() {
    return EndpointGroups.query({}).$promise;
  };

  service.createGroup = function(model, endpoints) {
    var payload = new EndpointGroupCreateRequest(model, endpoints);
    return EndpointGroups.create(payload).$promise;
  };

  service.updateGroup = function(model, endpoints) {
    var payload = new EndpointGroupUpdateRequest(model, endpoints);
    return EndpointGroups.update(payload).$promise;
  };

  service.updateAccess = function(groupId, authorizedUserIDs, authorizedTeamIDs) {
    return EndpointGroups.updateAccess({ id: groupId }, { authorizedUsers: authorizedUserIDs, authorizedTeams: authorizedTeamIDs }).$promise;
  };

  service.deleteGroup = function(groupId) {
    return EndpointGroups.remove({ id: groupId }).$promise;
  };

  return service;
}]);
