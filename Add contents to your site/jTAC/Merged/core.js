// jTAC/jTAC.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: jTAC

Purpose:
Core object, defined as the global variable jTAC. It hosts
methods to manage classes defined in this library.
It also hosts a number of static methods utilitized by classes
throughout this library.

A strategy of this class is to mimic js EXT v4's class design
so these classes will work within js EXT with little if any alteration.
Effectively the jTAC class's define, create, and extend methods
should take the same parameters and have the same results.
If js EXT is installed, these methods should be replaceable with
direct calls to their js EXT equivalents. This results in
the advantages of the js EXT v4 loader as well as fitting well into its framework.
Yet, this design is intended to work without any other third party library,
so it can also work with jQuery, dojo, mootools, etc.

Properties:
* definitions (object) -
   Each item added by the define() method appears here.
   The property name is the full class name.
   The value is an object with these elements:
      ctor: A reference to a function created by define() that 
         is the constructor to the class.
      inst: An instance of the object used with supply descriptive info
         from the class, including class name, parent class, etc. 
         These are defined properties starting with $.
         This object has not been initialize fully. The 
         constructor defined in the members has not been called.
         So it should not be used for invoking methods.
   Be aware that most full class names contain periods. Therefore,
   you must access definitions using the array syntax, not property syntax:
   correct: jTAC.definitions["Namespace.classname"]
   wrong: jTAC.definitions.Namespace.classname

* aliases -
  Entries recorded by calling jTAC.defineAlias().


Methods:
* define(fullClassName, members, replace) -
   Registers a class.
   -  fullClassName (string) - the class name to register, including namespaces.
   -  members (object) - an object whose properties become members of the prototype
      for this class. See below for details.
   -  replace (boolean) - If the definition exists, true will replace its definition. 
      false will throw an exception.

   The [member] object defines functions that become methods on the prototype. 
   Do not define any data storage fields here. They belong either in the [config] property (see below) 
   or the [_internal] property, which is an object for you to use freely. 
   Here are predefined property names and their usage:
   -	extend (string) - The name of parent class from which this inherits. 
      Your class will inherit all elements of the parent's prototype. Omit if there is nothing to extend.

   -	constructor (function) - A function which is run when the jTAC.create() method 
      is called to initialize the object. 
      The function takes one parameter, propertyValues, which is the same object 
      passed to jTAC.create(name, propertyValues).
      The value of this is the instance of the object being initialized. 
      At that time it is called, the getter and setter functions for all properties 
      defined within config have been added to the prototype.
      If your class extends another, call this.callParent([propertyValues]) to invoke 
      the parent’s constructor.

   -	config (object) - An object whose properties are all actual property names to expose 
      on the main object. These values are used a storage and hold the default value. 
      Property names should use “camel case” (lowercase first letter; uppercase where a 
      new word occurs; no underscores). 
      Even if you don’t declare it, your class will have the config property. 

      It always contains properties inherited from the class it extends.

      jTAC will automatically create getter and setter functions on your class 
      for each property name. If you want to customize those functions, define them yourself. 
      The function names should be “get” + [property name] and “set” + [property name] 
      where the first letter of the property name has been converted to uppercase.

   -	configrules (object) - An object that provides rules for any of the properties 
      defined in [config]. While [config] hosts the name and default value of properties, 
      [configrules] hosts objects with these values:
      >	valFnc (function) - A function that takes one parameter, a value, 
         and returns the value (possibly cleaned up) if it is a legal value, 
         or calls this._error("description") if the value is not legal. 
         (_error() throws an exception and writes to the browser’s console for debugging assistance.)

         A validation function is automatically setup if not defined and the 
         [config] property has a default value whose type is boolean, string, 
         integer, array, or RegExp object. The jTAC object defines numerous 
         functions that you can assign using just their names, such as jTAC.checkAsStr and 
         jTAC.checkAsFunction.

         You can also use a shorthand of just defining the function against the property name, 
         instead of creating a child object that has valFnc as a property.
         configrules: {
	         propertyname:jTAC.checkAsStrOrNull,
	         propertyname2: {
		         valFnc: function(val) { return val == "a"; }
	         }
         }
      >	values (array) - Alternative to valFnc. Supply an array of legal values. 
         Values must be primitive types (strings, numbers, booleans, null). 

         You can also use a shorthand of just defining the array against the property name, 
         instead of creating a child object that has valFnc as a property.
         configrules: {
	         propertyname: ["a", "b", "c"],
	         propertyname2: {
		         values: [1, 2, 3, null]
	         }
         }
      >	autoSet (boolean) - When false, do not automatically create a missing setter function. It defaults to true.
      >	autoGet (boolean) - When false, do not automatically create a missing getter function. It defaults to true.
      >  clearCache (boolean) - When true, call _clearCache() to allow all cached items to be recreated.

   -	require (string) - A string or array of strings identifying other 
      classes that are required. This does not need to include any direct ancestor class. 
      It can supply a specific class it needs and not worry about supplying all ancestor classes too.

   -	abstract (boolean) - When true, this class is abstract and cannot be created by jTAC.define(). 
      It can still be instantiated using "new jTAC.namespace.class()". However, that does not 
      invoke the code defined in constructor nor does it initialize the [config] property.

   -	_internal (object) – Do not declare this directly in members. But you can use it to store private values.


* createByClassName(fullClassName, propertyVals) - 
  Creates an instance of a class. The class name must already be defined.
  Does not support aliases.
  - fullClassName (string) - The name of a defined class including namespaces.
    This should NOT reflect an alias name. If you have an alias to use,
    call create().
  - propertyVals - optional object or function used to initialize the properties
      of the new instance. When an object, that object's property names
      will be used to set values of the same named properties created.
      When a function, it takes three parameters: new object instance, aliasname, classname.
      It's return result is not used.


* isDefined(fullClassName) - 
   Checks for the presence of the class. Returns true if found and false if not.
      - fullclassname (string) - the class name, including namespaces

* defineAlias(aliasname, classname, propertyVals) -
  Adds an entry to the alias' list that lets the create function create an 
  instance with a specific set of properties.
  - aliasname (string) - the name of the alias. It does not need namespaces. 
      It just needs to be unique. If identical to an existing name,
      it replaces that element.
  - classname (string) - the class name, including namespaces, that is created 
      by using this alias.
  - propertyVals - optional object or function used to initialize the properties
      of the new instance. When an object, that object's property names
      will be used to set values of the same named properties created.
      When a function, it takes three parameters: new object instance, aliasname, classname.
      It's return result is not used.

* create(name, propertyVals) -
   Creates an instance of a class, first checking for an alias name match. If
   not found, attempts for a full class name match.
  - name (string) - The name of an alias or full class name.
  - propertyVals (object) - An object passed to the constructor function.Name and value pairs 

* getClass(fullClassName, throwError) -
   Returns a function defined for the given class name specified
   - fullClassName (string) - A class name with full namespace.
      All elements are case sensitive to existing data in the namespaces property.
   - throwError (boolean) - When true and an error is detected, throw an exceptoin.
   Returns the function definition for the class name or null if not defined.

* getDefinition(fullClassName) -
   Returns the object was registered with jTAC.define() to define this class.
   The object contains:
      ctor: A reference to a function created by define() that 
         is the constructor to the class.
      inst: An instance of the object used with supply descriptive info
         from the class, including class name, parent class, etc. 
         These are defined properties starting with $.
         This object has not been initialize fully. The 
         constructor defined in the members has not been called.
         So it should not be used for invoking methods.

   - fullClassName (string) - A class name with full namespace.
   All elements are case sensitive to existing data in the namespaces property.
   
   Returns the function definition or null if not defined.

* inheritsFrom (fullClassName, anotherClassName)
   Returns true if the class name is the same as, or 
   inherits from the anotherClassName class.

Required libraries:
None (Does not require or utilize jquery)

------------------------------------------------------------*/
var jTAC = ( function () {

/*
   Each item added by the define() method appears here.
   The property name is the full class name.
   The value is an object with these elements:
      ctor: A reference to a function created by define() that 
         is the constructor to the class.
      inst: An instance of the object used with supply descriptive info
         from the class, including class name, parent class, etc. 
         These are defined properties starting with $.
         This object has not been initialize fully. The 
         constructor defined in the members has not been called.
         So it should not be used for invoking methods.
   Be aware that most full class names contain periods. Therefore,
   you must access definitions using the array syntax, not property syntax:
   correct: jTAC.definitions["Namespace.classname"]
   wrong: jTAC.definitions.Namespace.classname
*/
   var definitions = {
   };

   /*
   Entries recorded by calling jTAC.defineAlias().
   Property names are the same as the alias names.
   The values are an object with: className and propertyVals properties.
   className is the class name to create and dafaults is an object
   with default property values, or a function that will get the new
   instance passed to init it..
   These two properties are passed to the jTAC.create() method.
   */
   var aliases = {
   };

/*
   Registers a class. The parameters are:
   -  fullClassName (string) - the class name to register, including namespaces.
   -  members (object) - an object whose properties become members of the prototype
      for this class. See below for details.
   -  replace (boolean) - If the definition exists, true will replace its definition. 
      false will throw an exception.

   The [member] object defines functions that become methods on the prototype. 
   Do not define any data storage fields here. They belong either in the [config] property (see below) 
   or the [_internal] property, which is an object for you to use freely. 
   Here are predefined property names and their usage:
   -	extend (string) - The name of parent class from which this inherits. 
      Your class will inherit all elements of the parent's prototype. Omit if there is nothing to extend.

   -	constructor (function) - A function which is run when the jTAC.create() method 
      is called to initialize the object. 
      The function takes one parameter, propertyValues, which is the same object 
      passed to jTAC.create(name, propertyValues).
      The value of this is the instance of the object being initialized. 
      At that time it is called, the getter and setter functions for all properties 
      defined within config have been added to the prototype.
      If your class extends another, call this.callParent([propertyValues]) to invoke 
      the parent’s constructor.

   -	config (object) - An object whose properties are all actual property names to expose 
      on the main object. These values are used a storage and hold the default value. 
      Property names should use “camel case” (lowercase first letter; uppercase where a 
      new word occurs; no underscores). 
      Even if you don’t declare it, your class will have the config property. 

      It always contains properties inherited from the class it extends.

      jTAC will automatically create getter and setter functions on your class 
      for each property name. If you want to customize those functions, define them yourself. 
      The function names should be “get” + [property name] and “set” + [property name] 
      where the first letter of the property name has been converted to uppercase.

   -	configrules (object) - An object that provides rules for any of the properties 
      defined in [config]. While [config] hosts the name and default value of properties, 
      [configrules] hosts objects with these values:
      >	valFnc (function) - A function that takes one parameter, a value, 
         and returns the value (possibly cleaned up) if it is a legal value, 
         or calls this._error("description") if the value is not legal. 
         (_error() throws an exception and writes to the browser’s console for debugging assistance.)

         A validation function is automatically setup if not defined and the 
         [config] property has a default value whose type is boolean, string, 
         integer, array, or RegExp object. The jTAC object defines numerous 
         functions that you can assign using just their names, such as jTAC.checkAsStr and 
         jTAC.checkAsFunction.

         You can also use a shorthand of just defining the function against the property name, 
         instead of creating a child object that has valFnc as a property.
         configrules: {
	         propertyname:jTAC.checkAsStrOrNull,
	         propertyname2: {
		         valFnc: function(val) { return val == "a"; }
	         }
         }
      >	values (array) - Alternative to valFnc. Supply an array of legal values. 
         Values must be primitive types (strings, numbers, booleans, null). 

         You can also use a shorthand of just defining the array against the property name, 
         instead of creating a child object that has valFnc as a property.
         configrules: {
	         propertyname: ["a", "b", "c"],
	         propertyname2: {
		         values: [1, 2, 3, null]
	         }
         }
      >	autoSet (boolean) - When false, do not automatically create a missing setter function. It defaults to true.
      >	autoGet (boolean) - When false, do not automatically create a missing getter function. It defaults to true.
      >  clearCache (boolean) - When true, call _clearCache() to allow all cached items to be recreated.

   -	require (string) - A string or array of strings identifying other 
      classes that are required. This does not need to include any direct ancestor class. 
      It can supply a specific class it needs and not worry about supplying all ancestor classes too.

   -	abstract (boolean) - When true, this class is abstract and cannot be created by jTAC.define(). 
      It can still be instantiated using "new jTAC.namespace.class()". However, that does not 
      invoke the code defined in constructor nor does it initialize the [config] property.

   -	_internal (object) – Do not declare this directly in members. But you can use it to store private values.
   -	_cache (object) – Do not declare this directly in members. But, like _internal, 
      you can use it to store private values. These values are considered cached and will be cleared
      when _clearCache() is invoked.
*/
   function define( fullClassName, members, replace ) {
      function member(name, typeName, missing, del) {
         var val = members[name] || missing;
         if ( val != null ) {
            if ( typeof val != typeName ) {
               me.error( name + " parameter must be a " + typeName + "." );
            }
         }
         delete members[name];
         return val;
      }

      var me = jTAC; // used instead of 'this'. Call any support function passing this to the call method
      try {
         pushContext("jTAC.define('" + fullClassName + "')");
         if ( !members || ( typeof members != "object" ) ) {
            me.error( "Members parameter must be an object." );
         }

         var nspath = fullClassName.split( '.' );
         var className = nspath.pop();

         var definition = definitions[fullClassName];
         // see if exists
         if ( definition && !replace ) {
            me.error( "[" + fullClassName + "] is already defined." );
         }
         var parentName = member("extend", "string",null);
         if (parentName) {
            me.require( parentName );
         }
         var parentClass = parentName ? me.getClass( parentName, true ) : null;
         
         var ctor = member("constructor", "function", null);
         if ( ctor && ctor.toString().indexOf( "function Object()" ) > -1 )   // the default constructor. Tested with IE 9, FireFox 15, Safari 5, Chrome 22, Opera 12
            ctor = null;
         if ( !ctor ) { // provide a default constructor
            ctor = function ( propertyVals ) {
               if ( parentClass )
                  this.$parentClass.prototype.$ctor( propertyVals );
            }
         }

         var newconfig = member("config", "object");
         var newconfigrules = member("configrules", "object");
         var abs = member("abstract", "boolean", false);
         var require = members["require"] || null;
         if ( require ) {
            if ( ( typeof require != "string" ) && !(require instanceof Array) ) {
               me.error( "require property must be a string or array of strings" );
            }
            jTAC.require(require);  // may throw exceptions
         }
         delete members["require"];

         // create a config object that inherits from the prototype in parentClass.config
         var config = function () { };
         if ( parentClass )
            config.prototype = new parentClass.prototype.config();
         if ( newconfig )
            me.extend( newconfig, config.prototype );

         // create a configrules object that inherits from the prototype in parentClass.config
         var configrules = function () { };
         if ( parentClass )
            configrules.prototype = new parentClass.prototype.configrules();
         if ( newconfigrules )
            me.extend( newconfigrules, configrules.prototype );
         _setupConfigRules( config.prototype, configrules );

         // create a function that will be used as the constructor
         // and host prototypes for this class.
         // It will be attached to ns[cn]
         // This function is using closures to access several variables created in define()
         var newClass = function ( ) {

            this.$className = className;
            this.$parentName = parentName || "";
            this.$parentClass = parentClass;
            this.$fullClassName = fullClassName;
            this.$require = require;
            this.$abstract = abs;
            this.$uniqueid = jTAC._internal.uniqueid++;
            this.config = {};
            this._internal = {};
            this._cache = {};
            me.extend( config.prototype, this.config, true );
            this.configrules = {};
            me.extend( configrules.prototype, this.configrules, true );
            if ( config )
               this._defineProperties.call( this, config );

         };

         _buildUserPath.call( me, nspath, className, newClass );

         if ( parentClass ) {
            newClass.prototype = new parentClass();
         }
         else {
            me.extend( jTACClassBase, newClass.prototype );
         }
         me.extend( members, newClass.prototype );
         if ( newconfig )
            newClass.prototype._autoGetSet.call( newClass, newconfig, configrules );

         newClass.prototype.config = config;
         newClass.prototype.configrules = configrules;
         newClass.prototype.$ctor = ctor;

         _registerNewMethodNames(newClass, parentClass, fullClassName);

         definitions[fullClassName] = {
            ctor: newClass,
            inst: new newClass()
         }
      }
      finally {
         popContext();
      }

   };

/*
Checks for the presence of the class. Returns true if found and false if not.
   - fullclassname (string) - the class name, including namespaces. It is case sensitive. 
*/
   function isDefined( fullClassName ) {
      return jTAC.getClass( fullClassName, false ) != null;
   };

   /*
   Adds members to an existing jTAC Class definition. It can include new config and configrules parameters.
   - fullclassname (string) - the class name to modify, including namespaces. It is case sensitive. 
   - members (object) - An object whose properties will be new members.
      It can include config and configrules properties, each with their own members.
      If supplied, config members will be converted into properties, with 
      getter and setter functions defined automatically if not already present.
   */
   function addMembers( fullClassName, members ) {
      try {
         pushContext("jTAC.addMembers('" + fullClassName + "')");
         var me = jTAC;
         if ( typeof members == "object" ) {
            var def = jTAC.getDefinition( fullClassName );
            if (!def) {
               me.error( "className [" + fullClassName + "] not defined. Requires a case sensitive match." );
            }
            var proto = def.ctor.prototype;
            var config = null;
            for ( var name in members ) {
               switch (name) {
                  case "config":
                     config = members[name];
                     me.extend( config, proto.config.prototype );
                     break;
                  case "configrule":
                     me.extend( members[name], proto.configrules.prototype );
                     break;
                  default:
                     proto[name] = members[name];
                     if (typeof proto[name] == "function") {
                        proto[name].$owner = def.inst.$parentClass;
                        proto[name].$name = name;
                        proto[name].$fullClassName = def.inst.$fullClassName;
                     }
                     break;
               }
            }  // for
            if (config) {
               _setupConfigRules( config, proto.configrules );
               proto._autoGetSet.call( def.ctor, config, proto.configrules );

            }
         }
         else
            me.error( "Illegal param" );
      }
      finally {
         popContext();
      }
   };

   /*
   Creates an instance of a class. The class name must already be defined.
   Does not support aliases.
   - fullClassName (string) - The name of a defined class including namespaces.
      This should NOT reflect an alias name. If you have an alias to use,
      call create(). It is case sensitive. 
   - propertyVals - optional object or function used to initialize the properties
      of the new instance. When an object, that object's property names
      will be used to set values of the same named properties created.
      When a function, it takes these parameters: new object instance, classname.
      It's return result is not used.
   - optional (boolean) - When true, if the class is not found, return null.
      If the class name is not found, it throws an exception.
   */
   function createByClassName( fullClassName, propertyVals, optional ) {
      try {
         pushContext("jTAC.createByClassName('" + fullClassName + "')");
         var me = jTAC; // used instead of 'this'. Call any support function passing this to the call method
         var classFnc = me.getClass( fullClassName, false );
         if (classFnc == null) {
            if (optional)
               return null;
            _scriptFileMissing(fullClassName);
         }
         var obj = new classFnc( /* propertyVals || {} */ );
         if (obj.$abstract)
            me.error( "Cannot create [" + fullClassName + "]. It is marked abstract.");

         obj.init.call(obj, propertyVals);
         return obj;
      }
      finally  {
         popContext();
      }
   };
   function _scriptFileMissing ( fullClassName) {
      jTAC.error( "className [" + fullClassName + "] not defined. Check that the script file is loaded. The name is case sensitive." );
   }

   /*
   Check for one or more class names to be defined. Throw an exception if one is not defined.

   This is meant to be similar to js EXT's Ext.require() function, except its limited
   to the first parameter. That allows the function to be replaced by Ext.require() easily.
   - fullClassNames (string or array) - One or more full class name. When an array, elements
      of the array must be strings.
   */
   function require( fullClassNames ) {
      if ( typeof ( fullClassNames ) == "string" )
         fullClassNames = [fullClassNames];
      for ( var i = 0; i < fullClassNames.length; i++ ) {
         var r = jTAC.getClass( fullClassNames[i], false );
         if ( !r )
            _scriptFileMissing(fullClassNames[i]);
      }
   };

   /*
   Adds an entry to the alias' list that lets the create function create an 
   instance with a specific set of properties.
   - aliasname (string) - the name of the alias. It does not need namespaces. 
   It just needs to be unique. If identical to an existing name,
   it replaces that element.
   - fullclassname (string) - the class name, including namespaces, that is created 
   by using this alias.
   - propertyVals - optional object or function used to initialize the properties
   of the new instance. When an object, that object's property names
   will be used to set values of the same named properties created.
   When a function, it takes three parameters: new object instance, aliasname, classname.
   It's return result is not used.
   - replace (boolean) - If the alias exists, true will replace its definition.
   False will throw an exception.
   - optional (boolean) - When true, its safe to call this even if fullClassname isn't defined.
      It allows you to setup a number of calls to defineAlias as a master setup,
      without worrying if they are present.
   */
   function defineAlias( aliasName, fullClassName, propertyVals, replace, optional ) {
      var me = jTAC; // used instead of 'this'. Call any support function passing this to the call method
      if ( aliases[aliasName] && !replace ) {
         me.error( "alias named [" + aliasName + "] is already defined." );
      }

      var cl = me.getClass( fullClassName, !optional );   // just used to validate the name.
      if (cl) {
         if ( propertyVals === undefined )
            propertyVals = null;
         aliases[aliasName] = {
            className: fullClassName,
            propertyVals: propertyVals
         };
      }
   };

   /*
   Creates an instance of a class, first checking for an alias name match. If
   not found, attempts for a full class name match.
   Use createByClassName() if you want to only match by class name.
   - name (string) - The name of an alias or full class name.
   - propertyVals - optional object or function used to initialize the properties
      of the new instance. When an object, that object's property names
      will be used to set values of the same named properties created.
      When a function, it takes these parameters: new object instance, classname.
      It's return result is not used.
      This is combined with propertyVals already defined by defineAlias.
   - optional (boolean) - When true, if the class is not found, return null.
      If the class name is not found, it throws an exception.
   */
   function create( name, propertyVals, optional ) {
      try {
         pushContext("jTAC.create('" + name + "')");
         var me = jTAC; // used instead of 'this'. Call any support function passing this to the call method

         if ( !name ) {
            if ( !propertyVals )
               me.error( "Must supply parameters" );
            name = propertyVals["jtacClass"];
            if ( !name )
               me.error( "Must either pass a class name or assign the jtacClass property to a class name in the propertyVals object." );

         }

         var alias = aliases[name];
         if ( alias ) {
            var obj = me.create( alias.className, alias.propertyVals );
            // if the user supplied propertyVals, they are applied last
            if ( propertyVals ) {
               if ( typeof propertyVals == "function" ) {
                  propertyVals.call( obj, obj, alias.className, name );
               }
               else
                  obj.setProperties.call( obj, propertyVals );
            }


            return obj;
         }
         return me.createByClassName( name, propertyVals, optional );
      }
      finally {
         popContext();
      }
   };

   /*
   Utility to update the tree of namespaces with the constructor for a class 
   that is being defined.
   The idea is to have all classes defined off of the jTAC object like this:
   jTAC.namespace.classctor  (ctor=constructor)
   This allows users to reference the constructor if they want, especially
   when they use the 'instanceof' keyword:
   if (obj instanceof jTAC.namespace.classctor)


   - namespaces (string or array) - A period delimited string of namespaces (without
   the class name) or an array of each namespace. Never include the class name.
   All elements are case sensitive to existing data in the namespaces property.
   May optionally include "jTAC" as the first namespace.
   - className (string) - The class name alone. This will become the actual
      property name of a namespace object.
   - ctor (function) - The function reference used as the constructor.
   */
   function _buildUserPath( namespaces, className, ctor ) {
      var me = jTAC; // used instead of 'this'. Call any support function passing this to the call method
      var current = me;
      var nspath = namespaces;
      if ( typeof namespaces == "string" ) {
         nspath = namespaces ? namespaces.split( '.' ) : [];
      }
      for ( var i = 0; i < nspath.length; i++ ) {
         var name = nspath[i];
         if ( name == "jTAC" )
            continue;
         if ( !name )
            me.error( "Empty namespace is illegal" );
         var child = current[name];
         if ( !child ) {
            current[name] = child = {};
            child._parent = current;

         }
         current = child;
      }  // for
      current[className] = ctor;
   };

   /*
   Returns a function defined for the given class name specified
   - fullClassName (string) - A class name with full namespace.
   All elements are case sensitive to existing data in the namespaces property.

   - throwError (boolean) - When true and an error is detected, throw an exceptoin.
   
   Returns the function definition for the class name or null if not defined.

   */
   function getClass( fullClassName, throwError ) {
      var def = getDefinition( fullClassName );
      if ( !def ) {
         if ( throwError ) {
            _scriptFileMissing(fullClassName);
         }
         return null;
      }
      return def.ctor;

   };

   /*
   Returns the object was registered with jTAC.define() to define this class.
   The object contains:
      ctor: A reference to a function created by define() that 
         is the constructor to the class.
      inst: An instance of the object used with supply descriptive info
         from the class, including class name, parent class, etc. 
         These are defined properties starting with $.
         This object has not been initialize fully. The 
         constructor defined in the members has not been called.
         So it should not be used for invoking methods.

   - fullClassName (string) - A class name with full namespace.
   All elements are case sensitive to existing data in the namespaces property.
   
   Returns the function definition or null if not defined.

   */
   function getDefinition( fullClassName ) {
      var me = jTAC; // used instead of 'this'. Call any support function passing this to the call method
      fullClassName = fullClassName.replace("jTAC.","");
      return definitions[fullClassName];

   };

/*
   Returns true if the class name is the same as, or 
   inherits from the anotherClassName class.
   Throws an exception if fullClassName is not registered.
*/
   function inheritsFrom (fullClassName, anotherClassName) {
      var def = getDefinition(fullClassName);
      if ( !def ) {
         _scriptFileMissing(fullClassName);
      }
      return def.inst.instanceOf(anotherClassName);
   };

   /*
   configrules' prototype hosts functions used to validate inputs
   for the members of the config object. 
   This creates validation rules for any member of config that does
   not have a validation rule and whose value is already a boolean,
   integer, string, array, or RegExp object.
   */
   function _setupConfigRules( config, configrules ) {
      for ( var name in config ) {
         var obj = configrules.prototype[name];
         var fnc = null;
         if ( obj ) {
            if ( typeof obj == "function" ) {   // convert function to object with valFnc property
               configrules.prototype[name] = { valFnc: obj };
               continue;
            }
            else if (obj instanceof Array) {
               configrules.prototype[name] = { values: obj };
               continue;
            }
            else
               fnc = obj.valFnc;
         }
         if ( fnc )
            continue;
         if ( obj && obj.values)
            continue;
         var val = config[name];
         switch ( typeof val ) {
            case "boolean":
               fnc = jTAC.checkAsBool;
               break;
            case "number":
               fnc = jTAC.checkAsInt;
               break;
            case "string":
               fnc = jTAC.checkAsStr;
               break;
            case "object":
               if (val instanceof RegExp) {
                  fnc = jTAC.checkAsRegExp;
               }
               else if (val instanceof Array) {
                  fnc = jTAC.checkAsArray;
               }
               break;
         }  // switch
         if ( fnc ) {
            if ( !obj )
               configrules.prototype[name] = obj = {};
            obj.valFnc = fnc;
         }
      }
   };

/*
Adapted from js EXT Ext.AddMembers to tag each member of newClass.prototype
that is a function and only defined in this class with details
about the method. 
*/
   function _registerNewMethodNames (newClass, parentClass, fullClassName) {
      var skipnames = ["config", "$parentClass"];
      var proto = newClass.prototype;
      for (var name in proto) {
         if (skipnames.indexOf(name) > -1)
            continue;
         if (proto.hasOwnProperty(name)) {
            var val = proto[name];

            if (typeof val == 'function' ) {
               val.$owner = parentClass;
               val.$name = name;
               val.$fullClassName = fullClassName;
            }
         }  // if
      }  // for
   };

/*
Enables and disables the ability for the jTAC.inputError function
to write to the console. The feature is enabled by default,
allowing console writing.
   bool (boolean) - When true, console is not used.
      If this parameter is omitted, the function returns the current value
      and does not attempt to set anything.
Returns: Always returns the state of this feature where true means
the console is not used.
*/
   function silentWarnings(bool)
   {
      if (!arguments.length)
         return _silentWarnings;
      return _silentWarnings = bool;
   }
   var _silentWarnings = false;

/*
Used by jTAC.error to supply the action value to _error() when the action
parameter is not supplied.
push() and pop() strings on this array to add and remove an action.
Be sure to balance these calls in a try...finally clause.
*/
   var _errorActionStack = [];


/*
Adds a string to the error action stack. This will be used by
the actionStack() function to better document errors written to the console 
and thrown in exceptions by error(), inputError(), and warn().
   action (string) - the String to add. Generally use the format of a method, ending in ().
      If unassigned, it gets the name of the caller function (so long as
      the class was created by jTAC.createByClassName()).
   value (string) - value to show along with the action.
      This can be assigned while action can be null, letting this function
      determine the action from the caller name.
*/
   function pushContext(action, value) {
      if (!action) {
         var c = pushContext.caller;
         while(!action && c && c.$name) {
            action = c.$name;
            if (["_pushContext"].indexOf(action) > -1) {
               action = "";
               c = c.caller;
            }
            if (action) {
               action = c.$fullClassName + "." + action + "()";
            }
         }

      }
      if (action && (value != null))
         action += " [" + value.toString() + "]";
      _errorActionStack.push(action);
   }

/*
Removes the last string on the error action stack.
*/
   function popContext() {
      return _errorActionStack.pop();
   }
  
/*
Builds a string combining all entries in the error action stack.   
*/
   function actionStack() {
      return _errorActionStack.join("> ");
   }

/* 
Throw an Error exception with the text as the message.
Also write to the browser's console using error().
Internal method used by _error and _inputError.
   msg (string) - Text to show
   inst (object) - If assigned, this must be an object defined by jTAC.create that is calling this function.
      Its stateful data will be used to provide some context to the user.
   action (string) - If assigned, this is output as "Action: " + this value.
      Use it to describe the action that is happening when the error occurs.
   noThrow (boolean) - By default, it throws an exception. Pass false to prevent the exception.
   caller (function) - Pass this.[callermethodname].caller.
   consolemode (string) - Identify the name of the function on console to pass the message.
      When null or "", it uses "error".
*/
   function _logAndThrow( msg, inst, action, noThrow, caller, consolemode ) {
      if ( window.console ) {
         if ( inst && inst.$className ) {
            msg = "[" + inst.$fullClassName + "] " + " Message: " + msg;
         }
         var as = actionStack();
         while(!action && caller && caller.$name) {
            action = caller.$name;
            if (["_error", "_inputError", "_AM", "_DM", "err"].indexOf(action) > -1) {
               action = "";
               caller = caller.caller;
            }
            if (action) {
               action = caller.$fullClassName + "." + action + "()";
            }
         }
         if (as) {
            action = as + (action ? "> " + action : "");
         }

         if ( action ) {
            msg += "   Context: " + action + "";
         }
         if (!consolemode || (consolemode == "error"))
            console.error( msg );
         else {
            eval("console." + consolemode + "(msg);");
         }
         if ( console.trace )   // does not exist in IE 9
            console.trace();
      }
      if ( !noThrow )
         throw new Error( msg );
   };


   // ---- STATIC METHODS ----------------------------------------------------

   var staticMethods = {
      /* STATIC METHOD
      Throw an Error exception with the text as the message.
      Also write to the browser's console using error().
      Call from anywhere using jTAC.error(text)
         msg (string) - Text to show
         inst (object) - If assigned, this must be an object defined by jTAC.create that is calling this function.
            Its stateful data will be used to provide some context to the user.
         action (string) - If assigned, this is output as "Action: " + this value.
            Use it to describe the action that is happening when the error occurs.
         noThrow (boolean) - By default, it throws an exception. Pass false to prevent the exception.
      */
      error: function ( msg, inst, action, noThrow ) {
         _logAndThrow(msg, inst, action, noThrow, this.error.caller, "error");

      },

      /* STATIC METHOD
      Throw an Error exception with the text as the message.
      Also write to the browser's console using log().
      Call from anywhere using jTAC.inputError(text)
         inst (object) - If assigned, this must be an object defined by jTAC.create that is calling this function.
            Its stateful data will be used to provide some context to the user.
         action (string) - If assigned, this is output as "Action: " + this value.
            Use it to describe the action that is happening when the error occurs.
         noThrow (boolean) - By default, it throws an exception. Pass false to prevent the exception.
      */
      inputError: function ( msg, inst, action, noThrow ) {
         _logAndThrow(msg, inst, action, noThrow, this.inputError.caller, "log");

      },

      /* STATIC METHOD
      Write to the browser's console using warn(). Does not throw an exception.
      Call from anywhere using jTAC.warn(text)
         msg (string) - Text to show
         inst (object) - If assigned, this must be an object defined by jTAC.create that is calling this function.
            Its stateful data will be used to provide some context to the user.
         action (string) - If assigned, this is output as "Action: " + this value.
            Use it to describe the action that is happening when the error occurs.
      */
      warn: function ( msg, inst, action ) {
         _logAndThrow(msg, inst, action, true, this.error.caller, "warn");

      },


      /* STATIC METHOD
      Trims lead and trailing spaces from the string.
      Call from anywhere using jTAC.trimStr(text)
      */
      trimStr: function ( value ) {
         return ( value + "" ).replace( /^\s+|\s+$/g, "" );
      },

      /* STATIC METHOD
      Utility for building a regular expression pattern where the text
      has been escaped. That means special characters are preceded by a lead \ character.
      Call from anywhere using jTAC.escapeRE(text)
      */
      escapeRE: function ( text ) {
         // reference: http://simonwillison.net/2006/jan/20/escape/
         return text.replace( /[-[\]{}()*+?.,\\^$|#\s:]/g, "\\$&" );
      },


      /* STATIC METHOD
      Utility to create a Regular Expression that searches for the text
      surrounded by either the delimiters or line boundries.
      text (string) - Text to find.
      delim (string) - Delimiter regular expression.
      Returns a RegExp object.
      Call from anywhere using jTAC.delimitedRE(text, delim))
      */
      delimitedRE: function ( text, delim ) {
         if ( delim == null )
            delim = "\\s";
         return new RegExp( "(^|" + delim + ")" + jTAC.escapeRE( text ) + "(" + delim + "|$)" );
      },

      /* STATIC METHOD
      Replaces one string with another. It supports regular expressions.
      Match uses case insensitive search and replaces all instances of the text to find.
      text (string) - the text buffer
      find (string) - text to find. Can be a regexp pattern when escape=true.
      replace (string) - the replacement text
      escape (bool) - when true, escape the find. When false, find is a regex pattern.
      Call from anywhere using jTAC.replaceAll(params)
      */
      replaceAll: function ( text, find, replace, escape ) {
         if ( escape )
            find = jTAC.escapeRE( find );
         var re = new RegExp( find, "ig" );
         return text.replace( re, replace );
      },

      /* STATIC METHOD
      Determines if one string is within another. It supports regular expressions.
      Match uses case insensitive search.
      text (string) - the text buffer
      find (string) - text to find. Can be a regexp pattern when escape=true.
      escape (bool) - when true, escape the find. When false, find is a regex pattern.
      Call from anywhere using jTAC.contains(params)
      */
      contains: function ( text, find, escape ) {
         if ( escape )
            find = jTAC.escapeRE( find );
         var re = new RegExp( find, "ig" );
         return re.test( text );
      },


/* STATIC METHOD
Html encodes a string. With limitations. It only 
replaces &, ', ", < and >.
*/
      htmlEncode: function (text) {
         return String(text)
               .replace(/&/g, '&amp;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
      },


      /* ---- VALUE TYPE CHECKING ------------------------------------- */

      /* STATIC METHOD
      Use in the SETTER of properties that take integers to ensure the value
      is an integer. Call this before setting the field. It will fix a value,
      if needed (string to int), or throw an exception for illegal values.
      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsInt(params)
      */
      checkAsInt: function ( value, defaultval ) {
         if ( value == null ) {
            if ( defaultval === undefined )
               jTAC.error( "Null is not allowed. Must be an integer." );
            else
               return defaultval;
         }
         if ( typeof ( value ) == "string" ) {
            value = parseFloat( value ); // uses float to detect illegal decimal values
         }
         if ( ( typeof ( value ) != "number" ) || isNaN( value ) || ( Math.floor( value ) != value ) )
            jTAC.error( "Illegal value. Must be an integer." );

         return value;
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take integers to ensure the value
      is an integer or null. Call this before setting the field. It will fix a value,
      if needed (string to int), or throw an exception for illegal values.
      If null or "" is passed, it returns null.
      Call from anywhere using jTAC.checkAsIntOrNull(params)
      */
      checkAsIntOrNull: function ( value ) {
         if ( ( value == null ) || ( value === "" ) )
            return null;
         return jTAC.checkAsInt( value );
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take integers to ensure the value
      is an integer. Call this before setting the field. It will fix a value,
      if needed (string to int), or throw an exception for illegal values.
      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsNumber(params)
      */
      checkAsNumber: function ( value, defaultval ) {
         if ( value == null ) {
            if ( defaultval === undefined )
               jTAC.error( "Null is not allowed. Must be an integer." );
            else
               return defaultval;
         }
         if ( typeof ( value ) == "string" ) {
            value = parseFloat( value ); // uses float to detect illegal decimal values
         }
         if ( ( typeof ( value ) != "number" ) || isNaN( value ) )
            jTAC.error( "Illegal value. Must be a number." );

         return value;
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take integers to ensure the value
      is a number or null. Call this before setting the field. It will fix a value,
      if needed (string to int), or throw an exception for illegal values.
      If null or "" is passed, it returns null.
      Call from anywhere using jTAC.checkAsNumberOrNull(params)
      */
      checkAsNumberOrNull: function ( value ) {
         if ( ( value == null ) || ( value === "" ) )
            return null;
         return jTAC.checkAsNumber( value );
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take booleans to ensure the value
      is a boolean. Call this before setting the field. It will fix a value,
      if needed ("true", "false", 1, and 0 are all converted), 
      or throw an exception for illegal values.
      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsBool(params)
      */
      checkAsBool: function ( value, defaultval ) {
         if ( value == null ) {
            if ( defaultval === undefined )
               jTAC.error( "Null is not allowed. Must be an boolean." );
            else
               return defaultval;
         }
         switch ( typeof ( value ) ) {
            case "boolean":
               break;
            case "string":
               if ( value.toLowerCase() == "true" )
                  value = true;
               else if ( value.toLowerCase() == "false" )
                  value = false;
               else
                  value = undefined;
               break;
            case "number":
               if ( value == 1 )
                  value = true;
               else if ( value == 0 )
                  value = false;
               else
                  value = undefined;

               break;
            default:
               value = undefined;
               break;
         }  // switch
         if ( value === undefined )
            jTAC.error( "Illegal value. Must be an boolean." );

         return value;
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take Boolegers to ensure the value
      is an Boolean or null. Call this before setting the field. It will fix a value,
      if needed (string to Bool), or throw an exception for illegal values.
      If null or "" is passed, it returns null.
      Call from anywhere using jTAC.checkAsBool(params)
      */
      checkAsBoolOrNull: function ( value ) {
         if ( ( value == null ) || ( value === "" ) )
            return null;
         return jTAC.checkAsBool( value );
      },


      /* STATIC METHOD
      Use in the SETTER of properties that take string to ensure the value
      is a string. Call this before setting the field. It will fix a value,
      if needed (converting to string), or throw an exception for illegal values.
      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsStr(params)
      */
      checkAsStr: function ( value, defaultval ) {
         if ( value == null ) {
            if ( defaultval === undefined )
               jTAC.error( "Null is not allowed. Must be a string." );
            else
               return defaultval;
         }
         // while all types have a toString() function, its not meaningful to convert many types.
         // This only converts numbers. All other non-string types are errors
         if ( typeof ( value ) == "number" ) {
            value = value.toString();
         }
         else if ( typeof ( value ) != "string" )
            jTAC.error( "Illegal value. Must be a string." );

         return value;
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take Stregers to ensure the value
      is an String or null. Call this before setting the field. It will fix a value,
      if needed (string to Str), or throw an exception for illegal values.
      If null is passed, it returns null.
      Call from anywhere using jTAC.checkAsStr(params)
      */
      checkAsStrOrNull: function ( value ) {
         return jTAC.checkAsStr( value, null );
      },



      /* STATIC METHOD
      Creates or updates an object of the class identified by classCtor.
      Returns the object. Use in property setters that host objects.
         val - Supports these values:
            Class specific object - If passed, it is returned without change.
            javascript object with jtacClass property -
               Creates an instance of the class named by the jtacClass property
               and assigns the remaining properties to the new object.
            javascript object without jtacClass property - 
               if existingObject is assigned, its properties are updated.
               If existingObject is null, an exception is thrown.
               If illegal properties are found, exceptions are thrown.
            string - Specify the class or alias name of the class to create. 
               That class is created with default properties
               and returned.
            null - return the value of existingObject.
         existingObject - Either null or an object instance. Usage depends on val.
         classCtor - Class constructor used to verify the class instance created
            is allowed. Usually jTAC.[namespace].[classname].
            Required.
      */

      checkAsClass : function ( val, existingObject, classCtor ) {
         if ( ((val == null) || ( val == "")) && (existingObject !== undefined) )
            return existingObject || null;
         try {
            jTAC._internal.pushContext("jTAC.checkAsClass");

            if ( val && (typeof val == "object") && !val.$className) {
               if ( val.jtacClass ) {
                  val = jTAC.create(null, val);
               }
               else if ( existingObject ) {
                  existingObject.setProperties(val);
/*
            // a plain object and just update the properties on existingObject and return it.
            // Reject it if any property is not legal
                  for (var name in val) {
                     if (!existingObject.setProperty(name, val[name]))  // will throw exceptions for illegal values
                        jTAC.error("Could not set the property [" + name + "] on the class [" + existingObject.$fullClassName +  "].");
                  }
*/
                  return existingObject;
               }
            }
            else if (typeof(val) == "string") {
               val = jTAC.create(val, null, true);
            }
            if (val instanceof classCtor) {
               return val;
            }

            var name = val ? val.$fullClassName : (existingObject ? existingObject.$fullClassName : "n/a");

            jTAC.error("Property does not support the class [" + name + "].");
         }
         finally {
            jTAC._internal.popContext();
         }
      },

      /* STATIC METHOD
      For properties that take a RegExp object or null.
      It accepts either a RegExp object or a string with a valid regular expression pattern.
      Call from anywhere using jTAC.checkAsRegExp(val)
      */
      checkAsRegExp: function ( val ) {
         if ( ( val instanceof RegExp ) || ( val == null ) )
            return val;
         if ( typeof val == "string" ) {
            try {
               return new RegExp( val );
            }
            catch ( e ) {
               jTAC.error("Invalid regular expression pattern. Error: " + e.message);
            }
         }
         jTAC.error( "Invalid type in 'val' parameter." );
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take arrays to ensure the value
      is an array. Call this before setting the field. 
      It will throw an exception for illegal values.
      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsArray(params)
      */
      checkAsArray: function ( value, defaultval ) {
         if ( value == null ) {
            if ( defaultval === undefined )
               jTAC.error( "Null is not allowed. Must be an integer." );
            else
               return defaultval;
         }
         if ( value instanceof Array ) {
            return value;
         }
         jTAC.error( "Illegal value. Must be an array." );

      },

      /* STATIC METHOD
      Use in the SETTER of properties that take functions to ensure the value
      is a function. Call this before setting the field.
      It accepts a string specifying the name of a function defined on the window object.

      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsFunction(params)
      */
      checkAsFunction: function ( value, defaultval ) {
         if ( value == null ) {
            if ( defaultval === undefined )
               jTAC.error( "Null is not allowed. Must be a function." );
            else
               return defaultval;
         }
         if ( typeof ( value ) == "string" ) {
            value = window[value];
            if (!value)
               jTAC.error("Function [" + value + "] not defined on the window object.");
         }
         if ( ( typeof ( value ) != "function" ) )
            jTAC.error( "Illegal value. Must be a function." );

         return value;
      },

      /* STATIC METHOD
      Use in the SETTER of properties that take functions to ensure the value
      is a function. Call this before setting the field.
      It accepts a string specifying the name of a function defined on the window object.

      If null is passed, it is an error unless a value is passed in the defaultval parameter
      to return. Do not supply defaultval if you don't want to use it.
      Call from anywhere using jTAC.checkAsFunction(params)
      */
      checkAsFunctionOrNull: function ( value, defaultval ) {
         return jTAC.checkAsFunction(value, null);
      },

  /*
      Copies members from one object to another.
      Primary usage: add members to a prototype definition. 
      Do not use this to extend a jTAC class object because it does not setup functions correctly.
      Instead, use addMembers(). 
      Set src to an object whose members will be added to the prototype.
      Set dest to the prototype property of a member.
         src (object) - Object whose members are added to dest.
         dest (object) - The object that receives these members
         deep (boolean) - When true, clone objects found in the properties of the source.
  */
      extend: function ( src, dest, deep ) {
         if ( ( typeof src == "object" ) && ( typeof dest == "object" ) ) {
            for ( var name in src ) {
               dest[name] = deep ? jTAC.clone(src[name]) : src[name];
            }
         }
         else
            jTAC.error( "Illegal param" );
      },

/*
Clones an object including array and date. If the value passed is not an object,
the same valuw is returned.
*/
      clone: function( item )
      {
         if (item == null)
            return null;
         if (typeof item == "object") {
            if (item instanceof Array) {
               var a = [];
               for (var i = 0; i < item.length; i++) {
                  a[i] = jTAC.clone(item[i]);   //!!recursion
               }
               return a;
            }
            if (item instanceof Date) {
               return new Date(item.getTime());
            }
            if (item.constructor === Object) {
                var newObj = {};

                for (name in item) {
                    newObj[name] = jTAC.clone(item[name]);   //!!recursion
                }
                return newObj;
            }
         }
         return item;
      }

   }; // end staticMethods object

   var publics = {
      define: define,
      defineAlias: defineAlias,
      addMembers: addMembers,
      isDefined: isDefined,
      createByClassName: createByClassName,
      create: create,
      require: require,
      getClass: getClass,
      getDefinition: getDefinition,
      silentWarnings: silentWarnings
      // NOTE: All items in staticMethods is also added. See below
   };

   staticMethods.extend( staticMethods, publics );

   // slightly expose privates mostly for the benefit of unit testing.
   // However, these values are usable elsewhere if needed.
   publics._internal = {
      definitions: definitions,
      aliases: aliases,
      pushContext: pushContext,
      popContext : popContext,
      actionStack : actionStack,
      uniqueid : 0,
      temp: {} // when creating member objects for define, instead of creating objects globally, assign them here
   };

   return publics;
}) ();

/* ----------------------------------------------------------------
The jTACClassBase object hosts is the base class for all prototypes
generated by the jTAC.define() method.
define() creates this for each new class and extends that new class's
prototype with all members passed into define. If those members
include the "extend" property, it inherits from the prototype of the 
class it inherits before adding the new members to the prototype.
-----------------------------------------------------------------*/

var jTACClassBase = {
   /*
   Field used internally that identifies the class name (without namespace)
   */
   $className: null,

   getName: function () {
      return $className;
   },

   /*
   Field used internally that identifies the class name which this class extends
   */
   $parentName: null,
   /*
   Field used internally that identifies the function which this class extends
   */
   $parentClass: null,
   /*
   Field used internally that identifies the full class name (with namespace)
   */
   $fullClassName: null,

/*
When true, this class is abstract and cannot be created by jTAC.define().
It can still be instantiated using new jTAC.namespace.class. However, that does not
invoke the constructor function defined in the members passed into jTAC.define()
nor does it initialize the config object.
*/
   $abstract: false,

/*
Defines other class names that are required by this class.
This does not need to include any direct ancestor class.
It can supply a specific class it needs and not worry about supplying all ancestor classes too.
The value is either a string or array of strings identifying full class names.
This property is often assigned in the member object passed to jTAC.define.
*/
   $require: null,



   /*
   Hosts an object with properties that are used as data storage for public properties
   defined on child classes of base.
   */
   config: null,

   /*
   The class can add anything here they don't want the outside word to see.
   Add fields that are storage for properties, cached data (like a RegExp)
   and even methods.
   This is an object that is created by the constructor process.
   */
   _internal: null,

/*
   Similar to _internal, but for values that are cached and will need to be
   cleared when _clearCache() is invoked.
*/
   _cache: null,

/*
Call after instantiating the object (calling the constructor function) to
call the user defined constructor (from the member.constructor field)
and to initialize the config properties.
*/
   init: function(propertyVals)
   {
      this._reviewDefaults.call(this);

      if ( this.$ctor ) {
         this.$ctor.call( this, propertyVals ); // if you want to avoid passing a value used in propertyVals to the next code, delete items in this object in your constructor
      }

      if ( propertyVals ) {
         if ( typeof propertyVals == "function" ) {
            propertyVals.call( this, this, this.$className );
         }
         else
            this.setProperties.call( this, propertyVals );
      }

   },

   /*
   Adds properties and methods to the prototype of this class.
   Best usage is to work with the static method:
   jTAC.Namespace.childnamespace.className.implement({property:value}).

   jTAC.conditions.charCount.implement({replaceTokens: function(){...}});

   This method should match js EXT's Ext.implement(members).
   members (object) - Each property will be added to the prototype.
   If the property name already exists, it will replace the current value.
   */
   implement: function ( members ) {
      // NOTE: Currently, this differs from js EXT in that js EXT will not add members
      // that are inherited (in the prototype from a parent class).
      jTAC.extend( members, this.prototype );
   },

   /*
   Calls the parent or ancestor method of the same name as the caller, using
   the arguments (in an array) passed in as the parameters to call the method.
   */
   callParent: function ( args ) {
      if (args && (typeof args != "object"))
         this._error("Arguments must be enclosed in an array.");
      if ( this.$className === undefined )
         this._error( "Only supports classes defined by jTAC.define()." );
      var caller = this.callParent.caller;
      if ( !caller )
         this._error( "No caller" );

      var methodName = caller.$name;
      if ( !methodName )
         this._error( "Not registered correctly." );
      if ( !caller.$owner )
         this._error( "No parent class defined." );
      var parentMethod = caller.$owner.prototype[methodName];
      if ( !parentMethod )
         this._error( "Parent does not define the method [" + methodName + "]." );

      return parentMethod.apply( this, args || [] );
   },

   /*
   Determines if this object is an instance of another class, either
   the same class or inherits from that class.
   Returns true if it is an instance of ancestorClassName.
   */
   instanceOf: function ( ancestorClassName ) {
      var current = this;
      do {
         if ( current.$fullClassName == ancestorClassName )
            return true;
         current = current.$parentClass;
      }
      while ( current != null );
      return false;
   },

/*
Accesses the getter function of the property name supplied.
Returns the value of that property. 
   propertyName (string) - The property name on this class.
If the property name does not have a getter, it returns undefined.
*/
   getProperty: function(propertyName) {
      try
      {
         this._pushContext(this.$fullClassName + ".getProperty('" + propertyName + "')");

         var fixedname = this._propNameToUpper( propertyName );
         var getter = this["get" + fixedname];
         if ( getter )
            return getter.call( this );
         return undefined;
      }
      finally {
         this._popContext();
      }
   },

/*
Accesses the setter function of the property name supplied.
Sets the value of that property. 
If the property name does not have a getter, it returns false.
   propertyName (string) - The property name on this class.
   value - The value to assign to that property. The setter
      may validate it and throw an exception if illegal.
*/
   setProperty: function(propertyName, value) {
      try
      {
         this._pushContext(this.$fullClassName + ".setProperty('" + propertyName + "')");
         var fixedname = this._propNameToUpper( propertyName );
         var setter = this["set" + fixedname];
         if ( setter ) {
            setter.call( this, value );
            return true;
         }
         return false;
      }
      finally {
         this._popContext();
      }
   },

/*
   Pass in an object. Its property names are compared to properties
   on 'this'. If it has a setter method with that name, the value is assigned.
   If a property hosts another jTAC object, that property's setter
   should accept an object of property names and values and internally
   call setProperties, or if it finds a jtacClass property, create a
   new instance with it.
*/
   setProperties: function ( newvalues ) {
      for ( var name in newvalues ) {
         if ( name == "jtacClass" )
            continue;
         this.setProperty( name, newvalues[name] );
      }  // for
   },

   /*
   Takes a property name and changes its first character to uppercase
   for use with getter and setter methods.
   */
   _propNameToUpper: function ( name ) {
      return name.charAt( 0 ).toUpperCase() + name.substr( 1 );
   },

   /*
   Creates Get and Set methods for each property defined in config, so long
   as they are not already defined in the object's prototype.
   The methods are not created when the configrules[property] has autoGet=false
   or autoSet=false.
   Get and Set methods have a specific syntax.
   Get = "get" + property name, where the first letter of property name is uppercase.
   Set = "set" + property name, where the first letter of property name is uppercase.
   config (object) - the new properties to review for adding getters and setters.
   */
   _autoGetSet: function ( config, configrules ) {
      function nameClosure( name1 ) {
         var rule = configrules.prototype[name1] || null;
         var autoGet = !rule || ( rule.autoGet != false );
         var autoSet = !rule || ( rule.autoSet != false );
         var fixedName = proto._propNameToUpper( name1 );

         var getter = proto["get" + fixedName];   // supports methods that aren't even on the prototype
         var setter = proto["set" + fixedName];

         if ( !getter && autoGet ) {
            proto["get" + fixedName] = function () {
               return this.config[name1];
            };
         }
         if ( !setter && autoSet ) {
            proto["set" + fixedName] = function ( value ) {
               this._defaultSetter.call(this, name1, value);
            }; // end setter function

         }

      }  // nameClosure

      proto = this.prototype;
      for ( var name in config ) {
         var defValue = config[name];
         if ( defValue === undefined )
            continue;   // property was stripped out
         nameClosure( name );


      }  // for
   },

/*
Utility to be called from a property setter that wants to set
the [config] object after checking the configrule for validity.
This is called when using autoset (see _autoGetSet()).
The property isn't required to use this to set this.config.
Always call to set 'this' to the instance of the object.
EXAMPLE:
   setPropertyName: function(val) {
      this._updateConfig.call(this, "PropertyName", val);
      // do other stuff.
   }
*/
   _defaultSetter: function (propertyName, value) {
      // force some validation and data cleanup. If these aren't enough, write the set method in the class itself
      var configrule = this.configrules[propertyName];
      if ( configrule ) {
         var fnc = ( typeof configrule == "function" ) ?   // convert function to object with valFnc property
            configrule : fnc = configrule.valFnc;

         if ( fnc ) {
            value = fnc.call( this, value );   // throws exceptions when the value is illegal
         }
         else {
            var values = configrule instanceof Array ? configrule : configrule.values;
            if ( values ) {
               if (values.indexOf(value) == -1)
                  jTAC.error("Requires one of these values: " + values.join(", "));

            }
         }
         if (configrule.clearCache) {
            this._clearCache();
         }
      }
      this.config[propertyName] = value;
   },

   /*
   Creates javascript properties (Object.defineProperty) for each element
   in config. It uses GET and SET functions already defined in the obj's prototype.
   Get and Set methods have a specific syntax.
   Get = "get" + property name, where the first letter of property name is uppercase.
   Set = "set" + property name, where the first letter of property name is uppercase.
   */
   _defineProperties: function ( config ) {
      for ( var name in config.prototype ) {
         var defValue = config.prototype[name];
         if ( defValue === undefined )
            continue;   // property was stripped out

         this._defineProperty( name );

      }  // for
   },

/*
   Creates one javascript property (Object.defineProperty) for the name specified.
   It uses GET and SET functions already defined in the obj's prototype.
   Get and Set methods have a specific syntax.
   Get = "get" + property name, where the first letter of property name is uppercase.
   Set = "set" + property name, where the first letter of property name is uppercase.
   Due to requirements for Javascript 1.8.5, browsers without support
   for Object.defineProperty still work, but do require calling the
   getter and setter functions directly instead of using the property name.
   All code within jTAC calls getter and setter functions instead of using property names
   to ensure compatibility with earlier browsers.
*/
   _defineProperty: function ( name ) {

      if ( Object.defineProperty ) { // Introduced in JavaScript 1.8.5. https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty
         var me = this;
         var fixedName = me._propNameToUpper( name );

         var getter = me["get" + fixedName];   // supports methods that aren't even on the prototype
         if ( getter && ( typeof getter != "function" ) )
            return;
         var setter = me["set" + fixedName];
         if ( setter && ( typeof setter != "function" ) )
            return;
         Object.defineProperty( me, name, {
            get: function () { 
               if ( getter ) { 
                  try {
                     me._pushContext(me.$fullClassName + "." + getter.$name); 
                     return getter.call( me ); 
                  }
                  finally {
                     me._popContext();
                  }
               }
            },
            set: function ( val ) { 
               if ( setter ) { 
                  try {
                     me._pushContext(me.$fullClassName + "." + setter.$name); 

                     setter.call( me, val ); 
                  }
                  finally {
                     me._popContext();
                  }
               } 
            }
         } );
      }
   },


/*
   Looks through the config values. If assigned, run them through their function setter
   to allow it to clean up those values in config. This allows a setter to use checkAsBool/Int, etc
   to change a value of a compatible type into the correct type.
   Does nothing when the value is null.
   A common usage: properties that use checkAsConnection, checkAsCondition, checkAsTypeManager,
   and checkAsCalcItem all allow the actual object, a JSON object with jtacClass property,
   and a string with the class name or alias. Any of these can be assigned
   to a config property. This will let the checkAs function convert the value into the actual class instance
   and reassign it to config.
*/
   _reviewDefaults: function()
   {
      var me = this;
      for ( var name in me.config ) {
         var val = me.config[name];
         if (val == null)
            continue;
         var fixedName = me._propNameToUpper( name );

         var setter = me["set" + fixedName];
         if ( !setter || ( typeof setter != "function" ) )
            continue;
         setter.call(me, val);
      }  // for
   },


/*
Abandons the values stored in the _cache object by replacing
it with a new object.
Call from properties that may require cached data to be cleared.
If this class owns another jTAC object whose _clearCache method 
should be called, connect the two with _registerChild().
*/
   _clearCache: function() {
      this._cache = {};
      var children = this._internal.children;
      if (children) {
         for (var child in children)
            children[child]._clearCache();
      }
   },

/*
If another object depends on its clearCache method or other actions
to notify its method, pass it to register.
*/
   _registerChild: function (child) {
      var children = this._internal.children;
      if (!children) {
         children = this._internal.children = [];
      }
      children.push(child);
   },

   _AM: function () {
      jTAC.error( "Not supported. Abstract method.", this );
   },

   _DM: function () {
      jTAC.error( "Not supported method.", this );
   },

/*
Adds a string to the error action stack. This will be used by
the actionStack() function to better document errors written to the console 
and thrown in exceptions by error(), inputError(), and warn().
   action (string) - the String to add. Generally use the format of a method, ending in ().
      If unassigned, it gets the name of the caller function (so long as
      the class was created by jTAC.createByClassName()).
   value (string) - value to show along with the action.
      This can be assigned while action can be null, letting this function
      determine the action from the caller name.
*/
   _pushContext: function(action, value) {
      jTAC._internal.pushContext(action, value);
   },

/*
Removes the last string on the error action stack.
*/
   _popContext: function() {
      return jTAC._internal.popContext();
   },


/*
Wrapper around jTAC.error that gets the current instance involved.
   msg (string) - Message passed to jTAC.error's msg parameter.
   action (string) - Passed to jTAC.error's action parameter. Can be null.
*/
   _error: function( msg, action ) {
      jTAC.error(msg, this, action);
   },

/*
Wrapper around jTAC.inputError that gets the current instance involved.
   msg (string) - Message passed to jTAC.inputError's msg parameter.
   action (string) - Passed to jTAC.inputError's action parameter. Can be null.
*/
   _inputError: function( msg, action ) {
      jTAC.inputError(msg, this, action);
   },

   /* 
Wrapper around jTAC.warn that gets the current instance involved.
Write to the browser's console using warn(). Does not throw an exception.
Call from anywhere using jTAC.warn(text)
   msg (string) - Text to show
   inst (object) - If assigned, this must be an object defined by jTAC.create that is calling this function.
      Its stateful data will be used to provide some context to the user.
   action (string) - If assigned, this is output as "Action: " + this value.
      Use it to describe the action that is happening when the error occurs.
*/
   _warn: function ( msg, inst, action ) {
      jTAC.warn(msg, inst, action);

   }


};    // end jTACClassBase object definition


/* -----------------------------------------------------------
Translations provides alternative strings to those built in.
They can either replace the existing strings or be assigned 
to a culture for localization. When using a culture, select the 
current culture with setLanguage().
When adding strings to this library, use register().
When retrieving a string, use lookup(). It will first
look at the current culture for the key. If not found, it looks
at the culture neutral format. If not found, it uses
a default supplied by the caller.

All data is stored in the object defined in the global object
jTAC.translations.
Each property is the name of a culture with "default" being
the values always used when there is no culture support.
Each property hosts its own object where the property name is
a unique lookup key and the value is the string provided to the user.
-------------------------------------------------------------*/
jTAC.translations = {

/*
Call to add a list of translations specific to a culture.
Each translation has two elements: key and value. Both
are strings. Key is used to lookup the value.
An effective usage is to create separate script files that
contain each culture. That file will call this.
Note that the last call to this will be the current culture used
by lookup() until you explicitly call setLanguage().
   cultureName (string) - Use "" for the culture neutral format.
      Otherwise use unique strings for each culture.
      Recommended naming is the same as all culture names, "en-US",
      "en-UK", "es-ES", etc.
   translations (object) - This object defines the key and value
      pairs for each translation.
      A key is a string that will be used by the caller of
      jTAC.translations.lookup() to identify what its looking for.
      The value is a string that will be returned if the key is requested.
*/
   register : function (cultureName, translations)
   {
      var lng = jTAC.translations[cultureName];
      if (lng == null)
         jTAC.translations[cultureName] = lng = {};

      jTAC.extend(translations, lng, true);

      jTAC.translations.setLanguage(cultureName);
   },

   /*
   Sets the current language used for translations by lookup().
   Always called by register(), so the last
   call to that will define the initial current culture.
   Call this explicitly if you have the ability to switch cultures without postback.
      cultureName (string) - Use "" for the culture neutral format.
         Otherwise use unique strings for each culture.
         Recommended naming is the same as all culture names, "en-US",
         "en-UK", "es-ES", etc.

   */
   setLanguage : function (cultureName)
   {
      if (jTAC.translations[cultureName] == null)
         jTAC.error("Requested the language for [" + cultureName + "]. It has not be registered with jTAC.translations.");
      jTAC.translations.current = jTAC.translations[cultureName];
   },

   /*
   Looks up a translation for the given key. If not found, it first
   falls back to the culture neutral format.
   If not found there, it uses the default.
      key (string) - Defined by the caller to locate its specific string.
         If null or "", it returns def.
      def (string) - Default value when nothing else works.
         Pass in null if you want to know if the key has a value.
         Then test for null with the result to know it does not.
      cultureSpecific (boolean) - If true, then only lookup
         if the current culture is not the neutral culture. 
         Never use the neutral culture. If there is no match
         on the current culture, it returns the default.
   Returns either the translated value or the def.
   */
   lookup : function (key, def, cultureSpecific)
   {
      if (!key)
         return def;
      var t = jTAC.translations;
      var ct = t.current;
      if (ct == null)
         return def;
      if (cultureSpecific && (ct == t[""]))
         return def;

      var value = ct[key];
      if ((value == null) && !cultureSpecific)
      {
         var nt = t[""];   // the culture neutral translations
         if (nt && (nt !== ct))
            value = tn[key];
      }
      return value != null ? value : def;

   }

}  // end jTAC.translations object

var jTAC_Temp; // used as a placeholder for creating member objects passed into addMembers() and define()﻿// jTAC/Connections/Base.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: Connection objects
Class : Connections.Base      ABSTRACT CLASS
Extends: nothing

Purpose:
A Connection object provides two-way data transfer between code and an element
on the page, such as a form field's value attribute. 
It can be limited to one-way transfer, where the code can request a value,
but not set it. This allows Connections be hosts to a value.

Connections are used by Condition objects to retrieve a value to evaluate.
That value can come from an element on the page when the FormConnection class is used.
When using the ValueConnection class, it holds a fixed value.

Connections can transfer several types of data. All should handle
getting and setting string values via their getTextValue() and setTextValue() methods,
even if the native value of stored in another type. 
(They should convert native to string in that case.)
HTML Form elements all keep a string representation in their value attribute
(document.getElementById("textbox1").value).
Some Form elements have other representations of data:
  * The checkbox and radio inputs have the checked attribute which is a boolean value.
  * The HTML5 date, time, datetime, etc inputs have the valueAsDate property which is 
      a Date object.
  * The HTML5 number and range inputs have the valueAsNumber property which
      is a number value.

To support these non-string values, use the getTypedValue() and setTypedValue()
methods. First check if a type is supported by passing one of the following
strings to the typeSupported() method:
  "integer" - Supports a number value that is an integer. 
      HTML5 number and range inputs support this.
  "float" - Supports a number value that is a float.
      HTML5 number input supports this.
  "date" - Supports a Date object representing only a date (the time is undefined).
      HTML5 date, datetime, datetime-local, and month inputs support this.
  "datetime" - Supports a Date object representing both date and time.
      HTML5 datetime and datetime-local inputs support this.
  "time" - Supports a Date object representing only a time (the date is undefined).
      HTML5 time input supports this.
  "boolean" - Supports a boolean value.
      checkbox and radio inputs support this.
  "index" - Supports a number value representing an offset in a list.
      -1 = no selection. 0 = first element.
      HTML's select element supports this.
  "indices" - Supports an array of integers representing multiple 
      offsets in a list.
      HTML's select element supports this.


Essential Methods:
Here are the essential methods of a Connection class
  getTextValue() - retrieve the string representation of the value.
  setTextValue(value) - assign a value represented as a string.
  typeSupported(typename) - Check if a type other than string is supported.
      If it is, the setTypedValue() and getTypedValue() methods
      can be used for this type. See 
      Subclasses may introduce other type strings, such as a rich text editor
      may offer "string" to return a value without any formatting codes
      and "html" to get the formatted version.
  getTypedValue(typename) - if the typeSupported() function supports a type and that type
      is needed, this will be called to get a value of that type.
  setTypedValue(value) - if the typeSupported() function supports a type and 
      that type is needed, this is called to set the value, passing in that type.
  isNullValue() - Determines if the value is assigned or not.
      HTML form elements are null when their value attribute is "".
  isValidValue(typename) - Determines if the value held by the widget
      will create a validvalue for the given type. Returns true
      if it can convert and false if not. It also returns true if isNullValue is true.
  textLength() - Determines the length of the text value.
  isEditable() - Determines if the element allows editing.
  getTypeManager() - If the widget is built to handle a specific data type
      other than string, it can create and return a TypeManager class for that data type.
  getLabel() - Returns a string that can be displayed as the label for the element.
  
By using subclassing, you can support data transfer with widgets that
may use code to access its value, and it may supply the value as
something other than a string. For example, a datePicker may introduce
a DatePickerConnection that calls its API function to get a Date object.
Also, a rich text editor may introduce a RichTextConnection that calls
its API to get and set the string it contains.
Your subclasses may support other types of data than those listed above
for the typeSupported(), getTypedValue(), and setTypedValue().


Properties introduced by this class:
   defaultLabel (string) - 
      The string returned by getLabel() when the user did not 
      provide support for it on the element.

   defaultLookupKey (string) -
      Provides a key that is used with the jTAC.translations system
      to retrieve a localized string that is used instead of defaultLabel.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require or utilize jquery itself. These classes can be
used outside of jquery, except where jquery globalize demands it
(jquery globalize is designed to work independently of jquery.)

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._Connections_Base = {
   "abstract": true,

   constructor: function ( propertyVals ) {

   },

   config: {
      defaultLabel: "Field",
      defaultLookupKey: null
   },

   configrules: {
      defaultLookupKey: jTAC.checkAsStrOrNull
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   */
   getTextValue : function () {
      this.AM();  // throws exception
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      this.AM();  // throws exception
   },

   /*
   Check if a type other than string is supported.
   If it is, the setTypedValue() and getTypedValue() methods
   can be used for this type. 
   Here are the predefined type names that can be passed into the typeName parameter:
     "integer" - Supports a number value that is an integer. 
         HTML5 number and range inputs support this.
     "float" - Supports a number value that is a float.
         HTML5 number input supports this.
     "date" - Supports a Date object representing only a date (the time is undefined).
         HTML5 date, datetime, datetime-local, and month inputs support this.
     "datetime" - Supports a Date object representing both date and time.
         HTML5 datetime and datetime-local inputs support this.
     "time" - Supports a Date object representing only a time (the date is undefined).
         HTML5 time input supports this.
     "boolean" - Supports a boolean value.
         checkbox and radio inputs support this.
     "index" - Supports a number value representing an offset in a list.
         -1 = no selection. 0 = first element.
         HTML's select element supports this.
     "indices" - Supports an array of integers representing multiple 
         offsets in a list.
         HTML's select element supports this.
   Subclasses may introduce other type strings, such as a rich text editor
   may offer "string" to return a value without any formatting codes
   and "html" to get the formatted version.

   */
   typeSupported : function (typeName) {
      this.AM();  // throws exception
   },

   /*
   Retrieves a value of a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
      typename (string) - If null, use the default type (usually there is a single type supported
         other than string). Otherwise, one of the values that would return
         true when calling typeSupported().
   Returns the value based on the expected type.
   If the value cannot be created in the desired type, it returns null.
   */
   getTypedValue : function (typeName) {
      this.AM();  // throws exception
   },

   /*
   Sets the value represented by a specific type (number, Date, boolean, string).
   The caller must call typeSupported() first to determine if this function
   will work.
   Subclasses should test the type of the object passed in to ensure it is still legal.
      value - The value to update. Must be a type supported by this method
         or subclass should throw an exception.
   */
   setTypedValue : function (value) {
      this.AM();  // throws exception
   },

   /*
   Determines if the value is assigned or not.
   For example, HTML form elements are null when their value attribute is "".
      override (boolean) - Some widgets can either return a real value
         or treat that value as null. For example, a checkbox and radiobutton
         can treat its checked=false state as either false or null.
         Normally isNullValue should indicate false in these cases.
         When override is true, isNullValue will indicate true in these cases.
   */
   isNullValue : function (override) {
      this.AM();  // throws exception
   },

   /*
   Determines if the value held by the widget will create a valid value for the given type.
      typename (string) - If null, use the default type (usually there is a single type supported
         other than string). Otherwise, one of the values that would return
         true when calling typeSupported(). 
   Returns true if it can convert and false if not. It also returns true if isNullValue is true
   or the typename is not supported.
   */
   isValidValue : function (typename) {
      if (!this.typeSupported(typename))
         return true;
      if (this.isNullValue())
         return true;
      try {
         var val = this.getTypedValue(typename);
         if ((val == null) || isNaN(val))
            return false;
      }
      catch (e) {
         return false;
      }
      return true;
   },

/*
   Determines the length of the text value.
   While usually the length is the same as the string value represented by 
   the element, there are cases where the string value is not what is
   saved on postback. 
   For example, the HTML TextArea allows ENTER in the text. Many browsers
   report the length of the string with 1 character (%AO) for each ENTER.
   However, all browsers postback two characters (%0D%A0). 
   So this function can return a length adjusted with the value used in postback.
*/
   textLength: function() {
      var text = this.getTextValue();
      return text ? text.length : 0;
   },
   
   /*
   Determines if the element is editable.
   Returns true when editable.
   This class always returns true.
   */
   isEditable : function () {
      return true;
   },

   /* 
   Returns a string that can be displayed as the label for the element.
   This class returns the defaultLabel property value.
   It will also use defaultLookupKey to get a localized value.
   */
   getLabel : function () {
      return jTAC.translations.lookup(this.getDefaultLookupKey(), this.getDefaultLabel());
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   If it does not have a TypeManager to return, it returns null.
   This class always returns null.
   */
   getTypeManager : function () {
      return null;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.Base", jTAC._internal.temp._Connections_Base);


/* STATIC METHOD - EXTENDS jTAC
   Creates or updates a TypeManager object.
   Returns the object. Use in property setters that host objects.
      val - Supports these values:
         Class specific object - If passed, it is returned without change.
         javascript object with jtacClass property -
            Creates an instance of the class named by the jtacClass property
            and assigns the remaining properties to the new object.
         javascript object without jtacClass property - 
            if existingObject is assigned, its properties are updated.
            If existingObject is null, an exception is thrown.
            If illegal properties are found, exceptions are thrown.
         string - Specify the class or alias name of the class to create. 
            That class is created with default properties
            and returned.
         null - return the value of existingObject.
      existingObject - Either null or an object instance. Usage depends on val.
         
*/
jTAC.checkAsConnection = function ( val, existingObject ) {
   return jTAC.checkAsClass( val, existingObject, jTAC.Connections.Base );
}
/*
jTAC.checkAsConnection = function ( val, defaultValue ) {
   try
   {
      jTAC._internal.pushContext();

      if ( (val == null) && (defaultVal !== undefined) )
         return defaultVal || null;

      if ( val && (typeof val == "object") && !val.$className) {
         if ( val.jtacClass ) {
            val = jTAC.create(null, val, true);
         }
         else if ( defaultVal ) {
      // a plain object and just update the properties on defaultVal and return it.
      // Reject it if any property is not legal
            for (var name in val) {
               if (!defaultVal.setProperty(name, val[name]))  // will throw exceptions for illegal values
                  jTAC.error("Could not set the property [" + name + "] on the Connection.");
            }
            return defaultVal;
         }
      }
      else if (typeof(val) == "string") {
         val = jTAC.create(val, null, true);
      }
      if (val instanceof jTAC.Connections.Base) {
         return val;
      }
      jTAC.error("Requires a Connection object.");
   }
   finally {
      jTAC._internal.popContext();
   }
}
*/

/* STATIC METHOD - EXTENDS jTAC
Same as jTAC.checkAsConnection but allows assigning null to the result.
*/
jTAC.checkAsConnectionOrNull = function ( val ) {
   return jTAC.checkAsConnection(val, null);
}

﻿// jTAC/Connections/BaseElement.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: Connection objects
Class : Connections.BaseElement     ABSTRACT CLASS
Extends: Connections.Base

Purpose:
Base class for accessing an element on the page.

Its default functionality handles many aspects of DOM.

Its getElement() method returns an instance of the object that describes
the widget. It does not have to be a DOM element. For example,
a jquery connection can be built around jquery elements.

Its getLabel() method can locate the label for the element instead of
using the value from the defaultLabel property.
If the element has the data-msglabel attribute, its value is used.
Otherwise, if there is a <label> tag whose for= points to the element,
its text is used, after cleaning it up in the _cleanLabel() method.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
   id (string) - the id attribute value of an element on the page.

   allowNone (boolean) - When true, if the id is not found when calling
      get or set methods, nothing happens. When false, an exception occurs.

   trim (boolean) - Determines if strings are returned from getTextValue()
      after trimming lead and trailing spaces. isNullValue also 
      applies this property to evaluate if null.
      Defaults to true.
      Subclasses should call _cleanString(text) in their getTextValue()
      and isNullValue() methods.

   unassigned (string) - Allows for watermarks in a textbox
      and a non-empty string value for a list to mean unselected.
      A watermark is text that appears when the textbox is empty.
      Lists usually use the value "" to mean an unselected state.
      But if you want to have a "no selection" item with a different value,
      assign this to the string for that value.
      When assigned, this string is compared to the textual value
      of the widget. If it matches, getTextValue() returns the empty string
      and IsNullValue() returns true.
      It defaults to null.

   unassignedCase (boolean) - When using the unassigned property, 
      this determines if the 'unassigned' string is compared case sensitive or not. 
      When true, it compares case sensitive. 
      When false, it does not.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_BaseElement = {
   extend: "Connections.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      id: null,
      allowNone: false,
      trim: true,
      unassigned: null,
      unassignedCase: false
   },

   configrules: {
      id: jTAC.checkAsStrOrNull,
      unassigned: jTAC.checkAsStrOrNull
   },

   /*
   Retrieves the object associated with the id that manages the widget.
   Throws exceptions if not found, unless allowNone is true.
   noneAllowed (boolean) - When defined, it overrides the allowNone property.
   When null/undefined, use allowNone.
   */
   getElement: function (noneAllowed) {
      try
      {
         this._pushContext();

         if (this._internal.element != null) {
            return this._internal.element;
         }

         // instead of capturing the HTML element and using that instance each time
         // the value is retrieved with each call. This allows AJAX and other
         // scripts to delete and re-add the element.
         var id = this.getId();
         if (!id) {
            if (noneAllowed == null) {
               noneAllowed = this.getAllowNone();
            }
            if (!noneAllowed)
               this._error("Did not assign the id.");
            return null;
         }
         var el = document.getElementById(id);
         if (el) {
            this._checkElement(el);  // may throw an exception
         }
         else if (!el && !this.getAllowNone())
            this._error("HTML Element not found for " + id);
         return el;
      }
      finally {
         this._popContext();
      }

   },

   /*
   Lets you set the element object itself that is returned by getElement.
   Normally you will assign the id and let getElement do the work.
   Use this when you have an instance of the element AND do not expect
   it to be deleted for the life of this Connection.
   This is intended to be a public method.
   */
   setElement: function (value) {
      this._internal.element = value;
   },

   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement: function (element) {
      this.AM();  // throws exception
   },

   /*
   Attaches a function to an event handler on the element.
   name (string) - Name of the event handler. Strings are case sensitive.
   Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
   The subclass determines how to use them and may ignore those it doesn't support.
   func (function) - A function that will be called when the event is raised.
   Its parameters should either match those supported by the event, which is usually
   the event object itself, or there should be no parameters.
   funcid (string) - Optional. If you want to only hook up the function
   once to the element, pass a name here. That name will be attached to the element's data.
   Later calls with the same name will not attempt to add the event.
   A good usage is attaching a validation function. That function generally
   handles all validators. So only the first validation rule should attach
   the validation function. When not used, omit the parameter or pass null.
   Returns: When true, the event was attached. When false it was not supported.
   */
   addEventListener: function (name, func, funcid) {
      return false;
   },


   /*
   Attaches a function to an event handler to additional DOM elements
   associated with the main element that build a single widget.
   It does not impact the main element. Use addEventListener for that.
   name (string) - Name of the event handler. Strings are case sensitive.
   Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
   The subclass determines how to use them and may ignore those it doesn't support.
   func (function) - A function that will be called when the event is raised.
   Its parameters should either match those supported by the event, which is usually
   the event object itself, or there should be no parameters.
   funcid (string) - Optional. If you want to only hook up the function
   once to the element, pass a name here. That name will be attached to the element's data.
   Later calls with the same name will not attempt to add the event.
   A good usage is attaching a validation function. That function generally
   handles all validators. So only the first validation rule should attach
   the validation function. When not used, omit the parameter or pass null.
   Returns: When true, the event was attached. When false it was not supported.

   This class does nothing.
   */
   addSupportEventListeners: function (name, func, funcid) {
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   Subclasses should implement this as this class always returns false.
   Your implementation can support ids and objects that are not 
   associated with DOM elements. For example, you have a jquery-ui
   class that manages how a textbox works.
   id (string or object) - If its string, evaluate it as a unique id
   used to identify the element. If its an object, see if its
   the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement: function (id) {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   If so, it creates an instance of the connection class using 
   the id or object passed in to support the getElement() method.
   Uses the testElement method to handle the evaluation of id.

   id (string or object) - If its string, evaluate it as a unique id
   used to identify the element. If its an object, see if its
   the correct class, such as DOMElement.

   Returns an instance of the implementing class with the id assigned
   or the getElement() method ready to return the element.
   If the id is not supported, it returns null.
   */
   testElementAndCreate: function (id) {
      if (this.testElement(id)) {
         var conn = jTAC.createByClassName(this.$fullClassName);
         (typeof id == "string") ? conn.setId(id) : conn.setElement(id);

         return conn;
      }
      return null;
   },

   /*
   Returns the TypeManager assigned to the element. 
   If none is found, it attempts to create one.
   Any created is stored with the element so all consumers
   of the element get the same TypeManager.
   */
   getTypeManager: function () {
      var tm,
      el = this.getElement(true);
      if (el) {

         var tm = this.getData("typemanager");  // NOTE: All connections to this element will share the same TypeManager instance due to this.
         if (tm) {
            return tm;
         }
         tm = this._createTypeManager(el);
         if (tm) {
            if (tm instanceof jTAC.TypeManagers.Base)
            {
               this.setData("typemanager", tm);

               return tm;
            }
            // tm may still be an object with properties to assign in the next step
         }
      }
      return null;
   },
   /*
   The widget can define a TypeManager as an attribute.
   There are several formats:
   1) JSon exposed as an HTML attribute called "data-jtac-typemanager":
   <input type='text' data-jtac-typemanager="{'jtacClass': 'date', 'dateFormat' : 1 }" />
   2) A string specifying a class name defined in by jTAC.define() or jTAC.defineAlias()
   such as "Integer", "Float", "Date", "DateTime", "Currency",
   "Percent", "TimeOfDay", and "Duration".
   Use the "data-jtac-datatype" attribute.
   <input type='text' data-jtac-datatype="date.abbrev" />
   3) A hybrid of the above two, where data-jtac-datatype defines the object to create
   and data-jtac-typemanager contains an object with property name and value
   pairs that override those in the typemanager created.
   4) An actual TypeManager object created programmatically and
   assigned to the Element as the property 'data-typemanager'.
   The first two formats actually get converted and create this value.

   */
   _createTypeManager: function (el) {
      try
      {
         this._pushContext();
         var tm = this.getData("typemanager");  // NOTE: All connections to this element will share the same TypeManager instance due to this.
         if (tm)
            return tm;
         tm = this.getData("jtac-typemanager");
         if (tm) {
            if (typeof tm == "string") {
               try {
                  tm = eval("(" + tm + ");");
               }
               catch (e) {
                  jTAC.error("JSon parsing error. " + e.message, this, null, true);
               }
            }
            if (tm.jtacClass) {
               tm = jTAC.create(null, tm);
            }

            if (tm instanceof jTAC.TypeManagers.Base)
            {
               this.setData("typemanager", tm);

               return tm;
            }
            // tm may still be an object with properties to assign in the next step
         }

         var dt = this.getData("jtac-datatype");
         if (dt) {
            tm = jTAC.create(dt, tm);
         }


         if (tm instanceof jTAC.TypeManagers.Base) {
            this.setData("typemanager", tm);
            return tm;
         }
         else if (tm)
            this._error("data-jtac-typemanager or datatype could not convert into a TypeManager object.");

         return null;
      }
      finally {
         this._popContext();
      }

   },
   /*
   Attempts to get a value associated with the data collection of the element.
      key (string) - The value key in the data collection.
   Returns the value or null if not available.
   */
   getData: function (key) {
      var val,
      el = this.getElement(true);
      if (el) {
         var val = el["data-" + key];
         if (val === undefined) {
            val = el.getAttribute("data-" + key);
            if (val != null) {
               el["data-" + key] = val;
            }
         }
      }
      return val;
   },


   /*
   Assigns or replaces the value into the data collection of the element.
   key (string) - The value key in the data collection.
      value - The data to store with the key.
   */
   setData: function (key, value) {
      var el = this.getElement(true);
      if (el) {
         el["data-" + key] = value;
      }
   },


   /*
   Determines if the element is visible.
   Returns true if visible.
   This class looks at the display and visibility styles on the actual HTML element
   and up the DOM tree until it finds one invisible or nothing being invisible.
   Subclasses may have widgets with multiple HTML parts, some of which 
   may be visible and others hidden. Its up to those subclasses to determine
   what "visible" means.
   */
   isVisible: function () {
      return this._isDOMVisible(this.getElement(true));
   },

   /* STATIC METHOD
   Utility to check if a DOM element is visible by looking at its
   display and visibilty styles.
   el (DOM Element)
   */
   _isDOMVisible: function (el) {
      if (!el) {
         return true;
      }
      var v = 1;
      while (v && (el != null) && (el != document.body)) {
         v = !((el.style.visibility == "hidden") || (el.style.display == "none"));
         el = el.parentNode;
      }  // while 
      return v;
   },

   /*
   Determines if the element is enabled.
   Returns true if enabled.
   This class looks at the disabled attribute of the element. If no attribute
   exists, it returns true.

   Subclasses may have widgets with multiple HTML parts, some of which 
   may be enabled and others disabled. Its up to those subclasses to determine
   what "enabled" means.
   */
   isEnabled: function () {
      return this._isDOMEnabled(this.getElement(true));
   },

   /*
   Utility to check of a DOM element is disabled. It must have
   a disabled property to be checked. Otherwise, this returns true.
   el (DOM Element)
   */
   _isDOMEnabled: function (el) {
      if (!el || el.disabled == null)
         return true;
      return !el.disabled;
   },

   /*
   Determines if the element is editable by the user.
   Returns true when editable.
   This class returns true if both isVisible() and isEnabled() are true.
   */
   isEditable: function () {
      return this.isVisible() && this.isEnabled();
   },

   /* 
   Locates a string that can be displayed as the label for the element.
   There are several sources for a label:
   * The element can host this label in its data-msglabel attribute.
     If you are using localization, a lookupID can be in the data-msglabel-lookupid attribute.
     If present, this overrides the remaining options.
   * The element can specify the id of another HTML element whose innerHTML
     is the label with the data-msglabel-from attribute.
     The text retrieved will be cleaned up (no HTML tags, trimmed non-alphanumeric characters)
     via _cleanLabel().
   * A <label for=> HTML element where for= specifies the ID of this element.
     Its innerHTML is used, after cleaning up.
      NOTE: This function requires jquery to locate the label for= node. If
      jquery is not present, that feature is not used.
   Returns the label string or the value passed into the missing parameter if not found.
   NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
   conflicts with other systems.
   If element is null, it returns missing.
   */
   getLabel: function () {
      var r = this._locateLabel(this.getElement(true));
      if (r == null) {
         r = this.callParent();
      }
      return r;
   },

   /* Low level function used by getLabel().
   Locates a string that can be displayed as the label for the element.
   There are several sources for a label:
   * The element can host this label in its data-msglabel attribute.
     If you are using localization, a lookupID can be in the data-msglabel-lookupid attribute.
     Define the lookupid in your \jTAC\Translations\ script files with the localized names. 
     If present, this overrides the remaining options.
   * The element can specify the id of another HTML element whose innerHTML
     is the label with the data-msglabel-from attribute.
     The text retrieved will be cleaned up (no HTML tags, trimmed non-alphanumeric characters)
     via _cleanLabel().
   * A <label for=> HTML element where for= specifies the ID of this element.
     Its innerHTML is used, after cleaning up.
      NOTE: This function requires jquery to locate the label for= node. If
      jquery is not present, that feature is not used.
   NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
   conflicts with other systems.
      element (DOM Element) - Accepts null.
   Returns the label string or null if not located.
   The result will not contain HTML tags found in the source.
   */
   _locateLabel: function (element)
   {
      if (!element)
         return null;
      var update = false;  // when true, use cleanlabel and update data-msglabel.
      var t = element.getAttribute("data-msglabel");
      var lu = element.getAttribute("data-msglabel-lookupid");
      if (lu) {
         t = jTAC.translations.lookup(lu, t);
         update = true;
      }
      if (t == null) {
         var id = element.getAttribute("data-msglabel-from");
         if (id) {
            var lbl = document.getElementById(id);
            if (lbl) {
               t = lbl.innerHTML;
               update = true;
            }
         }
      }
      if ((t == null) && window.jQuery) { // this code only works with jQuery present
         var lbl = $("label[for='" + element.id + "'][generated!='true']");  // jquery-validate creates a label to host the error message. 
         // It assigns a custom attribute, 'generated=true' to that label. 
         // We need to avoid it.
         if (lbl) {
            t = lbl.html();
            update = true;
         }
      }
      if (t && update) {
         t = this._cleanLabel(t);
         // update data-label to avoid searching each time
         element.setAttribute("data-msglabel", t);
      }

      return t;   // may be null
   },

   /* Utility function
   Prepares a label string extracted from HTML on the page.
   It removes HTML tags and trims lead and trailing non-alphanumeric characters.
   For example:
   "My favorite:" -> "My favorite"
   */
   _cleanLabel: function (label) {
      // strip the HTML tags. Tags are always "<" + 1 or more characters + ">".
      var t = jTAC.replaceAll(label, "<(.|\n)+?>", "");

      // if it came from a label, strip lead and trail non-alpha numeric text.
      t = t.replace(/[^\dA-Za-z]+$/, ""); // trail non-alpha numeric
      t = t.replace(/^[^\dA-Za-z]+/, ""); // lead
      return t;
   },

   /*
   Returns the current style sheet class name associated with the element
   or "" if none.
   This class returns the value of the class property on the HTML element.
   */
   getClass: function () {
      var el = this.getElement();
      if (el && (el.className != null)) {
         return el.className;
      }
      return "";
   },

   /*
   Sets the current style sheet class name. If the widget has multiple
   classes for its various parts, this impacts the part most closely associated
   with the data entry, such as the input tag.
   */
   setClass: function (css) {
      var el = this.getElement();
      if (el && (el.className != null)) {
         el.className = css;
      }
   },

   /*
   Appends the class name provided to the existing one. 
   Effectively it creates the pattern "[old class] [new class]".
   css (string) - The class name to append.
   Returns true unless the class already appears. If so, no changes
   are made and it returns false.
   */
   addClass: function (css) {
      if (!css)
         return false;
      var oc = this.getClass();
      var re = jTAC.delimitedRE(css, "\\s");
      if (re.test(oc))
         return false;
      var nc = jTAC.trimStr(oc + " " + css);
      this.setClass(nc);
      return true;
   },

   /*
   Removes the style sheet class from the element's current class.
   */
   removeClass: function (css) {
      if (css) {
         var nc = this.getClass();
         // need to ensure the space or line ends surround css so we don't delete "blah" within "[old class] superblah"
         var re = jTAC.delimitedRE(css, "\\s");
         nc = jTAC.trimStr(nc.replace(re, " "));  // inserts a space in case both lead and trailing spaces are matched by the regexp. It will be stripped in the final step
         this.setClass(nc);
      }
   },

   /*
   Trims lead and trailing spaces from the string
   if the trim property is true.
   Then compares the result to the unassigned property, if setup.
   If it matches the unassigned property, it returns the empty string.
   */
   _cleanString: function (value)
   {
      var s = this.getTrim() ? jTAC.trimStr(value) : value;
      return this._matchUnassigned(s) ? "" : s;
   },

   /*
   Returns true if the text passed matches the 'unassigned' property's text
   and false if it does not.
   */
   _matchUnassigned: function (text)
   {
      var wm = this.getUnassigned();
      if (wm)
      {
         var cs = this.getUnassignedCase();
         if ((wm == text) ||
             (!cs && (wm.toLowerCase() == text.toLowerCase())))
         {
            return true;
         }
      }
      return false;
   }
   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Connections.BaseElement", jTAC._internal.temp._Connections_BaseElement);

﻿// jTAC/Connections/FormElement.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: Connection objects
Class : Connections.FormElement
Extends: Connections.BaseElement

Purpose:
Gets and sets the value attribute of an HTML form element,
like <input>, <select>, and <textarea>. 
getTextValue and setTextValue interact with the element's value attribute.
typeSupported() supports other types depending on the element,
such as checkbox supports "boolean".

User assigns the id value of an HTML element to the id property.

This class also can treat a group of radio buttons or checkboxes as a single widget.
Radio buttons only need their name attribute to match. Checkboxes need
you to identify which elements are in the group through its buttons property.
To use either of these groups, call getTypedValue("index") or pass an integer
index into setTypedValue().
Finally, a checkbox list also supports multiple selections by calling
getTypedValue("indices") or passing an array of integers to setTypedValue().

If working with individual checkbox or radio inputs, the getTextValue() and
setTextValue() methods respect the checked property of these inputs.
An empty string means unchecked. Any other string means checked.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:
  fixLength (boolean) - 
     When using a <TextArea> tag, the text length may differ between
     browsers for each ENTER character in the text.
     Many browsers report one character (%0A) while others report
     two (%0D%0A). In addition, all browsers post back two (%0D%0A).
     When true, this property ensures the textLength() function 
     counts 2 characters for each ENTER character in the text.
     When false, it uses the exact string size of the textarea's value.
     It defaults to true.
  buttons (array or function) - 
     When the element is part of a list of checkboxes or radio buttons
     from which you want to get or set by an index position,
     this can be used to identify the DOM input elements
     that form the list.
     This property supports several values:
     - function: Return an array of either string ids to elements
         or the actual DOM elements. The function takes one
         parameter, the original element assigned to the id property.
     - array of DOM elements
     - array of string ids to elements.
     When not supplied, radio buttons are handled automatically
     because they are grouped by their name attribute.
     However, if the order returned by document.getElementByName
     is incorrect, that's when you use the buttons property.
     Checkboxes always require this because there is no built 
     in grouping in HTML.
See also \jTAC\Connections\BaseElement.js

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement

----------------------------------------------------------- */
jTAC._internal.temp._Connections_FormElement = {
   extend: "Connections.BaseElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      fixLength : true,
      buttons: null
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   If the element is not on the page and allowNone is true,
   it returns null.
   Respects the trim property.
   If working with individual checkbox or radio inputs, 
   an empty string means unchecked. Any other string means checked.

   */
   getTextValue : function () {
      var el = this.getElement();   // may throw exception
      if (el)
         return this._cleanString(this._getValueAttribute(el));
      return null;
   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
     If working with individual checkbox or radio inputs, this only
     changes the checked property, not the value property.
     The empty string means uncheck. Otherwise check.

   */
   setTextValue : function (text) {
      var el = this.getElement();   // may throw exception
      if (el) {
      // checkbox and radio buttons need their checked state modified.
         if (this._isCheckable(el)) {
            el.checked = !!text; // if it has any text, its checked
         }
         else {
            el.value = text;
         }
      }
   },

   /*
   Supports alternative types based on the type of HTML element:
     "integer" - Supports a number value that is an integer. 
         HTML5 number and range inputs support this.
     "float" - Supports a number value that is a float.
         HTML5 number input supports this.
     "date" - Supports a Date object representing only a date (the time is undefined).
         HTML5 date, datetime, datetime-local, and month inputs support this.
     "datetime" - Supports a Date object representing both date and time.
         HTML5 datetime and datetime-local inputs support this.
     "time" - Supports a Date object representing only a time (the date is undefined).
         HTML5 time input supports this.
     "boolean" - Supports a boolean value.
         checkbox and radio inputs support this.
     "index" - Supports a number value representing an offset in a list.
         -1 = no selection. 0 = first element.
         HTML's select and radio elements support this.
         When the buttons property is used, a list of checkboxes also supports it.
     "indices" - Supports an array of integers representing multiple 
         offsets in a list.
         HTML's select element supports this.
   When a browser does not support an HTML5 field enough to supply
   a strong typed value (like valueAsDate on date input), this returns false.
   */
   typeSupported : function (typeName) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (el.tagName == "INPUT") {
            var hdate = el.valueAsDate !== undefined;  // has date
            var hnum = el.valueAsNumber !== undefined;  // has number
            switch (el.type) {
               case "radio":
                  return typeName == "boolean" || typeName == "index";
               case "checkbox":
                  if (typeName == "boolean") {
                     return true;
                  }
                  else if ((typeName == "index") || (typeName == "indices")) { // a list of checkboxes requires the buttons property to be setup.
                     return this.getButtons() != null;
                  }
                  else
                     return false;
               case "date":
               case "month":
                  return hdate && (typeName == "date");
               case "datetime":
               case "datetime-local":
                  return hdate && ((typeName == "date") || (typeName == "datetime") || (typeName == "time"));
               case "time":
                  return hdate && (typeName == "time");
               case "number":
                  return hnum && ((typeName == "integer") || (typeName == "float"));
               case "range":
                  return hnum && (typeName == "integer");
            }
         }
         else if (el.tagName == "SELECT") {
            return (typeName == "index") || (typeName == "indices");
         }
      }
      return false;
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
      typeName (string) - If null, always get the default type supported.
         Otherwise, it must be a value from the list supported
         by this control as shown in the typeSupported() method description.
   Returns: the typed value.
   Throws exception if the HTML element does not support the requested type.
   Call typeSupported() prior to this to ensure it will return a value
   instead of throwing an exception.
   */
   getTypedValue : function (typeName) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (el.tagName == "INPUT") {
            switch (el.type) {
               case "radio":
               case "checkbox":
                  if (!typeName || (typeName == "boolean")) {
                     return el.checked;
                  }
                  else if (typeName == "index") {
                     var btns = this._createButtonsList(el);
                     if (btns) {
                        for (var i = 0; i < btns.length; i++) {
                           if (btns[i].checked)
                              return i;
                        }
                        return -1;
                     }
                  }
                  else if ((typeName == "indices") && (el.type == "checkbox")) {
                     var btns = this._createButtonsList(el);
                     var a = new Array();
                     if (btns) {
                        for (var i = 0; i < btns.length; i++) {
                           if (btns[i].checked)
                              a.push(i);
                        }
                        return a;
                     }
                  }
                  break;
               case "date":
               case "datetime":
               case "datetime-local":
               case "month":
               case "time":
                  if (!typeName || (typeName == "date")) {
                     if (el.valueAsDate !== undefined) // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                        return el.valueAsDate;    // valueAsDate returns null if it cannot interpret the date
/*
                     try
                     {
                     // date is in the format yyyy-MM-dd. http://www.w3.org/TR/html-markup/input.date.html
                     // Javascript 1.8.5 supports that pattern in the Date constructor: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/parse
                        return new Date(el.value);
                     }
                     catch (x)
                     {
                        return null;   // illegal or blank value
                     }
*/
                  }
                  break;
               case "number":
               case "range":
                  if (!typeName || (typeName == "integer") || (typeName == "float")) {
                     if (el.valueAsNumber !== undefined) // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasnumber
                        return !isNaN(el.valueAsNumber) ? el.valueAsNumber : null;   // valueAsNumber returns NaN if it cannot interpret the number
/*
                     try
                     {
                        var val = parseFloat(el.value);   // always start with a float
                        if (isNaN(val))
                           return null;
                        if ((typeName == "integer") && (Math.floor(val) != val))  // expects an integer but the value was a float
                           return null;
                        return val;
                     }
                     catch (x)
                     {
                        return null;   // illegal or blank value
                     }
*/
                  }
                  break;
            }  // switch
         }  // if "INPUT"
         else if (el.tagName == "SELECT") {
            if (!typeName || (typeName == "index")) {
               return el.selectedIndex;
            }
            else if (typeName == "indices") {
               var l = new Array();
               for (var i = 0; i < el.options.length; i++) {
                  if (el.options[i].selected)
                     l.push(i);
               }  // for
               return l;
            }
         }
         this._error("The HTML element " + this.getId() + " does not support the type " + typeName, "getTypedValue");
      }
      return null;
   },

   /*
   Supports several input types, including HTML 5 types that return
   Date objects and numbers. See typeSupported() method for more.
   Unsupported cases throw an exception.
   */
   setTypedValue : function (value) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (el.tagName == "INPUT")
         {
            switch (el.type)
            {
               case "radio":
               case "checkbox":
                  if (typeof (value) == "boolean") {
                     el.checked = value;
                     return;
                  }
                  else if (typeof (value) == "number") {
                     var btns = this._createButtonsList(el);
                     if (btns)
                     {
                        for (var i = 0; i < btns.length; i++)
                        {
                           btns[i].checked = i == value;
                        }
                        return;
                     }
                  }
                  else if ((value instanceof Array) && (el.type == "checkbox")) {
                     var btns = this._createButtonsList(el);
                     if (btns)
                     {
                        for (var i = 0; i < btns.length; i++)
                        {
                           btns[i].checked = value.indexOf(i) > -1;
                        }
                        return;
                     }
                  }
                  break;
               case "date":
               case "datetime":
               case "datetime-local":
               case "month":
               case "time":
                  if (value == null) {
                     el.value = "";  // required by http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                     return;
                  }
                  else if (value instanceof Date) {
                     if (el.valueAsDate !== undefined) // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                     {
                        el.valueAsDate = value;
                        return;
                     }
                  }
                  break;
               case "number":
               case "range":
                  if (value == null) {
                     el.value = "";  // required by http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasdate
                     return;
                  }
                  else if (typeof (value) == "number") {
                     if (el.valueAsNumber !== undefined) { // See: http://dev.w3.org/html5/spec/common-input-element-apis.html#dom-input-valueasnumber
                        el.valueAsNumber = value;
                        return;
                     }
                  }
                  break;
            }
         }  // if "INPUT"
         else if (el.tagName == "SELECT") {
            if (typeof (value) == "number") {
               el.selectedIndex = value;
               return;
            }
            else if (value instanceof Array) {
               for (var i = 0; i < el.options.length; i++) {
                  el.options[i].selected = value.indexOf(i) != -1;
               }  // for
               return;
            }
         }
         this._error("The HTML element " + this.getId() + " does not support the type of the value", "setTypedValue");
      }
   },

   /*
   HTML form elements are null when their value attribute is "".
   Respects the trim property.
      override (boolean) - Normally radiobuttons and checkboxes
      will always return false here. When override is true,
      this returns true when they are unchecked.
   */
   isNullValue : function (override) {
      var el = this.getElement();   // may throw exception
      if (el) {
         if (!override && this._isCheckable(el)) {
            return false;
         }
         return this._cleanString(this._getValueAttribute(el)) == "";
      }
      return true;
   },

/*
   Determines the length of the text value.
   This function respects the trim property.
   While usually the length is the same as the string value represented by 
   the element, there are cases where the string value is not what is
   saved on postback. 
   This class adjusts for the HTML TextArea, which may include one
   or two characters for each ENTER in the text. 
   Many browsers report the length of the string with 1 character (%AO) for each ENTER.
   However, all browsers postback two characters (%0D%A0). 
   So this function can return a length adjusted with the value used in postback.
   Set the fixLength property to false to disable this. It defaults to true.
*/
   textLength: function() {
      var text = this.getTextValue();
      if (!text) {
         return 0;
      }
      var l = text.length;
      if (this.getFixLength()) {
         var el = this.getElement(true);
         if (el && (el.tagName == "TEXTAREA")) { 
         // FireFox 15, Safari 5, and IE 9 use only ASCII 10.
         // Opera 12 and older IE use ASCII 13 + ASCII 10.
         // Goal is to assume ASCII 10 alone is two characters.
            var m;
            var re = this._internal.findEnterRE;
            if (!re) {

            // Anything other than ASCII 13 followed by ASCII 10, or ASCII 13 at the very end
               this._internal.findEnterRE = re = /([^\r](?=\n))|(\r$)|(^\n)/g;
            }
            while ((m = re.exec(text)) != null)  {
               l++;
            }
         }
      }
      return l;
   },


   /*
   Checks the HTML element to confirm that it is supported.
   If not, it should throw an exception.
   */
   _checkElement : function(element) {
      if (element.value === undefined)
         this._error("HTML Element does not have a value attribute.");
   },

   /*
   Attaches a function to an event handler on the element.
      name (string) - Name of the event handler. Strings are case sensitive.
         Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
         The subclass determines how to use them and may ignore those it doesn't support.
      func (function) - A function that will be called when the event is raised.
         Its parameters should either match those supported by the event, which is usually
         the event object itself, or there should be no parameters.
      funcid (string) - Optional. If you want to only hook up the function
         once to the element, pass a name here. That name will be attached to the element's data.
         Later calls with the same name will not attempt to add the event.
         A good usage is attaching a validation function. That function generally
         handles all validators. So only the first validation rule should attach
         the validation function. When not used, omit the parameter or pass null.
   Returns: When true, the event was attached. When false it was not supported.
   */
   addEventListener : function (name, func, funcid) {
      return this._addEvt(this.getElement(), name, func, funcid);   // getElement may throw exception
   },

   /* UTILITY
   Attaches a function to an event handler on the element.
      el (DOM element) - The element to evaluate
      name (string) - Name of the event handler. Strings are case sensitive.
         Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
         The subclass determines how to use them and may ignore those it doesn't support.
      func (function) - A function that will be called when the event is raised.
         Its parameters should either match those supported by the event, which is usually
         the event object itself, or there should be no parameters.
      funcid (string) - Optional. If you want to only hook up the function
         once to the element, pass a name here. That name will be attached to the element's data.
         Later calls with the same name will not attempt to add the event.
         A good usage is attaching a validation function. That function generally
         handles all validators. So only the first validation rule should attach
         the validation function. When not used, omit the parameter or pass null.
   Returns: When true, the event was attached. When false it was not supported.
   */
   _addEvt : function (el, name, func, funcid) {
      if (el) {
         // is the function already attached?
         if (funcid) {
            var da = "data-formconnection-" + funcid;
            if (el.getAttribute(da) != null)
               return true;   // already attached
            el.setAttribute(da, true);
         }
         if ((name == "onchange") && this._isCheckable(el)) { // convert to onclick for inputs that don't have an onchange event
               name = "onclick";
         }

         if (el.addEventListener) {
            el.addEventListener(name.substr(2), func, false);
            return true;
         }
         else if (el.attachEvent) {
            el.attachEvent(name, func);
            return true;
         }
      }
      return false;
   },

   /*
   Attaches a function to an event handler to additional DOM elements
   associated with the main element that build a single widget.
   It does not impact the main element. Use addEventListener for that.
      name (string) - Name of the event handler. Strings are case sensitive.
         Typical names: "onchange", "onfocus", "onblur", "onclick", "onkeydown".
         The subclass determines how to use them and may ignore those it doesn't support.
      func (function) - A function that will be called when the event is raised.
         Its parameters should either match those supported by the event, which is usually
         the event object itself, or there should be no parameters.
      funcid (string) - Optional. If you want to only hook up the function
         once to the element, pass a name here. That name will be attached to the element's data.
         Later calls with the same name will not attempt to add the event.
         A good usage is attaching a validation function. That function generally
         handles all validators. So only the first validation rule should attach
         the validation function. When not used, omit the parameter or pass null.
   Returns: Nothing.

   This class looks at the buttons property to find additional items to update.
   */
   addSupportEventListeners : function (name, func, funcid) {
      var el = this.getElement(true);
      if (!el)
         return;
      // if there are buttons, apply to them
      var btns = this._createButtonsList(el);
      if (btns) {
         for (var i = 0; i < btns.length; i++) {
            if (el != btns[i])
               this._addEvt(btns[i], name, func, funcid);
         }  // for
      }
   },


   /*
   Returns an array of all elements identified by the buttons property
   or null if none are supplied.
   If the buttons property is null and its a radiobutton, it uses
   document.getElementByName.
   */
   _createButtonsList : function (element) {
      var b = this.getButtons();
      if (b) {
         if (typeof (b) == "function") {
            b = b(element);   // can return an array of strings or elements. Need to convert the strings into elements.
         }
         if (b instanceof Array) {
            var nb = [];   // since we are about to modify the list, do not allow it to impact the original

            for (var i = 0; i < b.length; i++) {
               if (typeof (b[i]) == "string") {
                  var el = document.getElementById(b[i]);
                  if (el) {
                     nb.push(el);
                  }
                  else {
                     if (window.console)
                        console.log("'" + b[i] + "' element not found on page. Check spelling and case. Specified in a Connections.FormElement using element id '" + element.id + "'." );
                  }
               }
               else if (typeof (b[i]) == "object") {
                  nb.push(b[i]);
               }
               // skips (eliminates) nulls and other unwanted data
            }  // for
            return nb.length ? nb : null;
         }
      }
      else if (element.type == "radio") {
         b = document.getElementsByName(element.name);
         return b.length ? b : null;
      }
      return null;
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   Subclasses should implement this as this class always returns false.
   Your implementation can support ids and objects that are not 
   associated with DOM elements. For example, you have a jquery-ui
   class that manages how a textbox works.
      id (string or object) - If its string, evaluate it as a unique id
         used to identify the element. If its an object, see if its
         the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement : function (id) {
      if (typeof (id) == "string") {
         var el = document.getElementById(id);
         return el && (el.form != null);
      }
      else {
         return ((typeof (id) == "object") && (id.tagName !== undefined) && (id.form != null));
      }
   },

   /*
   Utility to get the text value of an element. Normally it returns
   element.value. But when its a checkbox or radio, it only returns
   the value if its checked. Returns "" if unchecked.
      element (DOM element)
   */
   _getValueAttribute : function (element) {
      if (this._isCheckable(element)) {
         if (!element.checked) {
            return "";
         }
         return element.value ? element.value : "on"; // must have a textual value for a checked checkbox. "on" is used by browsers by default.
      }
      return element.value;
   },

   /*
   Utility.
   Returns true if the element in an INPUT type=checkbox or radio
      element (DOM element)
   */
   _isCheckable : function (element) {
      return (element.tagName == "INPUT") && /^(checkbox)|(radio)$/.test(element.type);
   },


   /*
   Determines if the element is visible.
   Returns true if visible.
   When the buttons property is used, its list of elements are all evaluated.
   If at least one button is visible, this returns true.
   */
   isVisible : function () {
      var el = this.getElement(true);
      if (!el) {
         return true;
      }
      var b = this._createButtonsList(el);
      if (b) {
         for (var i = 0; i < b.length; i++) {
            if (this._isDOMVisible(b[i])) {
               return true;
            }
         }  // for
         return false;
      }
      else {
         return this._isDOMVisible(el);
      }
   },

   /*
   Determines if the element is enabled.
   Returns true if enabled.
   When the buttons property is used, its list of elements are all evaluated.
   If at least one button is enabled, this returns true.
   */
   isEnabled : function () {
      var el = this.getElement(true);
      if (!el) {
         return true;
      }
      var b = this._createButtonsList(el);
      if (b) {
         for (var i = 0; i < b.length; i++) {
            if (this._isDOMEnabled(b[i])) {
               return true;
            }
         }  // for
         return false;
      }
      else {
         return this._isDOMEnabled(el);
      }
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   It also looks for the data-jtac-typemanager and data-jtac-datatype attributes
   for a TypeManager.
   If it does not have a TypeManager to return, it returns null.
   HTML INPUT tags have several data type specific cases based on
   the 'type' attribute. Here are the types supported:
      radio, checkbox - TypeManagers.Boolean
      date - TypeManagers.Date
      datetime, datetime-local - TypeManagers.DateTime
      month - TypeManagers.MonthYear
      time - TypeManagers.TimeOfDay
      number - TypeManagers.Float
      range - TypeManagers.Integer
   */
   _createTypeManager : function (el) {
      var tm = this.callParent([el]);
      if (tm)
         return tm;
      switch (el.type) {
         case "checkbox":
         case "radio":
            return jTAC.createByClassName("TypeManagers.Boolean", null, true);
            break;
         case "date":
            return jTAC.createByClassName("TypeManagers.Date", null, true);
            break;
         case "datetime":
         case "datetime-local":
            return jTAC.createByClassName("TypeManagers.DateTime", null, true);
            break;
         case "month":
            return jTAC.createByClassName("TypeManagers.MonthYear", null, true);
         case "time":
            return jTAC.createByClassName("TypeManagers.TimeOfDay", null, true);
            break;
         case "number":
            return jTAC.createByClassName("TypeManagers.Float", null, true);
            break;
         case "range":
            return jTAC.createByClassName("TypeManagers.Integer", null, true);
            break;
      }
      return null;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
     buttons property: SET function
   */
   setButtons : function (val) {
      if (typeof(val) == "string") { // try to convert to a global function
         val = window[val];   // may return null which will invoke _error() below.
      }
      if ((typeof (val) == "function") || (val instanceof Array)) {
         this.config.buttons = val;
      }
      else
         this._error("Illegal value. See function's documentation.");
   }

}
jTAC.define("Connections.FormElement", jTAC._internal.temp._Connections_FormElement);

jTAC.defineAlias("FormElement", "Connections.FormElement");

/* --- jTAC.connectionResolver ----------------------------------------
The jTAC.connectionResolver object provides a way to
create the appropriate instance of a BaseElement subclass
associated with a unique id of an element on the page.
Normally the id is a DOM element and this factory will return a Connections.FormElement.
However, if you register other connection classes, their
testElementAndCreate() method will be used to determine if 
the id is supported.
You can also register a function which evaluates the id and returns
and instance of the appropriate connection.

Defining your own function
----------------------------
Your function is passed one parameter, id, and returns either
an instance of the BaseElement object, already
assigned to the id, or null indicating that the id is not supported.
The id parameter may be passed either a string or object.
The string is an actual identifier to an object on the page.
The object is an instance of the class used to manage your widget.
For example, Connections.FormElement requires the object to be a DOMElement.

Auto registering your custom BaseElement class
--------------------------------------------------------------
Creators of Connections.BaseElement subclasses need to
determine if their is a definitive way to determine an id is for their
connection, such as a way to locate a jquery-ui object specific to their widget.
When they can do this, they should automatically call register with their
class in their page load code. That allows the page developer to avoid
setting up this factory to handle their class.

jTAC.define("Connections.MyClass", {members});
jTAC.connectionResolver.register(new myConnection());


jTAC.connectionResolver functions
-----------------------------------------
register()
   Pass in either a function or an instance of the 
   Connections.BaseElement subclass that will have its testElementAndCreate()
   function called to see if an id can become your connection class.
   This function actually supports a list of parameters, each
   can be either a function or Connections.BaseElement subclass.
   There is no need to register Connections.FormElement.

create()
   Pass an id. It returns an instance of a Connections.BaseElement
   subclass or null if none found.
   It goes through the items added by register(), first the functions,
   then the classes, in the order they were added.
   If none in that list match, it finally tries Connections.FormElement
   before returning null.
   You can optionally pass a second parameter, a Connections.BaseElement
   that will be used instead of returning null.
   When this returns an object, it will have the id assigned or
   will be able to return an object from its getElement() function.
------------------------------------------------------------------------ */

jTAC.connectionResolver =
{
   /* Global hosting entries made with register(). */
   _regCls: new Array(),
   _regFns: new Array(),

   /* Used by create() when no other registered connection supports the id */
   _formElement: jTAC.create("Connections.FormElement"),

   /* 
   Pass in either a function, the name of a Connections.BaseElement class,
    or an instance of the Connections.BaseElement subclass that will have its testElementAndCreate()
   function called to see if an id can become your connection class.
   This function actually supports a list of parameters, each
   can be either a function or Connections.BaseElement subclass.
   There is no need to register Connections.FormElement.

   Parameters:
      classOrFn (string, object or function) - The first of a list of 
      Connections.BaseElement class names, Connections.BaseElement subclasses 
      or functions to add to the registered list.
   */
   register: function (classOrFn) {
      try
      {
         jTAC._internal.pushContext("connectionResolver.register");

         for (var i = 0; i < arguments.length; i++) {
            var val = arguments[i];
            if (typeof (val) == "function") {
               this._regFns.push(val);
               continue;
            }
            if (typeof val == "string") {
               val = jTAC.create(val, null, true);
            }
            if (val && val.testElementAndCreate) {
               this._regCls.push(val);
            }
            else
               jTAC.error("Could not register an item.");

         }
      }
      finally {
         jTAC._internal.popContext();
      }
   },

   /* 
   Creates an instance of a Connections.BaseElement subclass 
   based on the id passed. It will be a new instance, unless
   the alt parameter is used.
   The instance it returns will have its id or getElement() function
   established to return a valid value.
   It goes through the items added by register(), first the functions,
   then the classes,  in the order they were added.
   If none in that list match, it finally tries Connections.FormElement
   before returning null.
   You can optionally pass a second parameter, a Connections.BaseElement
   that will be used before testing Connections.FormElement.
   When this returns an object, it will have the id assigned or
   will be able to return an object from its getElement() function.

   If the element for the id is a DOM element and contains the
   data-jtac-connection attribute, the name from that attribute
   specifies the Connection class to create.
   This option is only needed if the DOM element is not fully setup
   with widget extensions that map to a specific Connection class
   when the first request from create is made.
   For example, when using unobtrusive validation, it will
   run its setup phase prior to any $(document).ready() call
   in the page where the user has code that adds something like
   the jquery-ui datepicker. Changing the order of scripts
   on the page also fixes this.

   Parameters:
      id (string or Connection object) - Identifies the element that needs
         a connection. 
         The string is an actual identifier to an object on the page.
         The object is an instance of the class used to manage your widget.
         For example, Connections.FormElement requires the object to be a DOMElement.

      altconn (Connection object) - Optional. 
         When no other connection has matched the id,
         this instance of a connection is tested and if supported,
         returned, after having its id updated.
         When another connection has matched the id,
         the properties shared by both connections will have
         their values transferred to the new instance.
   Returns: Instance of the class or null.
   */
   create: function (id, altconn) {

      try
      {
         jTAC._internal.pushContext("resolveConnection");

         var conn = null;
         // see if it is an HTML element with data-jtac-connection. That can specify the class to create
         var el = typeof id == "string" ? document.getElementById(id) : id;   // both cases may return null or undefined
         if (el && el.getAttribute) {
            var name = el.getAttribute("data-jtac-connection");
            if (name) {
               conn = jTAC.create(name, null, true);
               if (conn) {
                  if (!(conn instanceof jTAC.Connections.Base))
                  {
                     jTAC.error("Unknown name in data-jtac-connection attribute of [" + el.id + "].", null, null, true);
                     conn = null;
                  }
               }
            }
         }

         if (!conn) {
            for (var i = 0; i < this._regFns.length; i++) {
               conn = _regFns[i](id);
               if (conn)
                  break;
            }  // for
         }

         if (!conn) {
            for (var i = 0; i < this._regCls.length; i++) {
               conn = this._regCls[i].testElementAndCreate(id);
               if (conn)
                  break;
            }  // for
         }

         if (altconn) {
            if (conn) {   // copy properties from altconn
               conn.allowNone = altconn.allowNone;
            }
            else { // use altconn as the connection
               if (altconn.testElement(id)) // only if id can be proven compatible
                  conn = altconn;
            }
         }
         // last attempt. Use Connections.FormElement
         if (!conn && this._formElement.testElement(id)) {
            conn = jTAC.create("Connections.FormElement");
         }

         if (conn) {
            (typeof (id) == "string") ? conn.setId(id) : conn.setElement(id);
         }

         return conn;
      }
      finally {
         jTAC._internal.popContext();
      }

   }

}  // object assigned to jTAC.ConnectionResolver

﻿// jTAC/TypeManagers/Base.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: TypeManager objects
Class: TypeManagers.Base   ABSTRACT CLASS
Extends: nothing

Purpose:
A TypeManager object understands data types, like integers, dates, currencies, 
and email addresses. Unique TypeManager classes are defined for each data type.

TypeManagers do a lot of things specific to each data type:
•	Convert between string and native type with the toValue() and toString() methods. 
   If you have a Connection object, its toValueFromConnection() simplifies 
   retrieving the value from the connection before conversion.
•	Check for validity of a string with the isValid() method.
•	Test a character to see if its supported by the type 
   (something used by the datatypeeditor widget) with the isValidChar() method.
•	Handles both culture specific and culture neutral formats. 
   Its toValueNeutral() and toStringNeutral() are used to get and 
   set the value of the hidden field used by the datatypeditor widget.
   Culture specific rules are implemented in the TypeManagers.BaseCulture subclass.
•	Compares two values with its compare() function, converting each value from a string if needed.

Many Conditions classes use TypeManagers. If their evaluation function requires one, 
its _evaluateRule() method gets the TypeManager in use from the Condition’s typeManager property.

TypeManagers.Base is the root base class for developing all TypeManagers.

Essential methods:
  toString(value) - 
      Conversion from native value to a string. Formatting rules are customized
      by properties introduced on the subclasses, such as ShowCurrencySymbol to add
      the currency character.

  toValue(string) - 
      Conversion from string to native value. Throws exceptions if conversion is not supported.
      Validation rules are also applied, based on properties introduced on the subclasses.

  toValueFromConnection(connection) - 
      Conversion from the value in a Connection.Base subclass,
      which may provide the actual type (no conversion needed) or a string (conversion needed).
      ONLY use when Connection scripts have been loaded.

  toValueNeutral(string) -
     Conversion from string to native value. The string should be culture neutral,
     not following the conventions of the current culture.
     For example, numbers should be using period for decimal separator
     and dates should be in yyyy-MM-dd format.

  toStringNeutral (value) -
      Conversion from native value to culture neutral string.

  isValid(text) - 
      Validate a string as correctly formatted to become the native type.
      Returns true if valid.

  compare(val1, val2) - 
      Compare two values, whether in a native type or string. 
      This comparison allows validation to have a generic way to compare values.
      Returns -1, 0, or 1 depending on if val1 is
      less than, equal, or greater than val2.

  isValidChar(chr) - 
      Assist the user interface by determining if a character is legal for it. 
      Textboxes will use this in their keypress event. 
      Returns true if the character is legal.

  toNumber(value) - 
      Converts the value into a number (float or int).
      Used to allow calculations even when the value is not a number.
      Especially useful for dates and times. 
      When the value is a number, its value is returned.
      When the value is a date, its value is the number of days since midnight Jan 01, 1970.
      When the value is a time, its value is the total seconds.
      When the value is a date time, its value is the number of seconds
      since midnight Jan 01, 1970.
      Other classes may define a differ result.
      If the TypeManager cannot convert to a number, return null.

  dataTypeName () - 
      Gets a string that identifies the real-world data type represented, 
      such as "date", "monthyear", or "currency".

  storageTypeName () - 
      Gets a string that identifies the storage data type (on the server side), 
      such as "integer", "float", and "boolean".

  nativeTypeName() - 
      A string that represents the name returned by the JavaScript typeof keyword
      that is supported by this class.

Properties common to all classes:
  friendlyName (string) -
      Provides a string that can be shown to the user representing this name.
      It can be localized through the jTAC.translations system.
      Classes provide the property lookupID to identify how to access
      the jTAC.translations system. The user can assign that property
      to override the default.
  friendlyLookupKey (string) -
      A lookup Key into the jTAC.translations system that will return
      a localized string for use by the friendlyName property.
      It defaults to the name set by dataTypeName()

See individual classes for their properties.

Comments:
A UI element, like a textbox, can own a single instance of 
a TypeManager to share amongst all classes that interact with that
object.
The Connection.BaseElement.getTypeManager() method provides
this service, looking for the data-jtac-datatype and
data-jtac-typemanager attributes on the element.
When found, it stores the TypeManager instance created
on the element.
To avoid this behavior, you must programmatically assign
a TypeManager instance that you created to the typeManager
property of the object using it.

Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require or utilize jquery itself. These classes can be
used outside of jquery, except where jquery globalize demands it
(jquery globalize is designed to work independently of jquery.)

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._TypeManagers_base = {
   "abstract": true,

   constructor: function ( propertyVals ) {
   },

   config: {
      friendlyName: null,  // null or string
      friendlyLookupKey: null  // null or string
   },
   configrule: {
      friendlyName: jTAC.checkAsStrOrNull,
      friendlyLookupKey: jTAC.checkAsStrOrNull
   },

   /*
   ABSTRACT METHOD
   A string that represents the name returned by the JavaScript typeof keyword
   that is supported by this class.
   */
   nativeTypeName : function () {
      this._AM();  // throws exception
   },

   /*
   ABSTRACT METHOD
   A string that represents the real-world data type, such as "float",
   "date", and "currency". This value is not used to evaluate the type passed
   into toValue(). It is used the consumer of this class to ensure the identity of the class.
   The name should be a syntax compatible with property names so it can be used
   in HTML tag's data properties like this: data-validate-range-datatype="date".
   Names should not be capitalized as a guideline to following property naming standards.
   */
   dataTypeName : function () {
      this._AM();  // throws exception
   },

   /*
   ABSTRACT METHOD
   A string that represents the data type stored on the server side, such as "float",
   "date", and "integer". It differs from the dataTypeName property which
   further describes a "float" as "currency", "percent", etc.
   The strings here are also used by Connection classes in their
   typeSupported() method. 
   Here are the the valid strings:
     "integer" - Supports a number value that is an integer. 
     "float" - Supports a number value that is a float.
     "date" - Supports a Date object representing only a date (the time is undefined).
     "datetime" - Supports a Date object representing both date and time.
     "time" - Supports a Date object representing only a time (the date is undefined).
     "boolean" - Supports a boolean value.
     "string" - Supports a string.

   Names should not be capitalized as a guideline to following property naming standards.
   */
   storageTypeName : function () {
      this._AM();  // throws exception  
   },

   /* 
   Convert from a native value to a string.
     value - the native value to convert. Its type must be supported by 
             the subclass implementing this method or it should throw an exception. 
             You can also pass a string. It will be first converted
             to the native type through toValue(). Then converted back to a string
             using the format parameter (or defaultFormat property).
   Returns: string. If the value represents nothing or is null, this will return
   the empty string.
   Exceptions: Throws exceptions when conversion cannot happen
   such as when the format is not appropriate for the data type being converted.
   SUBCLASSING: Override _nativeToString method to do the actual
   conversion.
   */
   toString : function (value) {
      if (value === undefined)   // since toString() is called for non-conversion tools
         return this.$className;

      try
      {
         this._pushContext();
         // if a string is passed, it is converted to native type
         // This lets it get converted to the native type in prep for converting back to a string in the specified format.
         if (typeof value == "string")
            value = this.toValue(value);

         value = this._reviewValue(value);   // may throw exceptions

         return this._nativeToString(value);
      }
      finally {
         this._popContext();
      }
   },

   /* ABSTRACT METHOD. MUST OVERRIDE
    Used by the toString() method to handle actual conversion between
    a native value and string. It can apply formatting rules
    from properties introduced by the subclass. 
    It can also throw exceptions if the value passed is not legal.
      value - The value to convert to a string. Must be the native type expected by the class.
   */
   _nativeToString : function (value) {
      this._AM();  // throws exception
   },

   /*
   Convert from a string to the native type.
     text - the string to convert. It must be compatible with
        the formatting rules or an exception will be thrown. 
   Returns: native value. If the value represents nothing or is null, 
   this will return null.
   Exceptions: Throws exceptions when conversion from strings fails.
   SUBCLASSING: Override _stringToNative method to do the actual
   conversion.
   */
   toValue : function (text) {
      try
      {
         this._pushContext("TypeManagers.Base [" + text + "]");
         if (typeof (text) == this.nativeTypeName())
            return this._reviewValue(text);   // it is already the native type; may throw exception
         if (typeof (text) != "string")
            this._error("Must pass a string in the text parameter.");
         if (this._isNull(text))
            return null;
         var v = this._stringToNative(text);
         return this._reviewValue(v);  // may throw exception
      }
      finally {
         this._popContext();
      }
   },


   /*
   Convert from the value in a Connection.Base subclass. Connections
   support both string and strong typed values. When the supported 
   strong type matches the storageTypeName property of this TypeManager class,
   it is returned. Otherwise, its text value is extracted and passed
   to the toValue() method.
      connection (Connection.Base subclass) - The Connection that supplies the value.
   Returns the native value or null if the value represents null.
   Exceptions: Throws exceptions when conversion from strings fails or the 
      type of value the connection supplies does not match what the TypeManager expects.
   SUBCLASSING: Rare
   ONLY use when Connection scripts have been loaded.
   */
   toValueFromConnection : function (connection) {
      try
      {
         this._pushContext();

         if (!(connection instanceof jTAC.Connections.Base))
            this._error("Must pass a Connection class.");
         if (connection.typeSupported(this.storageTypeName()))
            return this._reviewValue(connection.getTypedValue(this.storageTypeName()));
         return this.toValue(connection.getTextValue());
      }
      finally {
         this._popContext();
      }
   },


   /* ABSTRACT METHOD. MUST OVERRIDE.
   Used by toValue() method to do the actual conversion 
   from a string to the native type.
     text - the string to convert. It must be compatible with
        the formatting rules or an exception will be thrown. 
        If the string has lead or trailing spaces,
        they are ignored by the parser.
   Returns: native value. If the value represents nothing or is null, 
   this will return null.
   Exceptions: Throws exceptions when conversion from strings fails.
   */
   _stringToNative : function (text) {
      this._AM();  // throws exception
   },

   /*
   Returns true if the value represents null.
   This method allows the empty string and null.
   */
   _isNull : function (val) {
      return val == "" || val == null;
   },

   /*
   Evaluates the value. Looks for illegal cases. Throws exceptions when found.
   It may change the value too, if needed, such as to round it.
      value - The value to check. Must be the native type.
   Returns the value, which may have been modified.
   */
   _reviewValue : function (value) {
      if (typeof (value) != this.nativeTypeName())
         this._error("Type not supported");
      return value;
   },

   /* ABSTRACT METHOD. MUST OVERRIDE.
      Conversion from string to native value. The string should be culture neutral,
      not following the conventions of the current culture.
      For example, numbers should be using period for decimal separator
      and dates should be in yyyy-MM-dd format.
         text (string) - The string to parse and convert.
      Returns: The native value or null if the text is the empty string.
      Exceptions: Thrown if the string cannot be converted.
   */
   toValueNeutral : function (text) {
      this._AM();  // throws exception
   },

   /* ABSTRACT METHOD. MUST OVERRIDE.
      Conversion from native value to culture neutral string.
         val - The native value to convert.
      Returns: The native value or null if the text is the empty string.
   */
   toStringNeutral : function (val) {
      this._AM();  // throws exception
   },


   /*
   Checks if the text passed is a valid pattern for the native type.
     text - the string to check. If the string has lead or trailing spaces,
            they are ignored by the parser.
     cannoteval (bool) - When the text is the empty string or null, 
             this is the value returned.
             If the parameter is undefined, it returns false.
   Returns: true when text is a valid pattern and false when it is not.
   If the text parameter is the empty string or null, the result depends
   on the cannoteval parameter.
   SUBCLASSING: Rare
   */
   isValid : function (text, cannoteval) {
      if (cannoteval == undefined)
         cannoteval = false;
      if (text == null)
         return cannoteval;
      if ((typeof (text) == "string") && (jTAC.trimStr(text) == ""))
         return cannoteval;
      try
      {
         return this.toValue(text) != null;
      }
      catch (e)
      {
         return false;
      }
   },



   /* 
   Compare two values that represent the same data type.
   Either or both values can be strings or the native value.
      val1 - the value to compare on the left side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
      val2 - the value to compare on the right side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when conversion from strings fails
   or either of the values is null.
   */
   compare : function (val1, val2) {
      if (typeof (val1) == "string")
         val1 = this.toValue(val1);
      if (typeof (val2) == "string")
         val2 = this.toValue(val2);
      if ((val1 == null) || (val2 == null))
         this._error("Parameter value was null.");
      if (val1 < val2)
         return -1;
      else if (val1 > val2)
         return 1;
      return 0;
   },

   /*
   Evaluates a single character to determine if it is valid in a string
   representing the type. It does not care about the position or quantity
   of this character in the string that is being created.
   For example, if this is a date entry that supports only the short date format,
   it considers digits and the decimal separator to be valid.
      chr - A single character string to evaluate.
   Returns: true when the character is valid and false when invalid.
   */
   isValidChar : function (chr) {
      if ((chr == null) || (typeof (chr) != "string") || (chr.length != 1))
         this._error("Parameter must be a single character.");

      return true;
   },

   /*
   Converts the value into a number (float or int).
   Used to allow calculations even when the value is not a number.
   Especially useful for dates and times. 
   When the value is a number, its value is returned.
   When the value is a date, its value is the number of days since midnight Jan 01, 1970.
   When the value is a time, its value is the total seconds.
   When the value is a date time, its value is the number of seconds
   since midnight Jan 01, 1970.
   Other classes may define a differ result.
   If the TypeManager cannot convert to a number, return null.
   */
   toNumber : function (value) {
      return null;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   friendlyName property: GET function
   */
   getFriendlyName : function () {
      var r = this.config.friendlyName;
      var lu = this.getFriendlyLookupKey();
      if (lu) {
         r = jTAC.translations.lookup(lu, r);   // r may be null
      }
      if (r == null) {
         r = this.dataTypeName();
      }
      return r;
   },

   /*
   friendlyLookupKey property: GET function
   */
   getFriendlyLookupKey : function () {
      if (this.config.friendlyLookupKey == null)
         return this.dataTypeName();
      return this.config.friendlyLookupKey;
   },

   /* --- TYPEMANAGER UTILITY FUNCTIONS --------------------------
   Type related static methods that can be used throughout jTAC.
   Any of these can be called by using 
   jTAC.TypeManagers.Base.prototype.functionname(params)
   ------------------------------------------------------------ */
   /* STATIC METHOD. 
    Rounds a decimal value in numerous ways.
      value (float) - the value to round.
      rm (int) - one of these rounding modes:
         0 = Point5: round to the next number if .5 or higher; round down otherwise
         1 = Currency: Banker's rounding. Like Point5 except when the last digit is 5, round up when the prior digit is odd and round down when even.
         2 = Truncate: drop any decimals after mdp; largest integer less than or equal to a number.
         3 = Ceiling: round to the nearest even number.
         4 = NextWhole: Like ceiling, but negative numbers are rounded lower instead of higher
         Anything else throws an exception if the number of decimal digits exceeds mdp.
      mdp (int) - the number of decimal places to preserve. For example, when 2, it rounds based on
         the digits after the 2nd decimal place. If -1, no rounding. Return value
    Returns the rounded decimal value.
    Acknowledgement: this code is taken from Peter's Data Entry Suite v5 (http://www.peterblum.com/des/home.aspx)
    a product by Peter Blum (the author of jTAC.).
    Peter certifies that it is covered by the jTAC license.
    To use as a static method:
    jTAC.TypeManagers.Base.prototype.round(params);
   */
   round : function (value, rm, mdp) {
      if (mdp == -1)
         return value;
      // if the number of decimal points is lessthan or equal to mdp, do nothing
      // this limits the likelihood of introducing calculation errors in creating sv below
      if (jTAC.TypeManagers.Base.prototype.numDecPlaces(value) <= mdp)   // not enough decimal digits to round
         return value;

      var sf = Math.pow(10.0, mdp);   // ScaleFactor
      var sv = value * sf;   // ScaledValue. Put all significant digits in the integer side
      switch (rm)
      {
         case 0:   // round to the next number if .5 or higher; round down otherwise
            // NOTE: CPU rounding errors on Math.round() cause problems. 
            // Ex: 1.5 x 54.05 = 81.749999999 instead of 81.75. So Math.round() would round down when we expect it to round up
            sv = Math.abs(sv);
            sv = sv.toFixed(1);
            sv = parseFloat(sv).toFixed(0);
            sv = parseFloat(sv);

            if (value < 0)
               sv = -sv;

            return sv / sf; // return the digits to their decimal places

         case 1:  // Banker's rounding. Like Point5 except when the last digit is 5, round up when the prior digit is odd and round down when even.
            var nv = Math.floor(sv); // Math.round(sv);
            var f = sv - nv;
            var nv = (f == 0.5) ? ((nv % 2 == 0) ? nv : nv + 1) : Math.round(sv);

            return nv / sf; // return the digits to their decimal places

         case 2:  // Truncate - largest integer less than or equal to a number.
            sv = Math.floor(Math.abs(sv));
            if (value < 0)
               sv = -sv;
            return sv / sf; // return the digits to their decimal places

         case 3:  // Ceiling - smallest integer greater than or equal to a number.
            sv = Math.ceil(sv);
            return sv / sf; // return the digits to their decimal places

         case 4:  // NextWhole
            sv = Math.ceil(Math.abs(sv));
            if (value < 0)
               sv = -sv;
            return sv / sf; // return the digits to their decimal places
         default: // excess decimal digits. throw exception.
            this._inputError("Too many decimal places.");

      }  // switch
      return 0;   // should never get here
   },

   /* STATIC METHOD. CAN BE CALLED WITHOUT AN INSTANCE OF A TYPEMANAGER
    Utility to identify the number of decimal places are used in the value.
    To use as a static method:
    jTAC.TypeManagers.Base.prototype.numDecimalPlaces(params);
   */
   numDecPlaces : function (value) {
      var text = jTAC.TypeManagers.Base.prototype.floatToString(value);
      var dPos = text.indexOf(".");
      if (dPos < 0) // whole number
         return 0;
      return text.length - (dPos + 1);
   },

   /* STATIC METHOD
   Converts a decimal value to a string with fixed notation.
   Works around javascript decimal's toString function when it 
   returns exponential notation after 6 decimal digits.

      value (number) - the value to convert.

   To use as a static method:
   jTAC.TypeManagers.Base.prototype.floatToString(value);
   */
   floatToString : function (value) {
      var s = value.toString(); // when > 6 decimal digits, it returns exponential notation
      if ((s.indexOf('e-') > -1) && value.toFixed) {
         var m = s.match(/^.e\-(\d*)$/);
         var sz = parseInt(m[1]);
         s = value.toFixed(sz);
      }
      return s;
   },

   /* STATIC METHOD
   Creates a Javascript date object for Year, Month, Day, at 0 minutes in the day,
   using the UTC rules.
      y - Integer. Year
      m - Integer. Month, where 0 is jan and 11 is dec
      d - Integer. Day where 1 is the first of a month
      h - integer. Hours. Can be null.
      mn - integer. Minutes. Can be null.
      s - integer. Seconds. Can be null.
   Alternatively, pass one parameter, a date object in local format. It
   converts both date and time elements to local time.
   Returns a Date object with the UTC date or null if no valid date could be created
   To use as a static method:
   TAC.TypeManagers.Base.prototype.asUTCDate(y,m,d)
   */
   asUTCDate: function (y, m, d, h, mn, s) {
      if ((typeof y == "object") && (y instanceof Date)) {
         var date = y;
         y = date.getFullYear();
         m = date.getMonth();
         d = date.getDate();
         h = date.getHours();
         mn = date.getMinutes();
         s = date.getSeconds();

      }
      // allow null date parameters to return null
      if ((y == null) || (m == null) || (d == null)) { //NOTE: m=0 is a valid value. That's why I'm not using !m
         return null;
      }

      if (h == null)
         h = 0;
      if (mn == null)
         mn = 0;
      if (s == null)
         s = 0;

      var r = new Date(0);
      // Safari 1-1.2.3 has a severe bug that setUTCFullYear(y, m, d) avoids.
      // In most time zones (GMT + 0000 through GMT + 1200 through GTM - 0800)
      // It returns the wrong values. It often returns one month and one day back
      // This doesn't fix Safari but consistently returns better dates of one day back for those
      // time zones without breaking the US timezones
      r.setUTCFullYear(y, m, d);
      r.setUTCHours(h, mn, s, 0);

      return r;
   }

}

jTAC.define("TypeManagers.Base", jTAC._internal.temp._TypeManagers_base);


/* STATIC METHOD - EXTENDS jTAC
   Creates or updates an object of the class identified by classCtor.
   Returns the object. Use in property setters that host objects.
      val - Supports these values:
         Class specific object - If passed, it is returned without change.
         javascript object with jtacClass property -
            Creates an instance of the class named by the jtacClass property
            and assigns the remaining properties to the new object.
         javascript object without jtacClass property - 
            if existingObject is assigned, its properties are updated.
            If existingObject is null, an exception is thrown.
            If illegal properties are found, exceptions are thrown.
         string - Specify the class or alias name of the class to create. 
            That class is created with default properties
            and returned.
         null - return the value of existingObject.
      existingObject - Either null or an object instance. Usage depends on val.
         
*/
jTAC.checkAsTypeManager = function ( val, existingObject ) {
   return jTAC.checkAsClass( val, existingObject, jTAC.TypeManagers.Base );
}
/*
jTAC.checkAsTypeManager = function ( val, defaultValue ) {
   if ( ((val == null) || ( val == "")) && (defaultVal !== undefined) )
      return defaultVal || null;
   try {
      jTAC._internal.pushContext("jTAC.checkAsTypeManager");

      if ( val && (typeof val == "object") && !val.$className) {
         if ( val.jtacClass ) {
            val = jTAC.create(null, val);
         }
         else if ( defaultVal ) {
      // a plain object and just update the properties on defaultVal and return it.
      // Reject it if any property is not legal
            for (var name in val) {
               if (!defaultVal.setProperty(name, val[name]))  // will throw exceptions for illegal values
                  jTAC.error("Could not set the property [" + name + "] on the TypeManager[" + defaultVal.$fullClassName +  "].");
            }
            return defaultVal;
         }
      }
      else if (typeof(val) == "string") {
         val = jTAC.create(val, null, true);
      }
      if (val instanceof jTAC.TypeManagers.Base) {
         return val;
      }

      jTAC.error("Requires a TypeManager object.");
   }
   finally {
      jTAC._internal.popContext();
   }
}
*/
/* STATIC METHOD - EXTENDS jTAC
Same as jTAC.checkAsTypeManager but allows assigning null to the result.
*/
jTAC.checkAsTypeManagerOrNull = function ( val ) {
   return jTAC.checkAsTypeManager(val, null);
}

/* STATIC METHOD - EXTENDS jTAC
   When you want to use data-jtac-datatype and data-jtac-typemanager attributes
   on an HTML element but are not using HTML 5, use this method.
*/
jTAC.addDataTypeAttributes = function(elementId, datatype, json)
{
   var conn = jTAC.connectionResolver.create(elementId);
   conn.setData("jtac-datatype", datatype);
   conn.setData("jtac-typemanager", json);
}

/* --- jTAC.plugInParser --------------------------------------------
Sets up the plugInParser method on jTAC.

plugInParser is called to connect a custom parser object to a TypeManager class.

1. Create a jTAC class with these three members (and any more you need):
   * parse(text) - The parser. It is is passed the string to parse
     and returns the value expected by the TypeManager class's native _parse() method.
     It throws exceptions via this._inputError() for errors found.
   * valChar(orig) - Called by TypeManagers.isValidChar to assertain
     the characters allowed by the parser. It is passed a string with
     the characters defined natively. valChar should return
     the same list, a replacement or a modified version.
   * owner - A field that will be assigned the owning TypeManager object
     to use your parser.
2. Register that class with jTAC using jTAC.define("TypeManagers.classname", memberobject);

3. Call jTAC.plugInParser("[name of parser class]", "[name of TypeManager class to extend]")

See examples in \TypeManagers\PowerDateParser.js and PowerTimeParser.js.

When finished, users can either use your parser or by setting the new
[nativeParser] property to true, can use the original parser.

The user can assign any properties on the parser object by referencing
them through the [parserOptions] property on the TypeManager.
------------------------------------------------------------------ */

jTAC.plugInParser = function(parserClass, typeManagerClass) {

   /* --- EXTENDED TypeManagers.BaseTime -------------------------------
   Attaches the PowerTimeParser to the TypeManagers.BaseTime class
   by adding and replacement members of BaseTime's prototype.

   Adds these properties:
      parserOptions -
         Reference to the PowerTimeParser. Access it to update its options.
      nativeParser -
         While PowerTimeParser.js is loaded, all calls to BaseTime._parseTime()
         will use it. If you have a situation where you simulateously 
         need to use the native _parseTime method, set this to true.
         It defaults to false.
   ------------------------------------------------------------------ */

   var members = {
      config: {
         parserOptions: null,
         nativeParser: false
      },

   /*
      Replaces the original method on TypeManagers.BaseDatesAndTimes.prototype.
      Uses nativeParser to select between original and the Parser class.
   */
      _parse: function( text ) {
         return this.getNativeParser() ? 
            this._nativeParse(text) : // this method is created below
            this.getParserOptions().parse(text);
      },

   /*
      Replaces the original method on TypeManagers.BaseDatesAndTimes.prototype.
      Calls the valChars() method on the Parser class.
   */
      _valChars : function () {
         var r = this._nativeValChars(); // this method is created below
         if (!this.getNativeParser()) {
            var p = this.getParserOptions();
            if (p) {
               r = p.valChars(r);
            }
         }
         return r;
      },

/*
   Creates the class if not already supplied.
*/
      getParserOptions: function() {
         var p = this.config.parserOptions;
         if (!this.config.parserOptions) {
            p = this.config.parserOptions = 
               jTAC.create(parserClass);
            p.owner = this;
            this._registerChild(p);
         }
         return p;
      },

   /*
   Can only assign an object whose properties will be copied onto 
   the same named properties of the parser class.
   It can be an actual parser class instance, which will be directly assigned.
   */
      setParserOptions: function (val)
      {
         if ((val == null) || (typeof val != "object"))
            this._error("Must pass an object whose properties match those on the parserOptions property.");
         if (val.instanceOf && val.instanceOf(parserClass)) {
            val.owner = this;
            this.config.parserOptions = val;
         }

         else {
            var parser = this.getParserOptions();
            for (var name in parser.config)
            {
               if (val[name] !== undefined)
                  parser.config[name] = val[name];
            }
         }
      }

   }

   var cl = jTAC.getClass(typeManagerClass);
   var proto = cl.prototype;

   if (proto._parse === undefined)
      jTAC.error("Cannot use jTAC.plugInParser() with [" + typeManagerClass + "].");

   // Preserve the native _parse() method as "_nativeParse" and 
   // _valChars() method as "_nativeValChars" so they remain available.
   proto._nativeParse = proto._parse;
   proto._nativeValChars = proto._valChars;

   jTAC.addMembers(typeManagerClass, members);  // replaces _parse and _valChars

}  // end plugInParser function
﻿// jTAC/TypeManagers/BaseCulture.js
/* -----------------------------------------------------------
JavaScript Types and Conditions ("jTAC")
Copyright (C) 2012  Peter L. Blum

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.BaseCulture  ABSTRACT CLASS
Extends: TypeManagers.Base

Purpose:
TypeManagers.BaseCulture is an abstract base class for developing TypeManagers
that require culture specific formatting and parsing rules.

Its default configuration uses the global object jTAC.cultureInfo
to define each culture specific setting. See that class below.
You can change that class's properties to reflect another culture:
jTAC.cultureInfo.dtShortDatePattern = "MM/dd/yyyy";
You can also create an alias to describe another culture.
jTAC.defineAlias("Culture.fr-FR", { dtShortDatePattern: "dd/MM/yyyy" });
jTAC.cultureInfo = jTAC.create("Culture.fr-FR");

If you want to use jquery-globalize (https://github.com/jquery/globalize)
to supply culture info, add the 
\TypeManagers\Culture engine for jquery-globalize.js
after loading the BaseCulture.js file.
https://github.com/jquery/globalize.

You can provide other "culture engines". 
Just replace these jTAC.TypeManagers.BaseCulture.prototype
functions: numberFormat(), currencyFormat(), percentFormat(),
and dateTimeFormat(). See how \TypeManagers\Culture engine for jquery-globalize.js
does it.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced in this class:
  cultureName (string) - 
      The globalization name for the culture used by jquery-globalize
      or whatever culture system you have in place.
      For example, "en-US", "fr-CA".
      If null, use a default culture.

Methods introduced in this class:
  numberFormat(rule) - 
      Converts rule names describing number formatting (not currency or percent) 
      into values specific for the culture.
  currencyFormat(rule) - 
      Converts rule names describing currency formatting 
      into values specific for the culture.
  percentFormat(rule) - 
      Converts rule names describing percent formatting 
      into values specific for the culture.
  dateTimeFormat(rule) - 
      Converts rule names describing date and time formatting 
      into values specific for the culture.

Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require jquery-globalize until you add
\jTAC\TypeManagers\Culture engine for jquery-globalize.js.

------------------------------------------------------------*/

jTAC._internal.temp._TypeManagers_BaseCulture = {
   extend: "TypeManagers.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },
   config: {
      cultureName: ""
   },
   configrule: {
      cultureName: {
         valFnc: jTAC.checkAsStrOrNull,
         clearCache: true
      }
   },


/* 
Converts rule names describing number formatting (not currency or percnet) into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
Here are the rule names (case sensitive) and the values they return:
   NegPattern - string: negative number pattern: use "(n)|-n|- n|n-|n -", where n is replaced by the number
   Decimals - integer: number of decimal places normally shown
   GroupSep - string: string that separates number groups, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99
   GroupSizes  - array: array of numbers indicating the size of each number group.
   NegSymbol- string: symbol used for negative numbers

*/
   numberFormat: function(rule) {
      return jTAC.cultureInfo["num" + rule];
   },

/* 
Converts rule names describing currency formatting into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
Here are the rule names (case sensitive) and the values they return:
   NegPattern  - string: negative pattern for currency, including symbol represented by $
   PosPattern  - string: positive pattern for currency, including symbol represented by $
   Symbol- string: symbol used to represent a currency
   Decimals - integer: number of decimal places normally shown in a currency
   GroupSep - string: string that separates number groups in a currency, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99 in a currency
   GroupSizes  - array: array of numbers indicating the size of each number group in a currency
   NegSymbol- string: symbol used for negative numbers in a currency
*/
   currencyFormat: function(rule) {
      return jTAC.cultureInfo["cur" + rule];

   },

/*
Converts rule names describing percentage formatting into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
Here are the rule names (case sensitive) and the values they return:
   NegPattern  - string: negative pattern for percentage, including symbol represented by %
   PosPattern  - string: positive pattern for percentage, including symbol represented by %
   Symbol - string: symbol used to represent a percentage
   Decimals - integer: number of decimal places normally shown in a percentage
   GroupSep - string: string that separates number groups in a percentage, as in 1,000,000
   DecimalSep  - string: string that separates a number from the fractional portion, as in 1.99 in a percentage
   GroupSizes  - array: array of numbers indicating the size of each number group in a percentage
   NegSymbol- string: symbol used for negative numbers in a percentage

*/
   percentFormat: function(rule) {
      return jTAC.cultureInfo["pct" + rule];
   },



/* 
Converts rule names describing dates and times into values specific for the culture.
By default, this method uses jTAC.cultureInfo for its data.
You can switch "culture engines" by replacing this methods's prototype.
Here are the rule names (case sensitive) and the values they return:
   ShortDateSep- string: separator of parts of a date (e.g. "/" in 11/05/1955)
   TimeSep  - string: separator of parts of a time (e.g. ":" in 05:44 PM)
   FirstDay - integer: the first day of the week (0 = Sunday, 1 = Monday, etc)
   Days - array of 7 strings. Full names for days of the week
   DaysAbbr - array of 7 strings. Abbreviated names for days of the week
   DaysShort - array of 7 strings. Short names for days of the week
   Months - array of 13 strings. Full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
   MonthsAbbr - array of 13 strings. Abbreviated month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
   AM - string: AM Designator. Null when not used
   PM - string: PM Designator. Null when not used
   TwoDigitYearMax   - integer: When a two digit year is given, it will never be parsed as a four digit
			                              - year greater than this year (in the appropriate era for the culture)
   ShortDatePattern  - string: short date pattern. Valid chars: "M", "d", "y" and "/" for separator
   ShortDatePatternMN  - string: short date pattern with the month replaced by MMM (abbr month). Valid chars: "M", "d", "y" and "/" for separator
   AbbrDatePattern   - string: abbr date pattern, similar to long, with abbreviated month name: "MMM" for abbr month name.  Does not include week day
   LongDatePattern   - string: long date pattern. "MMMM" for month name.  Does not include week day
   ShortTimePattern  - string: time pattern without seconds: "H", "m", "tt"
   LongTimePattern   - string: time pattern with seconds: "H", "m", "s", "tt"
   ShortDurationPattern - duration pattern without seconds: "H", "m"
   LongDurationPattern - duration pattern with seconds: "H", "m", "s"
   ShortDateShortTimePattern  - string: short date pattern + short time pattern
   ShortDateLongTimePattern  - string: short date pattern + long time pattern
   AbbrDateShortTimePattern  - string: abbr date pattern + short time pattern
   AbbrDateLongTimePattern   - string: abbr date pattern + long time pattern
   LongDateShortTimePattern  - string: long date pattern + short time pattern
   LongDateLongTimePattern   - string: long date pattern + long time pattern
   ShortMonthDayPattern      - string: month day pattern with only digits
   ShortMonthDayPatternMN      - string: month day pattern based on ShortDatePatternMN
   AbbrMonthDayPattern      - string: month day pattern with abbreviated month name
   LongMonthDayPattern      - string: month day pattern with long month name
   ShortMonthYearPattern      - string: month year pattern with only digits
   ShortMonthYearPatternMN      - string: month year pattern based on ShortDatePatternMN
   AbbrMonthYearPattern     - string: month year pattern with abbreviated month name
   LongMonthYearPattern     - string: month year pattern with long month name

*/
   dateTimeFormat: function(rule) {
      return jTAC.cultureInfo["dt" + rule];

   },

   /*
   Evaluates a single character to determine if it is valid in a string
   representing the type. It does not care about the position or quantity
   of this character in the string that is being created.
   For example, if this is a date entry that supports only the short date format,
   it considers digits and the decimal separator to be valid.
      chr - A single character string to evaluate.
   Returns: true when the character is valid and false when invalid.
   */
   isValidChar : function (chr) {
      if (!this.callParent([chr])) // tests for illegal parameter. 
         return false;
      var cache = this._cache;
      if (cache.noREvalchar)  // not supported indicator
         return true;
      var re = cache.valcharRE;
      if (!re) {
         re = cache.valcharRE = this._valCharRE();
         if (!re) {   // not supported
            cache.noREvalchar = true;
            return true;
         }
      }
      return re.test(chr);
   },

   /*
   Function called by isValidChar
   to create a regular expression that evaluates a character as legal.
   Return null if all characters are legal and isValidChar should always return true.
      culture - object defined by jquery-globalize that contains one culture's rules.
         Returned by Globalize.culture['name']

   This function returns null by default and subclasses should override it.
   */
   _valCharRE : function () {
      return null;
   },

   /*
     Overridden
   */
   setCultureName : function (name) {
      this._defaultSetter("cultureName", name);  //this.config.cultureName = name;
      this._clearCache();
   }

}
jTAC.define("TypeManagers.BaseCulture", jTAC._internal.temp._TypeManagers_BaseCulture);

/* -------------------------------------------------------------------
Defines the jTAC.cultureInfo object. Used by TypeManagers.BaseCulture
to supply culture specific number, currency, percent, date and time settings.
This defines the TypeManagers.CultureInfo class. Below the default
is created using the settings shown here (which are en-US).
Edit values using jTAC.cultureInfo.property name or by creating a new instance
and assigning it to jTAC.cultureInfo.
This functionality is used by default by TypeManagers.BaseCulture.
You can load other culture engines, like "Culture engine for jquery-globalize.js",
which replace this functionality in TypeManagers.BaseCulture.
------------------------------------------------------------------- */

jTAC_Temp = {
   config: {
      numNegPattern: "-n", // string: negative number pattern: use "(n)|-n|- n|n-|n -", where n is replaced by the number
      numDecimals: 2,      // integer: number of decimal places normally shown
      numGroupSep: ",",    // string: string that separates number groups, as in 1,000,000
      numDecimalSep: ".",  //string: string that separates a number from the fractional portion, as in 1.99
      numGroupSizes: [3],  //  - array: array of numbers indicating the size of each number group.
      numNegSymbol: "-",    // string: symbol used for negative numbers
      curNegPattern: "($n)",  //string: negative pattern for currency, including symbol represented by $
      curPosPattern: "$n",  //string: positive pattern for currency, including symbol represented by $
      curSymbol: "$",      // string: symbol used to represent a currency
      curDecimals: 2, // integer: number of decimal places normally shown in a currency
      curGroupSep: ",", // string: string that separates number groups in a currency, as in 1,000,000
      curDecimalSep: ".",  //string: string that separates a number from the fractional portion, as in 1.99 in a currency
      curGroupSizes: [3],  //array: array of numbers indicating the size of each number group in a currency
      curNegSymbol: "-", // string: symbol used for negative numbers in a currency
      pctNegPattern: "-%n",  //string: negative pattern for percentage, including symbol represented by %
      pctPosPattern: "%n",  //string: positive pattern for percentage, including symbol represented by %
      pctSymbol: "%",      // string: symbol used to represent a percentage
      pctDecimals: 2, // integer: number of decimal places normally shown in a percentage
      pctGroupSep: ",", // string: string that separates number groups in a percentage, as in 1,000,000
      pctDecimalSep: ".",  //string: string that separates a number from the fractional portion, as in 1.99 in a percentage
      pctGroupSizes: [3],  //array: array of numbers indicating the size of each number group in a percentage
      pctNegSymbol: "-", // string: symbol used for negative numbers in a percentage
      dtShortDateSep: "/", // string: separator of parts of a date (e.g. "/" in 11/05/1955)
      dtTimeSep: ":",  //string: separator of parts of a time (e.g. ":" in 05:44 PM)
      dtFirstDay: 0, // integer: the first day of the week (0 = Sunday, 1 = Monday, etc)
      dtDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], // array of 7 strings. Full names for days of the week
      dtDaysAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // array of 7 strings. Abbreviated names for days of the week
      dtDaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], // array of 7 strings. Short names for days of the week
      dtMonths: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "" ],
      dtMonthsAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""],
      dtAM: "AM", // string: AM Designator. Null when not used
      dtPM: "PM", // string: PM Designator. Null when not used
      dtTwoDigitYearMax : 2029,  //integer: When a two digit year is given, it will never be parsed as a four digit year greater than this year (in the appropriate era for the culture)
      dtShortDatePattern: "M/d/yyyy",  //string: short date pattern. Valid chars: "M", "d", "y" and "/" for separator
      dtShortDatePatternMN: "MMM/d/yyyy",  //string: short date pattern with the month replaced by MMM (abbr month). Valid chars: "M", "d", "y" and "/" for separator
      dtAbbrDatePattern : "MMM dd, yyyy",  //string: abbr date pattern, similar to long, with abbreviated month name: "MMM" for abbr month name. Does not include week day
      dtLongDatePattern : "MMMM dd, yyyy",  //string: long date pattern. "MMMM" for month name. Does not include week day
      dtShortTimePattern: "h:mm tt",  //string: time pattern without seconds: "H", "m", "tt"
      dtLongTimePattern : "h:mm:ss tt",  //string: time pattern with seconds: "H", "m", "s", "tt"
      dtShortDurationPattern: "h:mm",  // duration pattern without seconds: "H", "m"
      dtLongDurationPattern: "h:mm:ss",  // duration pattern with seconds: "H", "m", "s"
      dtShortDateShortTimePattern: "M/d/yyyy h:mm tt",  //string: short date pattern + short time pattern
      dtShortDateLongTimePattern: "M/d/yyyy h:mm:ss tt",  //string: short date pattern + long time pattern
      dtAbbrDateShortTimePattern: "MMM dd, yyyy h:mm tt",  //string: abbr date pattern + short time pattern
      dtAbbrDateLongTimePattern : "MMM dd, yyyy h:mm:ss tt",  //string: abbr date pattern + long time pattern
      dtLongDateShortTimePattern: "MMMM dd, yyyy h:mm tt",  //string: long date pattern + short time pattern
      dtLongDateLongTimePattern : "MMMM dd, yyyy h:mm:ss tt",  //string: long date pattern + long time pattern
      dtShortMonthDayPattern: "M/dd",   // string: month day pattern with only digits
      dtShortMonthDayPatternMN: "MMM/dd",   // string: month day pattern based on ShortMonthDayPattern
      dtAbbrMonthDayPattern : "MMM dd",  //string: month day pattern with abbreviated month names
      dtLongMonthDayPattern: "MMMM dd",  //string: month day pattern with long month name
      dtShortMonthDayPattern: "M/yyyy", // string: month year pattern with only digits
      dtShortMonthDayPattern: "MMM/yyyy", // string: month year pattern based on ShortMonthYearPattern
      dtAbbrMonthYearPattern: "MMM yyyy",  //string: month year pattern with abbreviated month names
      dtLongMonthYearPattern: "MMMM yyyy"  //string: month year pattern with long month name
   },

   configrules: {
      dtAM: jTAC.checkAsStrOrNull,
      dtPM: jTAC.checkAsStrOrNull
   }
}

jTAC.define("TypeManagers.CultureInfo", jTAC_Temp);

// The Global that is used by TypeManagers.BaseCulture classes by default
// You can replace it with another instance if you like, or edit its properties directly.
jTAC.cultureInfo = jTAC.create("TypeManagers.CultureInfo"); // creates the default

