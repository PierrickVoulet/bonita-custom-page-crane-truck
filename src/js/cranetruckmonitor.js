'use strict';
/**
 *
 */

(function() {


var appCommand = angular.module('cranetruckmonitor', ['ui.bootstrap']);






// --------------------------------------------------------------------------
//
// Controler Ping
//
// --------------------------------------------------------------------------

// Ping the server
appCommand.controller('CraneTruckController', ['$http', '$scope', function ( $http, $scope ) {

	this.isshowhistory = false;
	this.hosturl = '';
	this.authtype='';
	this.principaldn='';
	this.password='';
	this.searchdn='';
	this.searchfilter = '';
	this.usedpagedsearch=true;
	this.data = { 'ldap':{}, 'bonita':{}, 'logger':{}, 'sync':{}, 'mapper':{} };
	this.display = { ldapconnection:true, bonitaconnection:true, logger: true, synchronize:true , mapper:true};
	this.status = { properties: {}};

	this.truefalse= [ {name:"true", value:"true"}, {name:"false", value:"false"} ];
	this.errorslevel = [ {name:"Warning", value:"WARNING"}, {name:"Info", value:"INFO"}, {name:"Fine", value:"FINE"} ];
	this.lowerupper = [ {name:"lowercase", value:"lowercase"}, {name:"uppercase", value:"uppercase"}, {name:"mixed", value:"mixed"} ];

	// ------------ init
	this.init=function() {
		this.rolelist= ["member", "admin"];
	};
	this.init();

	this.statusldap = {inprogress:""};
	this.statusbonita = { inprogress:""};

	this.ldapSynchronizerPath='C:/atelier/LDAP-Synchronizer 6.4.2/BonitaBPMSubscription-6.4.2-LDAP-Synchronizer/conf';


	// ---------------------------------------------- Properties files
	this.readProperties = function() {
		var post = { "ldapSynchronizerPath" : this.ldapSynchronizerPath, "domain": this.domain };
		var json= angular.toJson(post, true);
		var self=this;
		$http.get( '?page=custompage_cranetruck&action=readfromproperties&json='+json )
				.success( function ( jsonResult ) {
						console.log("readProperties",jsonResult);

						self.data	= jsonResult;
						self.data.ldap.used_paged_search_list = self.getFromList( self.truefalse, self.data.ldap.used_paged_search);

						self.data.logger.log_level_list = self.getLevel( self.data.logger.log_level );
						self.data.sync.error_level_upon_failing_to_get_related_user_list = self.getLevel( self.data.sync.error_level_upon_failing_to_get_related_user_list );

						self.data.sync.bonita_username_case_list = self.getFromList( self.lowerupper, self.data.sync.bonita_username_case);
						self.data.sync.bonita_deactivate_users_list = self.getFromList( self.truefalse, self.data.sync.bonita_deactivate_users);
						self.data.sync.allow_recursive_groups_list = self.getFromList( self.truefalse, self.data.sync.allow_recursive_groups);

						self.status.properties.status = jsonResult.info;
						self.status.properties.error = jsonResult.error;

				})
				.error( function() {
					alert('Error during access the server');
						self.status.properties.error = "Error during access the server";

					});
	}

	this.updateValueFromPage = function() {
			this.data.ldapSynchronizerPath = this.ldapSynchronizerPath;
		if (this.domain != null) {
			this.data.domain = this.domain;
		};

		this.data.ldap.used_paged_search = this.data.ldap.used_paged_search_list.value;
		this.data.logger.log_level = this.data.logger.log_level_list.value;
		this.data.sync.bonita_username_case = this.data.sync.bonita_username_case_list.value;
		this.data.sync.error_level_upon_failing_to_get_related_user = this.data.sync.error_level_upon_failing_to_get_related_user_list.value;
		this.data.sync.bonita_deactivate_users = this.data.sync.bonita_deactivate_users_list.value;

	};
	this.writeProperties = function() {
		this.updateValueFromPage();
		var json= angular.toJson(this.data, false);
		var self=this;
		console.log("writeProperties json="+json+" size="+json.length);
		$http.get( '?page=custompage_cranetruck&action=writetoproperties&json='+json )
				.success( function ( jsonResult ) {
						console.log("writeProperties",jsonResult);

						self.status.properties.status = jsonResult.info;
						self.status.properties.error = jsonResult.error;

				})
				.error( function() {
					alert('Error during access the server');
						self.status.properties.error = "Error during access the server";

					});
	}
	// ---------------------------------------------- LDAP Connection

	this.getDefaultLdapConnection = function() {
		this.data.ldap.hosturl = 'ldap://localhost:10389';
		this.data.ldap.authtype='simple';
		this.data.ldap.principaldn='uid=admin, ou=system';
		this.data.ldap.password='secret';
		this.data.ldap.searchdn='dc=example,dc=com';
		this.data.ldap.searchfilter = 'uid=walter.bates';
		this.data.ldap.directoryusertype='person';
		this.data.ldap.usedpagedsearchlist=this.truefalse[0];
		this.data.ldap.pagesize=1000;
	}

	this.ldaptest = {};
	this.testLdapConnection = function()
	{
		this.statusldap.inprogress ="...connection in progress...";
		var self=this;
		this.updateValueFromPage();
		var json= angular.toJson(this.data.ldap, true);

		$http.get( '?page=custompage_cranetruck&action=testldapconnection&json='+json )
				.success( function ( jsonResult ) {
						console.log("result",jsonResult);
						self.statusldap	= jsonResult;
						self.ldaptest			= jsonResult.detailsjsonmap;

						self.statusldap.inprogress ="";
				})
				.error( function() {
					alert('Error while test LDAP connection');
						self.statusldap.inprogress ="";
					});

	};
	// ---------------------------------------------- Bonita Connection
	this.getDefaultBonitaConnection = function()
	{
		var self=this;

		$http.get( '?page=custompage_cranetruck&action=getdefaultbonitaconnection' )
				.success( function ( jsonResult ) {
					console.log("defaultBonitaConnection",jsonResult);
					self.statusbonita	= jsonResult;
					self.data.bonita = jsonResult;
				})
				.error( function() {
					alert('Error while get default Bonita connection');
					});

	};

	this.testBonitaConnection = function()
	{
		// this.statusbonita.inprogress = "...connection in progress...";

		var self=this;
		var json= angular.toJson(this.data.bonita, true);

		$http.get( '?page=custompage_cranetruck&action=testbonitaconnection&json='+json )
				.success( function ( jsonResult ) {
					console.log("testBonitaConnection",jsonResult);
					// self.statusbonita.inprogress ="";
					self.statusbonita	= jsonResult;
				})
				.error( function() {
					alert('Error while test LDAP connection');
					// self.statusbonita.inprogress ="";
					});

	};

	// ---------------------------------------------- Synchronize
	this.data.sync.ldap_watched_directories =[];
	this.data.sync.ldap_groups=[];
	this.data.sync.ldap_searchs =[];
	this.synctest={};

	this.testSynchronize = function() {
		this.updateValueFromPage();
		this.synctest.inprogress = "Test in progress";
		var json= angular.toJson(this.data, false);
		var self=this;
		console.log("writeProperties json="+json+" size="+json.length);
		$http.get( '?page=custompage_cranetruck&action=testsynchronize&json='+json )
				.success( function ( jsonResult ) {
						console.log("writeProperties",jsonResult);

						self.synctest.inprogress = "";
						self.synctest.status = jsonResult.status;
						self.synctest.statuserror = jsonResult.error;
						self.synctest.detailsjsonmap= json.detailsjsonmap;

				})
				.error( function() {
					alert('Error during access the server for Test');
					self.synctest.statuserror = "Error accessing the server.";
					self.synctest.inprogress = "";
					});
	};


	// ---------------------------------------------- mapper
	this.data.mapper.listattributes =[];
	this.data.mapper.listattributes.push( { bonitaname:"user_name", "example":"uid" });
	this.data.mapper.listattributes.push( { bonitaname:"first_name", "example":"givenName"});
	this.data.mapper.listattributes.push( { bonitaname:"last_name", "example":"sn"});
	this.data.mapper.listattributes.push( { bonitaname:"title", "example":"title"});
	this.data.mapper.listattributes.push( { bonitaname:"job_title"});
	this.data.mapper.listattributes.push( { bonitaname:"manager"});
	this.data.mapper.listattributes.push( { bonitaname:"delegee"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_email", "example":"mail"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_phone", "example":"telephoneNumber"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_mobile", "example":"mobile"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_fax"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_website"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_room"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_building"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_address", "example":"postalAddress"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_city"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_zip_code", "example":"postalCode"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_state"});
	this.data.mapper.listattributes.push( { bonitaname:"pro_country"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_email"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_phone"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_mobile"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_fax"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_website"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_room"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_building"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_address"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_city"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_zip_code"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_state"});
	this.data.mapper.listattributes.push( { bonitaname:"perso_country"});

	this.mappertest = {};


	this.testMapper = function() {
		this.mappertest.statuserror = "This function is not yet implemented.";
	};

	// ---------------------------------------------- testAllConfiguration
	this.alltests = {};

	this.testAllConfiguration = function() {
		this.alltests.statuserror = "This function is not yet implemented.";
	};



	// ---------------------------------------------- testJaasConnection
	this.jaas= {};
	this.statusjaas = {};
	this.statusjaas.detailsjsonmap = {};
	this.getDefaultJaasConnection = function()
	{
		this.jaas.jaascontent  = 'BonitaAuthentication-1 {\n';
		this.jaas.jaascontent  += '    com.sun.security.auth.module.LdapLoginModule REQUIRED\n';
		this.jaas.jaascontent  += '    userProvider="ldap://localhost:10389/ou=system"\n';
		this.jaas.jaascontent  += '    userFilter="(&(uid={USERNAME})(objectClass=inetOrgPerson))"\n';
		this.jaas.jaascontent  += '    authzIdentity="{USERNAME}"\n';
		this.jaas.jaascontent  += '    debug=true\n';
		this.jaas.jaascontent  += '    useSSL=false;\n';
		this.jaas.jaascontent  += '};';
		this.jaas.jaasauthentkey ="BonitaAuthentication-1";
		this.jaas.jaasusername ="walter.bates";
		this.jaas.jasspassword ="bpm";
	};

	this.testJaasConnection = function()
	{
		this.statusjaas.inprogress ="...test Jaas in progress...";
		var self=this;
		var json= angular.toJson(this.jaas, false);
		var jsonurl = json.replace("&","_£");

		$http.get( '?page=custompage_cranetruck&action=testjaasconnection&json='+jsonurl )
				.success( function ( jsonResult ) {
						console.log("result",jsonResult);
						self.statusjaas			= jsonResult;

						self.statusjaas.inprogress ="";
				})
				.error( function() {
					alert('Error while test JAAS connection');
					jeself.statusjaas.inprogress ="";
					});

	};
	// ---------------------------------------------- Manage list
	this.list_add = function( listvalues, suffixname, newvalue ) {
		listvalues.push(newvalue);
		this.list_rename( listvalues, suffixname );
	};
	this.list_remove = function( listvalues, nametoremove,suffixname ) {
		console.log("remove: name "+nametoremove+" from list "+listvalues);
		 for (var i=0; i<listvalues.length; i++){
			if (listvalues[ i ].name == nametoremove) {
				console.log("remove: found the correct name at position "+i);
				listvalues.splice( i,1);
			};
         };
		// rename all
		this.list_rename( listvalues, suffixname);

	};
	this.list_rename = function(listvalues, suffixname) {
		// rename all
		 for (var i=0; i<listvalues.length; i++){
			listvalues[ i ].name=suffixname+i;
		}
	}

	this.getFromList = function( listOfValue, value ) {
		// console.log("getLevel");
		for (var i=0; i<listOfValue.length; i++){
			// console.log("getLevel ["+this.errorslevel[ i ].value+"] to level["+level+"]");
			if (listOfValue.value === value) {
				// console.log("getLevel!! ");
				return listOfValue[ i ];
			}
		}
		return listOfValue[ 0 ];
	}

	this.getLevel = function ( level )
	{
		return this.getFromList( this.errorslevel, level );
		/*
		// console.log("getLevel");
		for (var i=0; i<this.errorslevel.length; i++){
			// console.log("getLevel ["+this.errorslevel[ i ].value+"] to level["+level+"]");
			if (this.errorslevel[ i ].value === level) {
				// console.log("getLevel!! ");
				return this.errorslevel[ i ];
			}
		}
		return this.errorslevel[ 0 ];
		*/
	}

}]);



})();
