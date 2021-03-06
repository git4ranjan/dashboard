angular.module('chainid.app')
.controller('CreateEndpointController', ['$scope', '$state', '$filter', 'EndpointService', 'GroupService', 'Notifications',
function ($scope, $state, $filter, EndpointService, GroupService, Notifications) {

  $scope.state = {
    EnvironmentType: 'docker',
    actionInProgress: false
  };

  $scope.formValues = {
    Name: '',
    URL: '',
    PublicURL: '',
    GroupId: 1,
    SecurityFormData: new EndpointSecurityFormData(),
    AzureApplicationId: '',
    AzureTenantId: '',
    AzureAuthenticationKey: ''
  };

  $scope.addDockerEndpoint = function() {
    var name = $scope.formValues.Name;
    var URL = $filter('stripprotocol')($scope.formValues.URL);
    var publicURL = $scope.formValues.PublicURL === '' ? URL.split(':')[0] : $scope.formValues.PublicURL;
    var groupId = $scope.formValues.GroupId;

    var securityData = $scope.formValues.SecurityFormData;
    var TLS = securityData.TLS;
    var TLSMode = securityData.TLSMode;
    var TLSSkipVerify = TLS && (TLSMode === 'tls_client_noca' || TLSMode === 'tls_only');
    var TLSSkipClientVerify = TLS && (TLSMode === 'tls_ca' || TLSMode === 'tls_only');
    var TLSCAFile = TLSSkipVerify ? null : securityData.TLSCACert;
    var TLSCertFile = TLSSkipClientVerify ? null : securityData.TLSCert;
    var TLSKeyFile = TLSSkipClientVerify ? null : securityData.TLSKey;

    addEndpoint(name, 1, URL, publicURL, groupId, TLS, TLSSkipVerify, TLSSkipClientVerify, TLSCAFile, TLSCertFile, TLSKeyFile);
  };

  $scope.addAgentEndpoint = function() {
    var name = $scope.formValues.Name;
    var URL = $filter('stripprotocol')($scope.formValues.URL);
    var publicURL = $scope.formValues.PublicURL === '' ? URL.split(':')[0] : $scope.formValues.PublicURL;
    var groupId = $scope.formValues.GroupId;

    addEndpoint(name, 2, URL, publicURL, groupId, true, true, true, null, null, null);
  };

  $scope.addAzureEndpoint = function() {
    var name = $scope.formValues.Name;
    var applicationId = $scope.formValues.AzureApplicationId;
    var tenantId = $scope.formValues.AzureTenantId;
    var authenticationKey = $scope.formValues.AzureAuthenticationKey;

    createAzureEndpoint(name, applicationId, tenantId, authenticationKey);
  };

  function createAzureEndpoint(name, applicationId, tenantId, authenticationKey) {
    var endpoint;

    $scope.state.actionInProgress = true;
    EndpointService.createAzureEndpoint(name, applicationId, tenantId, authenticationKey)
    .then(function success() {
      Notifications.success('Endpoint created', name);
      $state.go('chainid.endpoints', {}, {reload: true});
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to create endpoint');
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  }

  function addEndpoint(name, type, URL, PublicURL, groupId, TLS, TLSSkipVerify, TLSSkipClientVerify, TLSCAFile, TLSCertFile, TLSKeyFile) {
    $scope.state.actionInProgress = true;
    EndpointService.createRemoteEndpoint(name, type, URL, PublicURL, groupId, TLS, TLSSkipVerify, TLSSkipClientVerify, TLSCAFile, TLSCertFile, TLSKeyFile)
    .then(function success() {
      Notifications.success('Endpoint created', name);
      $state.go('chainid.endpoints', {}, {reload: true});
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to create endpoint');
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  }

  function initView() {
    GroupService.groups()
    .then(function success(data) {
      $scope.groups = data;
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to load groups');
    });
  }

  initView();
}]);
