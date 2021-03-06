angular.module('chainid.app').component('accessTable', {
  templateUrl: 'app/chainid/components/access-table/accessTable.html',
  controller: function() {
    this.state = {
      orderBy: 'Name',
      reverseOrder: false,
      paginatedItemLimit: '10',
      textFilter: ''
    };

    this.changeOrderBy = function(orderField) {
      this.state.reverseOrder = this.state.orderBy === orderField ? !this.state.reverseOrder : false;
      this.state.orderBy = orderField;
    };
  },
  bindings: {
    dataset: '<',
    entryClick: '<',
    emptyDatasetMessage: '@'
  }
});
