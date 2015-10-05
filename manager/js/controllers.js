(function(){
	var app = angular.module('controllers', []);
	app.controller('controller', ['$scope', '$http', '$q', '$modal', function($scope, $http, $q, $modal){

		$scope.col1 = {};
		$scope.col2 = {};
		$scope.col3 = {};

		$scope.save = function(data, col, what){

			var d = $q.defer();

			$http.post("/send", {type:"update", col:col, what:what, value:data}).success(function(data, status, header, attr){

				console.log(data)
				$scope.renderCol(1, data.one);
				$scope.renderCol(2, data.two);
				$scope.renderCol(3, data.three);

				d.resolve(true);

			}).error(function(data, status, header, attr){

				console.log(data);
				d.resolve(false);

			});

			return d.promise;

		};

		$scope.init = function(){

			$http.post("/send", {type:"init"}).success(function(data, status, header, attr){

				$scope.renderCol(1, data.one);
				$scope.renderCol(2, data.two);
				$scope.renderCol(3, data.three);

			}).error(function(data, status, header, attr){

				$scope.openLogin();

			});

		};

		$scope.renderCol = function(colId, value) {
			var result = "";
			for(var i = 0; i < value.paragraphs.length; i++){
				result += value.paragraphs[i] + "\n";
			}
			$scope["col"+colId] = {title:value.title, ps:value.paragraphs, psrendered:result.substring(0, result.length-1)};
		};

		$scope.openLogin = function(){
			var modal = $modal.open({
				controller: 'loginController',
				templateUrl: 'templates/login.html',
				backdrop: 'static',
				keyboard: false
			});

			modal.result.then(function(){
				$scope.init();
			});
		};

		$scope.openSettings = function(){
			var modal = $modal.open({
				controller: 'settingsController',
				templateUrl: 'templates/settings.html'
			});;
		};

		$scope.logout = function(){

			//clear local data
			$scope.col1 = {};
			$scope.col2 = {};
			$scope.col3 = {};

			$http.post("/send", {type:"logout"}).success(function(data, status, header, attr){

				$scope.openLogin();

			}).error(function(data, status, header, attr){

				$scope.openLogin();

			});

		};

	}]);

	app.controller('loginController', ['$scope', '$modalInstance', '$http', '$timeout', function($scope, $modalInstance, $http, $timeout){

		$scope.userinfo = {username:"", password:""};
		$scope.warning = "";
		$scope.disabled = false;

		$scope.checker = function(){
			if($scope.userinfo.username==="") {
				$scope.warning = "Please give a username.";
				document.getElementById("LoginUsername").focus();
				return;
			}

			if($scope.userinfo.password==="") {
				$scope.warning = "Please give a password.";
				document.getElementById("LoginPassword").focus();
				return;
			}

			$scope.warning = "";
			$scope.disabled = true;

			$http.post("/login", {username:$scope.userinfo.username, password:$scope.userinfo.password}).success(function(data, status, header, attr){
			
				$modalInstance.close();

			}).error(function(data, status, header, attr){
				console.log("error  :"+data);
				$scope.userinfo.password = "";
				$timeout( function(){
					document.getElementById("LoginPassword").focus();
				}, 200 );
				$scope.disabled = false;
			});

		};
		$scope.keyCheck = function($event){
			if($event.keyCode==13) {
				$scope.checker();
			}
		};
	}]);

app.controller('settingsController', ['$scope', '$modalInstance', '$http', '$timeout', function($scope, $modalInstance, $http, $timeout){

	$scope.userinfo = {username:"", password:"", un:"", pw:""};
	$scope.warning = "";
	$scope.disabled = false;

	$scope.cancel = function(){

		$modalInstance.close();

	};

	$scope.checker = function(){
		
		if($scope.userinfo.username==="") {
			$scope.warning = "Please give a username.";
			document.getElementById("LoginUsername").focus();
			return;
		}

		if($scope.userinfo.password==="") {
			$scope.warning = "Please give a password.";
			document.getElementById("LoginPassword").focus();
			return;
		}

		if($scope.userinfo.un==="") {
			$scope.warning = "Please give old username.";
			document.getElementById("LoginUn").focus();
			return;
		}

		if($scope.userinfo.pw==="") {
			$scope.warning = "Please give old password.";
			document.getElementById("LoginPw").focus();
			return;
		}

		$scope.warning = "";
		$scope.disabled = true;

		$http.post("/send", {type:"change", nu:$scope.userinfo.username, np:$scope.userinfo.password, ou:$scope.userinfo.un, op:$scope.userinfo.pw}).success(function(data, status, headers, attr){
			$modalInstance.close();
		}).error(function(data, status, headers, attr){
			if(status===401) {
				$modalInstance.close();
				$scope.openLogin();
				return
			}
			$scope.warning = data;
			console.log("error  :"+data);
			$scope.userinfo.password = "";
			$scope.userinfo.pw = "";
			$timeout( function(){
				document.getElementById("LoginPassword").focus();
			}, 200 );
			$scope.disabled = false;
		});

	};

	$scope.keyCheck = function($event){
		if($event.keyCode==13) {
			$scope.checker();
		}
	};

}]);

app.directive('autoFocus', ['$timeout', function($timeout){
	return {
		restrict: 'A',
		link: function(scope, elements, attr){
			$timeout(function(){
				elements[0].focus();
			}, 200);
		}
	}
}]);

})();