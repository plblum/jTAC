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
   The element can host this label in its data-msglabel attribute or
   there is another with a for= attribute specifying this element whose
   HTML is the label. If both are present, data-label overrides
   the for= attribute. 
   Returns the label string or the value passed into the missing parameter if not found.
   The string will not contain HTML tags found in the source.
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
   The element can host this label in its data-msglabel attribute or
   there is another with a for= attribute specifying this element whose
   HTML is the label. If both are present, data-msglabel overrides
   the for= attribute. 
   If you want to support localization, define a new key in your \jTAC\Translations\
   script files with the localized names. Then add the data-msglabel-lookupid
   attribute to the element hosting that new key.
   NOTE: The value "data-msglabel" was chosen over "data-label" to avoid
   conflicts with other systems.
   NOTE: This function requires jquery to locate the label for= node. If
   jquery is not present, that feature is not used.
      element (DOM Element) - Accepts null.
   Returns the label string or null if not located.
   The result will not contain HTML tags found in the source.
   */
   _locateLabel: function (element)
   {
      if (!element)
         return null;
      var t = element.getAttribute("data-msglabel");
      var lu = element.getAttribute("data-msglabel-lookupid");
      if (lu) {
         t = jTAC.translations.lookup(lu, t);
      }
      if ((t == null) && window.jQuery) { // this code only works with jQuery present
         var lbl = $("label[for='" + element.id + "'][generated!='true']");  // jquery-validate creates a label to host the error message. 
         // It assigns a custom attribute, 'generated=true' to that label. 
         // We need to avoid it.
         if (lbl) {
            t = lbl.html();
            if (t) {
               t = this._cleanLabel(t);
               // update data-label to avoid searching each time
               element.setAttribute("data-msglabel", t);
            }
         }
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
         1 = Currency: round to the nearest even number.
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

         case 1:  // round to the nearest even number.
            var nv = Math.floor(sv); // Math.round(sv);
            if ((sv != nv) && (nv % 2 == 1))  // it changed. So did it go to an odd number? If so, it should have rounded down, so subtract 2.
            {  // redo the rounding after adjusting it up so that 3.4 is still 3 and 3.5 is 4.
               nv = Math.round(sv);

            }
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

﻿// jTAC/Connections/UserFunction.js
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
Class : Connections.UserFunction
Extends: Connections.Base

Purpose:
Write code that supplies a value to a Condition, such as a calculated
number or a string built from several other fields.
If using calculations, also consider using the Calculations.CalcWidget
or Calculation jquery-ui widget, which has its own Connection class.

This Connection class only reads data. It does not support setTextValue()
or setTypedValue().

Set up:
If the value returned is a string type, it does not need a TypeManager.
Otherwise, define a TypeManager in the [datatype] or [typeManager] properties.

Then you can either override the userFunction() method or create a separate
method that you assign to the [fnc] property.

Your function will be passed a list of values extracted from other
connections. Those connections are identified in the [connections] property,
which is an array of actual Connection objects or ids to elements on the page.

The function has these parameters:
- sender (Connection.UserFunction) - The object that calls this.
   Use it to access the TypeManager with getTypeManager().
- values (Array of values) - This array contains values retrieved from 
   the [connections] and prepared with the TypeManager (if used).
   The values will be strings if no TypeManager is used.
Return: A value compatible with the TypeManager or a string if no TypeManager.
Return null if there is no value available.

Properties introduced by this class:
   fnc (function) - 
      The user function to call when you do not override this class.
      It can be assigned a javascript function or the name of
      a globally defined function (it is a function on the window object).
      Leave it null if overriding the userFunction() method in a subclass.

   connections (array of Connections) - 
      Connections that are the source of data to pass to your user function.
      This array can contain:
         - Actual Connection objects
         - strings which are the IDs of elements on the page
         - a JavaScript object with the jtacClass property defining 
            the Connection class to create and other properties to assign to the
            instance of that Connection class.
      All elements will be converted to Connection objects by the time the 
      user function is invoked.

   required (array of boolean) -
      If you require a valid and non-null value from a Connection,
      assign the array element matching the Connection element in 
      [connections] to true. For example, if the 2nd Connection object
      in [connections] is required, use required: [false, true].
      Can be left unassigned.

   datatype (string) -
      The class or alias name of the TypeManager that determines the
      native type of values passed into your user function.
      (This does not determine the type returned by your function. Use [typeName]
      for that.)

   typeManager (TypeManager) -
      The TypeManager that determines the
      native type of values passed into your user function.
      (This does not determine the type returned by your function. Use [typeName]
      for that.)
      Set this if the [datatype] property cannot specify 
      the correct TypeManager because you need to explicitly set properties.
      It will be set if using [datatype] by the time your user function is invoked.

   typeName (string) - 
      The type that will be returned by your user function.
      This value is used by the typeSupported() method to determine
      if the getTypedValue() method is available.
      This value is normally determined by the TypeManager's storageTypeName() method.
      If there is no TypeManager, it defaults to "string".
      Set it explicitly if another type is needed. Supported values:
      "integer", "float", "date", "time", "datetime", "boolean", "string".

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

Does not require or utilize jquery itself. These classes can be
used outside of jquery, except where jquery globalize demands it
(jquery globalize is designed to work independently of jquery.)

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._Connections_UserFunction = {
   extend: "Connections.Base",

   constructor: function ( propertyVals ) {
      this.callParent([propertyVals]);

   },

   config: {
      fnc: null,
      connections: [],
      required: [],
      datatype: "",
      typeManager: null,
      typeName: ""
   },

   configrules: {
      fnc: jTAC.checkAsFunctionOrNull,
      typeManager: jTAC.checkAsTypeManagerOrNull
   },



/*
   If the user subclasses, override this function to do the calculation.
   It is set to [fnc] by default. It is replaced when the user sets the [fnc] property.
      sender (conn) - The connection object making this call.
      elementVals (array) - Array of values returned from the list of connections
         identified by the [elementIds] property. These should all be strings or "" when no value was found.
   Return the value based on the correct type. If are are not using a TypeManager, return strings.
   Otherwise, return the native type defined by the TypeManager defined in [datatype].
   If there is no value to return, return null.
   This function is also used by isNullValue, which returns true when this returns null.
*/
   userFunction: function(sender, elementVals) {
      this._AM();
   },

   /* 
   Retrieve the string representation of the value.
   Returns a string.
   */
   getTextValue : function () {
      this._prepare();
      if (!this.config.typeManager) {
         var vals = this._getConnValues();
         if (!vals)
            return "";
         return this.config.fnc.call(this, this, vals);
      }
      var val = this.getTypedValue(this.config.typeName);
      return val != null ? val.toString() : "";
   },

   typeSupported : function (typeName) {
      this._prepare();
      return typeName == this.config.typeName;
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
      this._prepare();
      if (!this.config.typeManager)
         this._error("Not supported.");
      var vals = this._getConnValues();
      if (vals == null)
         return null;
      return this.config.fnc.call(this, this, vals);
   },



   /*
   Determines if the value is assigned or not.
   This uses calls [fnc] method. If that returns null, so does isNullValue().
   Also, if using the [required] property and a connection has a null value
   when required, this returns true.
   Otherwise is returns false.
      override (boolean) - ignored
   */
   isNullValue : function (override) {
      this._prepare();
      var vals = this._getConnValues();
      if (vals == null)
         return true;

      return this.config.fnc.call(this, this, vals) == null;
   },
   
   /*
   Determines if the element is editable.
   Returns true when editable.
   This class always returns true.
   */
   isEditable: function () {
      return false;
   },

   /*
   If the widget is built to handle a specific data type
   other than string, it can create and return a TypeManager class for that data type.
   If it does not have a TypeManager to return, it returns null.
   This class always returns null.
   */
   getTypeManager : function () {
      this._prepare();
      return this.config.typeManager;
   },

/*
   Called by entry point methods before doing work to ensure
   the [fnc], [connections], [typeManager], and [typeName] properties
   have been setup.
*/
   _prepare: function () {
      var config = this.config;
      if (!this.config.fnc)
         this.config.fnc = this.userFunction;

      var conns = config.connections;

      for (var i = 0; i < conns.length; i++) {
         var conn = conns[i];
         if (!(conn instanceof jTAC.Connections.Base)) {
            if (typeof conn == "string") {   // it is an element Id
               conns[i] = jTAC.connectionResolver.create(conn, null);
            }
            else { // it is an actual Connection object or object with jtacClass property.
               conns[i] = jTAC.checkAsConnection(conn);
            }
         }
      }  // for

      if (!config.typeManager && config.datatype) {
         config.typeManager = jTAC.create(config.datatype);
      }
      config.typeName = config.typeManager ? config.typeManager.storageTypeName() : "string";

   },

/*
   Returns an array of values retrieved from the Connections in 
   [connections]. If the [required] property is true and a 
   Connection returns IsNullValue() = true, this returns null.
*/
   _getConnValues: function() {
      var config = this.config;
      var conns = config.connections;
      var tm = config.typeManager;
      var result = [];
      for (var i = 0; i < conns.length; i++) {
         var conn = conns[i];
         var val = tm ? null : "";
         if (conn.isValidValue(config.typeName)) {
            if (conn.isNullValue()) {
               if (config.required[i] == true)
                  return null;
            }
           
            val = tm ? tm.toValueFromConnection(conn) : conn.getTextValue();
         }
         result.push(val);
      }
      return result;
   }



}
jTAC.define("Connections.UserFunction", jTAC._internal.temp._Connections_UserFunction);
﻿// jTAC/TypeManagers/BaseNumber.js
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
Additional licensing:
Portions adapted from the commercial product, Peter's Data Entry Suite v5,
a product from Peter L. Blum who is the author of jTAC.
http://www.peterblum.com/des/home.aspx
Used by permission and covered by the same license as above.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.BaseNumber   ABSTRACT CLASS
Extends: TypeManagers.BaseCulture

Purpose:
Abstract class to support a number as a native type.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   allowNegatives (bool) - Property determines if a negative number is valid.
     When it is not, isValidChar() and isValid() functions both report
     errors when they find a negative char or number.
   showGroupSep (bool) - Determines if the toString() function includes
     group separator character (aka "thousands separator"). Defaults to true.
   allowGroupSep (bool) - Sets up the keyboard filter to allow the thousands symbol.
      When not allowed, the thousands character causes validation error.
      Defaults to true.
   strictSymbols (boolean) -
      By default, the parser is flexible about the placement of symbols
      surrounding the digits. The minus, currency symbol, percentage symbol
      can appear before or after the digits. If using parentheses
      for negative indicators, the opening paren can be either before or after,
      and the closing paren can be missing.
      That's because the parser just uses the presence of these characters
      to detect a negative value, and then strips out all of these symbols.
      When this is true, these symbols must be found in the positions
      indicated by the culture's NegPattern and PosPattern.
      However, any spaces separating the symbols from the digits are still optional.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseNumber = {
   extend: "TypeManagers.BaseCulture",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      allowNegatives: true,
      showGroupSep: true,
      allowGroupSep: true,
      strictSymbols: false
   },

   nativeTypeName : function () {
      return "number";
   },
   /*
   Overridden method.
   Evaluates the number. Looks for illegal cases. Throws exceptions when found.
   It may change the value too, if needed, such as to round it.
   value (number) - The number to check. 
   Returns the finalized number.
   */
   _reviewValue : function (value) {
      if (value === null)
         return value;

      value = this.callParent([value]);
      if (isNaN(value))
         this._error("Cannot pass NaN.");
      this._checkAllowNegatives(value); // may throw an exception
      return value;
   },

   /*
   Returns the original value.
   */
   toNumber : function (value) {
      return value;
   },

   /*
   Indicates the maximum number of decimal places.
   When 0, no decimal places are allowed.
   This class returns 0.
   */
   getMaxDecimalPlaces : function () {
      return 0;
   },


   /* 
      Conversion from native value to culture neutral string. only digits, period, optional lead minus character
   */
   toStringNeutral : function (val) {
      if (val == null)
         return "";
      var r = val.toString(); // when > 6 decimal digits, it returns exponential notation: w.ddde+n or w.ddde-n, where n is the exponent
      if ((r.indexOf('e') > -1) && val.toFixed) {	// toFixed requires Javascript 1.5
         var m = r.match(/^.+e[\-\+](\d*)$/);
         var sz = parseInt(m[1], 10);
         if (isNaN(sz))
            return "";
         r = val.toFixed(sz);
      }
      return r;

   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


   // ---- UTILITY METHODS ---------------------------------------------------
/*
Redirects the rule to one of the TypeManagers.BaseCulture
methods that handle number formats.
This class uses numberFormat().
*/
   _nf: function(rule) {
      return this.numberFormat(rule);
   },


   /* 
    Call when the number format restricts the negative symbol to minus character.
    Negative symbols include: -, (, ). However, parenthesis are only supported
    if the culture allows it, whereas minus is always allowed.
    Throws exception if illegal symbol is found.
    Usually currency allows all. Percent and float usually only allow minus.
      text (string) - contains the number including the negative symbol.
      numberFormat (object) - from culture.numberFormat, culture.numberFormat.currency,
        or culture.numberFormat.percent. Must have a pattern property that is 
        an array, where the first element is the negative pattern.
   */
   _checkNegSymbol : function (text) {
      if ((text.indexOf("(") > -1) && !this._negPatHasParen()) {
            this._error("Illegal negative symbol");
      }
   },

/*
Returns true if the negative pattern includes the parenthesis to indicate negative values.
*/
   _negPatHasParen : function() {
      var r = this._cache.nPAP;
      if (r == null) {
         r = this._cache.nPAP = this._nf("NegPattern").indexOf("(") > -1;
      }
      return r;
   },

/*
Call when the strictSymbols property is true.
Pass in the text containing a number after its thousands separators are removed
and its decimal place is converted to period. Effectively the number inside
the string is just digits and period.
This will evaluate the text against the culture's NegPattern and PosPattern. 
It will throw an exception if the pattern is not matched.
*/
   _checkStrictSymbols: function( text ) {
      var nSym = this._nf("NegSymbol");
      var neg = (text.indexOf(nSym) > -1) || text.indexOf("(") > -1;
      var pat = this._nf(neg ? "NegPattern" : "PosPattern") || "";
      if (!pat)
         return;
      text = text.replace(nSym, "-");
      var sym = this._nf("Symbol") || "";
      var defSym = pat.indexOf("$") > -1 ? "$" : (pat.indexOf("%") > -1 ? "%" : "");
      var hasSym = text.indexOf(sym) > -1;
      if (hasSym) {
         text = text.replace(sym, defSym);
         pat = jTAC.escapeRE(pat);  // for negative symbols
         pat = pat.replace("\\ ", "\\s?");  // optional spaces
      }
      else { // no sym means remove space and defSym from the pattern
         pat = jTAC.replaceAll(pat, " ", "");
         pat = pat.replace(defSym, "");
         pat = jTAC.escapeRE(pat);  // for negative symbols
      }
      pat = pat.replace("n", "\\d+(\\.\\d*)?");
      pat = "^" + pat + "$";
   //NOTE: Does not save the regexp because there are several cases that vary based on the input
      var re = new RegExp(pat);
      if (!re.test(text))
         this._inputError("Symbols are not correctly positions.");
   },

   /*
     Inserts the group separator in the text parameter and returns the value.
     text - string to update. Separators are placed to the left of the decimal
         separator character if present.
   */
   _applyGroupSep : function (text)  {
      var gSep = this._nf("GroupSep");
      if (gSep == null)
         return text;

      var r = "";
      var dSep = this._nf("DecimalSep");

      var dPos = text.indexOf(dSep);
      var ePos = text.length;
      if (dPos > -1)  {// copy the trailing decimal section
         r = text.substring(dPos, ePos);
         ePos = dPos;
      }
      var gpSz = this._nf("GroupSizes");
      if (gpSz == null)
         gpSz = [ 3 ];

      var szIdx = 0;
      var nxtP = gpSz[0];
      var pos = 0;
      for (var i = ePos - 1; i >= 0; i--) {
         r = text.charAt(i) + r;
         if (i == 0)
            break;   // to avoid adding the thousands separator as the first character
         pos++;
         if (pos == nxtP) {
            r = gSep + r;
            if (szIdx < gpSz.length - 1) // continue with the last size
               szIdx++;
            if (gpSz[szIdx] == 0) // when 0, the last segment is unlimited size
               nxtP = 999;
            else
               nxtP = nxtP + gpSz[szIdx];

         } // if
      }  // for
      return r;
   },

   /*
   Utility for the _nativeToString() method of subclasses to test
   if the number is negative when allowNegatives is false. 
   Throws an exception if negatives are detected but not allowed.
   */
   _checkAllowNegatives : function(value) {
      if (!this.getAllowNegatives() && (typeof value == "number") && (value < 0))
         this._inputError("Negative values not allowed");
   },

   /*
      Utility to remove thousands separator characters when the showGroupSep property is false.
      It does not care about their positions. Every single instance of the character is removed here.
      (Subclass if you'd like a different behavior.)
   */
   _stripGroupSep : function(text) {
      return jTAC.replaceAll(text, this._nf("GroupSep"), "", true);
   },

   /*
     Call when converting to a string and there are trailing zeroes in the decimal part.
     It removes excess zeroes from the end.
       text (string) - string to clean up.
       td (int) - Number of trailing decimal characters allowed. When 0, no cleanup is applied.
       numberFormat (object) - from culture.numberFormat, culture.numberFormat.currency,
          or culture.numberFormat.percent. Must have a "." property containing the decimal separator.
   */
   _cleanTrailingZeros : function (text, tz) {
      // jquery-globalize may default numberFormat.decimals to 2, which is its own trailing decimals.
      // Unfortunately that value is fixed in the scripts and 2 is a poor choice for decimal numbers
      // which are not currencies. So this strips off any trailing zeros that exceed tz.
      if (tz)
      {
         // the decimal digits may be followed by additional text, like currency or percent symbol.
         // This technique extracts the decimal point and all following digits.
         // It modifies that string before using search and replace on the original string.
         var re = new RegExp(jTAC.escapeRE(this._nf("DecimalSep")) + "\\d*");
         var match = re.exec(text);
         if (match) {
            var ds = match[0];
            while (tz < (ds.length - 1)) {
               if (ds.charAt(ds.length - 1) != "0")   // once its not a trailing zero, stop
                  break;
               ds = ds.substr(0, ds.length - 1);
            }
            // see if missing trailing zeroes
            var add = tz - (ds.length - 1);
            if (add > 0) {
               ds += "000000000000".substr(0, add);
            }
            text = text.replace(match[0], ds);
         }
      }

      return text;
   }

}
jTAC.define("TypeManagers.BaseNumber", jTAC._internal.temp._TypeManagers_BaseNumber);


﻿// jTAC/TypeManagers/BaseFloat.js
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
Additional licensing:
Portions adapted from the commercial product, Peter's Data Entry Suite v5,
a product from Peter L. Blum who is the author of jTAC.
http://www.peterblum.com/des/home.aspx
Used by permission and covered by the same license as above.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.BaseFloat      ABSTRACT CLASS
Extends: TypeManagers.BaseNumber

Purpose:
Base abstract class for developing floating point TypeManagers.
Supports float as the native type. 
Uses the numberFormat object provided by the _getNumberFormat() function.
This allows subclasses like TypeManagers.Currency and TypeManagers.Percent
to provide alternative formatting rules.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   trailingZeroDecimalPlaces (int) - Determines how many trailing decimal places 
      should appear when reformatting a float value to a string.
   maxDecimalPlaces (int) - Determines the maximum number of decimal digits that are legal. 
      If there are more, it is either a validation error or rounded,
      depending on roundMode.
      Set to 0 or null to ignore this property.
   roundMode (int) - When maxDecimalPlaces is set, this determines
      how to round based or if an exception is thrown. 
      Values: 0 = Point5, 1 = Currency, 2 = Truncate, 3 = Ceiling, 4 = NextWhole, null = error
      Defaults to null.
   acceptPeriodAsDecSep (boolean) - 
      Many cultures do not use the period as the decimal separator. 
      It makes numeric entry from the numeric keypad more difficult, 
      because it features a period key.
      When true, both the culture's decimal separator and a period are allowed as the decimal separator.
      Does not apply for cultures that already use a period for the decimal separator. 
      Some cultures use a period as a thousands separator. In those cases, the parser will 
      only consider periods the decimal separator when there is only one period character 
      and the culture's decimal separator is not found.
      Defaults to false.


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseFloat = {
   extend: "TypeManagers.BaseNumber",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      maxDecimalPlaces: null,         // no limit
      trailingZeroDecimalPlaces: 1,   // none
      roundMode: null,                // throw exception if maxDecimalPlaces is exceeded
      acceptPeriodAsDecSep: false
   },

   configrules: {
      maxDecimalPlaces: jTAC.checkAsIntOrNull,
      trailingZeroDecimalPlaces: jTAC.checkAsInt, 
      roundMode: jTAC.checkAsIntOrNull    
   },

   /*
   Support for the toString() method.
   Returns a string formatted to match the value.
   NOTE: Designed to be used by TypeManagers., TypeManagers.Currency, and TypeManagers.Percent.
   Avoid adding anything unique to any of those cases here.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
   /* Caller handles this through _reviewValue()
      if (isNaN(value))
         this._error("Cannot pass NaN.");
      this._checkAllowNegatives(value);   // may throw an exception

      value = this._applyMaxDec(value);  // may throw an exception
   */
      var s = this.floatToString(Math.abs(value));   // does not use culture specific formats. Has a period for a decimal separator.

      // Apply these formatting changes:
      // 1) trailingZeroDecimalPlaces
      // 2) Replace the period with the decimal separator
      // 3) add thousands separators 
      // 4) apply negative and positive formatting pattern
      s = this._applyTrailingZeros(s);
      var dSep = this._nf("DecimalSep");
      if (dSep != ".")
         s = s.replace(".", dSep);
      if (this.getShowGroupSep())
         s = this._applyGroupSep(s);
      var pr = (value < 0) ? "NegPattern" : "PosPattern";
      var pat = this._nf(pr);
      if (pat)
         s = pat.replace("n", s);

      return s;
   },

   /*
     Adds trailing zeros based on the current text representing a decimal
     value and the trailingZeroDecimalPlaces property.
      text (string) - A string representing a decimal number, with only
         digits and the period as the decimal separator. If no period,
         nothing happens.
     Returns the updated text.
   */
   _applyTrailingZeros : function (text) {
      var tz = this.getTrailingZeroDecimalPlaces();

      // when tz == null, don't add or remove trailing zeros, except for a whole number; 
      // when == 0, do not add ".0" to whole numbers; otherwise add trailing zeros
      if ((tz == null) && (text.indexOf(".") == -1)) {
         text += ".0";   // add a trailing decimal plus 0
      }
      if (tz > 0) {
         var p = text.indexOf(".");
         var add = tz;
         if (p == -1)
            text += ".";
         else
            add = tz - (text.length - p - 1);
         if (add > 0)
            text += String("000000000000000000").substr(0, add);
      }
      return text;
   },


   /*
   If the number of decimal places exceeds, maxDecimalPlaces, rounding is applied
   based on roundMode. May throw an exception.
      value (number) - The number to check. 
   */
   _reviewValue : function (value) {
      value = this.callParent([value]); // may throw an exception
      if (value != null)
         value = this._applyMaxDec(value);  // may throw an exception
      return value;
   },


   /* 
   Support for toValue() method. This is an override from the base class.
   Returns a float or throws an exception.
   */
   _stringToNative : function (text) {
      this._checkNegSymbol(text);   // throw exception if negative is () character.
      if (!this.getAllowGroupSep()) {
         var gSep = this.numberFormat("GroupSep");
         if (gSep && (text.indexOf(gSep) > -1))
            this._inputError("Group separator not allowed.");
      }


      var n = this._parse(text);
      if (isNaN(n))  // while handled in _reviewValue, this ensures child classes don't process the result when NaN
         this._inputError("Cannot convert [" + text + "] to " + this.dataTypeName() + ".");
   /* Caller handles this through _reviewValue()

      if (isNaN(n))
         this._error("Cannot convert [" + text + "]");
      if (n != null)
         n = this._applyMaxDec(n);

      this._checkAllowNegatives(n);
   */
      return n;
   },


/*
Parses the text, looking for a culture specific formatted number (floating point and integer).
If an error occurs, it throws an exception. 
It is very forgiving, to let users make the user typos that are harmless,
such as incorrectly positioned negative, currency, percent, and group symbols.
The caller has already tested for invalidate conditions that 
don't require some level of parsing, like the [allowGroupSep] property
and incorrect usage of parenthesis for negative symbols.
Returns a number or NaN.
*/
   _parse: function( text ) {

      // swap symbol character with "!!". This is never a legal symbol.
      // It becomes a placeholder, used by _checkStrictSymbols.
      // Then its stripped out entirely.
      var sym = this._nf("Symbol");
      if (sym) {
         text = text.replace(sym, "!!");
      }

      text = this._replaceDecSep(text);

      text = this._stripGroupSep(text);

   // replace the decimal symbol with period
      var dSep = this._nf("DecimalSep");
      if (dSep != ".") {
         if (text.indexOf(".") > -1)
            this._inputError("Period character not supported in this culture.");
         text = text.replace(dSep, ".");
      }

      if (this.getStrictSymbols()) {
         var temp = sym ? text.replace("!!", sym) : text;
         this._checkStrictSymbols(temp);
      }

      if (text.indexOf("!!") > -1) {
         text = jTAC.trimStr(text.replace("!!", ""));   // once past _checkStrictSymbols, we don't need the symbol anymore
      }

   // negative symbols just need to be present. Their location does not matter. 
   // If negPattern supports (), the closing paren is not required.
   // If user doesn't like this flexibility, they set [strictSymbols] to true.
      var nSym = this._nf("NegSymbol");
      var neg = (text.indexOf(nSym) > -1) || ((text.indexOf("(") > -1) && this._negPatHasParen());

    // After removing symbols, there may be a space left that separated the symbol from digits.
      text = jTAC.trimStr(text); 

   // ensure we have just digits, period and optionally negative symbol to the left or right of digits
      var re = this._cache.floatCharsRE;
	   if (!re) {
         var nsEsc = jTAC.escapeRE(nSym);
         this._cache.floatCharsRE = re = new RegExp("^([" + nsEsc + "\\(])?\\d+(\\.(\\d*))?([" + nsEsc + "\\)])?$");
      }
      if (!re.test(text))
         this._inputError("Invalid characters found");

      // parseFloat does not handle certain negative patterns. Remove the neg symbols
      if (neg) {
         text = jTAC.trimStr(text.replace(nSym, "").replace("(", "").replace(")", ""));
      }

      var n = parseFloat(text);
      if (isNaN(n)) {
         return n;
      }

      if (neg) {
         n = -n;
      }

      return n;
   },

   /*
     Applies the maxDecimalPlaces property rule to the value.
     Uses the roundMode property to determine what action to take
     when maxDecimalPlaces is exceeded. roundMode can have it throw an exception.
         value (float number) - the number to adjust.
     Returns the adjusted number.
   */
   _applyMaxDec : function (value) {
      var mdp = this.getMaxDecimalPlaces();
      if (mdp)
         return this.round(value, this.getRoundMode(), mdp); // throws exception when roundmode = null and maxDecimalPlaces is exceeded
      return value;
   },


   /* 
      Neutral format is only digits, one period, and optional lead minus character
      The period and trailing digits are optional, but if you have a period
      there must be at least one trailing digit.
   */
   toValueNeutral : function (text) {
      if (text == null)
         return null;
      try
      {
         this._pushContext(null, text);

         if (typeof (text) == "number")
            return this._reviewValue(text);
         if (/^\-?\d+(\.\d+)?$/.test(text))
            return parseFloat(text);
         this._inputError("Required format: [-]digits[.digits]");
      }
      finally {
         this._popContext();
      }
   },

   /* 
      Conversion from native value to culture neutral string. only digits, period, optional lead minus character
   */
   toStringNeutral : function (val) {
      if (val == null)
         return "";
      var r = this.callParent([val]);
      if (r.indexOf('.') == -1) {
         r = r + ".0";
      }
      return r;

   },


   /*
   Support for the isValidChar method. This is an override from the base class.
   Creates a regular expression object that allows digits and the thousands separator.
   This class provides digits, decimal separator, negative symbol, and thousands separator.
   Subclasses should override _moreValidChars() to introduce additional characters like 
   the currency symbol.
   */
   _valCharRE : function () {
      var pat = this._nf("NegPattern") || "";
      var ns = ""; // negative symbol.
      if (this.getAllowNegatives()) {
         // always allows negative symbol character, even when en-US doesn't define it.
         // users don't usually type the () characters when they can type a single - character.
         ns = "-";
         if (pat.indexOf("(") > -1)
            ns += "()";
      }
      var sp = pat.indexOf(" ") > -1 ? " " : "";  // has a space in the negative pattern

      var dSep = this.getMaxDecimalPlaces() != 0 ? this._nf("DecimalSep") : "";

      return new RegExp("[\\d" + jTAC.escapeRE(this._nf("GroupSep") + dSep + ns + this._moreValidChars()) + sp + "]");
   },

   /*
     Used by the _valCharRE method to add characters that it doesn't normally add.
   */
   _moreValidChars : function() {
      return "";
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

/*
Ancestor declares the same method. This is intended to override. 
AutoGetSet doesn't create it here because it already exists in the ancestor.
*/
   getMaxDecimalPlaces : function () {
      return this.config.maxDecimalPlaces;
   },

// --- UTILITY METHODS --------------------------------------------

/*
 When acceptPeriodAsDecSep is true, it converts a period decimal separator 
 to the culture's decimal separator.
 Call before cleaning up thousands separators.
   text - original text
 Returns the original or modified text.
*/
   _replaceDecSep: function (text) {
      if (!this.getAcceptPeriodAsDecSep())
         return text;
      var dSep = this._nf("DecimalSep");
      if ((dSep != ".") && (text.indexOf(".") > -1)) { // uses a non-period decimal separator
         // determine if that character is present.
         if (text.indexOf(dSep) == -1) {
            var replace = false;
            var gSep = this._nf("GroupSep");
            // evaluate the group separator. If the culture character is not a period, period is the decimal separator
            if (gSep != ".") {
               replace = true;
            }
            else // is there 0 or 1 group separator
            {
               var vPos1 = text.indexOf(gSep);
               var vPos2 = text.lastIndexOf(gSep);
               if ((vPos1 == -1) || (vPos1 == vPos2))
                  replace = true;
            }
            if (replace)
               text = text.replace(".", dSep);
         }
      }
      return text;
   }

}
jTAC.define("TypeManagers.BaseFloat", jTAC._internal.temp._TypeManagers_BaseFloat);

﻿// jTAC/TypeManagers/Integer.js
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
Additional licensing:
Portions adapted from the commercial product, Peter's Data Entry Suite v5,
a product from Peter L. Blum who is the author of jTAC.
http://www.peterblum.com/des/home.aspx
Used by permission and covered by the same license as above.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.Integer
Extends: TypeManagers.BaseNumber

Purpose:
Supports integer as the native type.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   FillLeadZeros (int) - Provides additional formatting when converting an integer to text
      by adding lead zeros. When > 0, it adds enough lead zeroes to match
      the value of this property. When 0 or null, it is not used.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Integer = {
   extend: "TypeManagers.BaseNumber",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      fillLeadZeros: 0
   },

   configrules: {
      fillLeadZeros : jTAC.checkAsIntOrNull
   },

   dataTypeName : function () {
      return "integer";
   },

   storageTypeName : function () {
      return "integer";
   },

   /* 
   Returns an integer or throws an exception.
   */
   _stringToNative : function (text) {
      if (text == null)
         this._error("Cannot evaluate null value");
      // if there is a decimal point, it is illegal
      if (text.indexOf(this.numberFormat("DecimalSep")) > -1)
         this._error("Cannot evaluate a floating point number.");

      var gSep = this.numberFormat("GroupSep");

      if (!this.getAllowGroupSep() && gSep && (text.indexOf(gSep) > -1))
         this._inputError("Group separator not allowed.");

      var n = this._parse(text);

      if (isNaN(n))  // while handled in _reviewValue, this ensures child classes don't process the result when NaN
         this._inputError("Cannot convert [" + text + "] to " + this.dataTypeName() + ".");
   /* handled by _reviewValue which is called by toValue
      if (isNaN(n))
         this._error("Cannot convert [" + text + "]");
      if (Math.floor(n) != n)
         this._error("Floating point value not allowed");
      this._checkAllowNegatives(n); // may throw an exception
   */
      return n;
   },

/*
Parses the text, looking for a culture specific formatted integer.
If an error occurs, it throws an exception. 
It is very forgiving, to let users make the user typos that are harmless,
such as incorrectly positioned minus symbol.
The caller has already tested for invalidate conditions that 
don't require some level of parsing, like the [allowGroupSep] property
and text that contains a decimal value.
Returns a number or NaN.
*/
   _parse: function (text) {

      text = this._stripGroupSep(text);

      if (this.getStrictSymbols()) {
         this._checkStrictSymbols(text);
      }

      var nSym = this._nf("NegSymbol");
      var neg = text.indexOf(nSym) > -1;

   // ensure we have just digits and optionally negative symbol to the left or right of digits
      var re = this._cache.intCharsRE;
      if (!re) {
         var nsEsc = jTAC.escapeRE(nSym);
         this._cache.intCharsRE = re = new RegExp("^(" + nsEsc + ")?\\d+(" + nsEsc + ")?$");
      }
      if (!re.test(text))
         this._inputError("Illegal character found.");

      if (neg) {   // neg symbol stripped because its location may not be left of the digits.
         text = text.replace(nSym, "");
      }


      var n = parseInt(text, 10);

   // limit the value to Server side Int32 min max range.
      if (!isNaN(n) && (n != null) && ((n > 2147483647) || (n < -2147483648)))
         this._inputError("Exceeds 32 bit integer.");

      if (neg) {
         n = -n;
      }

      return n;
   },

   /*
   Converts the value to a string. If null is passed,
   it returns "". If NaN is passed, it throws an exception.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
   /* handled by _reviewValue which is called by toString
      if (isNaN(value))
         this._error("Cannot pass NaN.");
      if (Math.floor(value) != value)
         this._error("Has decimal point.");
      this._checkAllowNegatives(value);   // may throw an exception
   */
      var s = Math.abs(value).toString();
      if (this.getShowGroupSep())
         s = this._applyGroupSep(s);
      var flz = this.getFillLeadZeros();
      if (flz && (s.length < flz)) {
         e = "0000000000";
         s = e.substr(0, flz - s.length) + s;
      }

      if (value < 0)
         s = this.numberFormat("NegPattern").replace("n", s);
      return s;
   },

   /*
   If the number of decimal places exceeds, maxDecimalPlaces, rounding is applied
   based on roundMode. May throw an exception.
      value (number) - The number to check. 
   */
   _reviewValue : function (value) {
      if (Math.floor(value) != value)
         this._inputError("Has decimal point.");
      return this.callParent([value]);
   },

   /* 
      Neutral format is only digits and optional lead minus character
   */
   toValueNeutral : function (text) {
      if (text == null)
         return null;
      try {
         this._pushContext();

         if (typeof (text) == "number")
            return this._reviewValue(text);
         if (/^\-?\d+$/.test(text))
            return parseInt(text);
         this._inputError("Required format: [-]digits");
      }
      finally {
         this._popContext();
      }
   },


   /*
   Support for the isValidChar method. This is an override from the base class.
   Creates a regular expression object that allows digits and the thousands separator.
   */
   _valCharRE : function () {
      var ts = this.getAllowGroupSep() ? this.numberFormat("GroupSep") : "";   // thousands separator
      var ns = this.getAllowNegatives() ? this.numberFormat("NegSymbol") : ""; // negative symbol
      return new RegExp("[\\d" + jTAC.escapeRE(ts + ns) + "]");
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Integer", jTAC._internal.temp._TypeManagers_Integer);
jTAC.defineAlias("Integer", "TypeManagers.Integer");
jTAC.defineAlias("Integer.Positive", "TypeManagers.Integer", {allowNegatives: false});

﻿// jTAC/TypeManagers/Float.js
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
Class : TypeManger.Float
Extends: TypeManagers.BaseFloat

Purpose:
Supports float as the native type. Use for all decimal numbers
unless they are covered by another TypeManager (like Currency and Percent).

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   NONE

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
One of the Culture engines, such as Culture engine using jTAC_Culture
or Culture engine using jquery-globalize.

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Float = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "float";
   },

   storageTypeName : function () {
      return "float";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Float", jTAC._internal.temp._TypeManagers_Float);
jTAC.defineAlias("Float", "TypeManagers.Float");
jTAC.defineAlias("Float.Positive", "TypeManagers.Float", {allowNegatives: false});
﻿// jTAC/TypeManagers/Currency.js
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
Class : TypeManger.Currency
Extends: TypeManagers.BaseFloat

Purpose:
For decimal values that represent currencies.
Supports float as the native type. Strings are formatted as currencies.
Conversion with jquery-globalize uses Globalize.parseFloat().

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   showCurrencySymbol (bool) - Determines if a string shows the currency symbol. 
      Only used by toString(). Defaults to true.
   allowCurrencySymbol (bool) - Determines if validation reports an error if 
      the currency symbol is found. Defaults to true.
   useDecimalDigits (bool) - Determines if the number of decimal digits
      is constrained to the culture (culture.numberFormat.currency.decimals)
      or the user can add more digits. Defaults to true.
   hideDecimalWhenZero (bool) - Determines a number that has only zeros in the decimal
      section shows the decimal part. For example, when the currency is 12.00, "12" 
      is shown while 12.1 shows "12.10".

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Currency = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      trailingZeroDecimalPlaces: null,   // override ancestor's default of 1

      showCurrencySymbol: true,
      allowCurrencySymbol: true,
      useDecimalDigits: true,
      hideDecimalWhenZero: false
   },

   dataTypeName : function () {
      return "currency";
   },

   storageTypeName : function () {
      return "float";
   },

   /*
   Returns a string converted from the float passed.
   */
   _nativeToString : function (value) {
      var s = this.callParent([value]);
      // at this point, thousands separators, decimal character and negative characters are localized.
      // The currency symbol is always present and represented by the "$" character.

      if (!this.getShowCurrencySymbol()) {  // strip out the $ and optional lead or trailing space
         var re = /\s?\$\s?/;
         s = s.replace(re, "");
      }
      else { // replace the $ character with the culture's currency symbol
         var sym = this._nf("Symbol");
         s = s.replace("$", sym);
      }

      if (this.getHideDecimalWhenZero()) {
         // if the value is an integer (lacks decimal digits), strip trailing digits
         var re = this._cache.checkDecRE;
         if (!re) {
            this._cache.checkDecRE = re = new RegExp(jTAC.escapeRE(this._nf("DecimalSep")) + "0+(?![1-9])"); // zeros until the next character is not a digit or its the end of the string
         }
         s = s.replace(re, "");
      }
      return s;
   },


   /* 
   Support for toValue() method. This is an override from the base class.
   Returns a float or throws an exception.
   */
   _stringToNative : function (text) {
      if (!this.getAllowCurrencySymbol() && (text.indexOf(this._nf("Symbol")) > -1))
         this._inputError("Currency symbol found but not allowed.");
      return this.callParent([text]);
   },

   /*
      Overridden to only apply when useDecimalDigits is true.
   */
   _applyMaxDec : function (value) {
      if (this.getUseDecimalDigits())
         return this.callParent([value]);
      return value;
   },

   /*
     Used by the _valCharRE method to add characters that it doesn't normally add.
   */
   _moreValidChars : function() {
      return this.getAllowCurrencySymbol() ? this._nf("Symbol") : "";
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
      Overrides ancestor to return the currencyFormat("Decimals")
      or the value that the user set for maxDecimalPlaces. 
   */
   getMaxDecimalPlaces : function () {
      if (this.config.maxDecimalPlaces != null)
         return this.config.maxDecimalPlaces;
      return this._nf("Decimals");
   },

   /*
      Overrides ancestor to return the currencyFormat("Decimals")
      or the value that the user set for trailingZeroDecimalPlaces. 
   */
   getTrailingZeroDecimalPlaces : function () {
      if (this.config.trailingZeroDecimalPlaces != null)
         return this.config.trailingZeroDecimalPlaces;
      return this._nf("Decimals");
   },

   // --- UTILITY METHODS ---------------------------------
   /*
   Uses currencyFormat for all rules.
   */
   _nf : function ( rule ) {
      var r = this.currencyFormat(rule);
      if (r === undefined)
         r = this.numberFormat(rule);  // fallback
      return r;
   }

}
jTAC.define("TypeManagers.Currency", jTAC._internal.temp._TypeManagers_Currency);
jTAC.defineAlias("Currency", "TypeManagers.Currency");
jTAC.defineAlias("Currency.Positive", "TypeManagers.Currency", {allowNegatives: false});

﻿// jTAC/TypeManagers/Percent.js
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
Class : TypeManger.Percent
Extends: TypeManagers.BaseFloat

Purpose:
For decimal and integer values representing a percentage.

Use maxDecimalPlaces set to 0 to keep percents as integers.
A value of 1 can mean 100% or 1% based on the usage. Use the oneEqualsOneHundred
to determine which.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   showPercentSymbol (bool) - Determines if a string shows the Percent symbol. 
      Only used by toString(). Defaults to true.
   allowPercentSymbol (bool) - Determines if validation reports an error if 
      the Percent symbol is found. Defaults to true.
   oneEqualsOneHundred (bool) - Determines if the numeric value of 1.0 is shown as 1% or 100%,
      but only when using floating point values. If maxDecimalPlaces = 0,
      it is not used. It defaults to true (convert 1 to 100).

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseNumber
TypeManagers.BaseFloat
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Percent = {
   extend: "TypeManagers.BaseFloat",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      trailingZeroDecimalPlaces: null,   // override ancestor's default of 1

      showPercentSymbol: true,
      allowPercentSymbol: true,
      oneEqualsOneHundred: true
   },

   dataTypeName : function () {
      return "percent";
   },

   storageTypeName : function () {
      return "float";
   },

   /* 
   Support for toValue() method. This is an override from the base class.
   Returns a float or throws an exception.
   */
   _stringToNative : function (text) {
      if (!this.getAllowPercentSymbol() && (text.indexOf(this._nf("Symbol")) > -1))
         this._inputError("Percent symbol found but not allowed.");

      var n = this.callParent([text]);   // throws exceptions if it cannot return a number

      if ((n != null) && this.getOneEqualsOneHundred() && (this.getMaxDecimalPlaces() != 0)) {
         // calculation errors are fixed by rounding
         var ndp = this.numDecPlaces(n);
         n = n / 100;
         ndp = ndp + 2;  // 2 is due to / 100
         n = this.round(n, 2, ndp);
      }

      return n;
   },

   /*
   Returns a string converted from the float passed.
   */
   _nativeToString : function (value) {
      var mdc = this.getMaxDecimalPlaces();
      if (this.getOneEqualsOneHundred() && (mdc != 0)) {
         // calculation errors occur: 1.1 * 100 = 110.000000000000001
         // Fixed by rounding
         var ndp = this.numDecPlaces(value);
         value = 100.0 * value;
         ndp = ndp - 2;  // 2 is due to x 100
         if (ndp < 0)
            ndp = 0;
         value = this.round(value, 2, ndp);
      }

      var s = this.callParent([value]);
      // at this point, thousands separators, decimal character and negative characters are localized.
      // The percent symbol is always present and represented by the "%" character.

      if (!this.getShowPercentSymbol()) { // strip out the % and optional lead or trailing space
         var re = this._cache.stripSymbolRE;
         if (!re) {
            re = this._cache.stripSymbolRE = new RegExp("\\s?%\\s?");
         }
         s = s.replace(re, "");
      }
      else { // replace the % character with the culture's currency symbol
         s = s.replace("%", this._nf("Symbol"));
      }

      return s;
   },


   /*
     Used by the _valCharRE method to add characters that it doesn't normally add.
   */
   _moreValidChars : function(nf) {
      return this.getAllowPercentSymbol() ? this._nf("Symbol") : "";
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
      Overrides ancestor to return percentFormat("Decimals")
      or the value that the user set for trailingZeroDecimalPlaces. 
      Always returns 0 when MaxDecimalPlaces = 0.
   */
   getTrailingZeroDecimalPlaces : function () {
      if (this.getMaxDecimalPlaces() == 0)
         return 0;
      if (this.config.trailingZeroDecimalPlaces != null)
         return this.config.trailingZeroDecimalPlaces;
      return this._nf("Decimals");
   },

   // --- UTILITY METHODS ---------------------------------

   _nf: function(rule) {
      var r = this.percentFormat(rule);
      if (r === undefined)
         r = this.numberFormat(rule);  // fallback
      return r;
   }

}
jTAC.define("TypeManagers.Percent", jTAC._internal.temp._TypeManagers_Percent);
jTAC.defineAlias("Percent", "TypeManagers.Percent");
jTAC.defineAlias("Percent.Positive", "TypeManagers.Percent", {allowNegatives: false});
jTAC.defineAlias("Percent.Integer", "TypeManagers.Percent", {maxDecimalPlaces: 0});
jTAC.defineAlias("Percent.Integer.Positive", "TypeManagers.Percent", {maxDecimalPlaces: 0, allowNegatives: false});

﻿// jTAC/TypeManagers/BaseDatesAndTimes.js
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
Additional licensing:
Portions adapted from the commercial product, Peter's Data Entry Suite v5,
a product from Peter L. Blum who is the author of jTAC.
http://www.peterblum.com/des/home.aspx
Used by permission and covered by the same license as above.
-------------------------------------------------------------
Module: TypeManager objects
Class : TypeManger.BaseDatesAndTimes   ABSTRACT CLASS
Extends: TypeManagers.BaseCulture

Purpose:
Base class for all date and time values.
Supports the javascript Date object. When working with time-only values, 
it supports number types.

Because there are many cases for date and time format entries,
the parser is replaceable. The built in parser for date handles
only the short date pattern (MM/dd/yyyy or MM/dd or MM/yyyy).
The build-in parser for time of day expects any of these patterns:
H:mm, H:mm:ss, hh:mm tt, hh:mm:ss tt.

You can load up another parser file that replaces the
TypeManagers.BaseDatesAndTimes.prototype._parse function.
jTAC includes two:
TypeManagers.PowerDateParser in \TypeManagers\PowerDateParser.js
TypeManagers.PowerTimeParser in \TypeManagers\PowerTimeParser.js

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:

   useUTC (boolean) -
      When true, the Date object is in UTC format. When false, it is in local format.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._TypeManagers_BaseDatesAndTimes = {
   extend: "TypeManagers.BaseCulture",
   "abstract": true,
/*
   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },
*/
   config: {
      useUTC: false
   },


/*
   Expects javascript Date objects.
*/
   nativeTypeName: function () {
      return "object";
   },

/* ABSTRACT METHOD
   Returns true if the class supports dates. 
*/
   supportsDates: function() {
      this.AM();
   },

/* ABSTRACT METHOD
   Returns true if the class supports times. 
*/
   supportsTimes: function() {
      this.AM();
   },

   /*
   Uses the _parse() method.
   Returns a javascript Date object or null when text is "".
   Throws exceptions when conversion is not possible.
   */
   _stringToNative: function ( text ) {
      var neutral = this._parse( text );
      if ( neutral == null )
         this._inputError( "Cannot convert [" + text + "] to " + this.dataTypeName() + "." );

      return this._fromNeutralToDate( neutral );
   },

/* ABSTRACT METHOD
Parses the text, looking for a culture specific formatted date and/or time.
If an error occurs, it throws an exception. It can also return null to let the caller provide a generic error message.
Returns an object with these properties:
   "y": year
   "M": month, 1-12
   "d": day
   "h": hours
   "m": minutes
   "s": seconds
If date is missing, omit y, M, d and the caller will use today's date. 
If time is missing, omit h, m, s and the caller will use 0:0:0.
*/
   _parse: function ( text ) {
      this.AM();
   },

/*
   Creates a string reflecting both date and time parts
   based on the culture's date and time patterns.
      value (date object)
   Return a string. If null is passed, returns "".
*/
   _nativeToString: function ( value ) {
      if ( value == null )
         return "";
      var neutral = this._fromDateToNeutral( value );
      return this._format( neutral );
   },

/* ABSTRACT METHOD
Formatter for the date and/or time data with culture specific date pattern.
   neutral (object) - The properties of this object are: "y", "M", "d", "h", "m", "s".
      Month is 1-12. Day is 1-31.
      Can omit all date or all time elements.
      Use _fromDateToNeutral() to create this object.
Returns the resulting formatted string.
Subclasses should consider calling _formatDate() and/or _formatTime() to do most of the work.
*/
   _format: function( neutral ) {
      this.AM();
   },

/* 
   Uses the toNumber() method to convert Date objects to numbers.
   (Subclasses have different numeric values for Dates, as defined
   by overriding _dateToNumber().)
   Uses the ancestor function to compare numbers.
      val1 - the value to compare on the left side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
      val2 - the value to compare on the right side of the comparison operator.
         If it is a string, it is passed to toValue() first to get it into a native value.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when conversion from strings fails
   or either of the values is null.
*/
   compare: function (val1, val2) {
      if (typeof val1 == "string")
         val1 = this.toValue(val1);  // convert to native type (date or number)
      val1 = this.toNumber(val1);   // convert native type to number
      if (typeof val2 == "string")
         val2 = this.toValue(val2);
      val2 = this.toNumber(val2);

      return this.callParent([val1, val2]);
   },

/*
   While the ancestor class provides a regular expression to parse, dates may include unicode characters
   for the localized day of week and month names. Those are harder to represent in a regex ([A-Za-z]
   only handles the ascii letters). So this gathers all characters from the names that are used
   by the dateFormat's pattern into a string that also contains the date separator,
   space, and digits. It also uses timeFormat to determine if there are any "AM/PM" letters to include.
   Each character is checked against the resulting string.
*/
   isValidChar: function ( chr ) {
      if (!this.callParent([chr])) // tests for illegal parameter. 
         return false;
      var vc = this._cache.validChars;
      if (vc == null) {
         vc = this._cache.validChars = this._valChars();
      }
      return vc.indexOf(chr) > -1;
   },

   /* ABSTRACT METHOD
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
   */
   _valChars: function () {
      this.AM();
   },


/* 
   Neutral format is determined by subclasses.
   This class creates another TypeManager of the same class name
   and uses _setNeutralFormat() to change its properties to generate
   the neutral format. Then it uses its toValue() method to do the work.
*/
   toValueNeutral : function ( text ) {
      if (text == null)
         return null;
      try {
         this._pushContext();
         if (text instanceof Date)
            return this._reviewValue(text);

         return this._getNeutralFormatTM().toValue(text);
      }
      finally {
         this._popContext();
      }
   },


/* 
   Neutral format is determined by subclasses.
   This class creates another TypeManager of the same class name
   and uses _setNeutralFormat() to change its properties to generate
   the neutral format. Then it uses its toString() method to do the work.
*/
   toStringNeutral: function ( val ) {
      if (val == null)
         return "";
      return this._getNeutralFormatTM().toString(val);
   },


/* 
   Used by toValueNeutral() and toStringNeutral() to create a new TypeManager 
   of the same class using culture neutral patterns.
*/
   _getNeutralFormatTM: function() {
      var tm = this._internal.neutralTM;
      if (!tm) {
         tm = this._internal.neutralTM = jTAC.create(this.$fullClassName);
         tm._setNeutralFormat(this);
      }
      return tm;
   },

/* ABSTRACT METHOD
   Used by _getNeutralFormatTM to change this TypeManager's propertise
   so they use the culture neutral date and/or time patterns.
*/
   _setNeutralFormat: function( sourceTM ) {
      this.AM();
   },


/*
   When passing a Date object, it returns a number of seconds,
   using both date and time parts of the Date object.
   When passing a number, it returns that number.
   When passing null, it returns 0.
   Otherwise it returns null.
*/
   toNumber: function ( value ) {
      if (value == null) {
         return 0;
      }
      if (value instanceof Date) {
         return this._dateToNumber(value);
      }
      else if (typeof value == "number")
         return value;
      return null;
   },

/*
Used by toNumber when the value is a Date object to convert
that date object into a number that uniquely represents the date.
This class returns the number of seconds using both date and time parts
of the Date object.
*/
   _dateToNumber: function (date) {
      return Math.floor(date.valueOf() / 1000);
   },


// --- UTILITY METHODS -------------------------------------------------------

/*
   Creates a Date object based on the data of the neutral property. 
   Generally used by the _parse() method to convert the results of parsing.
      neutral (object) - An object with these properties: 
         y - year
         M - month, 1 - 12
         d - day, 1 - 31
         h - hours
         m - minutes
         s - seconds
         Can omit y/M/d for time only and h/m/s for date only.
   Returns a Date reflecing the useUTC property rule. If date was omitted, the current date is used.
   If time was omitted, the time is 0:0:0.
*/
   _fromNeutralToDate: function( neutral ) {
      var r = new Date();  // current date + time in local time. Time will always be replaced. Date only if supplied
      if (neutral.y === undefined) {
         neutral.y = r.getFullYear();
         neutral.M = r.getMonth();
         neutral.d = r.getDate();
      }
      if (neutral.h === undefined) {
         neutral.h = neutral.m = neutral.s = 0;
      }

      if (this.getUseUTC()) {
      // Safari 1-1.2.3 has a severe bug that setUTCFullYear(y, m, d) avoids.
      // In most time zones (GMT + 0000 through GMT + 1200 through GTM - 0800)
      // It returns the wrong values. It often returns one month and one day back
      // This doesn't fix Safari but consistently returns better dates of one day back for those
      // time zones without breaking the US timezones
         r.setUTCFullYear(neutral.y, neutral.M - 1, neutral.d);
         r.setUTCHours(neutral.h, neutral.m, neutral.s, 0);
      }
      else {
         r.setFullYear(neutral.y, neutral.M - 1, neutral.d);
         r.setHours(neutral.h, neutral.m, neutral.s, 0);
      }

      return r;
   },

/*
   Creates a neutral object representing a date's values from a Date object.
   Generally used by the _format() method.
      date (object) - Date object
      content (int) - 0 or null means use both date and time parts; 1 use date; 2 use time.
   Returns an object with these properties:
      y - year
      M - month, 1 - 12
      d - day, 1 - 31
      h - hours
      m - minutes
      s - seconds
   Will omit properties based on the context.
*/
   _fromDateToNeutral: function( date, content ) {
      var r = {};
      var utc = this.getUseUTC();
      if (content != 2) {
         r.y = utc ? date.getUTCFullYear() : date.getFullYear();
         r.M = utc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
         r.d = utc ? date.getUTCDate() : date.getDate();
      }
      if (content != 1) {
         r.h = utc ? date.getUTCHours() : date.getHours();
         r.m = utc ? date.getUTCMinutes() : date.getMinutes();
         r.s = utc ? date.getUTCSeconds() : date.getSeconds();
      }

      return r;
   },


/*
   Used when parsing.
   Creates an array that contains the characters from the match parameter,
   in the order they were found in the pattern. Only one instance of each character is included.
   This is used to determine the order of elements in the pattern.
      isDate (boolean) - When true, use the date pattern. When false, use the time pattern.
      match (string) - The characters to extract, such as "dMy" for dates and "Hhmst" for time.
*/
   _patternOrder: function ( isDate, match ) {
      var r = this._cache.order;
      if (!r) {
         var pat = isDate ? this._datePattern() : this._timePattern();
         r = []; // will be populated with unique characters that are valid from the match
         var inQuote = false;
         for (var i = 0; i < pat.length; i++) {
            var chr = pat.charAt(i);
            if ((match.indexOf(chr) > -1) && (r.indexOf(chr) == -1) && !inQuote) {
               r.push(chr);
            }
            else if (chr == "'") {
               inQuote = !inQuote;
            }
         }  // for
         this._cache.order = r;
      }
      return r;
   },

/*
   Utility used when formatting to replace a symbol in the date or time
   pattern with a number. It adds lead zeros when the number of digits
   of the number is less than the number of symbols.
      chr (string) - A single letter to be found in the text: "M", "d", "h", "m", "s"
      val (int) - The number to replace.
      text (string) - The text to be modified.
   Returns the modified text.
*/
   _replacePart: function( chr, val, text ) {
      var s = val.toString();
      var re = new RegExp("(" + chr + "+)");
      var m = re.exec(text);
      if (!m)
         return text;
      var zeros = m[0].length - s.length;
      if (zeros > 0)
         s = "000000".substr(0, zeros) + s;

      return text.replace(m[0], s);
   },

/*
   When formatting, some patterns have a literal between single or double quotes
   extract that literal and add it in later.
   This extracts all literals and returns both the modified pattern
   and an array of literals.
   Call _restoreLiterals() to reverse this.
   Returns an object with these properties: "pat" (the updated pattern)
   and "lit" : null or an array of strings that are the literals. This array is
   passed to _restoreLiterals().
*/
   _extractLiterals: function ( pat ) {
      var re = /(['"]([^'"]+)['"])/;
      var m, pos,
      lit = null;  // forms an array of literals
      while (m = re.exec(pat)) {
         if ((m[2].charAt(0) != "'") && (m[2].charAt(0) != '"')) {  // ignore those inside quotes. We want inner text
            if (!lit)
               lit = [];
            pos = lit.length;
            lit.push(m[2]); // save the inner content. The quotes must be abandoned 
            pat = pat.replace(m[1], "{" + pos + "}");
         }  // if
      }  // while

      return {pat: pat, lit: lit};
   },

/*
After format() updates all elements of the pattern,
it calls this with the lit array that was returned from _extractLiterals.
This returns updated text, replacing the tokens with the text of the literals.
   text (string) - Text containing tokens made by _extractLiterals
   lit (array of strings, or null)
*/
   _restoreLiterals: function ( text, lit ) {
      if (lit)
         for (var i = 0; i < lit.length; i++)
            text = text.replace("{" + i + "}", lit[i]);
      return text;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseDatesAndTimes", jTAC._internal.temp._TypeManagers_BaseDatesAndTimes);

﻿// jTAC/TypeManagers/BaseDate.js
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
Class : TypeManger.BaseDate               ABSTRACT CLASS
Extends: TypeManagers.BaseDatesAndTimes

Purpose:
Base class for date-only values. Only supports values that are javascript Date objects.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   dateFormat (int) - Determines how to format a string containing a date. 
      The parser will can also use it.
      When using the built-in parser, it ignores this. However,
      the formatter does not. So only set it to something other than 0
      when using the formatter exclusively (such as creating text for a <span> tag).
      Its values:
      0 - Short date pattern with all digits. Ex: dd/MM/yyyy, dd/MM, and MM/yyyy
          This is the only format supported by the built-in parser.
      1 - Short date pattern with abbreviated month name. Ex: dd/MMM/yyyy
      2 - Short date pattern with abbreviated month name. Ex: dd/MMM/yyyy
            Month name is shown in uppercase only. (Its legal to parse it in lowercase.)

      10 - Abbreviated date pattern. Ex: MMM dd, yyyy

      20 - Long date pattern. Ex: MMMM dd, yyyy

      100 - Culture neutral pattern: yyyy'-'MM'-'dd

   twoDigitYear (boolean) -
      When true, two digit years are supported and converted to 4 digit years.
      When false, two digit years are an error.
      It defaults to true.

See also \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseDate = {
   extend: "TypeManagers.BaseDatesAndTimes",
   "abstract": true,

   config: {
      dateFormat: 0,
      twoDigitYear: true
   },

   configrules: {
      dateFormat: {
         values: [0, 1, 2, 10, 20, 100],
         clearCache: true
      }
   },

   storageTypeName : function () {
      return "date";
   },

/* 
   Returns true if the class supports dates. 
*/
   supportsDates: function() {
      return true;
   },

/* 
   Returns true if the class supports times. 
*/
   supportsTimes: function() {
      return false;
   },


/*
   Parses the text, looking for a culture specific formatted date.
   If an error occurs, it throws an exception. 
   Returns an object with properties of "d", "M", and "y".
   d = date 1-31, M = month 1-12 (not 0 to 11), y = year 0 to 9999.
*/
   _parse: function (text) {
      return this._parseDate(text);
   },

/*
   Formatter for the date data based on the dateFormat property
   and culture specific time pattern.
      neutral (object) - The properties of this object are: "y", "M", "d".
         Month is 1-12. Date is 1-31.
         All must be included.
         This object can be created with _fromDateToNeutral().

   Returns the resulting formatted string.
*/
   _format: function(neutral) {
      return this._formatDate(neutral);
   },


/*
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
*/
   _valChars: function () {
      var pat = "",
      has = new Array(),  // add the names extracted from the pat so they don't get added twice
      r = "1234567890",
      dSep = this.dateTimeFormat("ShortDateSep"),
      exp = "(d{3,4})|(M{3,4})|('[^']+')|(\\s)|(\\,)|(/)",
      re = new RegExp(exp, "g"), // look for containers of letters
      m, sym, atj,
      temp = this._datePattern();

      if (temp) {
         pat += temp;
         r += dSep;  // always assume short date pattern can be used
      }
   // Combines all names, which means that there will be repeated letters in the result.
   // Its lower cost to make a long string that is searched occassionally in isValidChar
   // than to search for each character found in all names to be sure no dups are added.
      while ((m = re.exec(pat)) != null) {
         sym = m[0];
         if (has.indexOf(sym) == -1) {
            atj = null;   // array to join
            var name = null;
            switch (sym)  {
               case "ddd":
                  name = "DaysAbbr";
                  break;
               case "dddd":
                  name = "Days";
                  break;
               case "MMM":
                  name = "MonthsAbbr";
                  break;
               case "MMMM":
                  name = "Months";
                  break;
               case "/":   // already added
                  break;
               default: // covers space, comma, and literals
                  r += ((sym.indexOf("'") == 0) ? 
                     sym.replace("'", "") : // strip lead/trail quotes
                     sym);
                  break;
            }   // switch
            if (name) {
               atj = this.dateTimeFormat(name);
            }
            if (atj) {
               var t = atj.join("");   // eliminate the separator
               r += t.toLowerCase() + t.toUpperCase();
            }
            has.push(sym);
         }  // if has[sym]
      }  // while

      return r;
   },

/* 
   Neutral format is yyyy-MM-dd.
*/
   _setNeutralFormat: function(sourceTM) {
      this.setDateFormat(100);
      this.setTwoDigitYear(false);
   },

/*
   Returns a number based on the date only part of the Date object.
   Each day adds a value of 1.
*/
   _dateToNumber: function ( date ) {
      return Math.floor(date.valueOf() / 86400000);
   },

/*
   Subclass to return "y", "d", or "M". This value will
   indicate which part of the date pattern to omit.
*/
   _skipDatePart: function() {
      return "";
   },

   _timePattern: function() {
      return "";
   },

/* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
These members are GETTER and SETTER methods associated with properties
of this class.
Not all are defined here. Any that are defined in this.config
can be setup by the autoGet and autoSet capability. If they are, they 
will not appear here.
---------------------------------------------------------------------*/

/*
   dateFormat property: SET function
*/
   setDateFormat: function ( val ) {
      this._defaultSetter("dateFormat", val);
      this._clearCache();
   },

// --- UTILITY METHODS -------------------------------------------------------

/*
   Parser specific to handling dates.
   This class ignores only uses the short date pattern. It ignores the dateFormat property, if in a subclass.
   It requires the user to supply all elements of the pattern.
   However, the year can be two or four digits and lead zeroes are optional.
   The pattern string comes from the _datePattern(). Subclasses
   will override that to provide other patterns, like month/year and day/month.

   This method can be replaced by a custom parser by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._parseDate.
      text (string) - The text to parse. An empty string will be considered an invalid entry.

   Returns an object with properties of "d", "M", and "y".
   d = date 1-31, M = month 1-12 (not 0 to 11), y = year 0 to 9999.
   (It lets the caller create the final Date object.)
   Throw exceptions for illegal values found. Can also return null
   to let the caller supply an error.
*/
   _parseDate: function ( text ) {
      var re = this._createDatePatternRE();

      var parts = re.exec(text);
      if (!parts)
         return null;   // let the caller know its just too way out to determine any specific issues.
      var r = {y: 1900, m: 0, d: 1}, // will become the result object. 1900 default for year is because assigning 0 to new Date() results in 1900 anyway
      v,
      order = this._patternOrder(true, "Mdy");
      for (i = 0; i < order.length; i++) {
         r[order[i]] = v = parseInt(parts[i + 1], 10);
         if (!isNaN(v)) {
            switch (order[i]) {
               case 'd':
                  if ((v > 31) || (v == 0)) {
                     v = NaN;
                  }
                  break;

               case 'M':
                  if ((v > 12) || (v == 0)) {
                     v = NaN;
                  }
                  break;

               case 'y':
                  if (v < 100) {
                     if (this.getTwoDigitYear()) {
                        r.y += (2000 + v) < this.dateTimeFormat("TwoDigitYearMax") ? 2000 : 1900;
                     }
                     else
                        this._inputError("Requires 4 digit year");
                  }
                  else if (v > 9999) { // if exceeds limit, error
                     v = NaN;
                  }

                  break;
            }  // switch        
         }
         
         if (isNaN(v))
            this._inputError("Invalid date part: " + order[i]);

      }  // for i
      
      // check if day was higher than last day of the month
      var v = new Date(r.y, r.M - 1, r.d, 0, 0, 0, 0),
      vy = v.getFullYear(),
      vm = v.getMonth();

      if ((vy != r.y) || (vm != (r.M - 1))) {
         this._inputError("Day exceeds month range");
      }
      return r;

   },


/*
   Used by _parseDate to provide a regular expression with 
   up to three groups, each that will contain only digits.
   The regex pattern is based on the date pattern.
*/
   _createDatePatternRE: function() {
      var re = this._cache.shortDateRE;
      if (!re) {
         var pat = this._datePattern();
         pat = jTAC.replaceAll(pat, "'", "");
      // convert pat into a regular expression that 
      // returns up to three groups of digits.
      // It replaces M, d, y characters and separators.
         pat = pat.replace(/d?d/, "(\\d{1,2})"); // replace first because the rest add "d" characters.
         pat = pat.replace(/M?M/, "(\\d{1,2})");
         pat = pat.replace(/y{2,4}/, this.getTwoDigitYear() ? "(\\d{2,4})" : "(\\d{4})");
         pat = jTAC.replaceAll(pat, "/", this.dateTimeFormat("ShortDateSep"), true);

         pat = "^" + pat + "$";
         this._cache.shortDateRE = re = new RegExp(pat);
      }
      return re;
   },

/*
   Formatter for the date based on the pattern passed in.
      neutral (object) - The properties of this object are: "y", "M", "d".
         Month is 1-12.
         All must be included.
         This object can be created with _fromDateToNeutral().
      pat (string) - A date pattern with these special characters:
         "yyyy" - 4 digit year
         "M" and "MM" - month as digits
         "d" and "dd" - day as digits.
         "MMM" - abbreviated month name
         "MMMM" - month name
         "/" - date separator
         If null, _datePattern() is used.

   Returns the resulting formatted string.

   This method can be replaced by a custom formatter by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._formatDate.
*/
   _formatDate: function ( neutral, pat ) {
      var r = pat || this._datePattern();
      var lit = this._extractLiterals(r);
      r = lit.pat;
      r = jTAC.replaceAll(r, "/", this.dateTimeFormat("ShortDateSep"), true);
      r = this._replacePart("d", neutral.d, r);
      r = r.replace("yyyy", neutral.y.toString());
      r = r.replace("yy", String(neutral.y % 100));
      if (r.indexOf("MMMM") > -1) {
         var name = this.dateTimeFormat("Months")[neutral.M - 1];
         r = r.replace("MMMM", name);
      }
      else if (r.indexOf("MMM") > -1) {
         var name = this.dateTimeFormat("MonthsAbbr")[neutral.M - 1];
         if (this.getDateFormat() == 2)
            name = name.toUpperCase();
         r = r.replace("MMM", name);
      }
      else {
         r = this._replacePart("M", neutral.M, r);
      }
      return this._restoreLiterals(r, lit.lit);
   },

/*
   Gets the culture specific date pattern requested by the user.
   A date pattern has these special characters:
      "yyyy" - 4 digit year
      "M" and "MM" - month as digits
      "d" and "dd" - day as digits.
      "MMM" - abbreviated month name
      "MMMM" - month name
      "/" - date separator
   This class uses [dateFormat] to select a pattern.
   Subclasses for MonthYear and DayMonth types will override.
   Return "" if date patterns are not supported.
*/
   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortDatePattern";
            break;
         case 1:
         case 2:
            name = "ShortDatePatternMN";
            break;
         case 10:
            name = "AbbrDatePattern";
            break;
         case 20:
            name = "LongDatePattern";
            break;
         case 100:
            return "yyyy'-'MM'-'dd";   // culture neutral
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   }

}
jTAC.define("TypeManagers.BaseDate", jTAC._internal.temp._TypeManagers_BaseDate);

﻿// jTAC/TypeManagers/Date.js
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
Class : TypeManger.Date
Extends: TypeManagers.BaseDate

Purpose:
For date-only values. Only supports values that are javascript Date objects.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Date = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },
   dataTypeName : function () {
      return "date";
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Date", jTAC._internal.temp._TypeManagers_Date);

jTAC.defineAlias("Date", "TypeManagers.Date");  
jTAC.defineAlias("Date.Short", "TypeManagers.Date");  
jTAC.defineAlias("Date.Abbrev", "TypeManagers.Date", {dateFormat: 10}); 
jTAC.defineAlias("Date.Long", "TypeManagers.Date", {dateFormat: 20});
﻿// jTAC/TypeManagers/BaseTime.js
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
Class : TypeManger.BaseTime   ABSTRACT CLASS
Extends: TypeManagers.BaseDatesAndTimes

Purpose:
Base class for time-only values. Supports both javascript date objects
and numbers depending on the valueAsNumber property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   timeFormat (int) - Determines how to setup the time pattern.
      It is also used to format a string.
      Its values:
      0 - Includes seconds. Uses culture's choice of 12/24 hr format.
         Ex: hh:mm:ss tt; HH:mm:ss
      1 - Omits seconds. Uses culture's choice of 12/24 hr format.
         Ex: hh:mm tt; HH:mm
      2 - Same as 0 except it omits seconds when they are 0 (while formatting a string).

      10 - Duration includes seconds. A duration is always using the 24 hour clock format.
         When using a number to hold the value, it supports hours higher than 24.
      11 - Duration omits seconds.
      12 - Same as 0 except it omits seconds when they are 0.
      100 - Culture neutral pattern: H:mm:ss
      101 - Culture neutral pattern without seconds: H:mm

   timeOneEqualsSeconds (int) - Used when the value is a number representing only time.
      Determines how many seconds is respresented by a value of 1.
      For 1 hour, use 3600. For 1 minute, use 60. For 1 second, use 1.

   valueAsNumber (boolean) - When true, it works with  number types.
      When false, it works with Date objects. It defaults to false.

   parseStrict (boolean) -
      When this is false, the parseTime() parser lets you omit or incorrectly 
      position the AM/PM designator.
      When true, it requires the AM/PM designator if its part of the time pattern,
      and it must be in the same location as that pattern.
      It defaults to false.

   parseTimeRequires (string) -
      When the time pattern has seconds,
      set this to "s" to require seconds be entered.
      When "m", minutes are required but not seconds.
      When "h", only hours are required.
      It defaults to "h".

See \jTAC\TypeManagers\Base.js for the rest.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseTime = {
   extend: "TypeManagers.BaseDatesAndTimes",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
   },

   config: {
      timeFormat: 0,
      timeOneEqualsSeconds: 1,
      valueAsNumber : false,
      parseStrict: false,
      parseTimeRequires: "h"
   },

   configrules: {
      timeFormat: {
         values: [0, 1, 2, 10, 11, 12, 100, 101],
         clearCache: true
      },
      parseTimeRequires: {
         values: ["h", "m", "s"],
         clearCache: true
      }
   },


   nativeTypeName: function () {
      return this.getValueAsNumber() ? "number" : "object";
   },

   storageTypeName: function () {
      return this.getValueAsNumber() ? "float" : "time";
   },

/* 
   Returns true if the class supports dates. 
*/
   supportsDates: function() {
      return false;
   },

/* ABSTRACT METHOD
   Returns true if the class supports times. 
*/
   supportsTimes: function() {
      return true;
   },


   /*
   A duration format is always a specific pattern: HH:mm:ss (where each number can be one or two characters).
   Returns either a Date object or number, depending on valueAsNumber.
   */
   _stringToNative: function ( text ) {
      var neutral = this._parse(text);
      if (neutral == null)
         this._inputError("Cannot convert [" + text + "] to " + this.dataTypeName() + ".");

      if (this.getValueAsNumber())
         return this._fromNeutralToNumber(neutral);
      if (neutral.h > 23)
         this._inputError("Hours exceeds 23");
      return this._fromNeutralToDate(neutral);
   },

   _nativeToString: function ( value ) {
      if (value == null)
         return "";

      var neutral = (value instanceof Date) ?
         this._fromDateToNeutral(value) :
         this._fromNumberToNeutral(value);

      return this._format(neutral);
   },


/*
Parses the text, looking for a culture specific formatted time.
If an error occurs, it throws an exception. 
Returns an object with properties of "h", "m", and "s".
h = hours 0 to 9999, m = minutes 0 - 59 (not 0 to 11), s = seconds 0 to 59.
*/
   _parse: function ( text ) {
      return this._parseTime(text);
   },

/*
Formatter for the time data based on the timeFormat property
and culture specific time pattern.
   neutral (object) - The properties of this object are: "h", "m", "s".
      All must be included.
Returns the resulting formatted string.
*/
   _format: function( neutral ) {
      return this._formatTime(neutral);
   },


   /*
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
   */
   _valChars: function () {
      var pat = "",
      has = new Array(),  // add the names extracted from the pat so they don't get added twice
      r = "1234567890",
      tSep = this.dateTimeFormat("TimeSep"),
      exp = "(tt)|('[^']+')|(\\s)|(\\:)",
      re = new RegExp(exp, "g"), // look for containers of letters
      m, sym, atj,
      temp = this._timePattern();
      if (temp) {
         pat += temp;
         r += tSep;  // always assume short time pattern can be used
      }

   // Combines all names, which means that there will be repeated letters in the result.
   // Its lower cost to make a long string that is searched occassionally in isValidChar
   // than to search for each character found in all names to be sure no dups are added.
      while ((m = re.exec(pat)) != null) {
         sym = m[0];
         if (has.indexOf(sym) == -1) {
            atj = null;   // array to join
            var name = null;
            switch (sym)  {
               case "tt":
                  var am = this.dateTimeFormat("AM") || "";
                  var pm = this.dateTimeFormat("PM") || "";
                  atj = [am, pm];
                  break;
               case ":":   // already added
                  break;
               default: // covers space, comma, and literals
                  r += ((sym.indexOf("'") == 0) ? 
                     sym.replace("'", "") : // strip lead/trail quotes
                     sym);
                  break;
            }   // switch
            if (name) {
               atj = this.dateTimeFormat(name);
            }
            if (atj) {
               var t = atj.join("");   // eliminate the separator
               r += t.toLowerCase() + t.toUpperCase();
            }
            has.push(sym);
         }  // if has[sym]
      }  // while

      return r;
   },


   /* 
      Conversion from native value to culture neutral string. HH:mm:ss
   */
/* handled in base class
   toStringNeutral: function ( val ) {
      if (val == null)
         return "";
      if (val instanceof Date) {
         return this.callParent([val]);
      }
      else if (typeof val == "number") {
         return this._getNeutralFormatTM().toString(val);
      }
      else
         this._error("Requires a Date object");
   },
*/

/* 
   Neutral format is H:mm:ss (always 24 hour style).
*/
   _setNeutralFormat: function( sourceTM ) {
      this.setTimeFormat(100);
      this.setValueAsNumber(sourceTM.getValueAsNumber());
      this.setTimeOneEqualsSeconds(sourceTM.getTimeOneEqualsSeconds());
      this.setParseTimeRequires("s");
      this.setParseStrict(true);
   },

/*
   Returns the total seconds from the time part of the Date object.
*/
   _dateToNumber: function ( date ) {
      return this._toTimeInSeconds(date, 1);
   },

/*
Indicates if the time value represents a time of day or not (Duration).
When true, it is a time of day. This class returns true.
Durations should return false.
*/
   _isTOD: function() {
      return true;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   timeFormat property: SET function
   Determines how to setup the time pattern.
   It is also used to format a string.
   */
   setTimeFormat: function ( val ) {
      this._defaultSetter("timeFormat", val);
      this._clearCache();
   },

   /*
   timeOneEqualsSeconds property: SET function
   Used when the value is a number representing only time.
   Determines how many seconds is respresented by a value of 1.
   For 1 hour, use 3600. For 1 minute, use 60. For 1 second, use 1 (null also works).
   */
   setTimeOneEqualsSeconds: function ( val ) {
      this._defaultSetter("timeOneEqualsSeconds", val);
      this._clearCache();
   },

   // --- UTILITY METHODS -------------------------------------------------------
/*
   Gets the culture specific time pattern requested by the user.
   A time pattern has these characters:
      "H", "HH" - hours as is.
      "h", "hh" - hours in 12 hour format.
      "m", "mm" - minutes
      "s", "ss" - seconds
      "tt" - AM/PM designator.
      ":" - time separator
   This class uses [timeFormat] to select a pattern.
   When timeFormat is 2 or 12, it will return the long pattern.
   The caller will have to strip the ":ss" part when seconds are zero.
   Return "" if time patterns are not supported.
*/
   _timePattern: function() {
      var name;
      switch (this.getTimeFormat()) {
         case 0:
         case 2:
            name = "LongTimePattern";
            break;
         case 1:
            name = "ShortTimePattern";
            break;
         case 10:
         case 12: 
            name = "LongDurationPattern";
            break;
         case 11:
            name = "ShortDurationPattern";
            break;
         case 100:
            return "HH:mm:ss"; // culture neutral
         case 101:
            return "HH:mm"; // culture neutral
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },


/*
   Parser specific to handling time.
   It requires the user to supply hours, minutes and if part of the pattern,
   the AM/PM descriptor. Seconds are optional.
   When using parseStrict = false (the default), it will disregard 
   the time pattern, assuming it is always hours(sep)minute(sep)seconds. 
   The location of AM/PM designator is ignored too. If its missing, that's fine too.
   If hours are > 12, that is valid when there is no AM/PM designator.
   When using parseStrict = true, the time pattern must be respected,
   except for seconds.

   This method can be replaced by a custom parser by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._parseTime.

   This function should not impose a 24 hour limit on the time,
   because this is used for both time of day and duration.
      text (string) - The text to parse. An empty string will be considered an invalid entry.

   Returns an object with properties of "h", "m", and "s".
   h = hours 0 to 9999, m = minutes 0 - 59 (not 0 to 11), s = seconds 0 to 59.
   (It lets the caller create the final Date object or number.)
   Throw exceptions for illegal values found. Can also return null
   to let the caller supply an error.
*/

   _parseTime: function ( text ) {
      if (this.getParseStrict()) {
         var re = this._strictTimePatternRE();  // there are expression groups for h, m, s, t and one more that starts with the time sep.
         var parts = re.exec(text);
         if (!parts)
            return null;   // let the caller know its just too incorrect to determine any specific issues.
      }

      var vals = [0, 0, 0],
      tSep = this.dateTimeFormat("TimeSep"),
      tod = this._isTOD(),
      isAM = false,
      isPM = false;

      // work with AM/PM designator to set isAM/PM, then strip it out
      if (tod) {
         text = text.toLowerCase(); // so we can find and strip AM PM easily
         var amDes = this.dateTimeFormat("AM") || "",
         pmDes = this.dateTimeFormat("PM") || "";
         if (amDes) {
            isAM = text.indexOf(amDes.toLowerCase()) > -1;    // doesn't compare to the time pattern. Present, missing, right or left doesn't matter.
         }
         if (pmDes) {
            isPM = text.indexOf(pmDes.toLowerCase()) > -1;    // doesn't compare to the time pattern. Present, missing, right or left doesn't matter.
         }
         var des = isPM ? pmDes : amDes;
         text = text.replace(des.toLowerCase(), "");
         text = jTAC.trimStr(text);
      }

      // at this point, there should be only digits and separators
      // if anything else is found, return null
      var re = this._cache.parseTimeRE;
      if (!re) {
      // We assume a fixed order of h:m:s here
         var etsep = jTAC.escapeRE(tSep);
         var tReq = this.getParseTimeRequires();

         var exp = "^(\\d{1,4})" + 
               "(" + etsep + "(\\d{1,2}))" + ((tReq == "h") ? "?" : "");
         if (this._timePattern().indexOf("s") > -1) {
            exp += "(" + etsep + "(\\d{1,2}))" + ((tReq != "s") ? "?" : "");
         }
         exp += "$";

         this._cache.parseTimeRE = re = new RegExp(exp);
      }
      var parts = re.exec(text);
      if (parts == null)
         return null;
      var r = {
         h: parseInt(parts[1], 10),
         m: parts[3] != null ? parseInt(parts[3], 10) : 0,
         s: parts[5] != null ? parseInt(parts[5], 10) : 0
      }

      if (tod) {
         if (isAM || isPM) {
            if (this.getParseStrict()) {
               if ((r.h > 12) || (r.h == 0))
                  this._inputError("Hours conflict with designator.");
            }
            if (r.h < 12 && isPM) {
               r.h = r.h + 12;
            }
            else if (isAM && (r.h == 12)) {
               r.h = 0;
            }
         }
         if (r.h > 23)
            this._inputError("Hours exceeds 24.");
      }
      if (r.m > 59)
         this._inputError("Minutes exceeds 59.");
      if (r.s > 59)
         this._inputError("Seconds exceeds 59.");
      return r;
   },

/*
   Used by _parseDate to provide a regular expression with 
   up to three groups, each that will contain only digits.
   The regex pattern is based on the date pattern.
*/
   _strictTimePatternRE: function() {
      var re = this._cache.strictTimeRE;
      if (!re) {
         var pat = this._timePattern();
         pat = jTAC.replaceAll(pat, "'", "");

         var tReq = this.getParseTimeRequires();
         if (tReq != "s") {
            pat = pat.replace(":ss", "(:ss)?"); // make seconds optional
            if (tReq != "m") {
               if (pat.indexOf("mm") > -1) { // make minutes optional
                  pat = pat.replace(":mm", "(:mm)?");
               }
               else {
                  pat = pat.replace(":m", "(:m)?");
               }
            }
         }

      // convert pat into a regular expression that 
      // returns up to three groups of digits.
      // It replaces h, m, s characters and separators.
         pat = pat.replace(/h{1,4}/i, "(\\d{1,4})"); 
         pat = pat.replace(/m?m/, "(\\d{1,2})");
         pat = pat.replace(/s?s/, "(\\d{1,2})");

         pat = jTAC.replaceAll(pat, ":", jTAC.escapeRE(this.dateTimeFormat("TimeSep")), true);
         pat = pat.replace(" ", "\\s?");

         if (pat.indexOf("t") > -1) {
            var amDes = this.dateTimeFormat("AM");
            var pmDes = this.dateTimeFormat("PM");
            var des = amDes ? "((?:" + jTAC.escapeRE(amDes) + ")|(?:" + jTAC.escapeRE(pmDes) + "))" : "";
            pat = pat.replace(/t?t/, des);
         }

         pat = "^" + pat + "$";
         this._cache.strictTimeRE = re = new RegExp(pat, "i");
      }
      return re;
   },

/*
   Formatter for the time based on the pattern passed in.
      neutral (object) - The properties of this object are: "h", "m", "s".
         All must be included.
         This object can be created with _fromDateToNeutral().

      pat (string) - A time pattern with these special characters.
         "H", "HH" - hours as is.
         "h", "hh" - hours in 12 hour format.
         "m", "mm" - minutes
         "s", "ss" - seconds
         "tt" - AM/PM designator.
         ":" - time separator
         If null, _timePattern() is used.
   Returns the resulting formatted string.

   This method can be replaced by a custom parser by assigning
   your function to TypeManagers.BaseDatesAndTimes.prototype._formatTime.
*/
   _formatTime: function ( neutral, pat ) {
      if (!pat) {
         pat = this._timePattern();
      }
      if (!neutral.s && (this.getTimeFormat() % 10 == 2)) { // strip seconds
         pat = pat.replace(":ss", "").replace(":s", "");
      }

      var r = pat;
      r = jTAC.replaceAll(r, ":", this.dateTimeFormat("TimeSep"), true);
      if (pat.indexOf("h") > -1) {
         var v = neutral.h % 12;
         if (v == 0) {
            v = 12;
         }
         r = this._replacePart("h", v, r);
      }
      else {
         r = this._replacePart("H", neutral.h, r);
      }

      r = this._replacePart("m", neutral.m, r);
      r = this._replacePart("s", neutral.s, r);
      r = r.replace("tt", this.dateTimeFormat(neutral.h > 11 ? "PM" : "AM"));

      return r;
   },


/*
   If valueAsNumber is true, pass the neutral value returned by _parse()
   here to convert it into a number.
      neutral (object) - An object with these properties: 
         h - hours
         m - minutes
         s - seconds
   Returns a number.
*/
   _fromNeutralToNumber: function (neutral) {
      var v = neutral.h * 3600 + neutral.m * 60 + neutral.s;
      var oes = this.getTimeOneEqualsSeconds();
      return (oes > 1) ? v / oes : v;
   },

/*
   If valueAsNumber is true, pass the number to have it converted
   into an object reflecting the time parts.
  
   Returns an object with these properties: 
      h - hours
      m - minutes
      s - seconds
*/
   _fromNumberToNeutral: function (number) {
   // convert the value to seconds
      var oes = this.getTimeOneEqualsSeconds();
      if (oes > 1) {
         number = Math.floor(number * oes);   // strip off decimal after calculation
      }
      return {y: 0, M: 1, d: 1,
         h: Math.floor(number / 3600),
         m: Math.floor((number % 3600) / 60),
         s: Math.floor(number % 60) 
         };
   },

/*
   Used when you need a number reflecting the time portion of a Date object, in seconds.
      date (Date object) - The Date object whose time value will be used.
      oneEqualsSeconds (int) - Determines how many seconds is respresented by a value of 1.
         For 1 hour, use 3600. For 1 minute, use 60. For 1 second, use 1 (null also works).
         Usually pass the timeOneEqualsSeconds property value.
   Returns the string. Respects the useUTC property.
*/
   _toTimeInSeconds: function ( date, oneEqualsSeconds ) {
      var s = this.getUseUTC() ? 
         date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds() :
         date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      if (oneEqualsSeconds > 1) {
         return s / oneEqualsSeconds;
      }
      return s;
   }

}
jTAC.define("TypeManagers.BaseTime", jTAC._internal.temp._TypeManagers_BaseTime);

﻿// jTAC/TypeManagers/TimeOfDay.js
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
Class : TypeManger.TimeOfDay
Extends: TypeManagers.BaseTime

Purpose:
For time-only values which represent the time of day. Supports both javascript Date objects
and numbers depending on the valueAsNumber property.
Enforces a maximum of 24 hours.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseTime
globalize.js from jquery-globalize: https://github.com/jquery/globalize

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_TimeOfDay = {
   extend: "TypeManagers.BaseTime",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "timeofday";
   },

   /*
   Overridden.
   Ensures hours is 0 to 23 hours.
   */
   _reviewValue : function (value) {
      value = this.callParent([value]);
      if (typeof (value) == "number") {
         var n = value;
         var oneEquals = this.getTimeOneEqualsSeconds();
         if (oneEquals > 1) {
            n = n * oneEquals;
         }
         if (Math.floor(n / 3600) >= 24)
            this._inputError("Exceeds 24 hours");
      }
      return value;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.TimeOfDay", jTAC._internal.temp._TypeManagers_TimeOfDay);

jTAC.defineAlias("TimeOfDay", "TypeManagers.TimeOfDay");
jTAC.defineAlias("TimeOfDay.NoSeconds", "TypeManagers.TimeOfDay", {timeFormat: 1});
jTAC.defineAlias("TimeOfDay.NoZeroSeconds", "TypeManagers.TimeOfDay", {timeFormat: 2});

jTAC.defineAlias("TimeOfDay.InSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true}); 
jTAC.defineAlias("TimeOfDay.InHours", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600}); 
jTAC.defineAlias("TimeOfDay.InSeconds.NoSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeFormat: 1}); 
jTAC.defineAlias("TimeOfDay.InHours.NoSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 1}); 
jTAC.defineAlias("TimeOfDay.InSeconds.NoZeroSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeFormat: 2}); 
jTAC.defineAlias("TimeOfDay.InHours.NoZeroSeconds", "TypeManagers.TimeOfDay", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 2}); 
﻿// jTAC/TypeManagers/DateTime.js
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
Class : TypeManger.DateTime
Extends: TypeManagers.BaseDatesAndTimes

Purpose:
Class for using both date and time elements of the javascript Date object.
While this class supports time values, it does not support a value of type number,
unlike TypeManagers.TimeOfDay. It only supports values of type Date object.

This class utilitizes the TypeManagers.Date and TypeManagers.TimeOfDay classes
to do most of the work. It exposes them through the [dateOptions] and [timeOptions]
properties. The user sets properties on these objects to determine parsing
and formatting rules.
TypeManagers.DateTime knows how to redirect all key methods (toString, toValue, etc)
to both TypeManagers.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   dateOptions (TypeManager.Date) - 
      The TypeManagers.Date object where all date parsing and formatting is handled.
      Set its properties to customize its parsing and formatting behaviors.
      You can set this property to an object hosting the same-named properties
      as on the TypeManagers.Date object. It will copy those property values
      onto the existing TypeManagers.Date object.
      You can also set this to an instance of TypeManagers.Date.
      It creates the TypeManagers.Date object by default.

   timeOptions (TypeManager.TimeOfDay) - 
      The TypeManagers.TimeOfDay object where all time of day parsing and formatting is handled.
      Set its properties to customize its parsing and formatting behaviors.
      You can set this property to an object hosting the same-named properties
      as on the TypeManagers.TimeOfDay object. It will copy those property values
      onto the existing TypeManagers.TimeOfDay object.
      You can also set this to an instance of TypeManagers.TimeOfDay.
      It creates the TypeManagers.TimeOfDay object by default.

   timeRequired (boolean)
      Determines if only the date is supplied, is the value valid,
      where the time is 0:0:0. When true, the time is required
      and an error is reported. When false, time is considered 0:0:0.
      It defaults to true.

See \jTAC\TypeManagers\BaseDatesAndTimes.js for others.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate,
TypeManagers.Date,
TypeManagers.BaseTime,
TypeManagers.TimeOfDay

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_DateTime = {
   extend: "TypeManagers.BaseDatesAndTimes",
   require: ["TypeManagers.Date", "TypeManagers.TimeOfDay"],

   config: {
      dateOptions: null, // will automatically create a TypeManagers.Date object
      timeOptions: null, // will automatically create a TypeManagers.TimeOfDay object
      timeRequired: true
   },

   dataTypeName : function () {
      return "datetime";
   },

   storageTypeName : function () {
      return "datetime";
   },

   supportsDates: function() {
      return true;
   },

   supportsTimes: function() {
      return true;
   },

/*
   Parses the text, looking for a culture specific formatted date and time.
   If an error occurs, it throws an exception. 
   Returns an object with properties of "d", "M", "y", "h", "m", "s".
   d = date 1-31, M = month 1-12 (not 0 to 11), y = year 0 to 9999.
*/
   _parse: function ( text ) {
      var date, time,
      parts = this._dateTimeSplitter(text);

      date = this.getDateOptions()._parse(parts.d);
      if (!date)
         return null;   // date is required
      time = this.getTimeOptions()._parse(parts.t);
      if (!time) {
         if (this.getTimeRequired())
            this._inputError("Time required.");
         time = {h: 0, m: 0, s: 0};
      }
      date.h = time.h;
      date.m = time.m;
      date.s = time.s;
         
      return date;
   },

/*
Used by _parse() to return two strings based on text,
the date part and the time part. Each will be passed to
date and time specific parsers by the caller.
The return value is an object with "d" and "t" properties,
each containing a string or null if not used.
*/
   _dateTimeSplitter: function( text ) {
      var df = this.getDateOptions().getDateFormat();
      if ((df < 10) || (df == 100)) {  // short date pattern lacks spaces. The two parts are separated by a space.
         var pos = text.indexOf(" ");
         if (pos == -1) {
            return {d: text, t: null};
         }
         return {d: text.substr(0, pos), t: text.substr(pos + 1) };
      }
      else {
   // always uses the time pattern, which is pretty stable, to identify the time part.
   // This limits the flexibility, as it depends on having at least one time separator
         var tm = this.getTimeOptions();
         var re = this._cache.timeFindRE;
         if (!re) {
            var tPat = tm.dateTimeFormat("LongTimePattern"); // need to determine which side of hours "tt" is on
            var tSep = jTAC.escapeRE(tm.dateTimeFormat("TimeSep"));
            var pos = tPat.indexOf("t");
            var rePat = "\\d?\\d" + tSep + "\\d?\\d(" + tSep + "\\d?\\d)?";
            if (pos > -1) {
               var am = tm.dateTimeFormat("AM") || "";
               var pm = tm.dateTimeFormat("PM") || "";
               if (am) {
                  var des = "((" + am + ")|(" + pm + "))";
                  rePat = pos < tPat.indexOf("h") ?
                     des + "\\s?" + rePat :
                     rePat + "\\s?" + des;
               }
            }
            re = this._cache.timeFindRE = new RegExp(rePat, "i");
         }
         var m = re.exec(text);
         if (!m)
            return {d: text, t: null};
         return {d: text.replace(m[0], ""), t: m[0]};
      }
   },


/*
   Formatter for the datetime data based on the formatting 
   and culture specific date pattern of [dateOptions] and [timeOptions].
      data (object) - The properties of this object are: "y", "M", "d", "h", "m", "s".
         Month is 1-12.
         All must be included.
   Returns the resulting formatted string.
*/
   _format: function( data ) {
      var dText = this.getDateOptions()._format(data);
      var tText = this.getTimeOptions()._format(data);

      if (dText) {
         if (tText) {
            return dText + " " + tText;
         }
         else
            return dText;
      }
      else
         return tText;
   },

   /* 
   Used by isValidChar to create a string of all valid characters.
   This class handles most cases for both date and time.
   */
   _valChars: function () {
      return this.getDateOptions()._valChars() + this.getTimeOptions()._valChars() + " ";
   },


/* 
   Neutral format is yyyy-MM-dd H:mm:ss (24 hour format)
*/
   _setNeutralFormat: function(sourceTM) {
      this.getDateOptions()._setNeutralFormat(sourceTM.getDateOptions());
      this.getTimeOptions()._setNeutralFormat(sourceTM.getTimeOptions());
   },


/* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
These members are GETTER and SETTER methods associated with properties
of this class.
Not all are defined here. Any that are defined in this.config
can be setup by the autoGet and autoSet capability. If they are, they 
will not appear here.
---------------------------------------------------------------------*/

/*
   Creates the default if not assigned.
*/
   getDateOptions: function() {
      var val = this.config.dateOptions;
      if (!this.config.dateOptions) {
         val = this.config.dateOptions =  jTAC.create("TypeManagers.Date");
         this._registerChild(val);
      }
      return val;
   },

/*
Can only assign an object whose properties will be copied onto 
the same named properties of the dateOptions.
It can be an actual TypeManagers.Date object, which will be directly assigned.
*/
   setDateOptions: function (val) {
      if ((val == null) || (typeof val != "object"))
         this._error("Must pass an object whose properties match those on the dateOptions property.");
      if (val instanceof jTAC.TypeManagers.Date) {
         this._registerChild(val);
         this.config.dateOptions = val;
      }

      else {
         var parser = this.getDateOptions();
         for (var name in parser.config)
         {
            if (val[name] != undefined)
               parser.config[name] = val[name];
         }
      }
   },

/*
   Creates the default if not assigned.
*/
   getTimeOptions: function() {
      var val = this.config.timeOptions;
      if (!this.config.timeOptions) {
         val = this.config.timeOptions =  jTAC.create("TypeManagers.TimeOfDay");
         this._registerChild(val);
      }
      return val;
   },

/*
Can only assign an object whose properties will be copied onto 
the same named properties of the timeOptions.
It can be an actual TypeManagers.Time object, which will be directly assigned.
*/
   setTimeOptions: function ( val ) {
      if ((val == null) || (typeof val != "object"))
         this._error("Must pass an object whose properties match those on the timeOptions property.");
      if (val instanceof jTAC.TypeManagers.TimeOfDay) {
         this._registerChild(val);
         this.config.timeOptions = val;
      }

      else {
         var parser = this.getTimeOptions();
         for (var name in parser.config)
         {
            if (val[name] != undefined)
               parser.config[name] = val[name];
         }
      }
   },

   setCultureName: function( val ) {
      this.callParent([val]);
      this.getDateOptions().setCultureName(val);
      this.getTimeOptions().setCultureName(val);
   }



}
jTAC.define("TypeManagers.DateTime", jTAC._internal.temp._TypeManagers_DateTime);

jTAC.defineAlias("DateTime", "TypeManagers.DateTime");  
jTAC.defineAlias("DateTime.Short", "TypeManagers.DateTime");  
jTAC.defineAlias("DateTime.Short.NoSeconds", "TypeManagers.DateTime", {timeOptions: {timeFormat: 1}});  
jTAC.defineAlias("DateTime.Abbrev", "TypeManagers.DateTime", {dateOptions: {dateFormat: 10}}); 
jTAC.defineAlias("DateTime.Long", "TypeManagers.DateTime", {dateOptions: {dateFormat: 20}});
﻿// jTAC/TypeManagers/Duration.js
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
Class : TypeManger.Duration
Extends: TypeManagers.BaseTime

Purpose:
For time-only values which represent the time of day. Supports both javascript Date objects
and numbers depending on the valueAsNumber property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   maxHours (int) - The upper limit for number of hours allowed. Defaults to 9999.
See also \jTAC\TypeManagers\BaseDatesAndTimes.js 

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseTime

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Duration = {
   extend: "TypeManagers.BaseTime",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      timeFormat: 10, // override the default
      maxHours: 9999
   },

   configrules: {
      timeFormat: [10, 11, 12, 100, 101]
   },

   dataTypeName: function () {
      return "duration";
   },

   /*
   Overridden.
   Ensures hours conforms to maxHours.
   */
   _reviewValue: function (value) {
      if (value instanceof Date) {
         if (value.getHours() > this.getMaxHours())
            this._inputError("Exceeded the max hours limit.");
      }
      else if (typeof (value) == "number") {
         var n = value;
         var oneEquals = this.getTimeOneEqualsSeconds();
         if (oneEquals > 1) {
            n = n * oneEquals;
         }

         if (Math.floor(n / 3600) > this.getMaxHours())
            this._inputError("Exceeded the max hours limit.");
      }
      else if (value != null)
         this._error("Value's type is not supported");
      return value;
   },

   _isTOD: function() {
      return false;
   },

/*
   Culture neutral formats for duration use 4 digit hours
   because one goal of this format is to provide sortable strings.
*/
   _timePattern: function() {
      switch (this.getTimeFormat()) {
         case 100:
            return "HHHH:mm:ss"; // culture neutral
         case 101:
            return "HHHH:mm"; // culture neutral
         default:
            return this.callParent();
      }  // switch
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Duration", jTAC._internal.temp._TypeManagers_Duration);

jTAC.defineAlias("Duration", "TypeManagers.Duration");
jTAC.defineAlias("Duration.NoSeconds", "TypeManagers.Duration", {timeFormat: 11});
jTAC.defineAlias("Duration.NoZeroSeconds", "TypeManagers.Duration", {timeFormat: 12});

jTAC.defineAlias("Duration.InSeconds", "TypeManagers.Duration", {valueAsNumber: true}); 
jTAC.defineAlias("Duration.InHours", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600}); 
jTAC.defineAlias("Duration.InSeconds.NoSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeFormat: 11}); 
jTAC.defineAlias("Duration.InHours.NoSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 11}); 
jTAC.defineAlias("Duration.InSeconds.NoZeroSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeFormat: 12}); 
jTAC.defineAlias("Duration.InHours.NoZeroSeconds", "TypeManagers.Duration", {valueAsNumber: true, timeOneEqualsSeconds: 3600, timeFormat: 12}); 


﻿// jTAC/TypeManagers/MonthYear.js
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
Class : TypeManger.MonthYear
Extends: TypeManagers.BaseDate

Purpose:
For date-only values where just the month and year are used. 
Only supports values that are javascript Date objects.
String patterns should only include the "M" and "y" symbols.
jquery-Globalize's culture.calendar.patterns provides the localized format
in its "Y" property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate
----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_MonthYear = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   dataTypeName : function () {
      return "monthyear";
   },


/*
   Returns the number of months since year 0.
*/
   _dateToNumber : function (date) {
      return this.getUseUTC() ?
         date.getUTCFullYear() * 12 + date.getUTCMonth() :
         date.getFullYear() * 12 + date.getMonth();
   },


   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortMonthYearPattern";
            break;
         case 1:
         case 2:
            name = "ShortMonthYearPatternMN";
            break;
         case 10:
            name = "AbbrMonthYearPattern";
            break;
         case 20:
            name = "LongMonthYearPattern";
            break;
         case 100:
            return "yyyy-MM";
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },

   _skipDatePart: function() {
      return "d";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


}
jTAC.define("TypeManagers.MonthYear", jTAC._internal.temp._TypeManagers_MonthYear);

jTAC.defineAlias("MonthYear", "TypeManagers.MonthYear");  
jTAC.defineAlias("MonthYear.Short", "TypeManagers.MonthYear");  
jTAC.defineAlias("MonthYear.Abbrev", "TypeManagers.MonthYear", {dateFormat: 10}); 
jTAC.defineAlias("MonthYear.Long", "TypeManagers.MonthYear", {dateFormat: 20});
﻿// jTAC/TypeManagers/DayMonth.js
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
Class : TypeManger.DayMonth
Extends: TypeManagers.BaseDate

Purpose:
For date-only values where just the day and month are used, such
as a birthday or anniversary.
Only supports values that are javascript date objects.
String patterns should only include the "M" and "d" symbols.
jquery-Globalize's culture.calendar.patterns provides the localized format
in its "M" property.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
See \jTAC\TypeManagers\BaseDatesAndTimes.js.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseCulture
TypeManagers.BaseDatesAndTimes
TypeManagers.BaseDate

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_DayMonth = {
   extend: "TypeManagers.BaseDate",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
   },

   configrules: {
   },

   dataTypeName : function () {
      return "daymonth";
   },

/*
   Returns the number of days into the year 2012 (which was chosen because its a leap year).
*/
   _dateToNumber : function (date) {
      var date = this.getUseUTC() ? // create a local date using the year 2012
         new Date(2012, date.getUTCMonth(), date.getUTCDate()) :
         new Date(2012, date.getMonth(), date.getDate());
      return this.callParent([date]);
   },


   _datePattern: function() {
      var name;
      switch (this.getDateFormat()) {
         case 0:
            name = "ShortMonthDayPattern";
            break;
         case 1:
         case 2:
            name = "ShortMonthDayPatternMN";
            break;
         case 10:
            name = "AbbrMonthDayPattern";
            break;
         case 20:
            name = "LongMonthDayPattern";
            break;
         case 100:
            return "MM-dd";
         default:
            return "";
      }  // switch
      return this.dateTimeFormat(name);
   },

   _skipDatePart: function() {
      return "y";
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/


}
jTAC.define("TypeManagers.DayMonth", jTAC._internal.temp._TypeManagers_DayMonth);

jTAC.defineAlias("DayMonth", "TypeManagers.DayMonth");  
jTAC.defineAlias("DayMonth.Short", "TypeManagers.DayMonth");  
jTAC.defineAlias("DayMonth.Abbrev", "TypeManagers.DayMonth", {dateFormat: 10}); 
jTAC.defineAlias("DayMonth.Long", "TypeManagers.DayMonth", {dateFormat: 20});
﻿// jTAC/TypeManagers/BaseString.js
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
Class : TypeManger.BaseString    ABSTRACT CLASS
Extends: TypeManagers.Base

Purpose:
Base class for any types that use a string to host its data.

The toNumber() function always returns null.
Subclasses can override isCaseIns() function to determine if 
compare() uses case sensitive or insensitive matches.

There is no localization built into this class.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseString = {
   extend: "TypeManagers.Base",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   nativeTypeName : function () {
      return "string";
   },

   storageTypeName : function () {
      return "string";
   },

   /*
   Converts non strings to strings first before letting _stringToNative 
   do further processing. Validation occurs last, with _reviewValue.
   */
   toValue : function (text) {
      if (text == null)
         return "";
      if (typeof (text) != "string") {
         text = text.toString();
      }
      var v = this._stringToNative(text);
      return this._reviewValue(v);  // may throw exception
   },


   /* 
   Convert from a native value to a string, applying globalization
   rules for the culture defined in the cultureName property.
     value - the native value to convert. Its type must be supported by 
             the subclass implementing this method or it should throw an exception. 
             You can also pass a string in a format compatible with a default formatting
             rule known to the jquery-globalize. That string will be converted
             first to the native type through toValue(). Then converted back to a string
             using the format parameter (or defaultFormat property).
   Returns: string. If the value represents nothing or is null, this will return
   the empty string.
   Exceptions: Throws exceptions when conversion cannot happen
   such as when the format is not appropriate for the data type being converted.
   SUBCLASSING: Override _nativeToString method to do the actual
   conversion.
   */
   toString : function (value) {

      if (value == null)
         return "";
      if (typeof (value) != "string") {
         value = value.toString();
      }

      value = this._reviewValue(value);   // may throw exceptions

      return this._nativeToString(value);
   },

   /* 
    Returns the same value. If value is not a string, it is converted to a string
    using the javascript toString() method. If the value is null, this returns null.
   */
   _nativeToString : function (value) {
      if (value == null)
         return "";
      return value.toString();
   },


   /*
    Returns the same value passed in.
   */
   _stringToNative : function (text) {
      return text;
   },

   /*
   Returns true if the value represents null.
   This method allows null. if emptyStrFalse is false
   the empty string also means null.
   */
   _isNull : function (val) {
      if (val == "")
         return true;
      return val == null;
   },

   /* 
   Compare two strings, applying case insensitive matching if _isCaseIns() is true.
      val1 - the value to compare on the left side of the comparison operator.
      val2 - the value to compare on the right side of the comparison operator.
   Returns: -1 when val1 < val2; 0 when val1 = val2; 1 when val1 > val2.
   Exceptions: Throws exceptions when either of the values is null.
   */
   compare : function (val1, val2) {
      val1 = this.toValue(val1); // ensures it is a string
      val2 = this.toValue(val2);
      if ((val1 == null) || (val2 == null))
         this._error("Parameter value was null.");
      if (this._isCaseIns()) {
         val1 = val1.toLowerCase();
         val2 = val2.toLowerCase();
      }
      if (val1 < val2)
         return -1;
      else if (val1 > val2)
         return 1;
      return 0;
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return false;
   },


   /* 
      Returns the original text.
   */
   toValueNeutral : function (text) {
      return text;
   },


   /* 
      Returns the original value, converted to string if needed.
   */
   toStringNeutral : function (val) {
      return this.toString(val);
   },


   /*
   Always returns true
   */
   isValidChar : function (chr) {
      return true;
   },

   /*
   Returns null. (not used)
   */
   toNumber : function (value) {
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
jTAC.define("TypeManagers.BaseString", jTAC._internal.temp._TypeManagers_BaseString);

﻿// jTAC/TypeManagers/BaseStrongPatternString.js
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
Class : TypeManger.BaseStrongPatternString   ABSTRACT CLASS
Extends: TypeManagers.BaseString

Purpose:
Base class for any string that is evaluated against a regular expression
to validate it.

Override these methods:
_regExp() - Returns an instance of the javascript RegExp object used to evaluate
   the string. Always ensure that it evaluates the full string by using the 
   ^ and $ symbols in the regexp pattern.  
dataTypeName() - Return the type name.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   altREPattern (string) - 
      Allows overriding the predefined regular expression pattern
      in case you have a different idea of the appropriate regular expression.
      If set, the _regExp() function is not used to create this. Instead,
      this and the _isCaseIns() are used.
      A good way to override this globally is to add a script that
      sets this in the prototype of the class you are modifying:
      TypeManagers.classname.prototype._REPattern = "pattern";


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseStrongPatternString = {
   extend: "TypeManagers.BaseString",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      altREPattern : ""
   },

   configrules: {
   },

/*
Checks the string against the regular expression. Throws
exception if there is no match. Otherwise, it returns the same text
*/
   _reviewValue : function(value) {
      var text = this.callParent([value]);
      if (text == "") {
         return text;
      }
      var re;
      if (this.getAltREPattern()) {
         re = new RegExp(this.getAltREPattern(), this._isCaseIns() ? "i" : "");
      }
      else {
         re = this._regExp();
      }
      if (!re || re.test(text)) {
         return text;
      }
      this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");
   },

/* ABSTRACT METHOD
Returns an instance of the javascript RegExp object used to evaluate
   the string. Always ensure that it evaluates the full string by using the 
   ^ and $ symbols in the regexp pattern.   
*/
   _regExp : function() {
      this._AM();
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.BaseStrongPatternString", jTAC._internal.temp._TypeManagers_BaseStrongPatternString);

﻿// jTAC/TypeManagers/BaseRegionString.js
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
Class : TypeManger.BaseRegionString
Extends: TypeManagers.BaseString

Purpose:
Handles characteristics of a data type that varies by the region of the world,
such as phone numbers, postal codes, etc.

Each subclass defines a "RegionsData" object on the window object and overrides
_defaultRegionsData to supply it.
The RegionsData object defines each region as a property name 
and an object with these properties as the value:
   * name (string) - Same name as the property. Lets consumers of this object
      identify it.
   * pattern (string) - The regular expression pattern used
      to validate the entire string passed into the TypeManager (via toValue).
      Patterns must be created within this structure: (^your pattern$).
      This allows for multiple patterns to be merged when the user
      defined a pipe delimited list of region names in the TypeManager's
      'region' property.

      Alternatively, this can be a function that is passed the text
      and returns true if it is valid.
   * caseIns (boolean) - When case insensitivity is required,
      define this with a value of true. Omit or set to false if not needed.
   * validChars (string) - The regular expression pattern used
      to validate a single character as a legal character of the pattern.
      This is used by the isValidChar() function.
   * toNeutral (function) - If you want to pass back to the server
      a string without some of the formatting, define this function.
      It is passed the text and returns the cleaned up text.
      For example, phone number may have everything except digits stripped.
      This value will be used by the toValueNeutral() function and
      is used by the dataTypeEditor widget when you have setup the hidden field
      that hosts a neutral format.
   * toFormat (function) - If you want to apply formatting to a neutral format
      to display it to the user, define a function here. It is passed
      the text to format and returns the formatted text.
      This value is used by toString(). You may need to make it work with 
      already formatted text, such as running it through the toNeutral()
      function first.

The RegionsData object must always have a "defaultName" property whose value is
the name of another property that will be used if the 'region' property
is left unassigned.

Sometimes a few regions use the same patterns. You can create alias properties.
Define the property name for the region and the value as a string with the 
name of the other property that holds an object.

Example RegionsData object:
var jTAC_PhoneNumberRegionsData = 
{
   defaultName: "UnitedStates",

   UnitedStates:
   {
      pattern : "(^([1])?\\s*(\\([2-9]\\d{2}\\))?\\s*\\d{3}[\\s\\-]?\\d{4}$)",
      validChars : "[0-9 \\(\\)\\-]",
      toNeutral : function(text)
         {  
            // strip digits here
            return r;
         }
      toFormat : function(text)
         {
            var r = jTAC_PhoneNumberRegionData.UnitedStates.toNeutral(text);
            // insert separators here.
            return r;
         }
   }
}

This is designed so the user can expand the list of regions, by adding
new properties to the object, and replace elements of an individual RegionsData node if needed.
To add, you can use this:
object["regionname"] = {pattern: value, more properties};
To replace the pattern property:
object["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, existing RegionsData object);

Set up:
Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

You can also define the region globally by passing the region name
to window.jTAC.setGlobalRegionName(name).
Then assign 'region' to "GLOBAL" (all caps) to use its values.
This way, you can build a Country field that when changed, impacts all TypeManagers.
Then all validation will be applied to that region.
When doing this, ENSURE that all patterns objects support the names
you will be used in jTAC.regionName.
REMINDER: Server side validation must know to use the same region name.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   region (string) -
      One of the region names defined in 'regionsdata'.
      If "", it uses patterns.defaultName's value as the region name.
      You can include a mixture of regions by specifying a pipe delimited list
      of region names.
      It defaults to "".
   regionsData (object) - 
      The RegionData object as described above. Each subclass should
      assign a default here by overriding _defaultRegionsData().

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_BaseRegionString = {
   extend: "TypeManagers.BaseString",
   "abstract": true,

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      region: "",
      regionsData: null
   },

   configrules: {
   },

   /* 
   Returns the same value. If value is not a string, it is converted to a string
   using the javascript toString() method. If the value is null, this returns null.
   */
   _nativeToString: function (value) {
      if (value == null)
         return "";
      var text = value.toString();
      if (text == "")
         return "";
      var rd = this._getRegionNode(text);
      if (!rd)
         this._inputError("Invalid " + this.dataTypeName());
      if (rd.toFormat) {
         text = rd.toFormat(text);
      }
      return text;
   },



   _reviewValue: function (text)
   {
      text = this.callParent([text]);
      if (text == "")
         return text;
      var obj = this._getRegionNode(text);
      if (!obj)
         this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");

      return text;
   },

   // Digits and the optional allowSeps value.
   isValidChar: function (chr) {
      if (!this.callParent([chr])) {
         return false;
      }
      var rds = this._selectRegionNodes();
      if (!rds.length) {
         return true;   // no data to validate. So allow all characters
      }
      for (var i = 0; i < rds.length; i++) {
         var rd = rds[i];
         if (!rd.validChar)   // if any have no filtering capability, then all have no filtering capability   
            return true;
         if (typeof rd.validChar == "string") {
            var re = this._cache.validCharRE;
            if (!re)
               re = this._cache = new RegExp(rd.validChar);
            return re.test(chr);
         }
         if (rd.validChar(chr)) {
            return true;
         }
      }  // for
      return false;
   },

   /* 
   Uses the RegionData.toNeutral function if available.
   Otherwise returns the original text.
   Exception: text does not match any validation patterns.
   */
   toValueNeutral: function (text) {
      if (!text) {
         return "";
      }
      try
      {
         this._pushContext();

         var rn = this._getRegionNode(text);
         if (!rn)
            this._inputError("Invalid " + this.dataTypeName() + " [" + text + "]");
         if (rn.toNeutral)
            text = rn.toNeutral(text);
         return text;
      }
      finally {
         this._popContext();
      }
   },



   /*
   Returns an array of 0 or more RegionData objects based on the region property.
   The caller will generally go through this to apply each rule.
   */
   _selectRegionNodes: function () {
      function add(n) {
         var names = n.split('|');
         var rd = this.getRegionsData();
         for (var i = 0; i < names.length; i++)
         {
            var rn = rd[names[i]];
            if (!rn)
               this._error("Region [" + names[i] + "] not defined in the regionsData object.");
            if (typeof rn == "string") {
               add.call(this, rn);   //!RECURSION
               continue;
            }
            if (typeof rn == "object") {
               r.push(rn);
            }
            else
               this._error("Region [" + rn + "] definition invalid.");
         }  // for
      }
      var rds = this._internal.rds;
      if (!rds || (this._internal.rdc != jTAC._globalRegionNameCount))
      {
         var name = this.getRegion();
         if (name == "")
            name = this.getRegionsData().defaultName;
         if (name == "GLOBAL")
            name = jTAC._globalRegionName;
         if (!name)
            this._error("Could not identify a region name from the region property.");
         var r = [];
         add.call(this, name);
         rds = this._internal.rds = r;
         this._internal.rdc = jTAC._globalRegionNameCount;
      }
      return rds;
   },


   /* 
   Gets an object from the patterns based on the region name.
   There can be multiple region names. The text parameter is used
   to match to a region's pattern to identify it as the correct object
   to return. If text is "", the first object from the region name list is returned.
   If the text does not match anything, it returns null.
   */
   _getRegionNode: function (text) {
      var regionNodes = this._selectRegionNodes();
      for (var i = 0; i < regionNodes.length; i++) {
         var regionNode = regionNodes[i];
         if (!text)  // no text, return the first
            return regionNode;
         if (typeof regionNode.pattern == "function") { // alternative way to supply the pattern. Function is passed text and returns true if valid.
            if (regionNode.call(this, text))
               return regionNode;
         }
         else {
            var re = new RegExp(this._resolvePattern.call(this, regionNode), regionNode.caseIns ? "i" : "");
            if (re.test(text))
               return regionNode;
         }
      }
      return null;   // not found
   },

   /*
   Gets the regular expression pattern from the region data object passed.
   This gets it from the pattern property.
      rn (object) - A region node object from the regionData.
   */
   _resolvePattern: function (rn) {
      return rn.pattern;
   },

/* ABSTRACT METHOD
Override to supply the RegionData object. 
*/
   _defaultRegionsData: function() {
      this._AM();
   },

   /* STATIC METHOD
   Utility to format text that has none of its formatting characters.
   It replaces elements of the mask parameter that have the "#" character
   with digits from the text and returns the result.
      text (string) - Neutral text. Should be digits. Any existing formatting
         is ignored.
      mask (string) - Pattern of the mask. Digits replace the "#"
         elements either in forward or reverse direction based on dir.
      dir (boolean) - When true, replace from left to right.
         When false, replace from right to left.
      unused (string) - Text to use when there are remaining "#" symbols
         after all of 'text' has been used.
   Returns: formatted text.
   To call this from anywhere, use:
   jTAC.TypeManagers.BaseRegionString.prototype.applyNumberMask(parameters)
   */
   applyNumberMask: function(text, mask, dir, unused) {
      var t = dir ? 0 : text.length - 1;   // current position in text being extracted
      var m = dir ? 0 : mask.length - 1;  // current position in mask being replaced
      var inc = dir ? 1 : -1; // how to increment t and m
      var lt = dir ? text.length : -1; // last position of text + 1
      var lm = dir ? mask.length - 1 : 0; // last position of mask

      var r = ""; // result
   // go through the mask. Add each char to r that is not a "#"
   // When "#", get the next digit from text.
      for (var i = m; dir ? i <= lm : i >= lm; i = i + inc) {
         var chr = mask.charAt(i);
         if (chr == "#") {
            // get the next digit from text.
            // Skip anything in text that is not a digit.
            // If exceeding the number of available text digits, substitute 'unused'.
            do {
               if (t == lt) {
                  chr = unused;
                  break;
               }
               chr = text.charAt(t);
               t = t + inc;
            } while ((chr < "0") || (chr > "9"));

         }
         if (dir) {
            r = r + chr;
         }
         else {
            r = chr + r;
         }
      }  // for

      if (t != lt) {   // have extra characters in text. They need to be included
         for (var i = t; dir ? i < lt : i > lt; i = i + inc) {
            var chr = text.charAt(i);
            if ((chr >= "0") && (chr <= "9")) {
               if (dir) {
                  r = r + chr;
               }
               else {
                  r = chr + r;
               }
            }  // if
         }  // for
      }  // if

      return r;

   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   One of the region names defined in patterns.
   If "", it uses patterns.defaultName's value as the region name.
   You can include a mixture of regions by specifying a pipe delimited list
   of region names.
   If "GLOBAL", it uses the value set by jTAC.setGlobalRegionName().
   It defaults to "".
   */
   setRegion: function (val)
   {
      this.config.region = jTAC.checkAsStr(val);
      this._internal.rds = null; // clear cached region array
   },

   getRegionsData: function()
   {
      var rd = this.config.regionsData;
      if (!rd)
         rd = this.config.regionsData = this._defaultRegionsData();
      return rd;
   },

   setRegionsData: function(val)
   {
      if (typeof(val) != "object")
         this._error("RegionsData must be an object");
      this.config.regionsData = val;
   }
}
jTAC.define("TypeManagers.BaseRegionString", jTAC._internal.temp._TypeManagers_BaseRegionString);



/* --- EXTENSIONS TO jTAC GLOBAL -------------------------- */
/*
The region name to use when a TypeManager's 'region' property is set to "GLOBAL".
Update this value when you are using an editable Country field.
Always assign a region name defined in the RegionsData object
and be sure that all RegionsData objects have that region.
You may have to convert a value stored in the country field into a 
different value for the region name.
*/
jTAC.setGlobalRegionName = function (region)
{
   jTAC._globalRegionName = region;
   jTAC._globalRegionNameCount++;
}
jTAC._globalRegionName = null; // if this is changed, always increment jTAC._globalRegionNameCount. (Hint: Use jTAC.setGlobalRegionName)
// Each time jTAC._globalRegionName is changed, jTAC._globalRegionNameCount must be incremented.
// TypeManagers.BaseRegionString._selectRegionNodes() saves this value locally.
// If a call to _selectRegionNodes finds this to differ from its local copy, it abandons the cached value.
jTAC._globalRegionNameCount = 0;
﻿// jTAC/TypeManagers/String.js
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
Class : TypeManger.String
Extends: TypeManagers.BaseString

Purpose:
For any string. There are other TypeManagers that host strings,
and can look for specific features of that string to ensure it reflects
a specific type of string data, such as phone number or postal code.
Always consider using the most specific TypeManager if available.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   caseIns (boolean) - 
      When true, use case insensitive comparison in the compare() method.
      It defaults to false.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_String = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      caseIns: false
   },


   dataTypeName : function () {
      return "string";
   },

/*
Tells compare() if it needs to do a case sensitive or insensitive match.
When true, it is case insensitive.
*/
   _isCaseIns : function() {
      return this.config.caseIns;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.String", jTAC._internal.temp._TypeManagers_String);
jTAC.defineAlias("String", "TypeManagers.String");
jTAC.defineAlias("String.caseins", "TypeManagers.String", {caseIns: true});

﻿// jTAC/TypeManagers/EmailAddress.js
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
Class : TypeManger.EmailAddress
Extends: TypeManagers.BaseStrongPatternString

Purpose:
Validates the pattern of an Email address.
You can optionally support multiple email addresses, defining
the desired delimiters between them.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   multiple (boolean) -
      Determines if multiple email addresses are permitted.
      When true, they are.
      It defaults to false.
   delimiterRE (string) - 
      A regular expression pattern that determines the delimiter
      between multiple email addresses.
      As a regular expression, be sure to escape any character
      that must be a kept as is.
      It defaults to ";[ ]?". It permits an optional space.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseStrongPatternString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_EmailAddress = {
   extend: "TypeManagers.BaseStrongPatternString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      multiple: false,
      delimiterRE : ";[ ]?"
   },


   dataTypeName : function () {
      return "EmailAddress";
   },

/* 
Builds a pattern from the properties.
*/
   _regExp : function() {
      var re = "^" + this._addressRE;
      if (this.getMultiple()) {
         re += "(" + this.getDelimiterRE() + this._addressRE + ")*";
      }
      re += "$";

      return new RegExp(re, "i");
   },

/*
Regular expression pattern for an email address.
It lacks ^ and $ to allow its reuse in multiple email addresses.
Those characters will be added by _regExp().

A good way to override this globally is to add a script that
sets this in the prototype of the class you are modifying:
jTAC.TypeManagers.EmailAddress.prototype._addressRE = "pattern";

If you prefer the pattern used by jquery-validate's "email" rule, here it is:
    ((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?

*/
   _addressRE : "([\\w\\.!#\\$%\\-+.'_]+@[A-Za-z0-9\\-]+(\\.[A-Za-z0-9\\-]{2,})+)"


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.EmailAddress", jTAC._internal.temp._TypeManagers_EmailAddress);
jTAC.defineAlias("EmailAddress", "TypeManagers.EmailAddress");
jTAC.defineAlias("EmailAddress.Multiple", "TypeManagers.EmailAddress", {multiple: true});

﻿// jTAC/TypeManagers/PhoneNumber.js
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
Class : TypeManger.PhoneNumber
Extends: TypeManagers.BaseRegionString

Purpose:

Validates the pattern of a phone number.
Supports regional patterns of phone numbers, as defined in
window.jTAC_PhoneNumberRegionsData field.
To add, you can use this:
window.jTAC_PhoneNumberRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property:
window.jTAC_PhoneNumberRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PhoneNumberRegionsData);

Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

Example of multiple regions: "NorthAmerica|CountryCode".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   supportsExt (boolean) -
      When true, the string can contain the extension.
      It defaults to false.
      Extensions insert their RegExp pattern into the main pattern before "$)".
      There is a default pattern for most extensions, but a region
      can override it with the 'extensionRE' property in its object.
      That will contain the regular expression pattern for the extension.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseRegionString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_PhoneNumber = {
   extend: "TypeManagers.BaseRegionString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      supportsExt: false
   },

   dataTypeName : function () {
      return "PhoneNumber";
   },
/*
   Gets the regular expression pattern from the region data object passed.
   This gets it from the pattern property.
*/
   _resolvePattern: function(regionNode) {
      var r = regionNode.pattern;

      if (this.getSupportsExt())
      {
   // insert the extension's regexp before any "$)" element.
         var ext = regionNode.extensionRE || "(\\s?\\#\\d{1,10})?";

         r = jTAC.replaceAll(r, "\\$\\)", ext + "$)", false);
      }

      return r;
   },

   _defaultRegionsData: function()
   {
      return window.jTAC_PhoneNumberRegionsData;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.PhoneNumber", jTAC._internal.temp._TypeManagers_PhoneNumber);
jTAC.defineAlias("PhoneNumber","TypeManagers.PhoneNumber"); 
jTAC.defineAlias("PhoneNumber.NorthAmerica", "TypeManagers.PhoneNumber", {region:"NorthAmerica"}); 
jTAC.defineAlias("PhoneNumber.NorthAmerica.CountryCode", "TypeManagers.PhoneNumber", {region:"NorthAmerica|CountryCode"}); 
jTAC.defineAlias("PhoneNumber.UnitedStates", "TypeManagers.PhoneNumber", {region:"UnitedStates"}); 
jTAC.defineAlias("PhoneNumber.UnitedKingdom", "TypeManagers.PhoneNumber", {region:"UnitedKingdom"}); 
jTAC.defineAlias("PhoneNumber.France", "TypeManagers.PhoneNumber", {region:"France"}); 
jTAC.defineAlias("PhoneNumber.Japan", "TypeManagers.PhoneNumber", {region:"Japan"}); 
jTAC.defineAlias("PhoneNumber.Germany", "TypeManagers.PhoneNumber", {region:"Germany"}); 
jTAC.defineAlias("PhoneNumber.China", "TypeManagers.PhoneNumber", {region:"China"}); 
jTAC.defineAlias("PhoneNumber.Canada", "TypeManagers.PhoneNumber", {region:"Canada"}); 


/*
Used by TypeManagers.PhoneNumber as its default RegionsData.
Defines the regions and their patterns, with the regionname
as the property name and phone number pattern as the value of the property.
Here is a good resource for building these patterns:
http://www.itu.int/oth/T0202.aspx?parent=T0202

To add a region, you can use this:
window.jTAC_PhoneNumberRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property in a region:
window.jTAC_PhoneNumberRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PhoneNumberRegionsData);

Finally you can substitute your own RegionsData object by setting it to the
TypeManagere.PhoneNumber.regionsData property.

*/
var jTAC_PhoneNumberRegionsData = {
   // This specifics which of the other properties is used when you don't assign the regionName
   defaultName: "Any",

   
   Any: {
      name: "Any",
      pattern: "(^\\+?\\d([\\-\\.]?\\d){6,19}$)",// optional +, 7 to 20 digits, with optional dash or period between digits
      validChar: "[0-9\\+\\-\\.]"
   },

   // requires a country code preceded by +. http://blog.stevenlevithan.com/archives/validate-phone-number
   CountryCode: {  
      name: "CountryCode",
   // +########. Between 7 and 15 digits, with lead and trailing digit. Single space separators allowed between digits
      pattern: "(^\\+(?:\\d ?){6,14}\\d$)",
      validChar: "[0-9\\+ ]"
   },

  
   NorthAmerica: { 
      name: "NorthAmerica",
   // 1(###) ####-####.  Formatting characters and lead 1 are optional.
      pattern: "(^([1])?[ ]?((\\([2-9]\\d{2}\\))|([2-9]\\d{2}))?[ ]?\\d{3}[ \\-]?\\d{4}$)",
      validChar: "[0-9\\+\\- \\(\\)]",
      toNeutral: function (text) { // keeps only digits
         var r = "";
         for (var i = 0; i < text.length; i++) {
            var chr = text.charAt(i);
            if ((chr >= "0") && (chr <= "9"))
               r += chr;
         }
         return r;
      },
      toFormat: function (text) {
         var that = jTAC_PhoneNumberRegionsData.NorthAmerica;
         var r = that.toNeutral(text);
         return jTAC.TypeManagers.BaseRegionString.prototype.applyNumberMask(r, that.formatMask, false, "");
      },

// Modify this mask if your business prefers a different format.
      formatMask : "#(###) ###-####"
   },

   UnitedStates: "NorthAmerica",
   Canada: "NorthAmerica",

   France: {
      name: "France",
   // 0# ## ### ### or 0# ## ## ## ##  or 0 ### ### ### or 0 ### ## ## ##   lead 2 digits are optional (0#)
      pattern: "(^(0( \\d|\\d ))?\\d\\d \\d\\d(\\d \\d| \\d\\d )\\d\\d$)",
      validChar: "[0-9 ]"
   },

   Japan: {
      name: "Japan",
     // 0#-#-#### or (0#) #-#### or #-####. Any single # can be 1-4 digits
      pattern: "(^(0\\d{1,4}-|\\(0\\d{1,4}\\) ?)?\\d{1,4}-\\d{4}$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   Germany: {
      name: "Germany",
     // (0##) ## ## ## or (0###) # ## ## ## or (0####) # ##-## or (0####) # ##-# or # ## ## ##
      pattern: "(^((\\(0\\d\\d\\) |(\\(0\\d{3}\\) )?\\d )?\\d\\d \\d\\d \\d\\d|\\(0\\d{4}\\) \\d \\d\\d-\\d\\d?)$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   China: {
      name: "China",
      // (###)######## or ###-######## or ########
      pattern: "(^(\\(\\d{3}\\)|\\d{3}-)?\\d{8}$)",
      validChar: "[0-9\\- \\(\\)]"
   },

   UnitedKingdom: {  
      name: "UnitedKingdom",
      // reference: http://en.wikipedia.org/wiki/Telephone_numbers_in_the_United_Kingdom
      // expression source: http://regexlib.com/REDetails.aspx?regexp_id=593
      // +44 #### ### ### or 0#### ### ### or +44 ### ### #### or 0### ### #### or +44 ## #### #### or 0## #### ####
      pattern: "(^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))$)",
      validChar: "[0-9\\+ \\(\\)]"
   }
}

﻿// jTAC/TypeManagers/PostalCode.js
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
Class : TypeManger.PostalCode
Extends: TypeManagers.BaseRegionString

Purpose:

Validates the pattern of a postal code.
Supports regional patterns of postal codes, as defined in
window.jTAC_PostalCodeRegionsData field.
To add, you can use this:
window.jTAC_PostalCodeRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property:
window.jTAC_PostalCodeRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PostalCodeRegionsData);

Set the 'region' property to the name of the desired region, or to "" to 
select the 'defaultName' property which specifies the default region name.

Example of multiple regions: "America|Canada".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
None

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseRegionString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_PostalCode = {
   extend: "TypeManagers.BaseRegionString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      supportsExt: false
   },

   dataTypeName : function () {
      return "PostalCode";
   },

   _defaultRegionsData: function()
   {
      return window.jTAC_PostalCodeRegionsData;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.PostalCode", jTAC._internal.temp._TypeManagers_PostalCode);

jTAC.defineAlias("PostalCode","TypeManagers.PostalCode"); 
jTAC.defineAlias("PostalCode.NorthAmerica", "TypeManagers.PostalCode", {region:"NorthAmerica"}); 
jTAC.defineAlias("PostalCode.UnitedStates", "TypeManagers.PostalCode", {region:"UnitedStates"}); 
jTAC.defineAlias("PostalCode.UnitedKingdom", "TypeManagers.PostalCode", {region:"UnitedKingdom"}); 
jTAC.defineAlias("PostalCode.France", "TypeManagers.PostalCode", {region:"France"}); 
jTAC.defineAlias("PostalCode.Japan", "TypeManagers.PostalCode", {region:"Japan"}); 
jTAC.defineAlias("PostalCode.Germany", "TypeManagers.PostalCode", {region:"Germany"}); 
jTAC.defineAlias("PostalCode.China", "TypeManagers.PostalCode", {region:"China"}); 
jTAC.defineAlias("PostalCode.Canada", "TypeManagers.PostalCode", {region:"Canada"}); 

/*
Used by TypeManagers.PostalCode as its default RegionsData.
Defines the regions and their patterns, with the regionname
as the property name and phone number pattern as the value of the property.
Here is a good resource for building these patterns:
http://www.itu.int/oth/T0202.aspx?parent=T0202

To add a region, you can use this:
window.jTAC_PostalCodeRegionsData["regionname"] = {pattern: value, more properties};
To replace the pattern property in a region:
window.jTAC_PostalCodeRegionsData["regionname"].pattern = "pattern";

You can also create your own full RegionsData object and merge its properties
with the existing one like this:
jTAC.extend(your object, window.jTAC_PostalCodeRegionsData);

Finally you can substitute your own RegionsData object by setting it to the
TypeManagere.PostalCode.regionsData property.

*/
var jTAC_PostalCodeRegionsData = {
   // This specifics which of the other properties is used when you don't assign the regionName
   defaultName: "UnitedStates|Canada",

   UnitedStates:  { 
      name: "UnitedStates",
      pattern: "(^(\\d{5}-\\d{4}|\\d{5})$)",
      validChar : "[0-9\\-]"
   },

   Canada:  {
      name: "Canada",

      // resource: http://www.dreamincode.net/code/snippet3209.htm, http://www.itsalif.info/content/canada-postal-code-us-zip-code-regex
      pattern: "(^[ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z][ ]?\\d[ABCEGHJ-NPRSTV-Z]\\d$)",
//      pattern: "(^([A-Za-z]\\d[A-Za-z][ ]?\\d[A-Za-z]\\d$)",
      caseIns : true,
      validChar : "[0-9A-Za-z ]"
   },

   NorthAmerica: "UnitedStates|Canada",
/*
   NorthAmerica: {
      name: "NorthAmerica",
      pattern: function() {
         return jTAC_PostalCodeRegionsData.UnitedStates.pattern + "|" + jTAC_PostalCodeRegionsData.Canada.pattern;
      },
      validChar : "[0-9A-Za-z \\-]" // blends US and Canada digits
   },
*/
   UnitedKingdom:  {
      name: "UnitedKingdom",
      // resource: http://en.wikipedia.org/wiki/Postal_codes_in_the_United_Kingdom
      pattern: "(^(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?) [0-9][ABD-HJLNP-UW-Z]{2})$)",
/*
      pattern: function() {
         return (!this.spacesOptional) ?
         //  this pattern demands spaces. 
            "(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?) [0-9][ABD-HJLNP-UW-Z]{2})" :
          // spaces are optional.It can be used by assigning the property "spacesOptional" on the TypeManager
            "(GIR 0AA|[A-PR-UWYZ]([0-9][0-9A-HJKPS-UW]?|[A-HK-Y][0-9][0-9ABEHMNPRV-Y]?)[ ]?[0-9][ABD-HJLNP-UW-Z]{2})"; 
      },
*/
      validChar: "[0-9A-Z ]"
   },


   France: {
      name: "France",
      //#####
      pattern: "(^\\d{5}$)",
      validChar: "[0-9]"
   },

   Japan: {
      name: "Japan",
      //  ### or ###-#### or ###-##
      pattern : "(^\\d{3}(-(\\d{4}|\\d{2}))?$)",
      validChar : "[0-9\\-]"
   },

   Germany: {
      name: "Germany",
      pattern: "(^\\d{5}$)",
      validChar : "[0-9\\-D]"
   },

   China: {
      name: "China",
      pattern : "(^\\d{6}$)",
      validChar: "[0-9]"
   }
}

﻿// jTAC/TypeManagers/CreditCardNumber.js
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
Class : TypeManger.CreditCardNumber
Extends: TypeManagers.BaseString

Purpose:
Validates a credit card number against Luhn's algorithm.
In addition, it can limit the brand of the credit card supported
and allow optional spaces.
By default it limits brands. If you want to include all possible
credit cards, set the brands property to null or use the alias "CreditCardNumber.AllBrands".

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   brands (array) -
      Defines the signatures of various brands of credit cards.
      These are checked if defined. To disable this feature,
      assign brands to null.
      This list is prepopulated with populate cards. Add, edit, and delete
      as needed.
      Each item of the array is a javascript object with these properties:
         len (int) - If defined, it is the exact number of digits allowed.
         prefix (string) - A pipe delimited list of digits that
            start the credit card number and are used to identify the brand.
   allowSeps (char) -
      Assign to a single character that is a legal value for the user
      to use while typing, such as space or minus.
      It defaults to "" (which means not allowed).

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_CreditCardNumber = {
   extend: "TypeManagers.BaseString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      brands:
         [{len: 16, prefix: '51|52|53|54|55'}, // Mastercard
          {len: 13, prefix: '4'}, // Visa-13char
          {len: 16, prefix: '4'}, // Visa-16char
          {len: 15, prefix: '34|37'}, // American Express
          {len: 14, prefix: '300|301|302|303|305|36|38'}, // Diners Club/Carte Blanche
          {len: 16, prefix: '6011'} // Discover
         ],
      allowSeps: ""

   },

   configrules: {
   },

   dataTypeName : function () {
      return "CreditCardNumber";
   },

/* 
Returns the same string passed in, but reports errors based on
the validation rules.

NOTE: This code is adapted from Peter's Data Entry Suite's CreditCardNumberValidator.
It is used here by permission from the author of that product.
*/
   _reviewValue : function(text) {
      if (text == "")
         return "";
      var as = this.getAllowSeps();
      if (as) {  // allow spaces. Strip out the spaces here to evaluate
         text = jTAC.replaceAll(text, as, "", true);
      }

      var len = text.length;
      if (len < 10)
         this._inputError("Not enough digits");   // under 10 is immediately rejected
      
   // must be all digits
      if (!/^(\d+)$/.test(text))
         this._inputError("Illegal character");

      var brands = this.getBrands();
      if (brands) {
   // match the length to elements in brands
         var fd = 0;  // found
         for (var i = 0; i < brands.length; i++) {
            var brand = brands[i];
         // elements in brands are objects with two properties:
         // len: the number length; prefix: a Regular expression to check the prefixes
            if (brand.len == len) {
               var re = new RegExp("^(" + brand.prefix + ")", "i");
               if (re.test(text)) {
                  fd = 1;
                  break;
               }
            }
         }  // for
         if (!fd)   // length not found
            this._inputError("Brand mismatch");
      }

   // perform Luhn's formula.
   // 1. Double the value of alternating digits starting from the second to last and going backward.
   // 2. Add the digits formed in step one. For example, starting with 7, we'd get 14 and add 1+4 here
   // 3. Add the alternating digits starting from the last. (This never uses the digits from step 1)
   // 4. Add the results of steps 2 and 3. If the result evenly divides by 10, success.
      var t = 0; // total
      var normal = true;   // when true, adding normal. False, adding after doubling.
      for (var i = len - 1; i >= 0; i--) {
         var d = parseInt(text.charAt(i), 10); // convert textual digit into number
         if (normal) {   // step 3
            t += d;
         }
         else {  // step 1 and 2
            d = d * 2;
            if (d > 9)
               t += 1 + (d % 10);   // doubled is between 10 and 19. '1' + the trailing digit
            else
               t += d;
         }
         normal = !normal;
      }  // for

      if (t % 10 != 0)
         this._inputError("Failed Luhns");

      return text;
   },

// Digits and the optional allowSeps value.
   isValidChar : function (chr)
   {
      if (!this.callParent([chr]))
         return false;
      if (this.getAllowSeps() == chr)
         return true;
      return "1234567890".indexOf(chr) > -1;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
   brands property: SET function
   */
   setBrands : function (val)
   {
      if ((val instanceof Array) || (val == null))
         this.config.brands = val;
      else
         this._error("Parameter must be an array or null.");
   },

   /*
   allowSeps property: SET function
      Assign to a single character that is a legal value for the user
      to use while typing, such as space or minus.
      It defaults to "" (which means not allowed).
   */
   setAllowSeps : function (val)
   {
      if ((typeof val == "string") && (val.length <= 1))
         this.config.allowSeps = val;
      else
         this._error("Parameter must be a 1 character string.");
   }

}
jTAC.define("TypeManagers.CreditCardNumber", jTAC._internal.temp._TypeManagers_CreditCardNumber);
jTAC.defineAlias("CreditCardNumber", "TypeManagers.CreditCardNumber");
jTAC.defineAlias("CreditCardNumber.AllBrands", "TypeManagers.CreditCardNumber", {brands: null});
﻿// jTAC/TypeManagers/Url.js
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
Class : TypeManger.Url
Extends: TypeManagers.BaseStrongPatternString

Purpose:
Validates the pattern of a URL.
Offers numerous options to select the parts of a URL
supported, which uri schemes, and which domain name extensions you allow.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   uriScheme (string) -
      A pipe delimited list of valid Uri Schemes.
      These are "http", "https", "ftp", etc.
      It defaults to "http|https".

   domainExt (string) - 
      A pipe delimited list of domain extensions, ignoring the country part.
      For example: "com|co|edu". Do not use "co.uk" as it contains a specific country part.
      To allow all, set to "".
      Defaults to "aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|jobs|mobi|pro|co".

   supportsIP (boolean) - 
      When true, allow the domain name part to be an IP address instead of a domain name.
      It defaults to false.

   supportsPort (boolean) - 
      When true, allow the port number to be specified.
      It defaults to false.

   supportsPath (boolean) - 
      When true, allow a path after the domain name.
      It defaults to true.

   requireUriScheme (boolean) - 
      When true, there must be a Uri Scheme.
      It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base
TypeManagers.BaseString
TypeManagers.BaseStrongPatternString

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_URL = {
   extend: "TypeManagers.BaseStrongPatternString",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      uriScheme: "http|https",
      domainExt: "aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|travel|jobs|mobi|pro|co",
      supportsIP: false,
      supportsPort: false,
      supportsPath: true,
      requireUriScheme: true
   },

   configrules: {
   },

   dataTypeName : function () {
      return "Url";
   },

/* 
Builds a pattern from the properties.
*/
   _regExp : function() {
      var re = "^((?:" + this.getUriScheme() + ")\\://)";
      if (!this.getRequireUriScheme())
         re += "?";
      if (this.getSupportsIP()) {
         re += "((";
      }
      re += this._domainRE;
      var de = this.getDomainExt();
      if (!de) {
         de = this._defDomainExt;
      }
      re += this._domainExtRE.replace("{DE}", de);
      if (this.getSupportsIP()) {
         re += ")|(" + this._IPAddressRE + "))";
      }

      if (this.getSupportsPort()) {
         re = re + this._portRE;
      }
      if (this.getSupportsPath()) {
         re += "/?(" + this._filePathRE + ")?";
      }
      else {
         re += "/?";
      }
      re += "$";

      return new RegExp(re, "i");
   },

/* ---------------------------------------------------------------  
The following fields ending in "RE" allows overriding their regular expression pattern.
A good way to override this globally is to add a script that
sets this in the prototype of the class you are modifying:
jTAC.TypeManagers.Url.prototype._domainRE = "pattern";
*/

/*
Regular expression pattern for a domain name.
*/
   _domainRE : "[a-zA-Z0-9\\-\\.]+",

/*
Regular expression pattern for a domain name.
*/
   _IPAddressRE : "(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9])\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|0?[1-9]{1}[0-9]{1}|0{0,2}[0-9])",  // see http://www.regexlib.com/REDetails.aspx?regexp_id=32

/*
Regular expression pattern for a domain name extension.
Use the token {DE} to be replaced by the value of the domainExt property.
*/
   _domainExtRE : "(?:\\.[a-z]{2})?\\.(?:{DE})(?:\\.[a-z]{2})?",  // NOTE: {DE} is a token that is replaced by the validDomainExt property.

/*
Used in the {DE} token of the _domainExtRE when _domainExt is "".
*/
   _defDomainExt : "[a-zA-Z]{2,3}",
/*
Regular expression pattern for a port number.
*/
   _portRE : "(?:\\:\\d+)?",

/*
Regular expression pattern for a file path after the domain name.
*/
   _filePathRE : "(?:/[a-zA-Z0-9_/%\\$#~][a-zA-Z0-9\\-\\._\\'/\\+%\\$#~]+[A-Za-z0-9])*" // exclude white space, \, ?, &, and =


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("TypeManagers.Url", jTAC._internal.temp._TypeManagers_URL);
jTAC.defineAlias("Url", "TypeManagers.Url");
jTAC.defineAlias("Url.FTP", "TypeManagers.Url", {uriScheme:"ftp"});

﻿// jTAC/TypeManagers/Boolean.js
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
Class : TypeManger.Boolean
Extends: TypeManagers.Base

Purpose:
Handles boolean types. Often used with
Condition.CompareToValue to compare a boolean value to
the value of a checkbox or radiobutton.

See \jTAC\TypeManagers\Base.js for an overview of TypeManagers.

Properties introduced by this class:
   reFalse (string or regex) - 
      Regular expression used to convert a string into false.
      Must match valid strings representing "false".
      Can pass either a RegExp object or a string that is a valid
      regular expression pattern. 
      Defaults to ^(false)|(0)$

   reTrue (string or regex) - 
      Regular expression used to convert a string into true.
      Must match valid strings representing "true".
      Can pass either a RegExp object or a string that is a valid
      regular expression pattern. 
      Defaults to ^(true)|(1)$

   numFalse (array of integers) -
      Array of numbers representing false.
      If null or an empty array, no numbers match.
      Defaults to [0]

   numTrue (array of integers or true) -
      Array of numbers representing true.
      If null or an empty array, no numbers match.
      If true, then all numbers not defined in numFalse match.
      Defaults to [1]

   falseStr (string) -
      The string representing "false". Defaults to "false".

   trueStr (string) -
      The string representing "true". Defaults to "true".

   emptyStrFalse (boolean) - 
     When true, the empty string represents false in the toValue function.
     It defaults to true.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._TypeManagers_Boolean = {
   extend: "TypeManagers.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      reFalse: /^(false)|(0)$/i, // the last () represents the empty string
      reTrue: /^(true)|(1)$/i,
      numFalse: [0],   // array of numbers that match to false
      numTrue: [1], // array of numbers that match to true. Also valid: true to match all numbers not in numFalse.

      falseStr: "false",  // returned by _nativeToString for false
      trueStr: "true",  // returned by _nativeToString for true

      emptyStrFalse: true
   },

   configrules: {
      reFalse: jTAC.checkAsRegExp,
      reTrue: jTAC.checkAsRegExp

   },

   nativeTypeName : function () {
      return "boolean";
   },


   dataTypeName : function () {
      return "boolean";
   },

   storageTypeName : function () {
      return "boolean";
   },

   /* 
    Returns the strings defined in the falseStr and trueStr properties.
    Assumes the value is a boolean. If not, its still evaluated as if it was
    a boolean.
   */
   _nativeToString : function (value) {
      return value ? this.getTrueStr() : this.getFalseStr();
   },

   /*
    By default, converts the following to FALSE:
    false, "false" (case insenstive), 0, "0", and "".
    Converts the following for TRUE:
    true, "true" (case insensitive), 1, "1"
    If you want to change the rules of string matching,
    change the regular expressions in reFalse and reTrue.
    To change the rules of number matching, change
    the numFalse and numTrue properties.
   */
   toValue : function (text) {
      if (typeof (text) == "number")
         return this._numberToBoolean(text); 
      return this.callParent([text]);
   },


   /*
    Uses the regular expressions in reFalse and reTrue
    to identify supported strings that convert to false or true.
   */
   _stringToNative : function (text) {
      if (text == "")
      {
         if (this.getEmptyStrFalse())
            return false;
         this._error("Empty string is not permitted when emptyStrFalse = false.");
      }
      else
      {
         var re = this.getReFalse();
         if (re && re.test(text))
            return false;
         re = this.getReTrue();
         if (re && re.test(text))
            return true;
      }
      this._inputError("Could not convert the string '" + text + "' to a boolean.");
   },

   /*
   Returns true if the value represents null.
   This method allows null. if emptyStrFalse is false
   the empty string also means null.
   */
   _isNull : function (val) {
      if (val == "")
         return !this.getEmptyStrFalse();
      return val == null;
   },

   /*
   Used by toValue when the value is a number.
   Processes values identified by the rules of numFalse and numTrue properties.
   If it cannot process, it throws an exception.
   By default, it only supports 1 for true and 0 for false.
   */
   _numberToBoolean : function (num) {
      var nf = this.getNumFalse();
      if (nf && (nf.length > 0) && (nf.indexOf(num) > -1))
         return false;
      var nt = this.getNumTrue();
      if (nt) {
         if (nt === true)
            return true;
         if ((nt.length > 0) && (nt.indexOf(num) > -1))
            return true;
      }
      this._inputError("Could not convert the number " + num + " to a boolean.");
   },

   /* 
      Supports the strings "false" and "true" (case insensitive)
   */
   toValueNeutral : function (text) {
      if (typeof(text) == "boolean")
         return text;
      if (/^false$/i.test(text))
         return false;
      if (/^true$/i.test(text))
         return true;
      this._inputError("Required values: 'false' and 'true'");
   },


   /* 
      Conversion from native value to culture neutral string. "false" and "true"
   */
   toStringNeutral : function (val) {
      if (val == null)
         return "";
      return val ? "true" : "false";
   },

   /*
   Accepts all values, converting those that are not the correct type
   into a boolean.
   */
   _reviewValue : function (value) {
      return !!value;
   },

   /*
   Always returns false
   */
   isValidChar : function (chr) {
      return false;
   },

   /*
   Returns 1 or 0.
   */
   toNumber : function (value) {
      return value ? 1 : 0;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
     numFalse property: SET function
   */
   setNumFalse : function (numbers) {
      if (typeof(numbers) == "number")
         numbers = [ numbers ];
      this.config.numFalse = numbers;
   },

   /*
     numTrue property: SET function
   */
   setNumTrue : function (numbers) {
      if (typeof(numbers) == "number")
         numbers = [ numbers ];
      this.config.numTrue = numbers;
   }

}
jTAC.define("TypeManagers.Boolean", jTAC._internal.temp._TypeManagers_Boolean);

jTAC.defineAlias("Boolean", "TypeManagers.Boolean");
﻿// jTAC/Parser.js
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
Module: General

Purpose:
Provides a Parser to convert various textual syntaxes into objects
of jTAC.
When the jTAC.parser object is defined (by loading this file),
each object created by jTAC.create offers the object in its "parser" property.
Subclasses can implement the method parse() which takes a text string
to parse from its first character. If it can extract text from the beginning
of that string, it converts that text into an object instance associated
with the class implementing parse(). It returns an object containing
both that object instance with these elements:
  obj - The object it created.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.
If it cannot parse the first part of the string passed, parse() must return null.

The jTAC.parser object defines a number of generic parsing methods including:
* err() - Provides a standarized error message feedback system for parsers.
* asExact() - Extract an exact string.
* asNumber() - Extract a number, whether floating point or integer, in culture neutral format.
* asInt() - Extract an integer, in culture neutral format.
* asBool() - Extract the values of a boolean as the text "true" and "false".
* asParmDelim() - Extract separator characters in a parameter list, either a comma, 
   or a terminating parenthesis or terminating curley braces.
* oParen() - Extract an opening parenthesis
* cParen() - Extract a closing parenthesis
* asJSon() - Look for a Javascript Object Notation string. Extract the object made from that string.
* asNull() - Look for the text "null".
* asNaN() - Look for the text "NaN".
* asId() - Extract a string (in single or double quotes) that is a legal identifier.
   An identifier consists of only letters, digits and underscores.
* asClass() - Extract the next element, which represents an object or optionally null.
   There are three possible values:
   1) a string (in quotes) containing a class name registered with the jTAC.define() or defineAlias().
      It uses the jTAC.create to create an instance of the class. That instance
      is returned.
   2) a JSon object (using the asJSon() method) where its jtacClass property contains a
      class name registered with the jTAC.define or defineAlias.
   3) the string 'null' (using asNull() method).


Any class that offers a parse() method must register an instance of itself
with jTAC.parser.register(). These instances are used to search for a match to 
the next item in the string by calling next().

Parsing syntax general rules:
- Separators can be surrounded by 0 or more whitespace characters.
- Strings can be in single or double quotes
- Syntax should generally look like javascript

Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

/*-----------------------------------------------------------
The jTAC.parser global object is used by individual
classes' parse() method for its various parsing utility methods.
Those classes must register an instance of themselves by
calling jTAC.parser.register(instance).

Classes created by jTAC.create are extended with a new property, parser,
that keeps a reference to this same instance.
------------------------------------------------------------*/

jTAC.parser =
{
/* 
Global hosting entries made with register().
These have their parse() method called in the order defined here,
until one returns a value. 
*/
   _registered: new Array(),

/* 
Registers a class that supports parsing.
Call it during page initialization, such as after defining
the constructor function:

jTAC.define("namespace.class", { members } ");
jTAC.parser.register("namespace.class" );

Parameters:
   name (string) - A full class name or alias name.
*/
   register: function (name) {
      var cl = jTAC.create(name, null, false);
      this._registered.push(cl);
   },

/*
Parses the text to match the first characters to one of the registered
parsers. The first found will process and return an instance of the object
created from that call. 
This function returns an object with these parameters:
  obj - The object created by the parser.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.
If none are found, it returns null.
If there are errors, exceptions are thrown.
*/
   next: function(text) {
      var reg = this._registered;
      for (var i = 0; i < reg.length; i++) {
         var r = reg[i].parse(text, this);
         if (r) {
            return r;
         }  // if r
      }  // for

      return null;
   },


/*
Provides a standarized error message feedback system for parsers.
*/
   err : function(text, details, callerInst, action) {
      var msg = "Could not parse the expression starting here: " + text;
      if (details)
         msg = "Error: " + details + " " + msg;
      jTAC.error(msg, callerInst, action ? action : (callerInst ? null : "Parser"));
   },


/*
Extract the next element, which must exactly match the string passed.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   match (string) - The text to exactly match.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
   caseIns (boolean) - Optional. If true, use a case insensitive match.
   afterRE (string) - If the expression should look ahead to ensure the following characters don't conflict,
      specify the pattern to allow here. It will be inserted into a larger expression: (?=[your pattern]|$).
      If null, don't care about what follows.
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   asExact : function(text, match, req, caseIns, afterRE) {
      var peREs = this._peREs;
      if (!peREs) {
         this._peREs = peREs = [];
      }
      var re = peREs[match];
      if (!re) {
         var pat = "^\\s*" + jTAC.escapeRE(match);
         if (afterRE) {
            pat += "(?=" + afterRE + "|$)";
         }
         peREs[match] = re = new RegExp(pat, caseIns ? "i" : "");
      }
      var m = re.exec(text);
      if (m) {
         return { rem : text.substr(m[0].length) };
      }
      if (req)
         this.err(text, match + " expected.", null, "Parser.asExact");
      return null;

   },

/*
Extract the next element, where it must be a number in culture neutral format.
It can be decimal or integer. It can have a lead minus character.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   number (number) - the number extracted
   rem (string) - the remaining text after the number was extracted
*/
   asNumber : function(text, req) {
      if (!this._numRE) {
         this._numRE = new RegExp("^\\s*(\\-?\\d+(\\.\\d+)?)(?![\\.\\dA-Za-z])");
      }
   // look for delimiter
      var m = this._numRE.exec(text);
      if (m) {
         var n = parseFloat(m[1]);
         return { number: n, rem : text.substr(m[0].length)};
      }

      if (req)
         this.err(text, "Number expected.", null, "Parser.asNumber");
      return null;
   },

/*
Extract the next element, where it must be an integer in culture neutral format.
It can have a lead minus character.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   number (number) - the number extracted
   rem (string) - the remaining text after the number was extracted
*/
   asInt : function(text, req) {
      if (!this._numRE) {
         this._numRE = new RegExp("^\\s*(\\-?\\d+)(?!\\.A-Za-z)");
      }
   // look for delimiter
      var m = this._numRE.exec(text);
      if (m) {
         var n = parseInt(m[1], 10);
         return { number: n, rem : text.substr(m[0].length)};
      }

      if (req)
         this.err(text, "Integer expected.", null, "Parser.asInt");
      return null;
   },

/*
Extract the next element, where it must be one of these strings (without quotes):
true or false. Uses a case sensitive match.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   bool (number) - the boolean value
   rem (string) - the remaining text after the element was extracted
*/
   asBool : function(text, req) {
      var r = this.asExact(text, "true", false, false, "\\W");
      if (r) {
         r.bool = true;
         return r;
      }
      r = this.asExact(text, "false", false, false, "\\W");
      if (r) {
         r.bool = false;
         return r;
      }
      if (req)
         this.err(text, "true or false expected.", null, "Parser.asBool");
      return null;
   },

/*
Extract the next element, where it must be a parameter delimiter as
one of these characters: comma, closing parenthesis, or curley brace
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   delim (string) - the delimiter character extracted
   rem (string) - the remaining text after the element was extracted
*/
   asParmDelim : function(text, req) {
      if (!this._sepRE) {
         this._sepRE = new RegExp("^\\s*(\\,|\\)|\\})");
      }
   // look for delimiter
      var m = this._sepRE.exec(text);
      if (m) {
         return { delim: m[1], rem : text.substr(m[0].length)};
      }

      if (req)
         this.err(text, "Comma or ) character expected.", null, "Parser.asParmDelim");
      return null;
   },

/*
Extract the next element, where it must be a opening parenthesis.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   oParen : function (text, req) {
      return this.asExact(text, "(", req, false, null);
   },

/*
Extract the next element, where it must be a closing parenthesis.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   cParen : function (text, req) {
      return this.asExact(text, ")", req, false, null);
   },

/*
Utility to extract the next element, where it must be a JSon expression.
This code creates an object that represents the data.
The string must start with a left curley brace and later have a right curley brace.
If both are found, then that string is run through a JSon converter
to make it into the object that is returned.
It handles nested JSon objects too.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   JSon(object) - the JSon object
   rem (string) - the remaining text after the element was extracted
*/
   asJSon : function(text, req) {
      var m, obj, re;
   // see if it starts with a lead { (whitespace before allowed)
      if (!/^\s*\{/.test(text)) {
         return null;
      }
   // strip lead whitespace
      m = /^\s*/.exec(text);
      if (m) {
         text = text.substr(m[0].length);
      }

   // collect positions of each { and } throughout the string until balancing } is found
   // NOTE: Don't store this regexp because of the "g" option. It's instance preserves stateful
   // info that we must reset when entering this function. That only happens
   // by creating a new instance.
      var nest = 0;
      re = new RegExp("([\\{\\}])", "g");
      while (m = re.exec(text)) {
         if (m[1] == "{")
            nest++;
         else if (nest) { // m[1] == "}"
            nest--;
            if (!nest) { // endpoint
               try {
                  obj = eval("(" + text.substr(0, m.index + 1) + ");"); 
               }
               catch (e) {
                  this.err(text, "JSon parsing error. " + e.message, null, "Parser.asJSon");
               }

               return { JSon : obj, rem : text.substr(m.index + 1) };
            }
         }
      }  // while
      this.err(text, "JSon parsing error. Missing closing }.", null, "Parser.asJSon");
   },

/*
Extract the next element, which must be "null" (without quotes).
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted

   NOTE: Uppercase N on Null is used only because all-lowercase null is a reserved word.
*/
   asNull : function(text, req) {
      return this.asExact(text, "null", req, false, "\\W");
   },

/*
Extract the next element, which must be "NaN" (without quotes).
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   rem (string) - the remaining text after the element was extracted
*/
   asNaN : function(text, req) {
      return this.asExact(text, "NaN", req, false, "\\W");
   },

/*
Extract the next element if it is an ID.
An id is a string, enclosed in single or double quotes, and is limited to letters, digits, and underscore.
The first letter cannot be a digit.
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   id (string) - the id extracted
   rem (string) - the remaining text after the id was extracted
*/
   asId: function (text, req) {
      if (!this._idRE) {
         this._idRE = new RegExp("^\\s*((\"([A-Za-z_][\\w]*)\")(?=\\W|$))|^\\s*(('([A-Za-z_][\\w]*)')(?=\\W|$))", "i");
      }
      var m = this._idRE.exec(text);
      if (m) {
         var content = m[0];
         if (content)
            return { id: m[3] || m[6], rem : text.substr(content.length)};
      }
      if (req)
         this.err(text, "Id required", null, "Parser.asId");
      return null;
   },

/*
Extract the next element, which represents an object or optionally null.
There are three possible values:
1) a string (in quotes) containing a class name registered with the jTAC.define or defineAlias.
   It uses the jTAC.create to create an instance of the class. That instance
   is returned.
2) a JSon object (using the asJSon() method) where its jtacClass property contains a
   class name registered with the jTAC.define or defineAlias.
3) the string 'null' (using asNull() method).
It can be preceded by whitespace.
   text (string) - The content to parse, starting at the first character of this string.
   allowNull (boolean) - When true, if this value is not found as a class name or JSon,
      it still could look for 'null'.
   valinst (function) - When defined, it is a function that is passed the object created
      from the jTAC.create. It determines if that object is compatible with 
      what the caller wants. It returns true if compatible; false if not.
   req (boolean) - Optional. When true, a value is required and exception is thrown if missing
Returns an object if found, and null if not. The object has these properties:
   obj (object) - the object instance created or null if it found 'null'
   rem (string) - the remaining text after the class was extracted
*/
   asClass : function(text, allowNull, valinst, req) {
      var obj;
      var r = this.asId(text, false);
      if (r) {
         try {
            obj = jTAC.create(r.id);
         }
         catch (e) {
            this.err(text, e.message);
         }
      }
      else {  // Next try a JSon.
         r = this.asJSon(text, false);
         if (r) {
            try {
               obj = jTAC.create(null, r.JSon);
            }
            catch (e) {
               this.err(text, e.message);
            }
         }
         else if (allowNull) {// finally try null
            r = this.asNull(text, false);
            if (r) {
               return {obj : null, rem : r.rem };
            }
         }
      }

      if (obj) {
         if (valinst && !valinst(obj))
            this.err(text, "Unexpected class", null, "Parser.asClass");
         return { obj : obj, rem : r.rem };
      }
      if (req)
         this.err(text, "Class name expected.", null, "Parser.asClass");
      return null;
   }


}  // object assigned to jTAC.parser
﻿// jTAC/CalcItems/Base.js
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
Module: Calculations
Class : CalcItems.Base     ABSTRACT CLASS
Extends: None

Purpose:
Part of the Calculation widget. These "CalcItem" objects describe a single
element within a calculation. Each object includes two key elements:
* The math operator: + - * \
* The evaluate() method: Evaluates something and returns a number or NaN when
  it could not calculate.

CalcItem classes:
There are a number of CalcItem classes, all subclassed from CalcItems.Base,
which defines the operator property and evaluate() method.
* Element - Evaluates an element on the page, whether DOM element
  or a widget. It uses a Connection object to associate with the element
  and a TypeManager to return a numeric value from the connection. 
  User must specify the id of the element and optionally which TypeManager to use.
  If no TypeManager is identified, TypeManagers.Float is used.
* Group - Holds an array of CalcItems. Calculates them
  together as if they are enclosed in parenthesis.
* Number - Holds a number that is part of the calculation.
* Conditional - Allows IF THEN logic.
  Define a Condition object in its 'condition' property.
  When that condition  evaluates as "success", it evaluates a CalcItem object 
  you define in the 'success' property. 
  When the condition evaluates as "failed", it evaluates a CalcItem object 
  you define in the 'failed' property.
* NaN - Its evaluate function always returns NaN, stopping the calculation.
  NaN means that the calculation failed with an error.
  This is generally used in a CalcItems.Conditional on its 'failed' property.
* Null - Its evaluate function always returns null, stopping the calculation.
  Null means that there is nothing to calculate and its not an error condition.
  This is generally used in a CalcItems.Conditional on its 'failed' property
  and in Groups's valueWhenNull and valueWhenEmpty properties.


Essential Methods:
   canEvaluate() - Returns true if the Condition is enabled and ready to evaluate data.
   evaluate() - Evaluates and returns a number, NaN for an error detected, 
      and null for nothing to calculate.

Essential properties:
   enabled (boolean) - 
      When false, evaluate should not be called. canEvaluate() uses it. Defaults to true.
   operator (string) - 
      One of these strings representing a match operator: "+", "-", "*", "/".
   stopProcessing (boolean) - 
      Use by the CalcItems.Group class when a CalcItem in its "items"
      property returns NaN or null. That CalcItem has its value
      replaced by CalcItems defined in the valueWhenNull and valueWhenInvalid
      properties.
      If the CalcItem generates a number, it can be used
      either to replace the null/NaN value in the calculation,
      or to replace the entire calculation with the number.
      When this property is false, the CalcItems.Group
      will replace the value of the CalcItem only.
      When true, the CalcItems.Group will replace
      the entire calculation with the number.
      It defaults to false.

Parsing Calculation Expressions:
Users can create a string in JavaScript-like syntax that can be converted
into CalcItem objects through the parse() method.

The text provided to the parser is called the "calculation expression".

The parse() method is the entry point to each CalcItem class's parsing capabilities.
It is passed the string to parse.
It evaluates the text at the start of the string. If it matches the pattern
supported by the CalcItem class, parsing continues. It returns an object
containing two properties:
  obj - A new instance of the class, prepared based on what the string offered.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.
If the CalcItem doesn't support the text at the start of the string, it returns null.

Parsing syntax for each CalcItem class
======================================
General rules:
- Separators can be surrounded by 0 or more whitespace characters.
- Strings can be in single or double quotes
- Syntax should generally look like javascript

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
TypeManagers.Base
If using parsing, Parser.

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp._CalcItems_Base = {
   "abstract": true,

   constructor: function ( propertyVals ) {

   },

   config: {
      enabled: true,
      operator: "+",
      stopProcessing: false
   },

   configrules: {
      operator: ["+", "-", "*", "/"]
   },

   /*
   Call to determine if the Condition can be evaluated.
   If it returns true, you can call evaluate().
   */
   canEvaluate : function () {
      if (!this.getEnabled()) {
         return false;
      }
   
      return true;
   },

   /* ABSTRACT METHOD
   Evaluates and returns a number, NaN for an error detected, 
   and null for nothing to calculate.
   */
   evaluate : function () {
      this.AM();
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      // this class does nothing.
   },

   /*
   Utility to handle various ways to represent a CalcItem.
   If passed an actual CalcItem object, it is returned.
   If passed a JSon object, it attempts to convert into a CalcItem object.
   If passed an array, it creates CalcItems.Group with child items.
   If passed a number, it creates CalcItems.Number with that value.
   If passed a string, it creates a CalcItems.Element which uses the string as the elementID.
   If passed NaN, it creates CalcItems.NaN.
   If passed Null, it creates CalcItems.Null
   Other values throw an exception.
   */
   _cleanupCalcItemInput : jTAC_CleanupCalcItemInput,

/* STATIC METHOD
Supports parsing calculation expressions.
REQUIRES: jTAC.parser. Caller should ensure it is loaded \jTAC\Parser.js

This is a parser that looks for calculation expressions delimited by math operators (+ - * /).
If it finds one, it returns the actual CalcItem instance for that one expression,
such as CalcItems.Number or CalcItems.Element.
Otherwise, it creates a CalcItems.Group object and collects all 
calculation expressions into its [items] property. Each is assigned the operator
the precedes it.
   text (string) - The content to parse, starting at the first character of this string.
Returns an object with these parameters:
  ci - A CalcItem instance, prepared based on what the string offered.
  rem - A string which is the remainder for the caller to parse.
    Effectively the parse() function will strip out the part it parsed.

This is a static method. Call it from anywhere like this: 
jTAC.CalcItems.Base.prototype.calcexpr("string").
*/
   calcexpr: function(text, parser, callerInst) {
      try {
         jTAC._internal.pushContext(); // uses jTAC._internal because its a static method

         var proto = jTAC.CalcItems.Base.prototype;
         proto._checkParser(parser);
         var r,
         gci = null,   // if assigned, it is a CalcItems.Group object with its children found in the loop
         op = "+"; // the operator for the next calcItem. 
         if (!proto._opRE) {
            proto._opRE = new RegExp("^\\s*([\\+\\-\\*/])");
         }
         while (r = parser.next(text)) {
            text = r.rem;
            r.obj.operator = op;
         
         // see if there is an operator following. If so, add this to a CalcItems.Group object and get the next item
            var m = proto._opRE.exec(text);
            if (m) {
               if (!gci) {
                  gci = jTAC.create("CalcItems.Group");
               }

               op = m[1];
               text = text.substr(m[0].length);
            }

            if (gci) {
               gci.addItem(r.obj);
            }
            if (!m) {
               return { ci: gci ? gci : r.obj, rem : text };
            }

         }  // while

         parser.err(text, "Invalid calculation expression.", callerInst || this);
      }
      finally {
         jTAC._internal.popContext();
      }
   },

/*
Call to test the parser parameter passed to each parse() method.
*/
   _checkParser: function(parser)
   {
      if (!parser)
         this._error("Parser script has not been loaded.");
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Base", jTAC._internal.temp._CalcItems_Base);

/* STATIC METHOD
Utility to handle various ways to represent a CalcItem.
If passed an actual CalcItem subclass, it is returned.
If passed a JSon object, it attempts to convert into a CalcItem object.
If passed an array, it creates CalcItems.Group with child items. Each child CalcItem
   uses a "+" operator. You can change that by adding a string item with "+", "-", "*", "/"
   preceding the CalcItem that needs is operator changed.
If passed a number, it creates CalcItems.Number with that value.
If passed a string, it creates a CalcItems.Element which uses the string as the elementID.
If passed NaN, it creates CalcItems.NaN.
If passed Null, it creates CalcItems.Null
Other values throw an exception.
*/
function jTAC_CleanupCalcItemInput(input) {
   try
   {
      jTAC._internal.pushContext("convert data into CalcItem");

      if (input == null) {
         return jTAC.create("CalcItems.Null");
      }
      if (input instanceof Array) {
         var pci = jTAC.create("CalcItems.Group");
         for (var i = 0; i < input.length; i++) {
            pci.items.push(input[i]);
         }
         return pci;
      }
      if (typeof (input) == "number") {
         return isNaN(input) ? jTAC.create("CalcItems.NaN") : jTAC.create("CalcItems.Number", {number: input});
      }
      if (input instanceof jTAC.CalcItems.Base) {
         return input;
      }
      if (typeof (input) == "object") {
         if (!input.jtacClass)
            jTAC.error("Must define the CalcItem's class in the 'jtacClass' property of the object that describes a CalcItem.");
         return jTAC.create(null, input);  // may throw an exception
      }
      if (typeof (input) == "string") {
       // first try for a CalcItem class name. If not found, then its the ID of an element
         var cl = jTAC.createByClassName(input, null, true);
         if (cl && cl instanceof jTAC.CalcItems.Base) {
            return cl;
         }
         if (input.indexOf("CalcItems.") > -1)
            jTAC.error("Must load scripts for the class [" + input + "]");
         return jTAC.create("CalcItems.Element", {elementId: input});
      }
      jTAC.error("Must supply a CalcItem object or an array of CalcItem objects.");
   }
   finally {
      jTAC._internal.popContext();
   }

}


jTAC.checkAsCalcItem = function ( val ) {
   return jTAC_CleanupCalcItemInput(val);
}
jTAC.checkAsCalcItemOrNull = function ( val ) {
   if (!val) // includes null and ""
      return null;
   return jTAC.checkAsCalcItem(val);
}

﻿// jTAC/CalcItems/Null.js
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
Module: Calculations
Class : CalcItems.Null
Extends: CalcItems.Base

Purpose:
The javascript value 'null' means that there is nothing to calculate and its not an error condition.

Its evaluate function always returns null, stopping the calculation.
This is generally used in a CalcItems.Conditional on its [failed] property
and in CalcItems.Group in its [valueWhenNull] and [valueWhenEmpty] properties.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
The value null. (Not in quotes. Case sensitive.)
null


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Null = {
   extend: "CalcItems.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/* 
Returns Null.
*/
   evaluate : function () {
      return null;
   },

   parse: function(text, parser) {
      this._checkParser(parser);
      var r = parser.asNull(text, false);
      if (r) {
         return { obj: jTAC.create("CalcItems.Null"), rem: r.rem };
      }
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
jTAC.define("CalcItems.Null", jTAC._internal.temp._CalcItems_Null);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Null");

﻿// jTAC/CalcItems/NaN.js
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
Module: Calculations
Class : CalcItems.NaN
Extends: CalcItems.Base

Purpose:
NaN means that the calculation failed with an error.

Its evaluate function always returns NaN, stopping the calculation.
This is generally used in a CalcItems.Conditional object on its [failed] property.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
The value NaN. (Not in quotes. Case sensitive.)
NaN


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_NaN = {
   extend: "CalcItems.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/* 
Returns NaN.
*/
   evaluate : function () {
      return NaN;
   },

   parse: function(text, parser) {
      this._checkParser(parser);
      var r = parser.asNaN(text, false);
      if (r) {
         return { obj: jTAC.create("CalcItems.NaN"), rem: r.rem };
      }
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
jTAC.define("CalcItems.NaN", jTAC._internal.temp._CalcItems_NaN);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.NaN");

﻿// jTAC/CalcItems/Number.js
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
Module: Calculations
Class : CalcItems.Number
Extends: CalcItems.Base

Purpose:
Holds a number that is part of the calculation.
Assign the number to the [number] property. If not assigned,
that property defaults to 0.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   number (number) - 
      The numeric value to return in the evaluate() method.
      It defaults to 0.

Parsing calculation expressions:
Any number, whether integer or float, positive or negative
in the culture neutral format. (Period is the decimal separator,
there are no thousands separators, minus character to the left without a space after it).
0
-10
200000.00


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Number = {
   extend: "CalcItems.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      number: 0
   },

   configrules: {
      number: jTAC.checkAsNumber
   },
   /* 
   Returns the value of the number property.
   */
   evaluate : function () {
      return this.getNumber();
   },

   parse : function(text, parser) {
      try {
         this._pushContext();

         var r = parser.asNumber(text, false);
         if (r) {
            return { obj: jTAC.create("CalcItems.Number", {number: r.number}), rem: r.rem };
         }
         return null;
      }
      finally {
         this._popContext();
      }
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Number", jTAC._internal.temp._CalcItems_Number);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Number");
﻿// jTAC/CalcItems/Element.js
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
Module: Calculations
Class : CalcItems.Element
Extends: CalcItems.Base

Purpose:
Evaluates an element on the page, whether DOM element or a widget. 
It uses a Connection object to associate with the element
and a TypeManager to return a numeric value from the connection. 
User must specify the id of the element in the [elementId] property
or the Connection object in the [connection] property.
If they specify the id, the jTAC.connectionResolver object will
determine the best Connection object for that id.

The TypeManager is determined in several ways:
1. The user can supply it by defining its name in the [datatype] property
   or creating an instance and assigning it to the [typeManager] property.
2. The Connection object may return a TypeManager, especially if the 
   element is a specific datatype like integer, float, or date.
3. If neither of the above supply a TypeManager, TypeManagers.Float is used.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   typeManager (TypeManager object)- 
      Gets the user specified TypeManager object.
      If not defined, the above rules are used to determine it.

   datatype (string) - 
      The datatype assigned to the TypeManager object.
      When setting it, the typeManager property is updated.
      Names are strings registered with jTAC.define() or jTAC.defineAlias(),
      such as "Integer", "Float", "Date", "DateTime", "Currency",
      "Percent", "TimeOfDay", and "Duration". (Those are predefined.)

   connection (Connection object) -
      The Connection object that attaches to the element on the page
      that is the source of the number used in this calculation.
      If you don't set it, its value is determined by the [elementId] property.

   elementId (string) -
      Updates the connection with a new Connection class using this Id
      to identify its element.
      Uses jTAC.connectionResolver to replace the existing
      connection class if the id needs it.

   valueWhenInvalid (CalcItem object) -
      If the connection's value is invalid (cannot be resolved to a number),
      this CalcItem is evaluated.
      Typically you assign a constant of 0 using CalcItems.Number({value:0})
      or NaN using CalcItems.NaN().
      However, its valid to use any CalcItem.
      If you use CalcItems.NaN, it also stops the calculation.
      It defaults to CalcItems.NaN().
      This is a shortcut to using CalcItems.WhenInvalid() around the CalcItems.Element.

   valueWhenNull (CalcItem object) -
      If the Connection determines its value is null (empty textbox for example),
      it evaluates this CalcItem.
      Typically you assign a constant of 0 using CalcItems.Number({value:0})
      or null using CalcItems.Null().
      However, its valid to use any CalcItem.
      It defaults to CalcItems.Null({value:0}).
      This is a shortcut to using CalcItems.WhenNull() around the CalcItems.Element.

Parser rules:
1) The ID of an element alone, as a string: 
   "id". Example: "TextBox1".
   The string pattern must be legal for an HTML ID: letters, digits, underscore, period. No whitespace.
   NOTE: DOM uses a case sensitive match for ids passed into document.getElementById().
2) A function named "Element" with parameters: 
   Element("id")
   - "id" is the same as in #1, a string in quotes.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Null
CalcItems.NaN
TypeManagers.Base
TypeManagers.BaseGlobalize
TypeManagers.BaseNumber
Either or both: TypeManagers.Integer, TypeManagers.Float
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Element = {
   extend: "CalcItems.Base",
   require: ["CalcItems.Null", "CalcItems.NaN", "Connections.FormElement", "TypeManagers.BaseNumber"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      datatype: "",
      typeManager: null,
      connection: "Connections.FormElement",// jTAC.checkAsConnection will convert this to an instance
      elementId: null,
      valueWhenNull: "CalcItems.Null", // jTAC.checkAsCalcItem will convert this to an instance
      valueWhenInvalid: "CalcItems.NaN"
   },

   configrules: {
      typeManager: jTAC.checkAsTypeManagerOrNull,
      connection: jTAC.checkAsConnectionOrNull,
      valueWhenNull: jTAC.checkAsCalcItem,
      valueWhenInvalid: jTAC.checkAsCalcItem
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no connection is defined or 
   it does not specify an actual element.
   */
   canEvaluate : function () {
      var conn = this.getConnection();
      if (!conn || !conn.getElement(true)) {
         return false;
      }
      return this.callParent();
   },

   /* 
   If the connection cannot supply a number, it returns NaN, null, or 0
   depending on the valueWhenInvalid and valueWhenNull properties.
   Otherwise, it returns the number of the connection.
   */
   evaluate : function () {
      try {
         this._pushContext();

         var conn = this.getConnection();
         if (conn) {
            if (conn.isNullValue()) {
               var vwn = this.getValueWhenNull();
               if (!vwn || !vwn.canEvaluate()) {
                  return null;
               }
               return vwn.evaluate();
            }
            var tm = this.getTypeManager();
            if (!tm) {
               tm = conn.getTypeManager();
               if (!tm)
                  tm = jTAC.create("TypeManagers.Float");
               this.setTypeManager(tm);
            }

            try {
               if (!conn.isValidValue(tm.storageTypeName()))
                  throw new Error();   // just to jump to the catch statement
               var val = tm.toValueFromConnection(conn);
               return tm.toNumber(val); // while Integer and Float TypeManagers just return their actual value, this helps when using a date or time
            }
            catch (e) { // conversion error. Illegal value
               var vwi = this.getValueWhenInvalid();
               if (!vwi || !vwi.canEvaluate()) {
                  return NaN;
               }
               return vwi.evaluate();
            }
         }
         else {
            return NaN;
         }
      }
      finally {
         this._popContext();
      }
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var conn = this.getConnection();
      if (conn) {
         list.push(conn);
      }
   },


   parse : function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r, id, tm, conn;

         r = parser.asId(text); // { id: id, rem: remaining text}
         if (r) {
            return { obj: jTAC.create("CalcItems.Element", {elementId: r.id}), rem: r.rem };
         }

      // Element("id")
         r = parser.asExact(text, "Element(", false, false, null);
         if (r)
         {
            text = r.rem; 
         // look at the first parameter: ID
            r = parser.asId(text, true); // { id: id, rem: remaining text}
            text = r.rem;
            var id = r.id;

            r = parser.cParen(text, true);
            text = r.rem;

            return { obj: jTAC.create("CalcItems.Element", {elementId: id}), rem: text };
         }
         return null;
      }
      finally {
         this._popContext();
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /* datatype property: GET function
   Gets the datatype assigned to the TypeManager object.
   */
   getDatatype : function () {
      return this.config.typeManager ? this.config.typeManager.dataTypeName() : null;
   },

   setDatatype : function (datatype) {
   // The setTypeManager property does all of the work, converting the string to a TypeManager object
   // and throwing exceptions when the type is unknown.
   // This technique effectively makes setDatatype an alias for setTypeManager,
   // allowing the user to specify either a string or typemanager object.
      this.setTypeManager(datatype);
   },

   /* elementId property: GET function
   Returns the HTML Element ID within the Connection object
   or null if not available.
   */
   getElementId : function () {
      var conn = this.config.connection;
      return conn && conn.getId ? conn.getId() : null;
   },

   /* elementId property: SET function
   Updates the connection with a new Connection class using this Id
   to identify its element.
   Uses jTAC.connectionResolver to replace the existing
   connection class if the id needs it.
   Alternatively, this accepts a Connection object, which it
   redirects to the setConnection method.
   */
   setElementId : function (id) {
      if (typeof id == "object") {
         this.setConnnection(id);
      }
      else {
         var def = jTAC.create("Connections.FormElement", {id: id, allowNone: true} );   // allowNone=true
         var conn = jTAC.connectionResolver.create(id, def);   // may create a replacement connection
         this.config.connection = conn ? conn : def;
      }
   }

}
jTAC.define("CalcItems.Element", jTAC._internal.temp._CalcItems_Element);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Element");

﻿// jTAC/CalcItems/Group.js
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
Module: Calculations
Class : CalcItems.Group
Extends: CalcItems.Base

Purpose:
Holds an array of CalcItems. Calculates them together as a group, 
like when you enclose elements in parenthesis in an expression.
Each CalcItem object that is added to the group has its own [operator]
property to determine how its calculated.

Handles 80 bit math rounding errors usually seen with javascript.

See \jTAC\Calculations\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   items (Array of CalcItem objects) - 
      A list of CalcItems to perform the calculations upon.
      If any of these items returns NaN or null from its calculation,
      the valueWhenInvalid or valueWhenNull properties determine
      how to handle those cases.

   valueWhenInvalid (CalcItem object) -
      If a child CalcItem returns NaN, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the stopProcessing defined on the valueWhenInvalid CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining items.)
      Typically you assign a constant of 0 using CalcItems.Number(0)
      or NaN using CalcItems.NaN (that is actually the default).
      It defaults to CalcItems.NaN.

   valueWhenNull (CalcItem object) -
      If a child CalcItem returns null, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the stopProcessing defined on the valueWhenNull CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining items.)
      Typically you assign a constant of 0 using CalcItems.Number(0)
      or null using CalcItems.Null (that is actually the default).
      It defaults to CalcItems.Number(0).

   valueWhenEmpty (CalcItem object) -
      If the items is empty or all of its children cannot evaluate,
      it evaluates this CalcItem.
      Typically you assign a constant of 0 using CalcItems.Number(0)
      (that is actually the default) or NaN using CalcItems.NaN.
      However, its valid to use any CalcItem.
      It defaults to CalcItems.Number(0).

ALERT: 
Any property that accepts a CalcItem (including the child elements of [items]) 
all support these values:
   * CalcItems subclass
   * JSon that converts to a CalcItem by specifying the class name in the jtacClass property
   * String - Must be the id of an element on the page. Converts to CalcItems.Element
   * Number - Converts to CalcItems.Number
   * Null - Converts to CalcItems.Null
   * NaN - Converts to CalcItems.NaN
   * Array - Contents can be any of the above types. Converts to CalcItems.Group with child CalcItems

Parsing calculation expressions:
A list of 1 or more child calculation expressions representing other CalcItems
optionally enclosed by parenthesis. Each is separated by one of the math operators: + - * /
(calculation expression1)
(calculation expression1 + calculation expression2 - calculation expression3)
calculation expression1 + calculation expression2 - calculation expression3

Note: If it finds a single calculation expression in the parenthesis, it 
does not return a CalcItems.Group object. Instead, it returns a CalcItem reflecting the expression.

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Number
CalcItems.NaN
TypeManagers.Base
TypeManagers.BaseGlobalize
TypeManagers.BaseNumbers
TypeManagers.Float

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Group = {
   extend: "CalcItems.Base",
   require: ["CalcItems.NaN", "CalcItems.Number", "TypeManagers.Float"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      items: [],
      valueWhenEmpty: "CalcItems.Number", // jTAC.checkAsCalcItem will convert this to an instance
      valueWhenInvalid: "CalcItems.NaN",
      valueWhenNull: "CalcItems.Number"
   },

   configrules: {
      valueWhenEmpty: jTAC.checkAsCalcItem,
      valueWhenInvalid: jTAC.checkAsCalcItem,
      valueWhenNull: jTAC.checkAsCalcItem
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no CalcItem exists in items.
   */
   canEvaluate: function () {
      if (!this.getItems().length) {
         return false;
      }
      return this.callParent();
   },


   /* 
   Returns the total from all calcItems. 
   If any CalcItem returns NaN, it uses valueWhenInvalid 
   to determine how to proceed.
   If any CalcItem returns null, it uses valueWhenNull
   to determine how to proceed.
   If the entire list was empty or all items returned false
   from canEvaluate(), it uses valueWhenEmpty to determine
   the result.
   There are some serious challenges with 80 bit floating point math
   that are managed through the rounding logic here.
   */
   evaluate: function () {
      try {
         this._pushContext();

         this._cleanupItems();
         var items = this.getItems();
         var ttl = 0;   // total
         var ftm = jTAC.create("TypeManagers.Float");   // provides tools for rounding
         var empty = true;

         for (var i = 0; i < items.length; i++) {
            if (items[i].canEvaluate()) {
               empty = false;
               var val = items[i].evaluate();
               if (isNaN(val)) {
                  var vwi = this.getValueWhenInvalid();
                  if (!vwi || !vwi.canEvaluate()) {
                     return NaN;
                  }
                  val = vwi.evaluate();
                  if (isNaN(val) || (val == null) || vwi.getStopProcessing()) {
                     return val; // replacement for the group calculation
                  }
                  // if here, the value becomes part of this group's calculation.
               }
               else if (val == null) {
                  var vwe = this.getValueWhenNull();
                  if (!vwe || !vwe.canEvaluate()) {
                     return null;
                  }
                  val = vwe.evaluate();
                  if (isNaN(val) || (val == null) || vwe.getStopProcessing()) {
                     return val; // replacement for the group calculation
                  }
                  // if here, the value becomes part of this group's calculation.
               }
               // special case. First item ignores operator.
               // No need to deal with rounding.
               // Also doesn't address if the first item's canEvaluate() returns false.
               if (!i) {
                  ttl = val;
                  continue;
               }

               // clean up math errors with a little rounding.
               // Capture # of dec places in current value
               var cu = 1;  //CleanUp with rounding when 1. Set to 0 if division is used
               var vdp = ftm.numDecPlaces(val);  // value's decimal places
               var tdp = ftm.numDecPlaces(ttl); // total's decimal places
               // use the operator to include it in the total
               switch (items[i].getOperator()) {
                  case "+":
                     vdp = Math.max(vdp, tdp);  // used by rounding
                     ttl += val;
                     break;
                  case "-":
                     vdp = Math.max(vdp, tdp);  // used by rounding
                     ttl -= val;
                     break;
                  case "*":
                     // Decimal multiplication will have at most
                     // the # of decimal places of each value added together.
                     // Example: if ttl has 2 dec and val has 3, vdp needs to be 5.
                     vdp = vdp + tdp;
                     ttl *= val;
                     break;
                  case "/":  // divide - watch for divide by zero errors
                     if (val != 0.0)
                        ttl = ttl / val;
                     else
                        return NaN;
                     cu = 0; //decimalPlaces is unknown, turn off cleanup because 1/3 = 0.333333333333 which needs to be preserved
                     break;
               }  // switch

               // clean up math errors with a little rounding.
               // Always round to the highest precision needed, using Point5 method
               // vdp is the precision
               // This is to prevent any floating point rounding that javascript does
               // during basic mathmatical operations
               if (cu) {
                  ttl = ftm.round(ttl, 0, vdp);
               }

            }
         }  // for
         if (empty) {
            var vwe = this.getValueWhenEmpty();
            if (!vwe || !vwe.canEvaluate()) {
               return null;
            }
            return vwe.evaluate();
         }
         return ttl;
      }
      finally {
         this._popContext();
      }
   },

   /*
   Looks through the items collection. If any are JSON objects, they are converted
   to CalcItems. If there are any strings representing operators, they
   are applied to the next CalcItem.
   If any are illegal entries, an exception is thrown.
   */
   _cleanupItems: function () {
      var items = this.getItems();
      var nextOp = null;
      for (var i = 0; i < items.length; i++) {
         var item = items[i];
         // look for operator strings
         if ((typeof item == "string") && ("+-*/".indexOf(item) > -1)) {
            nextOp = item;
         // strip out the operator
            items.splice(i, 1);
            if (i >= items.length)
               continue;
            item = items[i];

         }
         item = this._cleanupCalcItemInput(item);
         items[i] = item;
         if (nextOp) {
            item.operator = nextOp;
            nextOp = null;
         }
      }  // for
   },

   /* 
   Adds a CalcItem to the end of the Items collection.
   item - Can be any of these:
   * CalcItems subclass
   * JSon that converts to a CalcItem by specifying the class name in the jtacClass property
   * String - Must be the id of an element on the page. Converts to CalcItems.Element
   * Number - Converts to CalcItems.Number
   * Null - Converts to CalcItems.Null
   * NaN - Converts to CalcItems.NaN
   * Array - Contents can be any of the above types. Converts to CalcItems.Group with child CalcItems
   operator - Optional. If supplied, it is a string with one of these values: "+" "-", "*", "/".
   Assigns the operator property.
   */
   addItem: function (item, operator) {
      this._cleanupItems();  // may throw exception
      item = this._cleanupCalcItemInput(item);  // may throw exception
      if (operator) {
         item.operator = operator;
      }
      this.getItems().push(item);
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections: function (list) {
      this._cleanupItems();
      var items = this.getItems();
      for (var i = 0; i < items.length; i++) {
         items[i].collectConnections(list);
      }  // for

   },

   parse : function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r = parser.oParen(text),
         ci;
         if (r) {
            text = r.rem;
            r = this.calcexpr(text, parser); // it returns either a CalcItems.Group or another CalcItem type. Either case, this value is actually returned.
            if (r) {
               text = r.rem;
               ci = r.ci;
               r = parser.cParen(text);
               if (r) {
                  return { obj: ci, rem: r.rem };
               }
               else
                  parser.err(text, "Missing closing paren.", this);
            }
         }
         return null;
      }
      finally {
         this._popContext();
      }
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Group", jTAC._internal.temp._CalcItems_Group);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Group");

﻿// jTAC/CalcItems/Conditional.js
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
Module: Calculations
Class : CalcItems.Conditional
Extends: CalcItems.Base

Purpose:
Allows IF THEN logic.
Define a Condition object in its [condition] property.
Conditions evaluate something and return "success" and "failed".
See \jTAC\Conditions\Base.js for more.

When that Condition evaluates as "success", it evaluates a CalcItem object 
you define in the [success] property. 

When the Condition evaluates as "failed", it evaluates a CalcItem object 
you define in the [failed] property.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   condition (Condition object) - 
      The Condition object. Required.
   success (CalcItem object) - 
      The CalcItem to evaluate when the Condition evaluates as "success".
      Its common to assign a CalcItem.Group object to calculate a list of values, but it can
      host any type, including another CalcItem.Conditional object.
      Defaults to CalcItem.Group.
   failed (CalcItem object) - 
      The CalcItem to evaluate when the Condition evaluates as "failed".
      Its common to assign a CalcItem.Group to calculate a list of values, but it can
      host any type, including another CalcItem.Conditional.
      If you want the calculation to stop, assign a CalcItem.NaN here.
      Defaults to CalcItem.Group.
   cannotEvalMode (string) - 
      Determines how the calculation works when the Condition evaluates as "cannot evaluate". 
      Some Conditions cannot evaluate data until certain values exist. 
      For example, the Condition.Range object cannot evaluate until the text in the textbox 
      is formatted to match what is demanded by its TypeManager.
      Values are:
         "error" - Stop the calculation. It’s an error. This is the default.
         "zero" - Return 0.
         "success" - Evaluate the [success] property.
         "failed" - Evaluate the [failed] property.

Parsing calculation expressions:
A function named "Condition" with the with parameters.
Condition(conditional logic[, success calculation][, failed calculation][, JSon with additional property values])
The parameters are:
- condition logic - provides the boolean logic that selects whether to run success or failed calculation.
   Initially this is a JSon representation of the desired Condition class
   where the jtacClass property identifies the name of the class and the remaining properties
   are values to assign to properties on the object created.
   Condition({"jtacClass" : "CompareToValue", "elementId" : "TextBox1", "operator" : "LessThan", "ValueToCompare" : 10, "datatype" : "integer"}, remaining parameters)

   If this parser is expanded to support Conditions, then this parameter will also accept text compatible with those parsers.

- success calculation  The calculation expression to run when the Condition returns "success".
   If this expression is not used, assign the value "null".
   Condition(conditional logic, ("TextBox1" + "TextBox2"), failed calculation, JSon with additional property values)
   Condition(conditional logic, null, failed calculation, JSon with additional property values)

- failed calculation (optional). The calculation expression to run when the Condition returns "failed".
   If this expression is not used, assign the value "null". It can also be omitted if the last two parameters are not needed.
   Condition(conditional logic, success calculation, ("TextBox1" + "TextBox2"), JSon with additional property values)
   Condition(conditional logic, success calculation, null, JSon with additional property values)

- One of two values to provide additional property values:
   1) One of these strings to assign to cannotEvalMode: "error", "zero", "success", "failed"
   2) JSon with additional property values (optional). A JSon with property names found
     on the CalcItems.Conditional class, and the values to assign to those properties.
     Condition(conditional logic, success calculation, failed calculation, { "cannotEvalMode" : "success" })




Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Group
Conditions.Base


----------------------------------------------------------- */

if (jTAC.isDefined("Conditions.Base")) {  // favored over using the require property because a merged calculations.js file should not require Conditions to be loaded
jTAC._internal.temp._CalcItems_Conditional = {
   extend: "CalcItems.Base",
   require: ["CalcItems.Group", "Conditions.Base"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );
      jTAC.require("Conditions.Base");
   },

   config: {
      condition: null,
      success: "CalcItems.Group", // jTAC.checkAsCalcItem will convert this to an instance
      failed: "CalcItems.Group",
      cannotEvalMode: "error"
   },

   configrules: {
      condition: jTAC.checkAsCondition,
      success: jTAC.checkAsCalcItem,
      failed: jTAC.checkAsCalcItem,
      cannotEvalMode: ["error", "zero", "success", "failed"]
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no Condition is defined or 
   its own canEvaluate() method returns false.
   */
   canEvaluate : function () {
      var cond = this.getCondition();
      if (!cond || !cond.canEvaluate()) {
         return false;
      }
      return this.callParent();
   },

   /* 
   Uses the Condition to select which of 'success' or 'failed'
   properties to evaluate. If the Condition cannot evaluate,
   it uses the rule in the cannotEvalMode property.
   */
   evaluate : function ()
   {
      try {
         this._pushContext();

         var cond = this.getCondition();
         if (!cond || !cond.canEvaluate()) {
            return -1;
         }
         var r = cond.evaluate();
         if (r == -1) {   // cannot evaluate returned
            switch (this.getCannotEvalMode()) {
               case "error":
                  return NaN;
               case "zero":
                  return 0;
               case "success":
                  r = 1;
                  break;
               case "failed":
                  r = 0;
                  break;
            }  // switch
         }  // if

         var item = r ? this.getSuccess() : this.getFailed();
         if (!item || !item.canEvaluate()) {
            return null;
         }
         return item.evaluate();
      }
      finally {
         this._popContext();
      }
   },

   parse: function(text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);

         var r = parser.asExact(text, "Condition(", false, false, null),
         cond, sci, fci, json, mode;
         if (r) {
            text = r.rem;
            r = parser.asJSon(text, true);
            cond = jTAC.create(null, r.JSon);
            if (!(cond instanceof jTAC.Conditions.Base))
               parser.err(text, "JSon for condition must specify a Condition class", this);
            text = r.rem;

            r = parser.asParmDelim(text, true);
            text = r.rem;

         // success expression or null
            r = parser.asNull(text);
            if (!r) {
               r = this.calcexpr(text, parser); // it returns either a CalcItems.Group or another CalcItem type. Either case, this value is actually returned.
               if (r) {
                  sci = r.ci;
               }
               else
                  parser.err(text, "Missing success parameter", this);
            }
            text = r.rem;

            r = parser.asParmDelim(text, false);
            if (!r || (r.delim == "}"))
               parser.err("Illegal delimiter", this);
            text = r.rem;
            if (r.delim == ",") {
            // failed expression or null
               r = parser.asNull(text);
               if (!r) {
                  r = this.calcexpr(text, parser); // it returns either a CalcItems.Group or another CalcItem type. Either case, this value is actually returned.
                  if (r)
                     fci = r.ci;
               }

               if (r) {
                  text = r.rem;
                  r = parser.asParmDelim(text, false);
                  if (!r || (r.delim == "}"))
                     parser.err("Illegal delimiter", this);
                  text = r.rem;

                  if (r.delim == ",") {
                  // last parameter to set certain properties.
                     r = parser.asId(text, false);  // used with EvalMode. Any string can be returned but assigning an illegal value to the property will throw an exception
                     if (r) {
                        mode = r.id;
                     }
                     else { // try a JSon
                        r = parser.asJSon(text, true);
                        json = r.JSon;
                     }
                     text = r.rem;
                     r = parser.cParen(text, true);
                     text = r.rem;
                  }

               }

            }

            var ci = jTAC.create("CalcItems.Conditional");
            ci.condition = cond;
            ci.success = sci;
            ci.failed = fci;
            if (mode != null) {
               ci.cannotEvalMode = mode;
            }
            if (json) {
               ci.setProperties(json);
            }
            return { obj: ci, rem: text };
         }
         return null;
      }
      finally {
         this._popContext();
      }
   }
   
   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Conditional", jTAC._internal.temp._CalcItems_Conditional);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Conditional");

}﻿// jTAC/CalcItems/BaseFunction.js
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
Module: Calculations
Class : CalcItems.BaseFunction
Extends: CalcItems.Base

Purpose:
Defines the evaluate() function to provide specialized math functions.

Subclasses override the _func() method to handle the function.
That function is passed either an array of values or a single value,
depending on the [parms] property contents and the numParms() method.
The caller, evaluate(), goes through the CalcItems defined in the [parms]
property, calling evaluate() on each, to build the value passed to _func().

The _numParms() determines how many parameters are used by your function.
When it returns 0 (the default), it returns an array of every CalcItem defined.
When it returns 1, it returns a single value, from the first CalcItem defined.
When it returns any other value, it returns an array of that many CalcItems defined.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   parms (Array of CalcItem objects) - 
      A list of CalcItems to perform the calculations upon.
      If any of these parms returns NaN or null from its calculation,
      the [valueWhenInvalid] or [valueWhenNull] properties determine
      how to handle those cases.

   valueWhenInvalid (CalcItem object) -
      If a child CalcItem returns NaN, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the [stopProcessing] property defined on the 
      [valueWhenInvalid] CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining parms.)
      Typically you assign a constant of 0 using CalcItems.Number
      or NaN using CalcItems.NaN (that is actually the default).
      It defaults to CalcItems.NaN.

   valueWhenNull (CalcItem object) -
      If a child CalcItem returns null, this provides an alternative CalcItem object.
      Its calculation either replaces the CalcItem that failed or
      replaces the entire Group's calculation,
      depending on the [stopProcessing] property defined on the 
      [valueWhenNull] CalcItem object.
      If the value returned by this CalcItem is either NaN or null,
      that value is returned by CalcItems.Group. 
      (Only a number value can continue processing the remaining parms.)
      Typically you assign a constant of 0 using CalcItems.Number
      or null using CalcItems.Null (that is actually the default).
      It defaults to CalcItems.Number.

Parsing calculation expressions:
Functions all have a pattern of:
Name(parameters)
The Name is defined by the _getParseName() method in the subclass.
The parameters are populated by the _getParseParms method, which returns an array
of the parameters.
The conversion to a CalcItem is handled by _convertParseParms().


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.Number
CalcItems.NaN

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_BaseFunction = {
   extend: "CalcItems.Base",
   "abstract": true,
   require: ["CalcItems.Number", "CalcItems.NaN"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      parms: [],
      valueWhenInvalid: "CalcItems.NaN",// jTAC.checkAsCalcItem will convert this to an instance
      valueWhenNull: "CalcItems.Number"
   },

   configrules: {
      valueWhenInvalid: jTAC.checkAsCalcItem,
      valueWhenNull: jTAC.checkAsCalcItem
   },
   /* 
   If the connection cannot supply a number, it returns NaN or 0
   depending on the Func and Func properties.
   Otherwise, it returns the number of the connection.
   If there are any Parms that calculate to NaN or null (after evaluating
   valueWhenInvalid and valueWhenNull), the function is not called.
   Instead the evaluate function returns immediately with NaN or null.
   If the number of parameters is not reached, it returns NaN.
   */
   evaluate : function () {
      try {
         this._pushContext();
         this._cleanupParms();
         var np = this._numParms();
         var evalparms = [];
         var parms = this.getParms();
         for (var i = 0; i < parms.length; i++) {
            if (np && i > np)
               break;
            var parm = parms[i];
            var val = null;
            if (parm.canEvaluate()) {
               val = parm.evaluate();
               if (isNaN(val)) {
                  var vwi = this.getValueWhenInvalid();
                  if (!vwi || !vwi.canEvaluate()) {
                     return NaN;
                  }
                  val = vwi.evaluate();
                  if (isNaN(val) || (val == null) || vwi.getStopProcessing()) {
                     return val; // replacement for the function calculation
                  }
               }
               else if (val == null) {
                  var vwe = this.getValueWhenNull();
                  if (!vwe || !vwe.canEvaluate()) {
                     return null;
                  }
                  val = vwe.evaluate();
                  if (isNaN(val) || (val == null) || vwe.getStopProcessing()) {
                     return val; // replacement for the function calculation
                  }
               }
               evalparms.push(val);
            }
         }  // for

         if (np && evalparms.length < np) {  // does not have enough parameters to process
            return NaN;
         }
         if (np == 1) {  // convert to the single value
            evalparms = evalparms[0];
         }

         // NOTE: when np = 0, the evalparms array can be empty. Its up to your function to determine how to handle that.

         return this._func(evalparms);
      }
      finally {
         this._popContext();
      }
   },


/* ABSTRACT METHOD
   Evaluate the parameter and return a number, NaN if it is an error condition,
   or null if there is nothing to evaluate.
      parms - This is either an array of numbers, or a single number,
         depending on the _numParms() method. 
         The array can be empty.
*/
   _func : function(parms) {
      this._AM();
   },

/*
   Determines how many parameters are used by your function.
   When it returns 0 (the default), it returns an array of every CalcItem defined.
   When it returns 1, it returns a single value, from the first CalcItem defined.
   When it returns any other value, it returns an array of that many CalcItems defined.
*/
   _numParms : function() {
      return 0;
   },

   /*
   Looks through the parms collection. If any are JSON objects, they are converted
   to CalcItems. If any are illegal entries, an exception is thrown.
   */
   _cleanupParms : function () {
      var parms = this.getParms();
      for (var i = 0; i < parms.length; i++) {
         parms[i] = this._cleanupCalcItemInput(parms[i]);
      }  // for
   },

   /* 
   Adds a CalcItem to the end of the Parms collection.
      parm - Can be any of these:
         * CalcItem object
         * JSon that converts to a CalcItem by specifying the class name in the jtacClass property
         * String - Must be the id of an element on the page. Converts to CalcItems.Element
         * Number - Converts to CalcItems.Number
         * Null - Converts to CalcItems.Null
         * NaN - Converts to CalcItems.NaN
         * Array - Contents can be any of the above types. Converts to CalcItems.Group with child CalcItems

   */
   addParm : function (parm) {
      this._cleanupParms();  // may throw exception
      parm = this._cleanupCalcItemInput(parm);  // may throw exception
      this.getParms().push(parm);
   },

   /*
   Let's the caller retrieve the collection instances defined in 
   the CalcItem subclass into a new list.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      this._cleanupParms();
      var parms = this.getParms();
      for (var i = 0; i < parms.length; i++) {
         parms[i].collectConnections(list);
      }  // for

   },

/* ---- PARSER SUPPORT ------------------------------------- */

/*
   If text starts with a match to _getParseName + "(" or _getParseName2 + "(",
   it is a match and will process parameters within the parenthesis.
   Otherwise it returns null.
*/
   parse: function (text, parser) {
      try {
         this._pushContext();

         this._checkParser(parser);
         var r = parser.asExact(text, this._getParseName() + "(", false, false, null);
         if (!r) {
            var pn2 = this._getParseName2();
            if (pn2) {
               r = parser.asExact(text, pn2 + "(", false, false, null);
            }
            if (!r) {
               return null;
            }
         }
         text = r.rem;
         r = this._getParseParms(text, parser);

         return { obj: this._convertParseParms(r.parms), rem: r.rem};
         }
      finally {
         this._popContext();
      }
   },

/* 
Returns the string name of the function, without trailing parenthesis.
By default, it returns the actual class name used by the jTAC.define() function.
*/
   _getParseName: function () {
      return this.$className;
   },

/* 
Returns the string name of the function, without trailing parenthesis.
This is an alternative to _getParseName. Returns null if not used.
*/
   _getParseName2: function () {
      return null;
   },

/*
Used by _getParseParms to indicate the number of calculation expression
to be parsed. By default, it returns the same value oas _numParms().
*/
   _numParserParms: function() {
      return this._numParms();
   },

/*
Converts a comma delimited list of parameters until a closing parenthesis is reached.
Returns an object if found, and null if not. The object has these properties:
   parms (array) - an array of parameter values
   rem (string) - the remaining text after the number was extracted
This class assumes all parameters convert to calculation expressions.
*/
   _getParseParms: function (text, parser) {
      var r,
      parms = [],
      np = this._numParserParms(),
      i = 0;
      while (true) {
         r = this.calcexpr(text, parser);
         if (!r)
            parser.err(text, "Missing parameter", this);
         text = r.rem;
         parms.push(r.ci);

         r = parser.asParmDelim(text, false);
         if (!r || r.delim == "}")
            parser.err(text, "parameter missing terminating delimiter", this);
         text = r.rem;
         if (r.delim == ")")  // done!
            return { parms : parms, rem : text };
         i++;
         if (np && (i >= np))
            parser.err(text, "too many calc expressions", this);
      }  // while
   },

/* 
Creates the actual CalcItem object from the parameters.
Returns the CalcItem. If it cannot convert, it should throw an exception (via this.getParser().err()).
This class creates an instance using the fullClassName of this instance
and sets its parms property.
*/
   _convertParseParms: function (parms) {
      var ci = jTAC.create(this.$fullClassName);
      ci.setParms(parms);
      return ci;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setParms : function (val)
   {
      if (val instanceof Array)
         this.config.parms = val;
      else
      {
         this.config.parms = [this._cleanupCalcItemInput(val)];  // may throw exception
      }
   }
}
jTAC.define("CalcItems.BaseFunction", jTAC._internal.temp._CalcItems_BaseFunction);

﻿// jTAC/CalcItems/Abs.js
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
Module: Calculations
Class : CalcItems.Abs
Extends: CalcItems.BaseFunction

Purpose:
Returns the absolute value of the number passed in.
Only supports one number passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
1) A function named "Abs" that takes one parameter, a calculation expression.
   Abs(calculation expression)

   Abs("TextBox1" - 100)

2) A function named "Math.abs" to minic the javascript function of the same name.
   Math.abs(calculation expression)

   Math.abs("TextBox1" - 100)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Abs = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   _func : function (parms) {
      return Math.abs.apply(window, [parms]);
   },

   _numParms : function() {
      return 1;
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName2: function () {
      return "Math.abs";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Abs", jTAC._internal.temp._CalcItems_Abs);
if (jTAC.parser)
   jTAC.parser.register("CalcItems.Abs");

﻿// jTAC/CalcItems/Avg.js
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
Module: Calculations
Class : CalcItems.Avg
Extends: CalcItems.BaseFunction

Purpose:
Returns the average value from the values passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
A function named "Avg" that a comma delimited list of calculation expressions.
   Avg(calculation expression1, calculation expression2, calculation expression3, etc)

   Avg("TextBox1", "TextBox2", "TextBox3")



Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Avg = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   /* 
   Calculates the average. Returns a value that is not rounded.
   */
   _func : function (parms)
   {
      var l = parms.length;
      if (!l)
         return NaN;
      var s = 0;
      for (var i = 0; i < l; i++)
         s += parms[i];
      return s / l;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Avg", jTAC._internal.temp._CalcItems_Avg);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Avg");
﻿// jTAC/CalcItems/Fix.js
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
Module: Calculations
Class : CalcItems.Fix
Extends: CalcItems.BaseFunction

Purpose:
Use when another CalcItem may return null or NaN and you want to replace that
value with something else, such as a CalcItem.Number.

This function normally returns the same value passed in.
If the value is null, it returns the value determined by the CalcItem object
in the [valueWhenNull] property.
If the value is NaN, it returns the value determined by the CalcItem object
in the [valueWhenInvalid] property.

The function's [parms] property takes exactly one CalcItem object.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None


Parsing calculation expressions:
A function named "Fix" that that has two or three parameters, each a calculation expression.
Fix(calculation expression, calculation expression when null, calculation expression when NaN)
Pass null for either of the 2nd and 3rd parameters to use the default rule,
where null will use CalcItems.Number and NaN will use CalcItems.NaN.

Fix("TextBox1", '0')
Fix("TextBox1", '0', '0')


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Fix = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

  
/*
By the time this function is called, the evaluate() function has already
determined that the parameter was null or NaN and applied the values
from [valueWhenNull] and [valueWhenNaN].   
*/
   _func : function (parms) {
      return parms;
   },

   _numParms: function() {
      return 1;
   },

/* ---- PARSER SUPPORT ------------------------------------- */
/* 
Returns the string name of the function, without trailing parenthesis.
By default, it returns the actual class name used by the jTAC.define() function.
*/
   _getParseName: function () {
      return "Fix";
   },

   _numParserParms: function() {
      return 3;
   },

/* 
Expects as many as 3 parameters. The first is assigned as the parameter to be
return by the function. Then second, if defined, replaces [valueWhenNull].
The last, if defined, replaces [valueWhenNaN].
*/
   _convertParseParms: function (parms) {
      var ci, ciNull, ciNaN;
      ci = parms[0];
      ciNull = parms[1] || null;
      ciNaN = parms[2] || null;

      var rci = jTAC.create("CalcItems.Fix");
      rci.setParms([ci]);
      if (ciNull) {
         rci.valueWhenNull = ciNull;
      }
      if (ciNaN) {
         rci.valueWhenInvalid = ciNaN;
      }
      return rci;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Fix", jTAC._internal.temp._CalcItems_Fix);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Fix");
﻿// jTAC/CalcItems/Max.js
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
Module: Calculations
Class : CalcItems.Max
Extends: CalcItems.BaseFunction

Purpose:
Returns the highest valued number from the list passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
1) A function named "Max" that a comma delimited list of calculation expressions.
   Max(calculation expression1, calculation expression2, calculation expression3, etc)

   Max("TextBox1", "TextBox2", 100)

2) A function named "Math.Max" to mimic the javascript function of the same name.
   Math.Max(calculation expression1, calculation expression2, calculation expression3, etc)

   Math.Max("TextBox1", "TextBox2", 100)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Max = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   _func : function (parms) {
      return Math.max.apply(window, parms);
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName2: function () {
      return "Math.max";
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Max", jTAC._internal.temp._CalcItems_Max);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Max");
﻿// jTAC/CalcItems/Min.js
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
Module: Calculations
Class : CalcItems.Min
Extends: CalcItems.BaseFunction

Purpose:
Returns the lowest valued number from the list passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
None

Parsing calculation expressions:
1) A function named "Min" that a comma delimited list of calculation expressions.
   Min(calculation expression1, calculation expression2, calculation expression3, etc)

   Min("TextBox1", "TextBox2", 100)

2) A function named "Math.min" to minic the javascript function of the same name.
   Math.min(calculation expression1, calculation expression2, calculation expression3, etc)

   Math.min("TextBox1", "TextBox2", 100)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Min = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },


   _func : function (parms) {
      return Math.min.apply(window, parms);
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName2: function () {
      return "Math.min";
   }


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Min", jTAC._internal.temp._CalcItems_Min);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Min");
﻿// jTAC/CalcItems/Round.js
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
Module: Calculations
Class : CalcItems.Round
Extends: CalcItems.BaseFunction

Purpose:
Returns the rounded value using rules defined in the [roundMode]
and [maxDecimalPlaces] properties. It can also indicate an error
if the maximum decimal places are exceeded.

Only supports one number passed in.

See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   roundMode (int) - 
      Determines the way to round. 
         0 = Point5: round to the next number if .5 or higher; round down otherwise
         1 = Currency: round to the nearest even number.
         2 = Truncate: drop any decimals after mdp; largest integer less than or equal to a number.
         3 = Ceiling: round to the nearest even number.
         4 = NextWhole: Like ceiling, but negative numbers are rounded lower instead of higher
         null = Report an error (return NaN).
      Defaults to 0.
   maxDecimalPlaces (int) - 
      Determines the maximum number of decimal digits that are legal. 
      If there are more, it is either a validation error or rounded,
      depending on roundMode.
      Defaults to 3.

Parsing calculation expressions:
1) A function named "Round" with several parameters.
   Round(calculation expression[, roundmode, maxdecimalplaces)
   - calculation expression
   - roundmode (optional) defines how to round with these values:
         0 = Point5: round to the next number if .5 or higher; round down otherwise
         1 = Currency: round to the nearest even number.
         2 = Truncate: drop any decimals after mdp; largest integer less than or equal to a number.
         3 = Ceiling: round to the nearest even number.
         4 = NextWhole: Like ceiling, but negative numbers are rounded lower instead of higher
     When not assigned, it uses 0.
   - maxdecimalplaces (optional) defines at how many decimal places to round.
     When 0, round as an integer. When not assigned, it uses 3.

     Round("TextBox1" + "TextBox2")
     Round("TextBox1" + "TextBox2", 2)
     Round("TextBox1" + "TextBox2", 2, 3)

2) A function named "Math.round" to mimic the javascript function for Point5 rounding
   to the nearest integer.
   It takes one parameter, the calculation expression.
   Math.round(calculation expression)

3) A function named "Math.floor" to mimic the javascript function for Truncate rounding
   to the nearest integer lower than the value provided.
   It takes one parameter, the calculation expression.
   Math.floor(calculation expression)

4) A function named "Math.ceil" to mimic the javascript function for Ceiling rounding
   to the nearest integer higher than the value provided.
   It takes one parameter, the calculation expression.
   Math.ceiling(calculation expression)


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction
TypeManagers.Base

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_Round = {
   extend: "CalcItems.BaseFunction",
   require: "TypeManagers.Base",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      roundMode: 2, 
      maxDecimalPlaces: 3
   },

   /* 
   Uses the jTAC.TypeManagers.Base.prototype.round function.
   */
   _func: function ( parms ) {
      try {
         return jTAC.TypeManagers.Base.prototype.round(parms, this.getRoundMode(), this.getMaxDecimalPlaces());
      }
      catch (e) {
      // rounding error reported, due to roundMode = null.
         return NaN; 
      }
   },

   _numParms: function () {
      return 1;
   },

/* ---- PARSER SUPPORT ------------------------------------- */

   /*
   Handles all formats. Looks for "Round(", "Math.round(", "Math.floor(", "Math.ceil(".
   Does not use the CalcItems.BaseFunction's parse() method at all.
   */
   parse: function (text, parser) {
      this._checkParser(parser);
      var r = parser.asExact(text, "Round(");
      if (r) {
         text = r.rem;
         return this._parseRound(text, parser);
      }
      var ci,
      roundmode = 0;

      r = parser.asExact(text, "Math.round(");
      if (r) {
         roundmode = 0;
      }
      else {
         r = parser.asExact(text, "Math.floor(");
         if (r) {
            roundmode = 2;
         }
         else {
            r = parser.asExact(text, "Math.ceil(");
            if (r) {
               roundmode = 3;
            }
            else {
               return null;   // no match
            }

         }
      }
      text = r.rem;

      r = this._getParseParms(text, parser);
      ci = jTAC.create("CalcItems.Round");
      ci.setParms(r.parms);
      ci.setRoundMode(roundmode);
      ci.setMaxDecimalPlaces(0);
      return { obj: ci, rem: r.rem };
   },

   /* 
   Used with the "Round(" lead text. There are up to 3 parameters.
   - calculation expression (required)
   - roundMode (optional, integer). null also valid
   - maxdecimalplaces (optional, integer). null also valid
   */
   _parseRound: function (text, parser) {
      var ci,
      mdp = 3,
      roundmode = 0,
      // calculation expression
      r = this.calcexpr(text, parser);
      if (!r)
         parser.err(text, "Must be an expression.", this);
      text = r.rem;
      ci = r.ci;

      r = parser.asParmDelim(text, false);
      if (!r || r.delim == "}")
         parser.err(text, "parameter missing terminating delimiter", this);
      text = r.rem;
      if (r.delim == ",") {
         var re = /^\s*([01234])/;
         var m = re.exec(text);
         if (!m) {
            r = parser.asId(text);
            if (r) {
               text = r.rem;
               switch (r.id) {
                  case "point5":
                  case "round":
                     roundmode = 0;
                     break;
                  case "currency":
                     roundmode = 1;
                     break;
                  case "truncate":
                  case "floor":
                     roundmode = 2;
                     break;
                  case "ceiling":
                  case "ceil":
                     roundmode = 3;
                     break;
                  case "nextwhole":
                     roundmode = 4;
                     break;
                  default:
                     parser.err(text, "Valid values: point5, truncate, currency, ceiling, nextwhole", this);
               }  // switch
            }
            else {
            // when null, use the default roundmode which is 0
               r = parser.asNull(text, true);
            }
            text = r.rem;
         }
         else {
            roundmode = parseInt(m[1], 10);
            text = text.substr(m[0].length);
         }

         r = parser.asParmDelim(text, false);
         if (!r || r.delim == "}")
            parser.err(text, "parameter missing terminating delimiter", this);
         text = r.rem;
         if (r.delim == ",") {
            r = parser.asInt(text, false);
            if (r) {
               mdp = r.number;
            }
            else {
               r = parser.asNull(text, true);
            }
            text = r.rem;

            r = parser.asParmDelim(text, false);
            if (!r || r.delim != ")")
               parser.err(text, "parameter missing terminating delimiter", this);
            text = r.rem;
         }
      }
      var rci = jTAC.create("CalcItems.Round");
      rci.setParms(ci);
      rci.setRoundMode(roundmode);
      rci.setMaxDecimalPlaces(mdp);

      return { obj: rci, rem: text };

   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.Round", jTAC._internal.temp._CalcItems_Round);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.Round");
﻿// jTAC/CalcItems/UserFunction.js
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
Module: Calculations
Class : CalcItems.UserFunction
Extends: CalcItems.BaseFunction

Purpose:
Calls your own function in its evaluate() method. Allows you
to add custom code into the calculation.

Your function takes one parameter and must return a number or NaN.
The parameter will be an array of numbers, determined by evaluating
the CalcItems in the parms property.

Your function can use or ignore the values passsed in.

This example calculates the sum of the values in parms:

function (parms) {
   var total = 0;
   for (var i = 0; i < parms.length; i++)
      total = total + parms[i];
   return total;
}
See \jTAC\CalcItems\Base.js for an overview of CalcItems.

Properties introduced by this class:
   func (function) - 
      Reference to a function to call.

Parsing calculation expressions:
A function named "Function" where the first parameter is the name of a globally defined
function to call (assigned to the window object) and the remaining parameters are 
a comma delimited list of calculation expressions.
The function must follow the definition giving by CalcItems.UserFunction.
   Function("function name", calculation expression1, calculation expression2)

   Function("MyFunction", "TextBox1", 100)



Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
CalcItems.Base
CalcItems.BaseFunction

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_UserFunction = {
   extend: "CalcItems.BaseFunction",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
      func: null
   },

   configrules: {
      func: jTAC.checkAsFunctionOrNull
   },

   /*
   Call to determine if the CalcItem can be evaluated.
   If it returns true, you can call evaluate().
   This returns false if no function is assigned.
   */
   canEvaluate : function () {
      var func = this.getFunc();
      if (!func)
         return false;
      return this.callParent();
   },

   /* 
   If the connection cannot supply a number, it returns NaN or 0
   depending on the Func and Func properties.
   Otherwise, it returns the number of the connection.
   */
   _func : function (parms) {
      var func = this.getFunc();
      if (!func) {
         return NaN;
      }
      return func.call(this, parms);
   },


/* ---- PARSER SUPPORT ------------------------------------- */

   _getParseName: function () {
      return "Function";
   },

   /*
   First parameter is the function name, represented by an id.
   The remainder are calculation expressions.
   */
   _getParseParms: function (text, parser) {
      var r,
      parms = [];
      r = parser.asId();
      if (!r)
         parser.err(text, "First parameter must be a function name.", this);
      parms.push(r.id);
      text = r.rem;
      r = this.callParent([text]);
      if (r) {
         parms = parms.concat(r.parms);
         text = r.rem;
      }
      return parms;
   },

   _convertParseParms: function (parms) {
      var name = parms.shift();
      var ci = this.callParent([parms]);
      ci.setFunc(name);
      return ci;
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.UserFunction", jTAC._internal.temp._CalcItems_UserFunction);

if (jTAC.parser)
   jTAC.parser.register("CalcItems.UserFunction");
﻿// jTAC/Calculations/Widget.js
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
Module: Calculations
Class : Calculations.Widget
Extends: None

Purpose:
Calculations.Widget is a UI interface element that runs a calculation
based on the CalcItem objects. It is always assigned to a hidden input field,
which can be defined by the user or created by the Widget. That hidden
field's value contains the current calculation value in neutral number format,
"NaN" if there is an illegal value, or the empty string if no calculation was run.

The Widget can output its value using any Connection object to specify the 
element to display it, and a TypeManager to format the value for that Connection.
Given the flexibility of Connection objects, the output can be to a textbox,
custom data entry widget or even an HTML element whose [innerHTML] property is updated.
(In this last case, use Calculations.WidgetConnection.)

Set up the calculation in the [calcItem] or [expression] property.
[calcItem] will host actual CalcItem objects while [expression] is a 
string with a calculation expression. See \jTAC\CalcItems\Base.js for documentation on both.

Assign the id of the hidden input in the [elementId] property. If this HTML element does not 
exist on the page, it wil be created in the first <form> tag. So if you want to 
locate it elsewhere, explicitly add the hidden input field.
This object will automatically attach itself to the [data-calcWidget] attribute of the hidden field.

Use the Calculations.WidgetConnection class as a Connection object for other jTAC
objects, such as to let a Condition object read its value from a calculation
instead of just an HTML field.

When creating a Calculations.Widget instance, its ready() method needs to run after 
you establish all properties. ready() establishes event handlers to the textboxes
that include values for it to calculation. It also runs an initial calculation
if [calcOnInit] is true.
So call it explicitly. 

Essential Methods:
   canEvaluate() - Returns true if the Calculation is enabled and ready to evaluate data.
      (Tests CalcItem.canEvaluate() on the calcItem property.
   evaluate() - Evaluates and returns a number or NaN.
   ready() - Call after properties have been established to attach
      eventhandlers to the textboxes and to run an initial calculation.
   attachEvent() - Attach an event handler function for the "change", "preCalc" and "postCalc" events.
      Details are below.

Essential properties:
   elementId (string) - 
      The id to the HTML hidden input field element to which this
      object is assigned. If this HTML element does not 
      exist on the page, it wil be created in the first <form> tag. So if you want to 
      locate it elsewhere, explicitly add the hidden input field.

   calcItem (CalcItem object) -
      The initial CalcItem object of the calculation.
      Normally you will use a CalcItems.Group object here.
      If you don't assign it explicitly, a CalcItems.Group object is created for you.

   expression (string) -
      Alternative to setting the [calcItem] property by using a string that uses
      JavaScript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the [calcItem] property.
      Parsing syntax is described in each CalcItem script file.

   calcOnInit (boolean) -
      When true, ready() will run an initial calculation, updating the [displayConnection]
      for the user's benefit. It defaults to true.

   useChangeEvt (boolean) -
      When true, ready() will attach onchange event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the field is changed. 

   useKeyEvt (boolean) -
      When true, ready() will attach onkeydown and onkeyup event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the onkeyup event. It defaults to false.

   displayConnection (Connection object) - 
      When you want to display the value of the calculation, set this up, either here or
      with the [displayElementId] property.
      This Connection class should be compatible with the type of element it communicates with.

   displayElementId (string) - 
      Assigns the ID of the element that will display the calculated value.
      If [displayConnection] is not assigned, setting this will also define
      [displayConnection]. Otherwise, it just updates the id from displayConnection.

   displayTypeManager (TypeManager object) - 
      Defines how to format the string shown by [displayConnection].
      This value can be set by assigning the [displayDatatype] property too.
      If not assigned, it first checks the displayConnection for a TypeManager.
      If that doesn't work, it uses TypeManagers.Float.
      displayConnection will look for the [data-jtac.datatype] and [data-jtac.typemanager]
      attributes on the HTML element it points to.
      Avoid using TypeManagers that are not intended to handle numbers.

   displayDatatype (string) - 
      Alternative way to set the [displayTypeManager]. Specify the name of
      a TypeManager that was defined with jTAC.define() or jTAC.defineAlias().
      Avoid using TypeManagers that are not intended to handle numbers.
      Supported names include: "Integer", "Float", "Currency", and "Percent".

   displayErrorClass (string) -
      When the calculation reports an error, this style sheet class is assigned
      to the [displayConnection] element.
      It defaults to "calcwidget-error".

   displayNullClass (string) - 
      When the calculation has nothing to show, this style sheet class 
      is assigned to the [displayConnection] element.
      It defaults to "calcwidget-null".

   displayErrorText (string) - 
      When the calculation reports an error, this string is assigned
      to the [displayConnection] element.
      It defaults to "***".

   displayNullText (string) - 
      When the calculation has nothing to show, this string is assigned
      to the [displayConnection] element.
      It defaults to "".

Events:
   "preCalc" - Use attachEvent("preCalc", fnc) to attach your function.
      Function is called prior to calculating. It is the first action of the evaluate() method.
      The function is passed no parameters, but its [this] value is the Calculations.Widget event object.
      If the function returns false, it prevents the rest of evaluate() from running.
      Otherwise, the function result is ignored.

   "postCalc" - Use attachEvent("postCalc", fnc) to attach your function.
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection]. It is the last action of the evaluate() method.
      The function is passed one parameter, the value returned by the calculation.
      Its [this] value is the Calculations.Widget event object.
      The function result is ignored.

   "change" - Use attachEvent("change", fnc) to attach your function.
      Function is called after calculating when the calculated value has changed.
      The function is passed one parameter, the value returned by the calculation.
      Its [this] value is the Calculations.Widget event object.
      The function result is ignored.
      


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base 
Connections.BaseElement 
Connections.FormElement
TypeManagers.Base 
TypeManagers.BaseGlobalize 
TypeManagers.BaseNumber 
TypeManager.Integer
CalcItems.Base 
CalcItems.Null 
CalcItems.NaN 
CalcItems.Number 
CalcItems.Group

If using the expression property, LOAD \jTAC\Parser.js too

----------------------------------------------------------- */
if (!window.jTAC)
   throw new Error("window.jTAC not created.");


jTAC._internal.temp._Calculations_Widget = {

   require: ["Connections.FormElement", "TypeManagers.Integer",
      "CalcItems.Null", "CalcItems.NaN", "CalcItems.Number", "CalcItems.Group"],

   constructor: function ( propertyVals ) {

      this._internal = {
         events: null,  // will hold an array. Use attachEvent
         readied: false,  // used by ready() method to ensure it runs only once
         eval: false, // Used by evaluate() to prevent recursive calls
         lastValue: null,   // The value from the previous evaluate() call. Used by the "change" event.
         lastDisplayTxt: null   // Used by the _keyDnEvt and keyUpEvt to detect changes after a character was edited.  

      }

   },

   config: {
      elementId: null,
      calcItem: "CalcItems.Group",
      expression: null,
      displayConnection: null,
      displayElementId: null,
      displayTypeManager: null,
      displayDatatype: null,
      displayErrorClass: "calcwidget-error",
      displayNullClass: "calcwidget-null",
      displayErrorText: "***",
      displayNullText: "",
      calcOnInit: true,
      useChangeEvt: true,
      useKeyEvt: false
   },

   configrules: {
      elementId: jTAC.checkAsStr,
      calcItem: jTAC.checkAsCalcItemOrNull,
      expression: jTAC.checkAsStrOrNull,
      displayConnection: jTAC.checkAsConnectionOrNull,
      displayTypeManager: jTAC.checkAsTypeManager
   },

   /* 
   Call after all properties have been setup to run the initial calculation
   and attach textbox's onchange events to the evaluation function.
   This is usually called automatically by document.onload.
   If you create the object after that action (including on an AJAX call),
   call this manually.
   */
   ready: function () {
      if (this._internal.readied)
         return;
      this._internal.readied = true;

      if (this.getCalcOnInit()) {
         if (this.canEvaluate()) {
            this.evaluate();
         }
      }

      if (this._needsEvts()) {
         var conns = [];
         this.getCalcItem().collectConnections(conns);
         for (var i = 0; i < conns.length; i++) {
            this._attachEvents(conns[i]);
         }
      }  // if

   },

   /*
   Call before evaluate() to determine if the calculation can be run.
   Returns true if it can. If false, don't call evaluate().
   */
   canEvaluate: function () {
      return this.getCalcItem().canEvaluate();
   },

   /*
   Runs the calculation. Then updates both the hidden field value
   and the display element, if defined.
   If it was an illegal value, it returns NaN. If there was nothing
   to calculate, it returns null. Otherwise it returns a number.
   Calls the preCalc, change, and postCalc event handlers. If preCalc returns false,
   this function returns null.
   */
   evaluate: function () {
      try
      {
         this._pushContext();

         var intnl = this._internal;
         if (this._fireEvent("preCalc", null) == false) {
            return null;
         }

         if (intnl.eval) {   // prevent recursion
            return null;
         }

         intnl.eval = true;
         try {
         
            var val = this.getCalcItem().evaluate();
            this._storeValue(val);
            this._displayValue(val);

         }
         finally {
            intnl.eval = false;
         }

         if (val != intnl.lastValue) {
            this._fireEvent("change", [val]);
         }
         intnl.lastValue = val;

         this._fireEvent("postCalc", [val]);
         return val;
      }
      finally {
         this._popContext();
      }

   },

   /*
   Writes the value to the hidden field specified by [elementId].
   Creates the hidden field if missing.
      val - The value to set. Must be either a number, NaN, or "".
      The hidden field's value will be a string with one of these values:
         number - using culture neutral formatted float.
         "NaN" - if there is an error to report.
         "" - if no calculated value to show.
   */
   _storeValue: function (val) {
      var hf = this._getHiddenFld();

      if (val == null) {
         val = "";
      }

      // valid values: "NaN", "", and number as a string.
      hf.value = isNaN(val) ? "NaN" : val.toString();
   },

   /*
   If the [displayConnection] is setup, this will update its text and style sheet class
   based on the value passed. If the value is a number, it uses the TypeManager
   to format it as a string.
   */
   _displayValue: function (val)
   {
      var conn = this.getDisplayConnection();
      if (!conn)
         return;

      // undo previous style sheet classes
      conn.removeClass(this.getDisplayNullClass());
      conn.removeClass(this.getDisplayErrorClass());
      if (typeof val == "number") {
         if (isNaN(val)) {
            this._displayError(conn);
         }
         else {
            var tm = this.getDisplayTypeManager();
            this._displayNumber(val, conn, tm);
         }
      }
      else {
         this._displayNull(conn);
      }
   },

   /*
   Used by _displayValue to setup the [displayConnection] to indicate an error.
   It uses the [displayErrorText] and [displayErrorClass] properties.
   */
   _displayError: function (conn) {
      conn.setTextValue(this.getDisplayErrorText());
      conn.addClass(this.getDisplayErrorClass());
   },

   /*
   Used by _displayValue to setup the [displayConnection] to indicate no value.
   It uses the [displayNullText] and [displayNullClass] properties.
   */
   _displayNull: function (conn) {
      conn.setTextValue(this.getDisplayNullText());
      conn.addClass(this.getDisplayNullClass());
   },

   /*
   Used by _displayValue to setup the [displayConnection] with the value
   formatted by the [displayTypeManager].
      val (number) - number to convert to a string and show.
      conn (Connection object) - connected element to update.
      tm (TypeManager object) - TypeManager defined 
         by the displayTypeManager property.
   */
   _displayNumber: function (val, conn, tm) {
      conn.setTextValue(tm.toString(val));
   },

   /*
   Returns the DOM element for the hidden field identified
   by the [elementId] property.
   Creates the hidden field in the first <form> if not found.
   Throws exception if the id is not found.
   */
   _getHiddenFld: function () {
      try
      {
         this._pushContext();

         var id = this.getElementId();
         if (!id)
            this._error("Must assign the elementId property.");
         var hf = document.getElementById(id);
         if (!hf) { // create a hidden field in the first form group
            hf = document.createElement("input");
            hf.id = id;
            hf.name = id;
            hf.type = "hidden";
            if (!document.forms.length)
               this._error("Must have a <form> tag.");
            document.forms[0].appendChild(hf);
         }

         if (!hf.calcWidget) {
            hf.calcWidget = this;
         }
         return hf;
      }
      finally {
         this._popContext();
      }

   },

   // --- EVENT HANDLERS -------------------------------------------------------
  
/*
Adds an event handler function.
   name (string) - the name of the event. Choose from "preCalc" and "postCalc" (case sensitive)
   fnc (function) - the function to call. Parameters and return value are specific
      to the event type.   

Supported event types:
   "preCalc" -
      Function is called prior to calculating. It is the first action of the evaluate() method.
      The function is passed no parameters, but its 'this' value is the Calculations.Widget event object.
      If the function returns false, it prevents the rest of evaluate() from running.
      Otherwise, the function result is ignored.
      If you need to establish stateful data that is shared between preCalc and postCalc,
      you can add a field to the Calculations.Widget object so long as the field name
      doesn't conflict with existing properties.

   "postCalc" -
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection]. It is the last action of the evaluate() method.
      The function is passed one parameter, the value returned by the calculation.
      Its 'this' value is the Calculations.Widget event object.
      The function result is ignored.
      If you need to establish stateful data that is shared between preCalc and postCalc,
      you can add a field to the Calculations.Widget object so long as the field name
      doesn't conflict with existing properties.

   "change" - 
      Function is called after calculating when the calculated value has changed.
      The function is passed one parameter, the value returned by the calculation.
      Its 'this' value is the Calculations.Widget event object.
      The function result is ignored.
*/
   attachEvent: function(name, fnc) {
// an object where each property is 'name'
// and value is an array of functions.
      var e = this._internal.events;
      if (!e) {
         e = {};
         this._internal.events = e;
      }
      var l = e[name];
      if (!l) {
         l = [];
         e[name] = l;
      }
      l.push(fnc);

   },

/*
Removes an event handler function, or all functions for a given name.
   name (string) - The event type. Supported values: "change", "preCalc", "postCalc"
   fnc (function) - Must be the identical object for the function.
      If null, all events for the given name was deleted.
*/
   detachEvent: function(name, fnc) {
      var e = this._internal.events;
      if (!e)
         return;
      var l = e[name];
      if (l) {
         if (!fnc) {
            delete e[name];
         }
         else {
            var i = l.indexOf(fnc);
            if (i > -1)
            {
               l.splice(i, 1);
            }
         }
      }
   },

/*
   Invokes all event handlers for the given event type.
   However, if any event handler function returns a value,
   it stops and returns that value.
      name (string) - Event name to call
      options (array) - Null or an array of parameter values to pass.
*/
   _fireEvent: function(name, options) {
      try
      {
         this._pushContext();

         if (!this._internal.events) {
            return;
         }
         if (typeof options != "object") {
            options = [ options ];
         }
         var l = this._internal.events[name];
         if (l) {
            for (var i = 0; i < l.length; i++) {
               var r = l[i].apply(this, options);
               if (r !== undefined) { // any function that is defined is returned, stopping iterations.
                  return r;
               }
            }
         }
      }
      finally {
         this._popContext();
      }

   },

   /*
   Attached to the connection to handle its onchange event.
   When invoked, it runs evaluate to update the results.
   */
   _changeEvt: function (evt, conn) {
      if (this.canEvaluate())
         this.evaluate();
   },


   /*
   Attached to the connection to handle its onkeyup event.
   When invoked, it runs evaluate to update the results.
   */
   _keyUpEvt: function (evt, conn) {
      if (!conn || (this._internal.lastDisplayTxt == null)) {
         return;
      }
      if ((this._internal.lastDisplayTxt != conn.getTextValue()) && this.canEvaluate()) {
         this.evaluate();
      }
   },

   /*
   Attached to the connection to handle its onkeydown event.
   When invoked, it runs evaluate to update the results.
   */
   _keyDnEvt: function (evt, conn) {
      this._internal.lastDisplayTxt = conn ? conn.getTextValue() : null;
   },


/*
Return true if event handlers need to be setup. This is called to determine
if _attachEvents() should be called.
*/
   _needsEvts : function () {
      return this.getUseChangeEvt() || this.getUseKeyEvt();
   },

/* 
Attach event handlers to the connection object. Called only if
_needsEvts() returns true.
   conn (Connection object) - Call its addEventListener method.
*/
   _attachEvents : function(conn) {
      var that = this;
      if (this.getUseChangeEvt()) {
         conn.addEventListener("onchange", function (evt) { that._changeEvt.call(that, evt, conn);} );
      }
      if (this.getUseKeyEvt()) {
         conn.addEventListener("onkeydown", function (evt) { that._keyDnEvt.call(that, evt, conn);});
         conn.addEventListener("onkeyup", function (evt) { that._keyUpEvt.call(that, evt, conn);});
      }
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   setElementId: function (val) {
      this.config.elementId = jTAC.checkAsStr(val);
      if (val) {
        // creates the hidden field if needed. Done here to ensure 
        // its on the page before calculations in case other features need to find it.
         this._getHiddenFld(); 
      }
   },

   setExpression: function (val) {
      try {
         this._pushContext(null, val != null ? val.toString() : "");
      
         var parser = jTAC.parser;
         if (!parser)
            this._error("Must load Parser.js");
         var r = jTAC.CalcItems.Base.prototype.calcexpr(jTAC.checkAsStr(val), parser, this);
         if (!r)
            parser.err(val, "syntax error", this);
         this.setCalcItem(r.ci);
         this.config.expression = val;
      }
      finally {
         this._popContext();
      }
   },

   getDisplayElementId: function () {
      var conn = this.getDisplayConnection();
      return conn && conn.getId ? conn.getId() : null;
   },

   setDisplayElementId: function (id) {
      var def = jTAC.create("Connections.FormElement", {id: id, allowNone: true});  
      var conn = jTAC.connectionResolver.create(id, def);   // may create a replacement connection
      this.config.displayConnection = conn ? conn : def;
   },

   getDisplayTypeManager: function () {
      try
      {
         this._pushContext();

         if (!this.config.displayTypeManager) {
            var tm;
            var conn = this.getDisplayConnection();
            if (conn) {
               tm = conn.getTypeManager();
            }
            if (!tm)
               tm = jTAC.create("TypeManagers.Float");
            this.config.displayTypeManager = tm;
         }
         return this.config.displayTypeManager;
      }
      finally {
         this._popContext();
      }

   },

   getDisplayDatatype: function () {
      return this.config.displayTypeManager ? this.config.displayTypeManager.dataTypeName() : null;
   },

   setDisplayDatatype: function (val) {
      this.setDisplayTypeManager(val);
   }

}
jTAC.define("Calculations.Widget", jTAC._internal.temp._Calculations_Widget);

﻿// jTAC/Calculations/WidgetConnection.js
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
Module: Calculations
Class : Calculations.WidgetConnection
Extends: Connections.BaseElement

Purpose:
A Connection object that interacts with a hidden input field
associated with a Calculations.Widget object.
It requires the Calculations.Widget has already been initialized.
It gets the value from getTextValue() and getTypedValue()
by calling the Calculations.Widget.evaluate() method.
It supports these types: "Integer", "Float".

Use the addEventListener() method to attach the "onchange" event to 
the Calculations.Widget so each time it calculates, it fires the onchange event.

The getClass() and setClass() methods use the style sheet class
on the element defined by the [displayConnection]. If that property is not setup,
nothing happens.

See \jTAC\Calculations\Widget.js for an overview of Calculations.Widget.
See \jTAC\Connections\Base.js for an overview of Connection objects.

Properties introduced by this class:
None


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement
Calculations.Widget

----------------------------------------------------------- */
jTAC._internal.temp._CalcItems_WidgetConnection = {
   extend: "Connections.BaseElement",

   require: ["Calculations.Widget"],

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

/*
Utility to retrieve the actual Calculations.Widget object associated with the ID of this connection.
*/
   _getCalcWidget: function () {
      var el = this.getElement(true);
      if (this._checkElement(el)) {
         return el.calcWidget;
      }
      return null;

   },


   /* 
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue: function () {
      var cw = this._getCalcWidget();
      if (cw && cw.canEvaluate()) {
         var val = cw.evaluate();
         if ((val != null) && !isNaN(val)) {
            // format as a string using displayTypeManager
            return cw.getDisplayTypeManager().toString(val);
         }
      }

   },

   /* 
   Does nothing.
   */
   setTextValue: function (text) {
   },

   /*
   Always returns false.
   */
   typeSupported: function (typeName) {
      return (typeName == "integer") || (typeName == "float");
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
      if (!typeName || this.typeSupported(typeName))
      {
         var cw = this._getCalcWidget();
         if (cw && cw.canEvaluate()) {
            var val = cw.evaluate();
            if ((typeName == "integer") && (Math.floor(val) != val)) { // value has decimal places and the caller wants an integer
               return null;
            }

            return val;
         }

      }
      return null;
   },

   /*
   Does nothing
   */
   setTypedValue : function (value) {
   },

   /*
   Only returns true if Calculations.Widget.evaluate returns null.
   */
   isNullValue: function (override) {
      var cw = this._getCalcWidget();
      if (cw && cw.canEvaluate()) {
         var val = cw.evaluate();
         return val == null;
      }
      return false;
   },

   /*
   Always returns false.
   */
   isEditable: function () {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   This evaluates the element for an innerHTML property.
   id (string or object) - If its string, evaluate it as a unique id
   used to identify the element. If its an object, see if its
   the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement: function (id) {
      if (typeof (id) == "string") {
         id = document.getElementById(id);
      }
      return this._checkElement(id);
   },

   /*
   Utility to determine if the element hosts the Calculations.Widget object
   in its data-calcWidget attribute.
   */
   _checkElement: function (el) {
      if (el && el.calcWidget)
         return true;

      return false;
   },


   /*
   Always returns true.
   */
   isEnabled: function () {
      return true;
   },

   /*
   Determines if the element is visible.
   Returns true if it has a displayConnection setup and that element is visible.
   */
   isVisible : function () {
      var cw = this._getCalcWidget();
      if (cw && cw.getDisplayConnection()) {
         return cw.getDisplayConnection().isVisible();
      }
      return false;
   },

   /*
   Always returns true to let a validator know it has data to be validated.
   */
   isEditable: function () {
      return true;
   },

   /*
   Let's the caller retrieve the collection instances into a new list.
   In addition to getting those in the connections property, subclasses
   can retrieve others which may be elsewhere, such as in a child
   Condition object.
      list (Array) - Add collection objects to this list.
   */
   collectConnections : function(list) {
      var cw = this._getCalcWidget();
      if (cw) {
         cw.getCalcItem().collectConnections(list);
      }
   },

/*
Supports the "onchange" event which maps to the change event type
on the Calculations.Widget.
*/
   addEventListener : function (name, func, funcid) {
      if (name == "onchange") {
         var cw = this._getCalcWidget();
         if (cw) {
            cw.attachEvent("change", func);
            return true;
         }
      }
      return false;
   },

/*
If displayConnection is setup, its class is returned.
Otherwise, it returns "".
*/
   getClass : function() {
      var cw = this._getCalcWidget();
      if (cw) {
         var conn = cw.getDisplayConnection();
         if (conn) {
            return conn.getClass();
         }
      }
      return "";
   },

/*
If displayConnection is setup, its class is updated.
*/
   setClass : function(css) {
      var cw = this._getCalcWidget();
      if (cw) {
         var conn = cw.getDisplayConnection();
         if (conn) {
            conn.setClass(css);
         }
      }
   }

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("CalcItems.WidgetConnection", jTAC._internal.temp._CalcItems_WidgetConnection);

jTAC.connectionResolver.register("CalcItems.WidgetConnection");
﻿// jTAC/Connections/InnerHtml.js
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
Class : Connections.InnerHtml
Extends: Connections.BaseElement

Purpose:
Interacts with an HTML tag that supports
the innerHTML property, such as <span>, <div>, and <td>.
These tags contain HTML as their value, so they are not type specific. 
Therefore, there is no default TypeManager class.

See \jTAC\Connections\Base.js for an overview of Connections.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base

----------------------------------------------------------- */
jTAC._internal.temp._Connections_InnerHtml = {
   extend: "Connections.BaseElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   /* 
   Returns a string. If no value, it returns the empty string.
   */
   getTextValue : function () {
      var el = this.getElement();
      if (this._checkElement(el))
         return el.innerHTML;
      return "";

   },

   /* 
   Set the value passing in a string.
     Text (string) - the value to set.
   */
   setTextValue : function (text) {
      var el = this.getElement();
      if (this._checkElement(el))
         el.innerHTML = text;
   },

   /*
   Always returns false.
   */
   typeSupported : function (typeName) {
      return false;
   },

   /*
   Always returns false.
   */
   isNullValue : function (override) {
      return false;
   },

   /*
   Always returns false.
   */
   isEditable : function () {
      return false;
   },

   /*
   Determines if the id or object passed is supported by this class.
   Returns true if it is.
   This evaluates the element for an innerHTML property.
      id (string or object) - If its string, evaluate it as a unique id
         used to identify the element. If its an object, see if its
         the correct class, such as DOMElement.
   Returns true when id is supported by this class and false when not.
   */
   testElement : function(id) {
      if (typeof (id) == "string") {
         id = document.getElementById(id);
      }
      return this._checkElement(id);
   },

/*
Utility to determine if the element is a type of HTML tag that supports
reading and writing the innerHTML property.
Most HTML tags have innerHTML even when they don't actually use it to store data.
*/
   _checkElement : function(el) {
      if (el && (typeof (el) == "object") && (el.tagName !== undefined) && (el.innerHTML !== undefined) && (el.form === undefined)) {
         if (typeof el.innerHTML == "string") {
            return true;
         }
      }

      return false;
   },


   /*
   Always returns true.
   */
   isEnabled : function () {
      return true;
   },

   /*
   Always returns false.
   */
   isEditable : function () {
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
jTAC.define("Connections.InnerHtml", jTAC._internal.temp._Connections_InnerHtml);

if (jTAC.connectionResolver)
   jTAC.connectionResolver.register("Connections.InnerHtml");
// jTAC/jquery-ui widgets/calculator.js
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
Module: Calculation objects

Purpose:
calculator is a jquery-ui widget that runs a calculation
based on the CalcItem objects. 
It is effectively a wrapper around Calculations.Widget (which does not use jquery).
So use the documentation in /jTAC/Calculations/Widget.js for an overview.

Establishing this ui widget:
1. Add a hidden input field. Assign the id and name properties to the same value.
   This element will host the Calculations.Widget object and hold the current value.
   Its value can be used in a postback too.

2. If working in code, use this to attach the calculator jquery-ui object to
   the hidden field.
   $("selector for the hidden field").calculator(options);
   The options reflect the properties shown below and are the same in the Calculations.Widget class.
   This code usually runs as the page loads, such as in $(document).ready.

3. If you want unobstrusive setup, add the [data-jtac-calculator] attribute to 
   the hidden field. Its value is a JSon description of the properties.

4. The jquery-validator library is supported against the hidden field.
   If you like, add unobtrusive validator rules to the hidden field.

Options:
   calcItem (CalcItem object) -
      The expression to calculate using CalcItem objects.
      calcItem hosts a single CalcItem object, which is the base of the calculation.
      Normally you will use a CalcItems.Group object here.
      If you don't assign it explicitly, a CalcItems.Group is created for you.
      You can either supply this as an instance of a CalcItem object,
      a JSon object that converts into a CalcItem (with the [jtacClass] property
      defined to specify the class name), or a shorthand notation
      that creates simple expressions.

   expression (string) -
      Alternative to setting the [calcItem] property by using a string that uses
      javascript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the calcItem property.
      Requires /jTAC/Parser.js.
      Parsing syntax is described in each CalcItem object file.
      Note that parsing requires more resources, both in script files loaded
      and work to convert strings to CalcItem objects. If you prefer speed,
      use the [calcItem] property directly.

   calcOnInit (boolean) -
      When true, init() will run an initial calculation, updating the [displayConnection]
      for the user's benefit. It defaults to true.

   useChangeEvt (boolean) -
      When true, init() will attach [onchange] event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the field is changed. 

   useKeyEvt (boolean) -
      When true, init() will attach [onkeydown] and [onkeyup] event handlers to the textboxes associated with the
      calculation, letting them run the calculation after the [onkeyup] event. It defaults to false.

   displayElementId (string) - 
      Assigns the ID of the element that will display the calculated value.
      Only setup if you want to display the value. It's common to avoid displaying
      the value, but still use the calculation to drive other calculations
      or be evaluated by a Condition object.

   displayConnection (Connection class) - 
      When [displayElementId] is object, it creates this object, a Connection object
      to the element that displays the calculated value.
      Generally you assign this when you need to define a different object or parameters
      than given you when [displayElementId] is setup.
      This Connection class should be compatible with the type of element it communicates with.
      Typical types: Connections.InnerHtml and Connections.FormElement.
      You can either supply this as an instance of a Connection class,
      or a JSon object that converts into a Connection class (with the [jtacClass] property
      defined to specify the class name).
      Once setup, you can use the members of the Connection class
      to interact with the element that displays the calculated value.

   displayTypeManager (TypeManager object) - 
      Defines how to format the string shown by [displayConnection].
      This value can be set by assigning the [displayDatatype] property too.
      If not assigned, it uses TypeManagers.Float.
      Avoid using TypeManagers that are not intended to handle numbers.

   displayDatatype (string) - 
      Alternative way to set the [displayTypeManager]. 
      Specify the class name or alias of a TypeManager.
      Avoid using TypeManagers that are not intended to handle numbers.
      Supported names include: "integer", "float", "currency", and "percent".

   displayErrorClass (string) -
      When the calculation reports an error, this style sheet class is assigned
      to the [displayConnection] element.
      It defaults to "calcwidget-error".

   displayNullClass (string) - 
      When the calculation has nothing to show, this style sheet class 
      is assigned to the [displayConnection] element.
      It defaults to "calcwidget-null".

   displayErrorText (string) - 
      When the calculation reports an error, this string is assigned
      to the [displayConnection] element.
      It defaults to "***".

   displayNullText (string) - 
      When the calculation has nothing to show, this string is assigned
      to the [displayConnection] element.
      It defaults to "".
      
   preCalc (function) -
      Function is called prior to calculating. This function must be 
      compatible with jquery's bind() method which demands two parameters:
      event and ui. Both of those parameters will be passed as null to your [preCalc] function.
      If it returns false, the remainder of the calculation is skipped.

   postCalc (function) -
      Function is called after calculating, updating the hidden field value, and displaying the result
      with the [displayConnection].
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      It ignores the returned value.

   change (function) -
      Function is called after calculating when the calculated value has changed.
      The function result is ignored.
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      change = function(event, ui) { your code. ui.value is the value of the calculation. }.

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcItem classes.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcWidget.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/TypeManagers/Base classes.js
ALWAYS LOAD /jTAC/TypeManagers/Numbers.js
When using CalcItems.Conditional, LOAD Conditions.Base AND other Condition classes.

------------------------------------------------------------*/
/* --- jquery-ui extension "calculator" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var calc = {  
/*
The Calculations.Widget attached to the $element.
*/
      _calcWidget : null,
      options: new jTAC_CalculatorOptions(),

      _create: function() {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require(["CalcItems.Base", "Calculations.Widget", "TypeManagers.Float"]);

         var that = this;
         var cw = jTAC.create("Calculations.Widget");
         that._calcWidget = cw;
         cw.elementId = that.element.get()[0].id;  // connects the calcwidget to the hidden field

         cw.attachEvent("preCalc",function () {
            return that._trigger("preCalc", null, { });   // uses options.preCalc if setup
         });
         cw.attachEvent("postCalc",function (val) {
            return that._trigger("postCalc", null, { "value": val  });
         });
         cw.attachEvent("change",function (val) {
            that._trigger("change", null, { "value": val });
            // always returns undefined. This lets CalcWidgets._fireEvent to continue through multiple change events
         });

      },

      _init: function() {  
         try
         {
            jTAC._internal.pushContext("calculator._init()");

            var that = this;
            var o = this.options;

         // convert events that are string names into actual functions
            this._convertEvent("preCalc");
            this._convertEvent("postCalc");
            this._convertEvent("change");

         // populate cw from the options
            var cw = this._calcWidget;

            for (var key in o) {
               var val = o[key];
               if ((val != null) &&  // null indicates to use the default on Calculations.Widget
                   (cw[key] !== undefined) && // property must exist in the destination
                   (typeof (val) != "function")) {  // event handler functions are designed for jquery and not passed into the child
                  cw[key] = val;
               }
            }

            cw.ready();
         }
         finally {
            jTAC._internal.popContext();
         }

      },  

/*
Checks the options for the event name. If it is a string type,
it attempts to convert it into a function.
*/
      _convertEvent: function( evtName ) {
         var evt = this.options[evtName];
         if (evt) {
            if (typeof evt == "string") {
               evt = window[evt];
               if (!evt) {
                  jTAC.warn("Calculator [" + this.element.get()[0].id + "] options include [" + evtName + "]. This must be a globally defined function name to be used.");
                  evt = null;
               }
               this.options[evtName] = evt;
            }

         }
      },

      _setOption: function( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments );  
         var cw = this._calcWidget;
         switch (key) {
            case "calcItem":
               cw.calcItem = value;
               if (cw.calcOnInit && cw.canEvaluate()) {
                  cw.evaluate();
               }
               break;

            case "calcOnInit":   // a nifty way to invoke calculation on demand. Set calcOnInit to true after init.
               if (value) {
                  if (cw.canEvaluate()) {
                     cw.evaluate();
                  }
               }
               break;
            case "displayErrorClass":
               cw.displayErrorClass = value;
               break;
            case "displayNullClass":
               cw.displayNullClass = value;
               break;
            case "displayErrorText":
               cw.displayErrorText = value;
               break;
            case "displayNullText":
               cw.displayNullText = value;
               break;
            case "preCalc":
            case "postCalc":
            case "change":
               this._convertEvent(key);
               break;

            default:
               // the remaining properties cannot be changed after init.
               // They include displayConnection, displayElementId,
               // displayTypeManager, displayDataType,
               // useChangeEvt, and useKeyEvt.

         }  // switch
      }  // _setOption
   }; // calc object
   $.widget("ui.calculator", calc); 
})(jQuery);  



/* --- CLASS jTAC_CalculatorOptions -------------------------------
Options object definition used by calculator.

NOTE: All properties are set to null initially. If changed
from null, then they override the value in the Calculations.Widget.
-----------------------------------------------------------------------*/

function jTAC_CalculatorOptions() {
}
jTAC_CalculatorOptions.prototype = {
/* Type: function
   The expression to calculate.
   calcItem hosts a single CalcItem object, which is the base of the calculation.
   Normally you will use a CalcItems.Group here.
   If you don't assign it explicitly, a CalcItems.Group is created for you.
   You can either supply this as an instance of a CalcItem object,
   a JSon object that converts into a CalcItem object (with the [jtacClass] property
   defined to specify the class name), or a shorthand notation
   that creates simple expressions.
*/
   calcItem : null, // null indicates to use the default on Calculations.Widget

/*
   Type: string
      Alternative to setting the [calcItem] property by using a string that uses
      javascript syntax to describe the calculation.
      A parser converts the string into CalcItem objects, which then are assigned
      to the calcItem property.
      Requires /jTAC/Parser.js.
      Parsing syntax is described in each CalcItem object file.
      Note that parsing requires more resources, both in script files loaded
      and work to convert strings to CalcItem objects. If you prefer speed,
      use the [calcItem] property directly.
*/

   expression : null, // null indicates to use the default on Calculations.Widget


/* Type: boolean
   When true, init() will run an initial calculation, updating the [displayConnection]
   for the user's benefit. It defaults to true.
*/
   calcOnInit: null, // null indicates to use the default on Calculations.Widget

/* Type: boolean
   When true, init() will attach [onchange] event handlers to the textboxes associated with the
   calculation, letting them run the calculation after the field is changed. 
*/
   useChangeEvt: null, // null indicates to use the default on Calculations.Widget

/* Type: boolean
   When true, init() will attach [onkeydown] and [onkeyup] event handlers 
   to the textboxes associated with the calculation, 
   letting them run the calculation after the onkeyup event. 
   It defaults to false.
*/
   useKeyEvt: null, // null indicates to use the default on Calculations.Widget

/* Type: Connection object
   When [displayElementId] is assigned, it creates this object, a Connection object
   to the element that displays the calculated value.
   Generally you assign this when you need to define a different object or parameters
   than given you when [displayElementId] is setup.
   This Connection class should be compatible with the type of element it communicates with.
   Typical types: Connections.InnerHtml and Connections.FormElement.
   You can either supply this as an instance of a Connection object,
   or a JSon object that converts into a Connection class (with the [jtacClass] property
   defined to specify the class name).
   Once setup, you can use the members of the Connection class
   to interact with the element that displays the calculated value.
*/
   displayConnection : null, // null indicates to use the default on Calculations.Widget

/* Type: string
   Assigns the ID of the element that will display the calculated value.
   Only setup if you want to display the value. It's common to avoid displaying
   the value, but still use the calculation to drive other calculations
   or be evaluated by a Condition object.
*/
   displayElementId: null, // null indicates to use the default on Calculations.Widget

/* Type: TypeManager class
   Defines how to format the string shown by [displayConnection].
   This value can be set by assigning the [displayDatatype] property too.
   If not assigned, it uses TypeManagers.Float.
   Avoid using TypeManagers that are not intended to handle numbers.
*/
   displayTypeManager : null, // null indicates to use the default on Calculations.Widget

/* Type: string
   Alternative way to set the [displayTypeManager]. 
   Specify the class name or alias of a TypeManager class.
   Avoid using TypeManagers that are not intended to handle numbers.
   Supported names include: "integer", "float", "currency", and "percent".
*/
   displayDatatype: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation reports an error, this style sheet class is assigned
   to the [displayConnection] element.
   It defaults to "calcwidget-error".
*/
   displayErrorClass: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation has nothing to show, this style sheet class 
   is assigned to the [displayConnection] element.
   It defaults to "calcwidget-null".
*/
   displayNullClass: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation reports an error, this string is assigned
   to the [displayConnection] element.
   It defaults to "***".
*/
   displayErrorText: null, // null indicates to use the default on Calculations.Widget

/* Type: string
   When the calculation has nothing to show, this string is assigned
   to the [displayConnection] element.
   It defaults to "".
*/
   displayNullText: null, // null indicates to use the default on Calculations.Widget

/* Type: function
   Function is called prior to calculating. This function must be 
   compatible with jquery's bind() method which demands two parameters:
   event and ui. Both of those parameters will be passed as null to your [preCalc] function.
   If it returns false, the remainder of the calculation is skipped.
   preCalc = function(event, ui) { your code }.
*/
   preCalc : null,

/* Type: function
      Function is called after calculating, updating the hidden field value, 
      and displaying the result with the [displayConnection].
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      It ignores the returned value.
   postCalc = function(event, ui) { your code. ui.value is the value of the calculation. }.
*/
   postCalc : null,

/* Type: function
      Function is called after calculating when the calculated value has changed.
      The function result is ignored.
      This function must be compatible with jquery's bind() method which demands two parameters:
      event and ui. Event will be null. ui will be an object with one property, [value],
      which holds the numeric value of the calculation, null, or NaN.
      change = function(event, ui) { your code. ui.value is the value of the calculation. }.
*/
   change : null

};

// jTAC/jquery-ui widgets/calculator-unobtrusive.js
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
Module: Calculation objects

Purpose:
Provides unobtrusive javascript support for the calculator widget.

Establishing this ui widget:
1. Add both calculator.js and calculator-unobtrusive.js
   to the page. The act of adding this file automatically runs code to detect
   hidden fields with the data-jtac-calculator attribute assigned.

2. If you prefer to use the expression property (which parsers javascript-like syntax to build the calculation expression),
   add the /jTAC/Parser.js file.

3. Add a hidden input field for each calculation. Assign the id and name properties to the same value.
   This element will host the Calculations.Widget object and hold the current value.
   Its value can be used in a postback too.

4. Assign the attribute "data-jtac-calculator" to the hidden input.
   Its value should be an object with the same properties
   supported by the options of the calculator.
   At minimum, assign the calcItem property to the calculation rule.

   See jquery-ui-calculator.js for details on the options.

   <input type='hidden' id='calculator1' name='calculator'
      data-jtac-calculator='{"calcItem" : ["TextBox1", "TextBox2"], "displayElementId" : "Result"}' />
   <span id='Result'></span>

   Example when using the expression property:
   <input type='hidden' id='calculator1' name='calculator'
      data-jtac-calculator='{"expression" : '"TextBox1" + "TextBox2"', "displayElementId" : "Result"}' />
   <span id='Result'></span>



Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jquery-ui-#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcItem classes.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/Calculations/CalcWidget.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD /jTAC/TypeManagers/Base classes.js
ALWAYS LOAD /jTAC/TypeManagers/Numbers.js
When using CalcItems.Conditional, LOAD Conditions.Base AND other Condition classes.
jquery-ui widgets/calculator.js
------------------------------------------------------------*/


(function ($){
   function applyOne(idx, element)
   {
      element = $(element);
      var options = element.data("jtac-calculator");
      if (options)
      {
         element.data("calculator", null);
         try
         {
            options = window.eval("(" + options +");");
            element.calculator(options);
         }
         catch (e)
         {
            jTAC.error("Could not parse the data-jtac-calculator attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply()
   {
      try
      {
         jTAC._internal.pushContext("calculator-unobtrusive.apply()");

         var elements = $("input[type=hidden]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (!window.jTAC_CalculatorOptions)
      jTAC.error("Requires the calculator scripts.");

   $(document).ready(apply);

})(jQuery);

// jTAC/jquery-ui widgets/datatypeditor.js
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

Purpose:
datatypeeditor is a jquery-ui widget that filters keystrokes in a textbox
based on a TypeManager class. jTAC's TypeManager classes have
the isValidChar() method. This widget uses isValidChar().


Establishing this ui widget:
1. Add an input field of type="text". Assign the id and name properties to the same value.

2. Add this attribute to the input field:
  
   data-jtac-datatype - Specifies TypeManager class to use.
      Its value must match a class name or alias.
      Usually the actual class name is registered, along with shorthands like:
      "Integer", "Float", "Currency", "Date", and "TimeOfDay". (There are many more.)

   <input type="text" id="id" name="name" data-jtac-datatype="Float" />

3. When using date or time TypeManagers, consider using a more powerful parser.
   The default parsers handle limited cases and are not very flexible with 
   the variety of user inputs that come to it.
   Use the TypeManagers.PowerDateParser and TypeManagers.PowerTimeParser classes
   to have a much richer data entry experience just by adding <script > tags
   to their script files:
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerDateParser.js' ></script>
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerTimeParser.js' ></script>


4. A TypeManager object has numerous properties to customize it. For example,
   TypeManagers.Date has a [dateFormat] property to adjust the format between short, abbrev and full.
   If you need to set any of these properties, add this attribute to the input field:
   
   data-jtac-typeManager - Specifies an object (JSon format recommended)
      whose properties override the defaults on the TypeManager created by data-jtac-datatype.

   TypeManagers have many useful properties. Here are some of the most useful:
   * cultureName (string) - sets the culture for formatting and parsing.
   * minValue and maxValue - When \jTAC\jquery-ui widgets\Command extensions.js are supported,
      these properties are available to define the limits of values commands can reach.
      When specified as strings, these must use the culture neutral format based on the datatype.
   * dateFormat and timeFormat - On date and time to adjust the parsing and formatting patterns.
   See the \jTAC\TypeManagers\ folder for details on individual classes.

   <input type="text" id="id" name="name" data-jtac-datatype="Float" 
      data-jtac-typeManager="{'cultureName': 'en-US', 'allowNegatives': false}" />

5a. If working in code, use this to attach the datatypeeditor jquery-ui object to
    the input field.
   
   $("selector for the textbox").datatypeeditor(options);

    The options reflect the properties shown below.

    This code usually runs as the page loads, such as in $(document).ready.

5b. If you want unobtrusive setup, add this attribute to the input field:
   
   data-jtac-datatypeeditor - Activates the datatypeeditor feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. Only
      specify to override a default.
      If no options are needed, use the empty string.

   Also add the script file \jTAC\jquery-ui widgets\datatypeeditor-unobtrusive.js

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="{'checkPastes' : false}" />
   <input type="text" id="id" name="name" data-jtac-datatype="Float"
      data-jtac-datatypeeditor="" />


6. You still have to deal with the server side code that gets and sets the value
  of this input. That can be tricky because that code needs to convert
  between strings and native values. To simplify this, you can 
  add hidden input whose id is the dataTypeEditor's id + "_neutral".
  Use the value attribute of this hidden field to get and set the value.
  ALWAYS work with a string in the culture neutral format of the type.
  Formats include:
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="" />
   <input type="hidden" id="id_neutral" name="id_neutral" value="2000-05-31" />

Options
============================
* datatype (string) -
  Alternative to using the data-jtac-datatype attribute assigned to the textbox.
  Only used when that attribute is missing.

* typeManager (TypeManager object) -
  Used instead of the data-jtac-datatype and data-jtac-typemanager attributes on the textbox
  when assigned. It must host the TypeManager object,
  or a JavaScript object with properties to assign to the TypeManager identified
  by the datatype property.

* reformat (boolean) -
  When true, the onchange event will reformat the contents to match
  the most desirable format. Effectively, it uses the TypeManager's
  toValue then toString methods. Nothing happens if there is a formatting error.
  It defaults to true.

* filterkeys (boolean) -
  When true, keystrokes are evaluated for valid characters.
  Invalid characters are filtered out. 
  This uses the TypeManager's isValidChar() method.
  When false, no keystroke filtering is supported.
  It defaults to true.

* checkPastes (boolean) -
  On browsers that support the onpaste event, this attempts to
  evaluate the text from the clipboard before it is pasted.
  It checks that each character is valid for the TypeManager.
  If any invalid character is found, the entire paste is blocked.
  It will also block pasting non-textual (including HTML) content.
  Supported browsers: IE, Safari, and Chrome.

* commandKeys (array) -
   An array of objects that map a keystroke to a command
   associated with the TypeManager's command feature.
   Requires loading \jTAC\jquery-ui widgets\Command extensions.js.
   When null, it uses the values supplied by the getCommandKeys() method
   on each TypeManager prototype.

   Each object in the array has these properties:
      action (string) - The TypeManager may supply an initial list of commands
         (date, time and numbers already do). As a result,
         this list is considered a way to modify the original list.
         "action" indicates how to use the values of the remaining properties.
         It has these values:
         "add" (or omit the action property) -
            adds the object to the end of the list.
         "clear" - remove the existing list. Use this to abandon
            items added by the TypeManager. Only use this as the first item 
            in commandKeys.
         "remove" - remove an item that exactly matches the remaining properties.
            If you want to replace an existing item, remove that item
            then add a new item.
     commandName (string) - The command name to invoke.
     keyCode - The keyCode to intercept. A keycode is a number
        returned by the DOM event object representing the key typed.
        It can also be a string with a single character.
        Common key codes:
           ENTER = 13, ESC = 27, PAGEUP = 33, PAGEDOWN = 35,
           HOME = 36, END = 35, LEFT = 37, RIGHT = 39,
           UP = 38, DOWN = 40, DELETE = 46
           F1 = 112 .. F10 = 122.
     shift - When true, requires the shift key pressed.
     ctrl - When true, requires the control key pressed.

  Commands are only invoked for keystrokes that are not considered valid by the TypeManager.
  For example, if you define the keycode for a letter and letters are valid characters,
  the command will not fire.
  As a result, map several key combinations to the same commandName.

  Assign to an empty array to avoid using commands.

* getCommandName (function) -
   A function hook used when evaluating a keystroke to see if it should 
   invoke a command. The function has these parameters:
      * evt - the jQuery event object to evaluate
      * cmdKeys - the commandKeys collection, which are described above.
      * tm - the TypeManager object associated with this datetextbox.

   Returns one of these values:
   * null - Continue processing the command.
   * commandName (string) - Use this command name to invoke the command.
   * "" (the empty string) - Stop processing this keystroke

* keyResult (function) -
   A function hook that is called after each keystroke is processed.
   It lets you know the result of the keystroke with one of these three states:
   valid, invalid, command.
   Use it to modify the user interface based on keystrokes. Its primary
   use is to change the UI when there is an invalid keystroke.
   If unassigned, it uses a default UI that changes the border using the style sheet
   class of the keyErrorClass property.
   If null, it is not used.
   This can be assigned as a string that reflects the name of a globally defined
   function too (for the benefit of JSon and unobtrusive setup).
   The function takes these parameters:
      * element - the jquery object for the textbox
      * event (the jquery event object) - Look at its keyCode for the keystroke typed.
      * result (string) - "valid", "invalid", "command"
      * options - the options object with user options.
   Returns nothing.

*  keyErrorClass (string) -
   The style sheet class added to the textbox when jTAC_DefaultKeyResult needs
   to show an error. Defaults to "key-error".

* keyErrorTime (int) -
   Number of milliseconds to show the keyErrorClass on the textbox after
   the user types an illegal key. Defaults to 200.

Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js

------------------------------------------------------------*/

/* --- jquery-ui extension "datatypeeditor" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var datatypeeditor = {  
      options: new jTAC_DataTypeEditorOptions(),

      _create: function () {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require( ["Connections.FormElement", "TypeManagers.Base"] );

      },

      _init: function () {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._init()");

            var tm = this._resolveTypeManager();
            if ( !tm )
               return;
            this._tm = tm;

            // if element.id + "_neutral" exists, access it. It hosts the neutral format
            var nElement = $( "#" + this.element[0].id + "_neutral" );
            if ( nElement.length ) {
               this._nElement = nElement; // save reference to the neutral element
               this._initValue( tm, nElement, this.element );
            }

            var o = this.options;
            this._prepCommandKeys( o, tm );
            this._prepDefaultKeyResult( o );

            var passThruKey = false;   // some browsers (FireFox) fire onkeypress even if onkeypress is canceled. When true, keypress immediately returns true.

            var that = this;
            this.element.keypress( function ( evt ) {
               if (passThruKey || (evt.which == 0)) {
                  return true;
               }
               var chr = String.fromCharCode( evt.which );
               var val = tm.isValidChar( chr );
               if ( !val ) {
                  if ( that._cmdKeys.length ) {
                     if ( that._invokeCommand( evt ) ) {
                        if ( o.keyResult )
                           o.keyResult( that.element, evt, "command", o );
                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                     }
                  }
                  if ( o.filterkeys || ( o.filterkeys === undefined ) ) {
                     var kc = evt.which || evt.keyCode;  // sometimes which is 0 while keyCode is correct
                     if ( that._validKeyCodes.indexOf( kc ) == -1 ) {   // some key codes are still passed on to the caller

                        if ( o.keyResult ) {
                           o.keyResult( that.element, evt, "invalid", o );
                        }

                        evt.preventDefault();
                        evt.stopPropagation();
                        return false;
                     }
                  }
               }
               if ( o.keyResult ) {
                  o.keyResult( that.element, evt, "valid", o );
               }

               return true;
            } );
            this._validKeyCodes = [13, 27, 9, 8];//[13, 27, 9, 8, 33, 34, 35, 36, 37, 38, 39, 40];

            if ( this._cmdKeys.length ) {
               this.element.keydown( function ( evt ) {
                  passThruKey = false;
                  if ( that._invokeCommand( evt ) ) {
                     if ( o.keyResult ) {
                        o.keyResult( that.element, evt, "command", o );
                     }

                     evt.preventDefault();
                     evt.stopPropagation();
                     passThruKey = true;
                     return false;
                  }
                  else
                     return true;
               } );
            }

            this.element.change( function ( evt ) {
               if ( o.reformat || ( o.reformat === undefined ) ) {
                  that._reformat( tm );
               }
            } );

            if ( o.checkPastes || ( o.checkPastes == undefined ) ) {
               this._installonpaste( tm );
            }
         }
         finally {
            jTAC._internal.popContext();
         }

      },  


/*
   Creates a TypeManager instance from several sources:
   data-jtac-datatype - attribute on the textbox that provides a class name for the typemanager
   data-jtac-typemanager - attribute on the textbox that provides property name and value pairs
      to assign to the typemanager created. If it has a jtacClass property, that is used
      as an alternative to data-jtac-datatype.
   options.datatype - same as data-jtac-datatype but on the options.
   options.typemanager - same as data-jtac-typemanager but on the options.
*/
      _resolveTypeManager: function () {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._resolveTypeManager()");

            var o = this.options;
            var tm = o.typeManager || this.element.data( "jtac-typemanager" );
            if ( tm ) {
               if ( typeof tm == "string" ) {
                  try {
                     tm = eval( "(" + tm + ");" );
                  }
                  catch ( e ) {
                     jTAC.warn( "JSon parsing error. " + e.message );
                  }
               }
               if ( tm.jtacClass ) {
                  tm = jTAC.create( null, tm );
               }

               if ( tm instanceof jTAC.TypeManagers.Base ) {
                  return tm;
               }

            }

            var dt = o.datatype || this.element.data( "jtac-datatype" );
            if ( dt ) {
               if ( o.datatype )
                  this.element.data( "jtac-datatype", o.datatype );   // transfer to the element so validators can use it
               tm = jTAC.create( dt, tm );
               if ( tm instanceof jTAC.TypeManagers.Base )
                  return tm;
            }

            jTAC.warn( "Specify the TypeManager. Use data-jtac-datatype='[name]' in the input field id=[" + this.element[0].id  + "]." );
            return null;
         }
         finally {
            jTAC._internal.popContext();
         }

      },


/*
Invoked by the textbox's onchange event to reformat and update
the neutral element's value with the culture neutral format.
*/
      _reformat : function( tm ) {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._reformat()");

            try {
               var val = tm.toValue(this.element.val());
               this.element.val(tm.toString(val));

               if (this._nElement != null) {
                  this._nElement.val(tm.toStringNeutral(val));
               }
            }
            catch (e) {
               // let validation change the UI for errors.
            }
         }
         finally {
            jTAC._internal.popContext();
         }

      },


/*
Called during Init to transfer the value of the neutral hidden html tag
to the visible textbox value, after reformatting it.
Does nothing if the user has already assigned a value to the element.
*/
      _initValue: function ( tm, neutralElement, visibleElement ) {
         if ( visibleElement.val() == "" ) {
            try {
               var n = tm.toValueNeutral( neutralElement.val() );
               if ( n != null ) {
                  visibleElement.val( tm.toString( n ) );
               }
            }
            catch ( e ) {
               jTAC.warn( "Converting neutral value in " + visibleElement.id + " error: " + e.message );
            }
         }

      },

/*
   Simple paste event handler designed to prevent pasting if 
   a single invalid character is found.
   It only looks at the content considered plain text. If there is HTML or another type,
   paste is prevented.
   Paste prevention is only available on IE, Safari, and Chrome.
   The other browsers do not prevent pasting.
   As a result, always validate the textbox's content.
*/
      _installonpaste: function ( tm ) {
         function notify() {
            jTAC.warn( "Paste was blocked." );
         }
         var el = this.element[0];
         if ( !el || ( el.onpaste === undefined ) ) {
            return;
         }
         el.onpaste = function ( e ) {
            var text = undefined;
            if ( window.clipboardData && window.clipboardData.getData ) { // IE
               text = window.clipboardData.getData( 'Text' );
               if ( text == null ) { // do not allow pasting any other type
                  notify();
                  return false; // Prevent the default handler from running.
               }
            }
            else if ( e.clipboardData && e.clipboardData.getData ) {  // safari and chrome
               text = e.clipboardData.getData( 'text/plain' );
               if ( text == null ) { // do not allow pasting any other type
                  notify();
                  return false; // Prevent the default handler from running.
               }
            }
            if ( text ) {
               for ( var i = 0; i < text.length; i++ ) {
                  if ( !tm.isValidChar( text.charAt( i ) ) ) {
                     notify();
                     return false; // Prevent the default handler from running.
                  }
               }
            }
            return true;
         };

      },


/*
   Creates and populates the _cmdKeys field with command key objects
   from two sources:
   - TypeManager.getCommandKeys() method defines the default collection.
   - options.commandKeys defines modifications to the defaults.
*/
      _prepCommandKeys: function ( opt, tm ) {
         this._cmdKeys = [];

         if ( tm.invoke ) {
            if ( tm.getCommandKeys ) { // initialize
               this._cmdKeys = tm.getCommandKeys();
            }
            if ( opt.commandKeys ) {
               for ( var i = 0; i < opt.commandKeys.length; i++ ) {
                  var ck = opt.commandKeys[i];
                  switch ( ck.action ) {
                     case "clear":
                        this._cmdKeys = [];
                        break;
                     case "remove":
                        // find a match to all properties
                        for ( var j = 0; j < this._cmdKeys.length; j++ ) {
                           var old = this._cmdKeys[j];
                           if ( old.commandName == ck.commandName ) {
                              if ( ( ck.keyCode == "*" ) ||
                                  ( ( old.keyCode === ck.keyCode ) &&
                                   ( old.ctrl == ck.ctrl ) &&
                                   ( old.shift == old.shift ) ) ) {
                                 this._cmdKeys.splice( j, 1 );
                                 break;
                              }
                           }
                        }  // for j
                        break;
                     default: // add
                        this._cmdKeys.push( ck );
                        break;
                  }  // switch
               }  // for i
            }  // if opt.commandKeys
         }  // if tm.invoke

      },


/* 
   Invokes the commands associated with the event keystroke.
   If no command occurred, returns false.
*/
      _invokeCommand: function ( evt ) {
         try
         {
            jTAC._internal.pushContext("datatypeeditor._invokeCommand()");

            var cmdName = null;
            if ( this.options.getCommandName ) {
               cmdName = this.options.getCommandName.call( this,
                  evt, this._cmdKeys, this._tm );
            }
            if ( cmdName == "" )   // means don't invoke this command
               return false;
            if ( !cmdName ) {
               cmdName = this._getCommandName( this._cmdKeys, evt );
            }
            if ( cmdName ) {
               var conn = this._conn;
               if ( !conn ) {
                  this._conn = conn = jTAC.connectionResolver.create( evt.currentTarget.id );
               }
               var args = { commandName: cmdName, connection: conn };
               this._tm.invoke( args );
               return true;
            }
            return false;
         }
         finally {
            jTAC._internal.popContext();
         }

      },

/*
Used by keydown and keypress events to see if a keystroke is associated
with a command registered in this._cmdKeys. If so, it invokes 
that command and returns true.
If not, it returns false.
   * cmdMap - string. Maps keystrokes to comamndIDs
   * evt - jquery event object

*/
      _getCommandName: function ( cmdMap, evt ) {
         var keyCode = evt.keyCode,
         ctrl = evt.ctrlKey,
         shift = evt.shiftKey;
         if ( ( keyCode == 16 ) || ( keyCode == 17 ) ) { // ctrl and shift keys alone
            return false;
         }

         // try to match by keyCode
         for ( var i = 0; i < cmdMap.length; i++ ) {
            var info = cmdMap[i];
            if ( ( info.keyCode == keyCode ) && ( !!info.ctrl == ctrl ) && ( !!info.shift == shift ) ) {
               return info.commandName;
            }
         }

         if ( ( evt.type != "keydown" ) || ( keyCode < 33 ) || ( ( keyCode < 91 ) && ( keyCode > 47 ) ) ) {
            var keyChar = String.fromCharCode( keyCode );  // only works in keypress event, not keydown
            var keyCharUC = keyChar.toUpperCase();
            var useShift = false;
            if ( ( keyCode < 65 ) || ( keyCode > 90 ) ) { // letters ignore the shift key, as they are matched in upper and lowercase
               useShift = true;
            }

            // try to match by keyCode
            for ( var i = 0; i < cmdMap.length; i++ ) {
               var info = cmdMap[i];
               if ( typeof ( info.keyCode ) == "number" )
                  continue;
               if ( useShift && ( !!info.shift != shift ) )
                  continue;
               if ( !!info.ctrl != ctrl )
                  continue;

               if ( ( info.keyCode == keyChar ) || ( info.keyCode.toUpperCase() == keyCharUC ) )
                  return info.commandName;
            }

         }
         return false;  // not found
      },

/*
Reviews the options to ensure they are setup for the keyResult option
to use the default if it hasn't already been setup.
*/
      _prepDefaultKeyResult: function ( options ) {
         if ( options.keyResult === undefined ) {  // needs the default
            options.keyResult = jTAC_DefaultKeyResult;
         }
         else if ( typeof options.keyResult == "string" ) {
            if ( window[options.keyResult] ) {
               options.keyResult = window[options.keyResult];
            }
            else 
               jTAC.warn( "Could not find the function [" + options.keyResult + "] globally defined." );
         }
         if ( options.keyErrorClass === undefined ) {
            options.keyErrorClass = "key-error";
         }
         if ( options.keyErrorTime == undefined ) {
            options.keyErrorTime = 200;
         }
      },

      _setOption: function ( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments ); 
      } 
   }; // datatypeeditor object
   $.widget("ui.dataTypeEditor", datatypeeditor); 
})(jQuery);


/*
Default function for the options.keyResult property.
Called after each keystroke is processed.
This function adds the style sheet class defined in options.keyErrorClass to the textbox
for a period of options.keyErrorTime.
The function takes these parameters:
   * element - the jquery object for the textbox
   * event (the jquery event object) - Look at its keyCode for the keystroke typed.
   * result (string) - "valid", "invalid", "command"
   * options - the options object with user options.
Returns nothing.
The value of 'this' is the datatypeeditor object.
*/
function jTAC_DefaultKeyResult( element, evt, result, options ) {
   function Clear() {
      if ( options.keyErrorIntervalID ) {
         element.removeClass( options.keyErrorClass );
         window.clearInterval( options.keyErrorIntervalID );
         options.keyErrorIntervalID = null;
      }
   }
   if ( !options.keyErrorClass )
      return;

   Clear();
   if ( result == "invalid" ) {
      element.addClass( options.keyErrorClass );
      options.keyErrorIntervalID = window.setTimeout( Clear, options.keyErrorTime );
   }
}

/* --- CLASS jTAC_DataTypeEditorOptions -------------------------------
Options object definition used by jquery-ui-datatypeeditor.

NOTE: All properties are set to null initially.
-----------------------------------------------------------------------*/

function jTAC_DataTypeEditorOptions() {
}
jTAC_DataTypeEditorOptions.prototype = {
/*
  Alternative to using the data-jtac-datatype attribute assigned to the textbox.
  Only used when that attribute is missing.
*/
   datatype : null,

/*
  Used instead of the data-jtac-datatype and data-jtac-typemanager attributes on the textbox
  when assigned. It must host the TypeManager.
  (The data-jtac-typemanager attribute's values will not be used to revise its properties.)
*/
   typeManager : null,

/*
When true, the onchange event will reformat the contents to match
the most desirable format. Effectively, it uses the TypeManager's
toValue then toString methods. Nothing happens if there is a formatting error.
*/
   reformat : true,

/*
When true, keystrokes are evaluated for valid characters.
Invalid characters are filtered out. 
This uses the TypeManager.IsValidChar() method.
When false, no keystroke filtering is supported.
*/
   filterkeys : true,

/*
On browsers that support the onpaste event, this attempts to
evaluate the text from the clipboard before it is pasted.
It checks that each character is valid for the TypeManager.
If any invalid character is found, the entire paste is blocked.
It will also block pasting non-textual (including HTML) content.
Supported browsers: IE, Safari, and Chrome.
*/
   checkPastes : true,

/*
An array of objects that map a keystroke to a command
associated with the TypeManager's command feature.
Requires loading \jTAC\TypeManagers\Command extensions.js.
When null, it uses the values supplied by the getCommandKeys() method
on each TypeManager prototype.

Each object in the array has these properties:
   action (string) - The TypeManager may supply an initial list of commands
      (date, time and numbers already do). As a result,
      this list is considered a way to modify the original list.
      "action" indicates how to use the values of the remaining properties.
      It has these values:
      "add" (or omit the action property) -
         adds the object to the end of the list.
      "clear" - remove the existing list. Use this to abandon
         items added by the TypeManager. Only use this as the first item 
         in commandKeys.
      "remove" - remove an item that exactly matches the remaining properties.
         If you want to replace an existing item, remove that item
         then add a new item. If you want to remove all instances of 
         a commandName, set keyCode to "*".
   commandName (string) - The command name to invoke.
   keyCode - The keyCode to intercept. A keycode is a number
      returned by the DOM event object representing the key typed.
      It can also be a string with a single character.
      Common key codes:
         ENTER = 13, ESC = 27, PAGEUP = 33, PAGEDOWN = 35,
         HOME = 36, END = 35, LEFT = 37, RIGHT = 39,
         UP = 38, DOWN = 40, DELETE = 46
         F1 = 112 .. F10 = 122.
   shift - When true, requires the shift key pressed.
   ctrl - When true, requires the control key pressed.

Commands are only invoked for keystrokes that are not considered valid by the TypeManager.
For example, if you define the keycode for a letter and letters are valid characters,
the command will not fire.
As a result, map several key combinations to the same commandName.

Assign to an empty array to avoid using commands.
*/
   commandKeys : null,


/*
A function hook used when evaluating a keystroke to see if it should 
invoke a command. The function has these parameters:
   * evt - the jQuery event object to evaluate
   * cmdKeys - the commandKeys collection, which are described above.
   * tm - the TypeManager object associated with this datetextbox.

Returns one of these values:
* null - Continue processing the command.
* commandName (string) - Use this command name to invoke the command.
* "" (the empty string) - Stop processing this keystroke

*/
   getCommandName : null,


/*
A function hook that is called after each keystroke is processed.
It lets you know the result of the keystroke with one of these three states:
valid, invalid, command.
Use it to modify the user interface based on keystrokes. Its primary
use is to change the UI when there is an invalid keystroke.
If null, it uses a default UI that changes the border using the style sheet
class of the keyErrorClass property.
This can be assigned as a string that reflects the name of a globally defined
function too (for the benefit of JSon and unobtrusive setup).
The function takes these parameters:
   * element - the jquery object for the textbox
   * event (the jquery event object) - Look at its keyCode for the keystroke typed.
   * result (string) - "valid", "invalid", "command"
   * options - the options object with user options.
Returns nothing.
*/
   keyResult : jTAC_DefaultKeyResult,

/*
The style sheet class added to the textbox when jTAC_DefaultKeyResult needs
to show an error.
*/
   keyErrorClass : "key-error",

/*
Number of milliseconds to show the keyErrorClass on the textbox after
the user types an illegal key.
*/
   keyErrorTime : 200
};

/*
   Utility that adds command objects to the command keys list for dates.
   Call from getCommandKeys functions.
      cmdKeys (array) - Array of existing objects. Items will be appended.
      today (boolean) - When true, add the Today command.
*/
function jTAC_StdDateCmds(cmdKeys, today) {
   if (today) {
      cmdKeys.push(
            {commandName: "Today", keyCode: "t" },
            {commandName: "Today", keyCode: "t", ctrl : true });
   }
   cmdKeys.push(
            {commandName: "NextDay", keyCode: 38 }, // up arrow
            {commandName: "PrevDay", keyCode: 40 }, // down arrow
            {commandName: "NextMonth", keyCode: 33 }, // Page up
            {commandName: "PrevMonth", keyCode: 34 }, // Page down
            {commandName: "NextMonth", keyCode: 38, ctrl : true }, // Ctrl+ up
            {commandName: "PrevMonth", keyCode: 40, ctrl : true }, // Ctrl +down
            {commandName: "NextYear", keyCode: 36 }, // Home
            {commandName: "PrevYear", keyCode: 35 }); // End
   return cmdKeys;
}

/*
   Utility that adds command objects to the command keys list for times.
   Call from getCommandKeys functions.
      cmdKeys (array) - Array of existing objects. Items will be appended.
      now (boolean) - When true, add the Now command.
*/
function jTAC_StdTimeCmds(cmdKeys, now) {
   if (now) {
      cmdKeys.push(
            {commandName: "Now", keyCode: "N", ctrl: true });
   }
   cmdKeys.push(
            {commandName: "NextMinutes", keyCode: 38 }, // up arrow
            {commandName: "PrevMinutes", keyCode: 40 }, // down arrow
            {commandName: "NextHours", keyCode: 33 }, // Page up
            {commandName: "PrevHours", keyCode: 34 }, // Page down
            {commandName: "NextHours", keyCode: 38, ctrl: true }, // Ctrl+ up
            {commandName: "PrevHours", keyCode: 40, ctrl: true}); // Ctrl +down; // End
   return cmdKeys;
}

if (jTAC.isDefined("TypeManagers.BaseDate")) {
   jTAC_Temp = {
      getCommandKeys : function() {
         return jTAC_StdDateCmds([], true);
      }
   } 
   jTAC.addMembers("TypeManagers.Base", jTAC_Temp);
}

if ( jTAC.isDefined( "TypeManagers.TimeOfDay" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdTimeCmds([], true);
      }
   } 
   jTAC.addMembers( "TypeManagers.TimeOfDay", jTAC_Temp );
}

if ( jTAC.isDefined( "TypeManagers.Duration" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdTimeCmds([], false);
      }
   }
   jTAC.addMembers( "TypeManagers.Duration", jTAC_Temp );
}

if ( jTAC.isDefined( "TypeManagers.DateTime" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         var cmdKeys = [{commandName: "Now", keyCode: "N", ctrl: true }];
         return jTAC_StdDateCmds(cmdKeys, true);
      }
   }
   jTAC.addMembers( "TypeManagers.DateTime", jTAC_Temp );
}

/*
   Utility that adds command objects to the command keys list for numbers.
   Call from getCommandKeys functions.
      cmdKeys (array) - Array of existing objects. Items will be appended.
      fp (boolean) - "floating point" When true, add the NextByPt1/PrevByPt1 commands.
*/
function jTAC_StdNumberCmds(cmdKeys, fp) {
   cmdKeys.push(
      {commandName: "NextBy1", keyCode: 38 }, // up arrow
      {commandName: "PrevBy1", keyCode: 40 }); // down arrow
   if (fp) {
      cmdKeys.push(
      {commandName: "NextByPt1", keyCode: 38, ctrl: true }, // Page up
      {commandName: "PrevByPt1", keyCode: 40, ctrl: true}) // Page down
   }
   return cmdKeys;
}
if ( jTAC.isDefined( "TypeManagers.BaseFloat" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdNumberCmds([], true);
      }
   }
   jTAC.addMembers( "TypeManagers.BaseFloat", jTAC_Temp );
}

if ( jTAC.isDefined( "TypeManagers.Integer" ) ) {
   jTAC_Temp =
   {
      getCommandKeys: function () {
         return jTAC_StdNumberCmds([], false);
      }
   }
   jTAC.addMembers( "TypeManagers.Integer", jTAC_Temp );
}
// jTAC/jquery-ui widgets/datetextbox.js
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

Purpose:
datetextbox is a jquery-ui widget that incorporates the features of
two other jquery-ui elements into a textbox:
- datatypeeditor (from jTAC\jquery-ui widgets\datatypeeditor.js)
- jquery-ui-datepicker (from jquery-ui-#.#.#.js)

While you could attach both of these elements to a textbox yourself,
this widget simplifies the setup.
- Modifies the default options of the datepicker widget to make it
  work gracefully with the datatypeeditor. For example, while the datepicker is popped
  up, several keystroke commands of datatypeeditor need to be disabled.
- Defaults to a button to popup instead of focus, because the keyboard
  entry features of datatypeeditor are more often going to be used for fast entry
  than having to work through a calendar. (Focus first suggests that the user
  goes to the calendar for most entry.)
- Applies the localized jquery-globalize rules.


Establishing this ui widget
==============================
1. Add an input field of type="text". Assign the id and name properties to the same value.

   <input type="text" id="id" name="name" />

2. Add this attribute to the input field:

   data-jtac-datatype - Specifies TypeManager class to use. 
      Its value must be a class name or alias to a TypeManager class.
      Here are the recommended values:
         "Date" - Uses TypeManagers.Date in its default settings.
         "Date.Short" - Uses TypeManagers.Date in Short date format
         "Date.Abbrev" - Uses TypeManagers.Date in Abbreviated date format (dateFormat = 10)
         "Date.Long" - Uses TypeManagers.Date in Long date format (dateFormat = 20)

      You can create other names and register them with jTAC.define() or jTAC.defineAlias(), 
      so long as their TypeManager.getDataTypeName() == "date".

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev" />

3. Consider using a more powerful parser.
   The default parser handles only the short date pattern and is not very flexible with 
   the variety of user inputs that come to it.
   Use the TypeManagers.PowerDateParser class to have a much richer data entry 
   experience just by adding <script> tags to its script file:
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerDateParser.js' ></script>

4. A TypeManager object has numerous properties to customize it. For example,
   TypeManagers.Date has a DateFormat property to adjust the format between short, abbrev and full.
   If you need to set any of these properties, add this attribute to the input field:

   data-jtac-typeManager - Specifies an object (JSon format recommended)
      whose properties override the defaults on the TypeManager created by data-jtac-datatype.

   TypeManagers have many useful properties. Here are some of the most useful:
   * cultureName (string) - sets the culture for formatting and parsing.
   * minValue and maxValue - When \jTAC\jquery-ui widgets\command extensions.js are supported,
      these properties are available to define the limits of values commands can reach.
      When specified as strings, these must use the culture neutral format of "yyyy-MM-dd".
   See the \jTAC\TypeManagers\ folder for details on individual classes.

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev" 
      data-jtac-typeManager="{'cultureName' : 'en-US', 'minValue' : "2012-01-01"}" />

5a. If working in code, use this to attach the datetextbox jquery-ui widget to
   the input field.

   $("selector for the hidden field").datetextbox(options);

   The options reflect the properties shown below.
   This code usually runs as the page loads, such as in $(document).ready.

5b. If you want unobtrusive setup, add this attribute to the input field:
   
   data-jtac-datetextbox - Activates the datetextbox feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. 
      Only specify to override a default.
      If no options are needed, use the empty string.

   Also add the script file \jTAC\jquery-ui widgets\datetextbox-unobtrusive.js

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datetextbox="{'checkPastes' : false, 'datepicker': { 'gotoCurrent' : true } }" />
   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datatextbox="" />

6. You still have to deal with the server side code that gets and sets the value
  of this input. That can be tricky because that code needs to convert
  between strings and native values. To simplify this, you can 
  add hidden input whose id is the dateTextBox's id + "_neutral".
  Use the value attribute of this hidden field to get and set the value.
  ALWAYS work with a string in the culture neutral format of the type
  which is: yyyy-MM-dd

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="" />
   <input type="hidden" id="id_neutral" name="id_neutral" value="2000-05-31" />


Options
=======================
These properties are defined on an object passed to the datetextbox steps 4a or 4b above.
NOTE: Most are the same as those for the datatypeeditor.

* datepicker (object) -
  An object that reflects the same properties as the options passed into the jquery-ui-datepicker.
  This object is passed to the datepicker as it is created.
  See http://docs.jquery.com/UI/Datepicker#options

* datatype (string) -
  Alternative to using the data-jtac-datatype attribute assigned to the textbox.
  Only used when that attribute is missing.

* typeManager (TypeManager object) -
  Used instead of the data-jtac-datatype and data-jtac-typemanager attributes on the textbox
  when assigned. It must host the TypeManager object,
  or a JavaScript object with properties to assign to the TypeManager identified
  by the datatype property.

* reformat (boolean) -
  When true, the onchange event will reformat the contents to match
  the most desirable format. Effectively, it uses the TypeManager's
  toValue then toString methods. Nothing happens if there is a formatting error.
  It defaults to true.

* filterkeys (boolean) -
  When true, keystrokes are evaluated for valid characters.
  Invalid characters are filtered out. 
  This uses the TypeManager's isValidChar() method.
  When false, no keystroke filtering is supported.
  It defaults to true.

* checkPastes (boolean) -
  On browsers that support the onpaste event, this attempts to
  evaluate the text from the clipboard before it is pasted.
  It checks that each character is valid for the TypeManager.
  If any invalid character is found, the entire paste is blocked.
  It will also block pasting non-textual (including HTML) content.
  Supported browsers: IE, Safari, and Chrome.

* commandKeys (array) -
   An array of objects that map a keystroke to a command
   associated with the TypeManager's command feature.
   Requires loading \jTAC\jquery-ui widgets\Command extensions.js.
   When null, it uses the values supplied by the getCommandKeys() method
   on each TypeManager prototype.

   Each object in the array has these properties:
      action (string) - The TypeManager may supply an initial list of commands
         (date, time and numbers already do). As a result,
         this list is considered a way to modify the original list.
         "action" indicates how to use the values of the remaining properties.
         It has these values:
         "add" (or omit the action property) -
            adds the object to the end of the list.
         "clear" - remove the existing list. Use this to abandon
            items added by the TypeManager. Only use this as the first item 
            in commandKeys.
         "remove" - remove an item that exactly matches the remaining properties.
            If you want to replace an existing item, remove that item
            then add a new item.
     commandName (string) - The command name to invoke.
     keyCode - The keyCode to intercept. A keycode is a number
        returned by the DOM event object representing the key typed.
        It can also be a string with a single character.
        Common key codes:
           ENTER = 13, ESC = 27, PAGEUP = 33, PAGEDOWN = 35,
           HOME = 36, END = 35, LEFT = 37, RIGHT = 39,
           UP = 38, DOWN = 40, DELETE = 46
           F1 = 112 .. F10 = 122.
     shift - When true, requires the shift key pressed.
     ctrl - When true, requires the control key pressed.

  Commands are only invoked for keystrokes that are not considered valid by the TypeManager.
  For example, if you define the keycode for a letter and letters are valid characters,
  the command will not fire.
  As a result, map several key combinations to the same commandName.

  Assign to an empty array to avoid using commands.

* getCommandName (function) -
   A function hook used when evaluating a keystroke to see if it should 
   invoke a command. The function has these parameters:
      * evt - the jQuery event object to evaluate
      * cmdKeys - the commandKeys collection, which are described above.
      * tm - the TypeManager object associated with this datetextbox.

   Returns one of these values:
   * null - Continue processing the command.
   * commandName (string) - Use this command name to invoke the command.
   * "" (the empty string) - Stop processing this keystroke

* keyResult (function) -
   A function hook that is called after each keystroke is processed.
   It lets you know the result of the keystroke with one of these three states:
   valid, invalid, command.
   Use it to modify the user interface based on keystrokes. Its primary
   use is to change the UI when there is an invalid keystroke.
   If unassigned, it uses a default UI that changes the border using the style sheet
   class of the keyErrorClass property.
   If null, it is not used.
   This can be assigned as a string that reflects the name of a globally defined
   function too (for the benefit of JSon and unobtrusive setup).
   The function takes these parameters:
      * element - the jquery object for the textbox
      * event (the jquery event object) - Look at its keyCode for the keystroke typed.
      * result (string) - "valid", "invalid", "command"
      * options - the options object with user options.
   Returns nothing.

*  keyErrorClass (string) -
   The style sheet class added to the textbox when jTAC_DefaultKeyResult needs
   to show an error. Defaults to "key-error".

* keyErrorTime (int) -
   Number of milliseconds to show the keyErrorClass on the textbox after
   the user types an illegal key. Defaults to 200.


Options example using code:
$("#TextBox1").datetextbox({datatype : "Date.Abbrev", datepicker : {buttonImageUrl : "/Images/calendar.png"} });

Options example unobtrusive:
<input type="text" id="TextBox1" name="TextBox1" 
   data-jtac-datetextbox='{datatype : "Date.Abbrev", datepicker : {buttonImageUrl : "/Images/calendar.png"} }' />


Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js
jquery-ui widgets\datatypeeditor.js

------------------------------------------------------------*/

/* --- jquery-ui extension "datetextbox" ------------------------------
See documentation in the file header.
-----------------------------------------------------------------------*/
(function($) {  
   var datetextbox = {  

/*
   Used by the datatypeeditor widget. Allows non-specified properties
   which includes the datepicker property that hosts an object
   passed to the datepicker widget.
*/
      options: new jTAC_DataTypeEditorOptions(),

      _create: function() {
         if ( !window.jTAC )
            throw new Error( "window.jTAC not created." );
         jTAC.require("Connections.FormElement", "TypeManagers.Date");
         if (!window.jTAC_DataTypeEditorOptions)
            jTAC.error("Requires the datatypeeditor scripts.");

      },

      _init: function() {
         try
         {
            jTAC._internal.pushContext("datetextbox._init()");

            var that = this;
            var textbox = this.element[0];
            if (!this.options.datatype && !this.element.data("jtac-datatype")) {
               this.options.datatype = "TypeManagers.Date"; // default TypeManagers.Date using DateFormat=0 (Short). This is overridden if the textbox has a data-jtac-datatype attribute.
            }

            // share the datatype on data-jtac-datatype if that attribute has not been setup
            if (!$.data(textbox, "jtac-datatype")) {
               textbox.setAttribute("data-jtac-datatype", this.options.datatype);   // not using $.data because this must become a real attribute of the element
            }

            if (!this.options.getCommandName) {
               this.options.getCommandName = function( evt, opt, tm ) {
                  if ($.datepicker._datepickerShowing)
                  {
                     return that._getCommandName(evt, opt, tm);
                  }
                  return null;
               };
            }


            this.element.dataTypeEditor(this.options);
            var dte = $.data(textbox, "dataTypeEditor");
            if (!dte) {
               return;
            }
            var tm = dte._tm;
            if (!tm || (tm.dataTypeName() != "date")) {
               return;  // don't setup the datepicker if we are not using a date object.
            }

            this._dte = dte;
            this._tm = tm;

            if (tm.installCmd) {
               tm.installCmd({commandName : "Calendar", func : function( args ) {
                  return that._popup.call(that, args);
               }, ignoreCurrent : true});
            }
         // create the options to be used by datepicker
            var dpopt = this.options.datepicker || {};
        //    if (!dpopt.buttonImage)
            dpopt.constrainInput = false; // because our datatypeeditor handles that
            if (!dpopt.dateFormat) {
               dpopt.dateFormat = this._convertDatePattern(tm._datePattern());
            }

            // applies culture specific rules
            dpopt.dayNames = tm.dateTimeFormat("Days");
            dpopt.dayNamesMin = tm.dateTimeFormat("DaysShort");
            dpopt.dayNamesShort = tm.dateTimeFormat("DaysAbbr");
            dpopt.monthNames = tm.dateTimeFormat("Months");  // note globalize's array has 13 items, not 12 like monthNames expects. But the last is just ignored
            dpopt.monthNamesShort = tm.dateTimeFormat("MonthsAbbr");


         // transfer the min and max values assigned to tm when using command extensions.
            if (!dpopt.minDate && tm.getMinValue && tm.getMinValue()) {  // getMinValue requires \TypeManagers\Command Extensions.js
               dpopt.minDate = tm.getMinValue;
            }
            if (!dpopt.maxDate && tm.getMaxValue && tm.getMaxValue()) {
               dpopt.maxDate = tm.getMaxValue;
            }

         // override the default of focus because we are favoring keyboard entry
            if (!dpopt.showOn) {
               dpopt.showOn = "button";
            }

            this._prepAutoButton(this.options);

            this.element.datepicker(dpopt);

            var dp = $.data(textbox, "datepicker");

            this._finishAutoButton(dp, this.options);

            // when the button is added, jquery-validate gets confused. It tries to validate
            // the button tag, but because datepicker does not assign an id or name attribute to
            // it, jquery-validate has a javascript exception.
            // Use $.validator's options to fix.
            $(document).ready(function() {
               if ($.validator) {
                  var validator = $.data(textbox.form, "validator");
                  if (validator && validator.settings) {
   //                  validator.settings.ignore.push(".ui-datepicker-trigger");

            //NOTE: ignore may be a function or $element. These are not modified.
                     var ignore = validator.settings.ignore || "";
                     if (ignore instanceof Array) {
                        if (ignore.length)
                           validator.settings.ignore.push(".ui-datepicker-trigger");
                        else
                           ignore = "";
                     }
                     if (typeof ignore == "string") {
                        validator.settings.ignore = (ignore ? ignore + "," : "") + ".ui-datepicker-trigger";
                     }

                  }
               }
            });
         }
         finally {
            jTAC._internal.popContext();
         }

      },  

/*
The datepicker.options.dateFormat property is assigned automatically
by using the pattern defined by the TypeManagers.Date class. However,
the format must be converted to work.
DateTypeManager is using the traditional .net pattern while
datepicker uses the format described here:
http://docs.jquery.com/UI/Datepicker/formatDate
*/
      _convertDatePattern : function( ptn ) {
         // month pattern conversion:
         // MMMM -> MM
         // MMM -> M
         // MM -> mm
         // M -> m

         if (ptn.indexOf("MMMM") > -1) {
            ptn = ptn.replace("MMMM", "MM");
         }
         else if (ptn.indexOf("MMM") > -1) {
            ptn = ptn.replace("MMM", "M");
         }
         else if (ptn.indexOf("MM") > -1) {
            ptn = ptn.replace("MM", "mm");
         }
         else if (ptn.indexOf("M") > -1) {
            ptn = ptn.replace("M", "m");
         }

         // year pattern conversion:
         // yyyy -> yy
         // yy -> y
         if (ptn.indexOf("yyyy") > -1) {
            ptn = ptn.replace("yyyy", "yy");
         }
         else if (ptn.indexOf("yy") > -1) {
            ptn = ptn.replace("yy", "yy");
         }
         
         return ptn;

      },

/*
   Implements the jTAC_DataTypeEditorOptions.getCommandName event
   to intercept keystrokes managed by the datepicker while it is popped up.
   This avoids having one keystroke modify both the textbox and datepicker.
   Only called when popped up.
   These keystrokes are owned by a popped up datePicker:
   ctrl + up, ctrl + left, ctrl + right, ctrl + down,
   page up, page down, ctrl+home, ctrl+end,
   enter, esc
   (For reference: http://docs.jquery.com/UI/Datepicker#overview) 
*/
      _getCommandName : function( evt, cmdKeys, tm ) {
         switch (evt.keyCode) {
            case 37: // left
            case 38: // up
            case 39: // right
            case 40: // down
            case 35: // end
            case 36: // home
               return evt.ctrlKey ? "" : null;
            case 27: // esc
            case 13: // enter
            case 33: // page up
            case 34: // page down
               return !evt.ctrlKey ? "" : null;
         }
         return null;
      },


/*
   If the buttonImage option is defined with "spacer.gif", it is a trigger to use
   this feature. It ensures the button is an image (it will set buttonImageOnly to true
   if you haven't explicitly set it to false). 
   It expects the .ui-datepicker-trigger style sheet to be defined using the image URL in its
   background-image style. 

   If you want mouse over effects, it should have
   .ui-datepicker-trigger:hover style also defined with another image
   in the background-image style.

   If you want mouse pressed effects, it should have
   .ui-datepicker-trigger-pressed style also defined with another
   image in the background-image style.

   All of these are defined if you load the /jTAC Appearance/jquery.ui.datetextbox.css.
   The spacer.gif file itself is important as it will be shown by the <img> tag.
   Since we really want to just show the background-image style, spacer.gif
   is actually a tranparent 1x1 pixel image.
   NOTE: The reason we use buttonImage="path/spacer.gif" instead of assigning it internally
   is because the path depends on the location of the html file in the app's hierarchy.
*/
      _prepAutoButton : function(dtbopts) {
         // see if datepicker options is already configured
         var opts = dtbopts.datepicker;
         if (!opts.buttonImage || opts.buttonImage.toLowerCase().indexOf("spacer.gif") == -1)
            return;
         if (opts.showOn == "focus")
            return;
         dtbopts.autoButton = true; // indicate that it needs further setup
         if (opts.buttonImageOnly == null) {
            opts.buttonImageOnly = true;
         }
         if (opts.buttonText == null) {
            opts.buttonText = "Open";
         }
      },
      
      _finishAutoButton : function( dp, dtbopts ) {
         if (!dtbopts.autoButton)
            return;
         // see if we need to add an animation to when the mouse is pressed
         var ss = window.document.styleSheets;
         if (!ss)
            return;
         var pcss = "ui-datepicker-trigger-pressed";

         for (var si = 0; si < ss.length; si++) {
            var ss2 = ss[si];
            var rules = ss2.cssRules ? ss2.cssRules : ss2.rules;
            for (var i = 0; i < rules.length; i++) {
               if (rules[i].selectorText && rules[i].selectorText.toLowerCase() == "." + pcss) {
               // found the style. Now build some events around the button using it.
                  dp.trigger.mousedown(function ( evt ) {
                     dp.trigger.addClass(pcss);
                  });
                  dp.trigger.mouseup(function ( evt ) {
                     dp.trigger.removeClass(pcss);
                  });
                  dp.trigger.mouseout(function ( evt ) {
                     dp.trigger.removeClass(pcss);
                  });
                  return;
               }  // if
            }  // for
         }  // for
      },

/*
This is a command compatible with TypeManager.installCmd() that
pops up the calendar.
The command is installed by _init() and has the commandName = "Calendar".
To use it, add a keyboard mapping entry to the dateTextBox.options.commandKeys.
Avoid using keystrokes that are normally allowed in the textbox.
*/
      _popup : function(args) {
         this.element.datepicker("show");
         return false;
      },

      _setOption: function( key, value ) {
         $.Widget.prototype._setOption.apply( this, arguments ); 
      }
   }; // datetextbox object
   $.widget("ui.dateTextBox", datetextbox); 
})(jQuery);  


// Need to add commands to popup the calendar to the existing command list of the DateTypeManager.
if (jTAC.isDefined("TypeManagers.BaseDate"))
{
// merge existing commandkeys with the new items
   var jTAC_DateCmds = jTAC.TypeManagers.BaseDate.prototype.getCommandKeys();
   jTAC_DateCmds.push({commandName: "Calendar", keyCode : 13, ctrl : true }); // Ctrl+Enter

   jTAC.TypeManagers.BaseDate.prototype.getCommandKeys = function()   // replace the function
      {
         return jTAC_DateCmds;
      };
}


﻿// jTAC/TypeManagers/Command extensions.js
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

Purpose:
Extends existing TypeManager objects to offer a command handler
that will allow users to modify the value of the textbox by
a keystroke or menu command.

The TypeManagers.Base class is expanded with these new members:

* invoke(args) - 
   Invokes a command. It is passed an object to reflect
   the arguments. They are:
   - command name (string) - A unique string associated with a command.
      This will run a specific function that is passed this same object.
      Most of the functions will be defined on the TypeManager subclass,
      although the user can provide functions written for external purposes,
      such as "popup" to popup a Calendar.
   - connection (Connection class) - 
      Identifies the element whose value is modified. It's used to 
      retrieve the current value, either as text or native type,
      and set the updated value.
   - caretPos (integer) - The location of the caret in the textbox. If
      there is a range, this is the starting location. 0 is the first position.
      If there is no caret, leave it null.
      This is used with commands that are position sensitive.
   - changed (boolean) - When true, the caller knows the value was updated.
   - error (boolean) - When true, the caller knows there was an error preventing change.
   - value - The native value as a result of running the function.
      This does not need to be set by the caller. It can be used when invoke() returns.

* installCmd(args) - 
   Called by the TypeManager's initCmds() function
   to install a single command name and associated function to call.
   Each function supports a single parameter, the same args as passed into invoke().
   installCmd() can also be called by the page developer to add custom commands.
   A custom command's function can be located on the TypeManager's own
   prototype or elsewhere. When its called, the value of 'this' is the TypeManager instance.
   Each function returns a boolean value. When true, it means update the connection's
   current value with the value from args.value. When false, no update occurs.

   The args is an object with the following properties:
   - commandName (string) - The unique string that identifies the command.
   - func (function) - Reference to a function that is invoked by the command.
   - ignoreCurrent (boolean) - When true, the function does not need to 
      know the current value. The invoke() args will have its 'value' property set to null.
      For example, the command "Today" doesn't need to read the current value.
   - ignoreError (boolean) - When true and the function uses the current value,
      it will still be called even if the current value could not be determined due to an error.
      When null or false, the function is not called if the current value cannot be determined.

* installValueCmd(commandname, value) - 
   Allows a command to set an explicit value.
   Only used by the page developer to add special values.
   Typically used to add dates. The value must be the native type supported
   by the TypeManager. 

* initCmds() -
   Called by the constructor when this script file is loaded.
   Subclasses should override this to call installCmd() for the command list.

* minValue, maxValue -
   These properties are used when there are range limits.
   They are used by some commands, especially those that increment or decrement the value.
   The values must be the correct data type for the TypeManager.
   You can also set them with a culture neutral formatted string represented the value.

* clearCmd(args) - 
   Function to assign to the "Clear" command. It always sets the args.value to null
   and clears the connection's value.
   Subclasses still must attach this function using installCmd().



Predefined commands on each class:
- All Date classes:
   * "NextDay", "PrevDay" - increase or decrease by one day. Will update month at the day borders
   * "NextMonth", "PrevMonth" - increase or decrease by one month. Will update year at the month borders
   * "NextYear", "PrevYear" - increase or decrease by one year
   * "Today" - Assign today's date
   * "Clear" - Clear the date. Empty textbox.

- Time and duration classes:
   * "NextSec", "PrevSec" - increases or decreases by one second.
   * "NextMin", "PrevMin" - increases or decreases by one minute.
   * "NextHr", "PrevHr" - increases or decreases by one hour.
   * "Now" - assign the current time of day.
   * "Clear" - Clear the date. Empty textbox.

- Number classes:
   * "NextBy1", "PrevBy1" - increases or decrease by 1
   * "NextBy10", "PrevBy10" - increases or decrease by 10
   * "NextBy100", "PrevBy100" - increases or decrease by 100
   * "NextBy1000", "PrevBy1000" - increases or decrease by 1000
   * "NextByPt1", "PrevByPt1" - increases or decrease by 0.1
   * "NextByPt01", "PrevByPt01" - increases or decrease by 0.01
   * "Clear" - Clear the date. Empty textbox.
     
  
Required libraries:
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD \jTAC\TypeManagers\Base.js BEFORE THIS FILE IS LOADED
ALWAYS LOAD any other TypeManager classes BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

/* ---- TypeManagers.Base extensions --------------- */
jTAC_Temp = {
   config : {
      minValue: null,
      maxValue: null
   },

   /*
   Holds the objects defined by the installCmds() method
   in the order they are added. (Duplicate commands are allowed
   but only the first is invoked.)
   _internal.cmds: [],  // this is defined when initCmds is called to avoid it here on the prototype
   */

   /*
   Invokes a command. 
   The args parameter is an object with these properties:
   * commandName (string) - A unique string associated with a command.
      This will run a specific function that is passed this same object.
      Most of the functions will be defined on the TypeManager subclass,
      although the user can provide functions written for external purposes,
      such as "popup" to popup a Calendar.
   * connection (Connection object) - 
      Identifies the element whose value is modified. It's used to 
      retrieve the current value, either as text or native type,
      and set the updated value.
   * caretPos (integer) - The location of the caret in the textbox. If
      there is a range, this is the starting location. 0 is the first position.
      If there is no caret, leave it null.
      This is used with commands that are position sensitive.
   * changed (boolean) - When true, the caller knows the value was updated.
   * error (boolean) - When true, the caller knows there was an error preventing change.
   * value - The native value as a result of running the function.
      This does not need to be set by the caller. It can be used when invoke() returns.
   * precmd (function) - Optional user function that is called prior to calling the normal function.
      Allows changing the initial value (in args.value), detecting a special error (set args.error=true),
      or just stopping the command.
      Function returns false to stop further processing, true to continue.
   * postcmd (function) - Optional user function that is called after to calling the normal function.
      It is only called if the normal function returns true, indicating the value had been changed (args.changed=true).
      Allows changing the resulting value (in args.value), detecting a special error (set args.error=true),
      and updating the interface directly.
      Function returns false to prevent updating the textbox's value (probably because 
      your function did that itself), and true to let invoke() update the textbox's value.
   */
   invoke: function ( args ) {
      var intnl = this._internal;
      var cmds = intnl.cmds;

      if (!cmds) {
         intnl.cmds = cmds = [];
         this._initCmds();
      }
      else if (intnl.needsCmds) {
         this._initCmds();
         intnl.needsCmds = false;
      }

   // init return results
      args.changed = false;
      args.error = false;
      args.value = null;
      for (var i = 0; i < cmds.length; i++) {
         var obj = cmds[i];
         if (obj.commandName == args.commandName) {
            if (!obj.ignoreCurrent) {
               try {
                  args.value = this.toValueFromConnection(args.connection);
               }
               catch (e) {
                  if (!obj.ignoreError) {
                     args.error = true;
                     return;
                  }
               }
            }

            if (args.precmd) {
         // function takes the args. If it sets error or returns false, it stops
         // Usually return false when the data is valid, but there is no need to continue
         // and args.error = true when there is really an error.
               if (!args.precmd(args) || args.error)
                  return;
            }

            if (!args.settings) {  // precmd function may have set it to override defaults
               args.settings = obj;
            }
            if (obj.func.call(this, args)) {
               args.changed = true;
               if (args.postcmd) {
            // function takes the args. If it sets error or returns false, it stops before setting the textbox's value.
            // Usually return false when the data was assigned to an element in the function
            // and args.error = true when there is really an error.
                  if (!args.postcmd(args) || args.error)
                     return;
               }

               args.connection.setTextValue(this.toString(args.value));
            }
            return;   // done
         }
      }
   },

   /* 
   Utility used by subclasses in their initCmds() function
   to install a single command name and associated function to call.

   Each function supports a single parameter, the same args as passed into invoke().
   installCmd() can also be called by the page developer to add custom commands.

   Each function returns a boolean value. When true, it means update the connection's
   current value with the value from args.value. When false, no update occurs.

   The args parameter is an object with the following properties:
   * commandName (string) - The unique string that identifies the command.
   * func (function) - Reference to a function that is invoked by the command.
   * ignoreCurrent (boolean) - When true, the function does not need to 
   know the current value. The invoke() args will have its 'value' property set to null.
   For example, the command "Today" doesn't need to read the current value.
   * ignoreError (boolean) - When true and the function uses the current value,
   it will still be called even if the current value could not be determined due to an error.
   When null or false, the function is not called if the current value cannot be determined.
   
   You can add other properties to this object which are used by your function
   by looking at its args.settings property.

   A custom command's function can be located on the TypeManager's own
   prototype or elsewhere. When its called, the value of 'this' is the TypeManager instance.

      args (object) - see above
      replace (boolean) - When true, search for the same named command already here and replace it.
         When false (or null), your command will be appended. If it is a duplicate,
         it will effectively be ignored by the invoke() command.

   */
   installCmd: function ( args, replace ) {
      var intnl = this._internal;
      var cmds = intnl.cmds;
      if (!cmds) {
         intnl.cmds = cmds = [];
         intnl.needsCmds = true; // don't call initCmds here because this is often called from within initCmds.
      }
      if (!args.func)
         this._error("args.func not assigned.");
      if (replace) {
         for (var i = 0; i < cmds.length; i++) {
            if (cmds[i].commandName == args.commandName) {
               cmds[i] = args;
               return;
            }
         }
      }
      cmds.push(args);  // does not check for duplicate names
   },

   /* 
   Allows a command to set an explicit value.
   Only used by the page developer to add special values.
   Typically used to add dates.
      * commandName (string) - the command to add
      * value - The value that will be assigned to the textbox. The value must be the native type supported
          by the TypeManager. 
      * replace (boolean) - When true, search for the same named command already here and replace it.
         When false (or null), your command will be appended. If it is a duplicate,
         it will effectively be ignored by the invoke() command.
   */
   installValueCmd: function (commandname, value, replace) {
      this.installCmd({commandName : commandname, func : this.setValueCmd, value : value, ignoreCurrent : true}, replace);
   },

/*
Access an existing command's arguments so you can modify
its supporting properties, such as keepSec, roundBy, and nextMin
that are used by the addSeconds() function.
*/
   getCmd: function ( commandName ) {
      var intnl = this._internal;
      var cmds = intnl.cmds;
      if (!cmds) {
         intnl.cmds = cmds = [];
         this._initCmds();
      }
      else if (intnl.needsCmds) {
         this._initCmds();
         intnl.needsCmds = false;
      }

      for (var i = 0; i < cmds.length; i++) {
         if (cmds[i].commandName == commandName) {
            return cmds[i];
         }
      }
      return null;
   },



   /* 
   Called by the constructor when this script file is loaded.
   Subclasses should override this to call installCmd() for the command list.
   */
   _initCmds: function () {
      // does nothing in this class. Subclass to support it.
   },


   /* 
   Function to assign to the "Clear" command. It always sets the args.value to null
   and clears the connection's value.
   Subclasses still must attach this function using installCmd().
   */
   clearCmd: function (args) {
      args.value = null;
      return true;
   },
   

/*
Commands created by installValueCmd use this to assign the value
they've stored in the command's object.value property.
*/
   setValueCmd: function (args) {
      var cmds = this._internal.cmds;
      for (var i = 0; i < cmds.length; i++) {
         var obj = cmds[i];
         if (obj.commandName == args.commandName) {
            args.value = obj.value;
            return true;
         }
      }
      return false;
   },

/*
Utility to test if the value is inside the range established by minValue and maxValue.
It returns true if it is or the range does not apply.
*/
   _inRange : function(value) {
      var mv = this.getMinValue();
      if ((mv != null) && (this.compare(value, mv) < 0)) {
         return false;
      }
      mv = this.getMaxValue();
      if ((mv != null) && (this.compare(value, mv) > 0)) {
         return false;
      }
      return true;
   },

/*
Utility to ensure the value is within the range. If it in the range,
the value is returned. If it outside the range, the range limit is returned.
*/
   _adjustForRange : function(value) {
      var mv = this.getMinValue();
      if ((mv != null) && (this.compare(value, mv) < 0)) {
         return mv;
      }
      mv = this.getMaxValue();
      if ((mv != null) && (this.compare(value, mv) > 0)) {
         return mv;
      }
      return value;
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   minValue property: SET function
   Used when there are range limits with this being the lower limit.
   Used by some commands, especially those that decrement the value.
   The values must be the correct data type for the TypeManager.
   You can also set them with a culture neutral formatted string represented the value.
   */
   setMinValue: function (val)
   {
      this.config.minValue = (typeof val == "string") ? this.toValueNeutral(val) : this.toValue(val);
   },

   /*
   maxValue property: SET function
   Used when there are range limits with this being the upper limit.
   Used by some commands, especially those that increment the value.
   The values must be the correct data type for the TypeManager.
   You can also set them with a culture neutral formatted string represented the value.
   */
   setMaxValue: function (val)
   {
      this.config.maxValue = (typeof val == "string") ? this.toValueNeutral(val) : this.toValue(val);
   }

} 
jTAC.addMembers("TypeManagers.Base", jTAC_Temp);

/* ---- TypeManagers.BaseDatesAndTimes prototype extensions --------------- 
Built-in commands:
   * "NextDay", "PrevDay" - increase or decrease by one day. Will update month at the day borders
   * "NextMonth", "PrevMonth" - increase or decrease by one month. Will update year at the month borders
   * "NextYear", "PrevYear" - increase or decrease by one year
   * "NextSec", "PrevSec" - increases or decreases by one second.
   * "NextMin", "PrevMin" - increases or decreases by one minute.
   * "NextHr", "PrevHr" - increases or decreases by one hour.
   * "NextAtCaret", "PrevAtCaret" - increase or decrease the element located at the caret.
      There are three elements: year, month, and day in Date and hours, minutes, seconds in Time.
   * "Today" - Assign today's date
   * "Now" - Assign the current time of day.
   * "Clear" - Clear the value. Empty textbox.

NOTE: Date commands only work when the TypeManager supports dates. 
Time commands only work when when the Typemanager supports time.

Additional properties:
   blankStartsAt -
      When a command is based on the current value (such as increment/decrement commands)
      and the value is unassigned, this determines the starting value to assign.
      Here are the legal values:
      null or "" - Determines by these rules:
      If decrementing, use maxValue if assigned.
      If incrementing, use minValue if assigned.
      If it supports dates is used, today's date.
      If it supports time but not date, 0.
      "Now" - If it supports dates is used, today's date.
      If it supports time is used, the current time.
      Date object - This value is used directly.
      integer - Only if it supports time and the value is a number.

--------------------------------------------------------------------------*/

if (jTAC.isDefined("TypeManagers.BaseDatesAndTimes"))
{
jTAC_Temp =
{
   config: {
      blankStartsAt : null   // uses default rule
   },

   _initCmds: function () {
      if (this.supportsDates()) {
         this.installCmd({ commandName: "NextDay", func: this.addDays, days: 1 });
         this.installCmd({ commandName: "PrevDay", func: this.addDays, days: -1 });
         this.installCmd({ commandName: "NextMonth", func: this.addMonths, months: 1 });
         this.installCmd({ commandName: "PrevMonth", func: this.addMonths, months: -1 });
         this.installCmd({ commandName: "NextYear", func: this.addMonths, months: 12 });
         this.installCmd({ commandName: "PrevYear", func: this.addMonths, months: -12 });
         this.installCmd({ commandName: "Today", func: this.todayCmd, ignoreCurrent: true });
      }
      if (this.supportsTimes()) {
         this.installCmd({ commandName: "NextSeconds", func: this.addSeconds, seconds: 1, roundBy : 0 });
         this.installCmd({ commandName: "PrevSeconds", func: this.addSeconds, seconds: -1, roundBy : 0 });
         this.installCmd({ commandName: "NextMinutes", func: this.addSeconds, seconds: 60 });
         this.installCmd({ commandName: "PrevMinutes", func: this.addSeconds, seconds: -60 });
         this.installCmd({ commandName: "NextHours", func: this.addSeconds, seconds: 3600 });
         this.installCmd({ commandName: "PrevHours", func: this.addSeconds, seconds: -3600 });
         this.installCmd({ commandName: "Now", func: this.nowCmd, ignoreCurrent: true });
      }
      this.installCmd({ commandName: "Clear", func: this.clearCmd, ignoreCurrent: true });
   },

   /*
   For a command that increments or decrements by days.
   If args.settings.days is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.days is unassigned, it increments by one day.
   */
   addDays: function (args) {
      var adjust = args.settings.days || 1;

      var orig = args.value;
      var date = orig;
      if (!date) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, adjust > 0);
         args.value = this._adjustForRange(args.value);
         return true;
      }

      if (!this.getUseUTC()) {  // convert to UTC. UTC dates ignore daylight savings time and are always 24 hours.
         date = this.asUTCDate(date);
      }

      // 86,400,000 is number of millisecs in a day
      var ticks = date.valueOf() + (adjust * 86400000);

      var nDate = new Date(ticks); // UTC date. Convert to standard date
      if (!this.getUseUTC()) {
         nDate = this._asLocalDate(nDate);
      }
      nDate = this._adjustForRange(nDate);
      args.value = nDate;
      return nDate.valueOf() != orig.valueOf();
   },

   /*
   Adds or subtracts a number of months starting at args.value
   Returns a Date object.
   Corrects for date overflow into another month
   If args.settings.months is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.months is unassigned, it increments by one month.
   */
   addMonths: function (args) {
      var adjust = args.settings.months || 1;

      var orig = args.value;
      var date = orig;
      if (!date) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, adjust > 0);
         args.value = this._adjustForRange(args.value);
         return true;
      }

      if (!this.getUseUTC()) {
         date = this.asUTCDate(date);
      }
      var m = date.getUTCMonth(),
      y = date.getUTCFullYear(),
      d = date.getUTCDate(),
      nDate = null; // result

      if (adjust > 0) {
         m = m + adjust;
         y = y + Math.round((m / 12) - 0.5);
         m = m % 12;
      }
      else {
         // invert m to 11 - m
         m = 11 - m;
         m = m - adjust;   // double negative gives a positive
         y = y - Math.round((m / 12) - 0.5);
         m = 11 - (m % 12);  // re-invert
      }

      do {
         nDate = this.asUTCDate(y, m, d);
         d--;
      }
      while (nDate.getUTCMonth() != m);

      if (!this.getUseUTC()) {
         nDate = this._asLocalDate(nDate);
      }
      nDate = this._adjustForRange(nDate);
      args.value = nDate;
      return nDate.valueOf() != orig.valueOf();
   },

   _asLocalDate: function (date) {
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
   },


   /*
   Command that returns args.value assigned to today.
   */
   todayCmd: function (args) {
      var nDate = new Date(); // assigned to today in local time

      nDate = this.getUseUTC() ?
         this.asUTCDate(nDate.getFullYear(), nDate.getMonth(), nDate.getDate()) :
         new Date(nDate.getFullYear(), nDate.getMonth(), nDate.getDate(), 0, 0, 0);
      args.value = nDate;
      return true;
   },


   /*
   Call for commands that need an existing value to calculate the next value,
   such as those that increment and decrement.
   Call when args.value is null. This will use the blankStartsAt property
   to assign args.value.
   inc (boolean) - When true, the command is intended to increment.
   When false, decrement.
   */
   _adjustBlank: function (args, inc) {
      var bsa = this.getBlankStartsAt();
      var useD = this.supportsDates();
      var useT = this.supportsTimes();
      if (bsa === "Now") {
         if (useT) {
            this.nowCmd(args);
         }
         else {
            this.todayCmd(args);
         }
      }
      else if ((bsa instanceof Date) || (typeof (bsa) == "number")) {
         args.value = bsa;
      }
      else { // anything else uses a default rule
         var mv = inc ? this.getMinValue() : this.getMaxValue();
         if (mv != null) {
            args.value = mv;
         }
         else if (useT) {
            this.nowCmd(args);
         }
         else {
            this.todayCmd(args);
         }
      }
   },

   /*
   Adds or subtracts args.seconds from the current value.
   If it hits a min or max, it stops at the min/max value.
   If args.settings.seconds is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.seconds is unassigned, it increments by one second.

   args.settings properties:
   * keepSecs (boolean) - 
      Normally seconds are stripped when changing by minutes or higher.
      Set this to true to keep the seconds.
      Defaults to false.
   * nextMin (intnl) -
      When stripping seconds and decreasing, if the existing value's seconds
      is greater than nextMin, then add one minute.
      This allows 12:59:59 to go to 12:00:00 instead of 11:59:00 when decreasing by 1 hour.
      nextMin defaults to 58 if not assigned.
      If you don't want this feature set nextMin to null.
   * roundBy (intnl) -
      Round up or down to the next increment of this number,
      which is a time in seconds.
      Examples:
      If roundBy=60, it rounds to the next minute
      If roundBy=5 * 60, it rounds to the next 5 minutes
      Does nothing when null or 0. It defaults to null.

   If you need to have a fixed value for "now", assign the desired time
   to args.now.
   */
   addSeconds: function ( args ) {
      function round(val, inc) {
         var rb = set.roundBy;
         if (rb) {
            var isNum = typeof(val) == "number";
            if (!isNum) {
               val = that._dateToSeconds(val, isUTC);
            }
            var s = Math.floor(val % rb);
            if (s) {
               val = val - s + (inc ? rb : 0);
            }
            if (!isNum) {
               val = that._secondsToDate(val, isUTC);
            }
         }
         return val;
      }
      var s;   // holds seconds in various calculations
      var set = args.settings;

      if (set.roundBy === undefined) {
         set.roundBy = 60;
      }
      if (set.nextMin == undefined) {
         set.nextMin = 58;
      }

      var adjust = set.seconds || 1;
      var inc = adjust > 0;   // increase when true
      var isUTC = this.getUseUTC();
      var orig = args.value;
      var time = orig;
      var that = this;  // for use in round() because it changes this to the window object.
      if (time == null) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, inc);

         if (set.roundBy) {
            args.value = round(args.value, inc);
         }
         args.value = this._adjustForRange(args.value);

/*
         if (!set.keepSecs && (Math.abs(adjust) > 59)) // strip off seconds
            args.value.setSeconds(0);
*/
         return true;
      }

      // works on an integer representation of the number of seconds
      if (time instanceof Date) {  // convert to integer
         time = this._dateToSeconds(time, isUTC);
      }

      var ntime = time; 

      if (!inc && set.nextMin && set.roundBy && (set.roundBy < Math.abs(adjust))) {
      // if decrementing and the seconds are above nextMin,
      // round up to the next minute then adjust.
      // This allows 11:59:59 to be decremented to 11:59:00 (using -60 secs) and 11:00:00 (using -3600)
      // If this did not happen, 11:59:59 would become 11:58:00 (using -60) and 10:59:00 (using -3600)
         s = Math.floor(ntime % 60);
         if (set.nextMin < s) {
            ntime = ntime + (60 - s);
         }
      }


      // if the current time isn't rounded to this value, make that happen INSTEAD of the adjustment
      if (Math.floor(ntime % set.roundBy)) {
         ntime = round(time, inc);
      }
      else { // adjust normally
         ntime = round(ntime + adjust, inc);
      }

      if (ntime < 0) {
         ntime = 0;
      }
/*
      // round up to the next increment of roundBy (in seconds)
      // If roundBy=60, it rounds to the next minute
      // If roundBy=5 * 60, it rounds to the next 5 minutes
      var rb = set.roundBy;
      if (rb)
      {
         s = Math.floor(time % rb);
         if (s)
         {
            ntime = time - s + (inc ? rb : 0);
         }
         else
         {
            s = Math.floor(ntime % rb);
            if (s)
               ntime = ntime - s + (inc ? rb : 0);
         }
      }
*/
/*
      if (!set.keepSecs && (Math.abs(adjust) > 59)) // strip off seconds
      {
         s = Math.floor(ntime % 60);
         if (s)
         {
            ntime = ntime - s;
            // if decreasing, jump to the next minute. 
            // This allows 11:59:59 to be decremented to 11:59:00 (using -60 secs) and 11:00:00 (using -3600)
            // If this did not happen, 11:59:59 would become 11:58:00 (using -60) and 10:59:00 (using -3600)
            var asc = set.nextMin;
            if (asc !== null) // null means do not use. Undefined means set the default
            {
               if (asc === undefined)
                  asc = 58;
               if (!inc && (s > asc))
                  ntime += 60;
            }
         }
      }
*/
      if (orig instanceof Date) { // convert ntime to date
         ntime = this._secondsToDate(ntime, isUTC);
/*
         if (ntime >= 24 * 3600)
            ntime = 24 * 3600 - 1;
         var h = Math.floor(ntime / 3600);
         var m = Math.floor((ntime % 3600) / 60);
         s = Math.floor(ntime % 60);

         ntime = new Date();  // establish today's date
         ntime.setHours(h, m, s, 0);
         if (this.getUseUTC())
            ntime = this.asUTCDate(ntime);
*/
      }

      var ntimeadj = this._adjustForRange(ntime);
      var comp = this.compare(ntime, ntimeadj);
      if (comp < 0) {
         ntime = round(ntimeadj, true);   // below rounds up
      }
      else if (comp > 0) {
         ntime = round(ntimeadj, false);  // above rounds down
      }

/*
      // if adjusted, see if seconds should be stripped
      if (!set.keepSecs && (Math.abs(adjust) > 59)) // strip off seconds
      {
         // unlike above, always rounds down.
         if (ntime instanceof Date)
            ntime.setSeconds(0); // possible that this will set the seconds below minvalue, but we'll live with that
         else
            ntime = ntime - Math.floor(ntime % 60);
      }
*/
      args.value = ntime;

      return this.compare(orig, ntime) != 0;
   },

   /*
   Command that returns args.value assigned to now.
   Override the value of "now" as the args.now property.
   */
   nowCmd: function ( args ) {
      if (args.now != null) {
         args.value = args.now;
         return true;
      }
      var nDate = new Date(); // assigned to today in local time

      if (this._nativeTypeName == "number") {
         nDate = this._dateToSeconds(nDate, false);
      }
      else {
         if (this.getUseUTC()) {
            nDate = this.asUTCDate(nDate);
         }
      }

      args.value = nDate;
      return true;
   },


   /* STATIC METHOD
   Converts a date object's hours, minutes and seconds to a total of seconds.
   time (Date object)
   isUTC (boolean) - When true, time holds a value in UTC time.
   */
   _dateToSeconds: function ( time, isUTC ) {
      if (isUTC) {
         return time.getUTCHours() * 3600 + time.getUTCMinutes() * 60 + time.getUTCSeconds();
      }
      return time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
   },

/* STATIC METHOD
   Convert a time, in seconds, into a Date object.
   The date part will reflect today's date.
      time (intnl) - Time in seconds.
      isUTC (boolean) - When true, time holds a value in UTC time.
   Returns a Date object.
*/
   _secondsToDate : function ( time, isUTC ) {
      if (time >= 24 * 3600) {
         time = 24 * 3600 - 1;
      }
      else if (time < 0) {
         time = 0;
      }
      
      var h = Math.floor(time / 3600);
      var m = Math.floor((time % 3600) / 60);
      var s = Math.floor(time % 60);

      time = new Date();  // establish today's date
      time.setHours(h, m, s, 0);
      if (isUTC) {
         time = jTAC.TypeManagers.Base.prototype.asUTCDate(time);
      }
      return time;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   /*
   minValue property: GET function
   When null and it supports time, this returns a value representing 12 AM
   either as a Date object or integer.
   */
   getMinValue: function () {
      if (this.config.minValue == null) {
         if (!this.supportsDates() && this.supportsTimes()) {
            if (this.nativeTypeName() == "number")
               return 0;
            var date = new Date();  // current time in local time
            date.setHours(0, 0, 0, 0);
            if (this.getUseUTC()) {
               date = this.asUTCDate(date);
            }
            return date;
         }
      }
      return this.config.minValue;
   },


   /*
   maxValue property: GET function
   When null and using time values, this returns a value representing 11:59:59PM 
   either as a Date object or integer. If a duration, it uses the getMaxHours()
   method to determine the final hour.
   */
   getMaxValue: function () {
      if (this.config.maxValue == null)
         if (!this.supportsDates() && this.supportsTimes()) {
            var mh = 23;
            if (this.getMaxHours && (this.getMaxHours() != null)) {
               mh = this.getMaxHours();
            }
            if (this.nativeTypeName() == "number") {
               return (mh + 1) * 3600 - 1;   // one second less than max hours + 1
            }
            var date = new Date();  // current time in local time
            if (mh > 23) {
               mh = 23;
            }
            date.setHours(mh, 59, 59, 0);
            if (this.getUseUTC()) {
               date = this.asUTCDate(date);
            }
            return date;
         }
      return this.config.maxValue;
   }

} 
jTAC.addMembers("TypeManagers.BaseDatesAndTimes", jTAC_Temp);

}  // if jTAC.isDefined("TypeManagers.BaseDatesAndTimes")

/* ---- TypeManagers.BaseNumber prototype extensions --------------- 
   * "NextBy1", "PrevBy1" - increases or decrease by 1
   * "NextBy10", "PrevBy10" - increases or decrease by 10
   * "NextBy100", "PrevBy100" - increases or decrease by 100
   * "NextBy1000", "PrevBy1000" - increases or decrease by 1000
   * "NextByPt1", "PrevByPt1" - increases or decrease by 0.1
   * "NextByPt01", "PrevByPt01" - increases or decrease by 0.01
   * "NextAtCaret", "PrevAtCaret" - increase or decrease the element located at the caret.
      The digit to the right of the caret is incremented/decremented
   * "Clear" - Clear the value. Empty textbox.
--------------------------------------------------------------------------*/

if (jTAC.isDefined("TypeManagers.BaseNumber"))
{
jTAC_Temp =
{

   _initCmds: function () {
      this.installCmd({ commandName: "PrevBy1", func: this.addBy, inc: -1 });
      this.installCmd({ commandName: "NextBy1", func: this.addBy, inc: 1 });
      this.installCmd({ commandName: "PrevBy10", func: this.addBy, inc: -10 });
      this.installCmd({ commandName: "NextBy10", func: this.addBy, inc: 10 });
      this.installCmd({ commandName: "PrevBy100", func: this.addBy, inc: -100 });
      this.installCmd({ commandName: "NextBy100", func: this.addBy, inc: 100 });
      this.installCmd({ commandName: "PrevBy1000", func: this.addBy, inc: -1000 });
      this.installCmd({ commandName: "NextBy1000", func: this.addBy, inc: 1000 });
      if (this.getMaxDecimalPlaces() != 0) { // its an integer type. Cannot use decimal places.
         this.installCmd({ commandName: "PrevByPt1", func: this.addBy, inc: -0.1 });
         this.installCmd({ commandName: "NextByPt1", func: this.addBy, inc: 0.1 });
         this.installCmd({ commandName: "PrevByPt01", func: this.addBy, inc: -0.01 });
         this.installCmd({ commandName: "NextByPt01", func: this.addBy, inc: 0.01 });
      }
      this.installCmd({ commandName: "Clear", func: this.clearCmd, ignoreCurrent: true });
   },

   /*
   For a command that increments or decrements by args.settings.inc.
   If args.settings.inc is assigned, that number is used to increment.
   It can be a positive or negative number.
   If args.settings.inc is unassigned, it increments by 1.
   */
   addBy: function ( args ) {
      var adjust = args.settings.inc || 1;

      var orig = args.value;
      var nval = orig;
      if (nval == null) {
         // if blank, assign the initial value when this command is first invoked.
         this._adjustBlank(args, adjust > 0);
         args.value = this._adjustForRange(args.value);
         return true;
      }


      if (this.numDecPlaces) {
      // clean up math errors with a little rounding.
      // Capture # of dec places in current value
         var vdp = this.numDecPlaces(adjust);  // adjust's decimal places
         var tdp = this.numDecPlaces(nval); // value's decimal places

         nval = this.round(nval + adjust, 0, Math.max(vdp, tdp));
      }
      else {
         nval = nval + adjust;
      }

      nval = this._adjustForRange(nval);
      args.value = nval;
      return nval != orig;
   },

   /*
   Call for commands that need an existing value to calculate the next value,
   such as those that increment and decrement.
   Call when args.value is null.
   inc (boolean) - When true, the command is intended to increment.
   When false, decrement.
   */
   _adjustBlank: function ( args, inc ) {
      var mv = inc ? this.getMinValue() : this.getMaxValue();
      args.value = (mv != null) ? mv : 0;
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/
   /*
   minValue property: GET function
   When null and allowNegatives = false, return 0.
   */
   getMinValue: function () {
      if (this.config.minValue == null) {
         if (!this.getAllowNegatives()) {
            return 0;
         }
      }
      return this.config.minValue;
   }

} 
jTAC.addMembers("TypeManagers.BaseNumber", jTAC_Temp);

}  // if jTAC.isDefined("TypeManagers.BaseNumber")

// jTAC/jquery-ui widgets/datatypeeditor-unobtrusive.js
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

Purpose:
Extension for jquery-ui-datatypeeditor to support unobtrusive setup.


Establishing this ui widget:
1. Add an input field of type="text". Assign the id and name properties to the same value.

2. Add this attribute to the input field:
  
   data-jtac-datatype - Specifies TypeManager class to use.
      Its value must match a class name or alias.
      Usually the actual class name is registered, along with shorthands like:
      "Integer", "Float", "Currency", "Date", and "TimeOfDay". (There are many more.)

   <input type="text" id="id" name="name" data-jtac-datatype="Float" />

3. When using date or time TypeManagers, consider using a more powerful parser.
   The default parsers handle limited cases and are not very flexible with 
   the variety of user inputs that come to it.
   Use the TypeManagers.PowerDateParser and TypeManagers.PowerTimeParser classes
   to have a much richer data entry experience just by adding <script > tags
   to their script files:
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerDateParser.js' ></script>
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerTimeParser.js' ></script>

4. A TypeManager object has numerous properties to customize it. For example,
   TypeManagers.Date has a [dateFormat] property to adjust the format between short, abbrev and full.
   If you need to set any of these properties, add this attribute to the input field:
   
   data-jtac-typeManager - Specifies an object (JSon format recommended)
      whose properties override the defaults on the TypeManager created by data-jtac-datatype.

   TypeManagers have many useful properties. Here are some of the most useful:
   * cultureName (string) - sets the culture for formatting and parsing.
   * minValue and maxValue - When \jTAC\jquery-ui widgets\Command extensions.js are supported,
      these properties are available to define the limits of values commands can reach.
      When specified as strings, these must use the culture neutral format based on the datatype.
   * dateFormat and timeFormat - On date and time to adjust the parsing and formatting patterns.
   See the \jTAC\TypeManagers\ folder for details on individual classes.

   <input type="text" id="id" name="name" data-jtac-datatype="Float" 
      data-jtac-typeManager="{'cultureName': 'en-US', 'allowNegatives': false}" />

5. Add the script file \jTAC\jquery-ui widgets\datatypeeditor-unobtrusive.js in addition 
   to those listed below.

6. Add this attribute to the input field:
   
   data-jtac-datatypeeditor - Activates the datatypeeditor feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. Only
      specify to override a default.
      If no options are needed, use the empty string.

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="{'checkPastes' : false}" />
   <input type="text" id="id" name="name" data-jtac-datatype="Float"
      data-jtac-datatypeeditor="" />


6. You still have to deal with the server side code that gets and sets the value
  of this input. That can be tricky because that code needs to convert
  between strings and native values. To simplify this, you can 
  add hidden input whose id is the dataTypeEditor's id + "_neutral".
  Use the value attribute of this hidden field to get and set the value.
  ALWAYS work with a string in the culture neutral format of the type.
  Formats include:
      Integers: [-]digits
      Float, Currency, Percent: [-]digits.digits  (always has at least one decimal place)
      Date: yyyy-MM-dd
      TimeOfDay and Duration: H:mm:ss
      DateTime: yyyy-MM-dd H:mm:ss
      DayMonth: MM-dd
      MonthYear: yyyy-MM

   <input type="text" id="id" name="name" data-jtac-datatype="Date"
      data-jtac-datatypeeditor="" />
   <input type="hidden" id="id_neutral" name="id_neutral" value="2000-05-31" />



Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js
jquery-ui widgets\datatypeeditor.js

------------------------------------------------------------*/

(function ($){
   function applyOne(idx, element)
   {
      element = $(element);
      var options = element.data("jtac-datatypeeditor");
      if (options != null)
      {
         element.data("datatypeeditor", null);
         try
         {
            if (options)
            {
               options = window.eval("(" + options +");");
               element.dataTypeEditor(options);
            }
            else
               element.dataTypeEditor();
         }
         catch (e)
         {
            jTAC.error("Could not parse the data-jtac-datatypeeditor attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply()
   {
      try
      {
         jTAC._internal.pushContext("datatypeeditor-unobtrusive.apply()");

         var elements = $("input[type=text]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (!window.jTAC_DataTypeEditorOptions)
      jTAC.error("Requires the datatypeeditor scripts.");

   $(document).ready(apply);

})(jQuery);
// jTAC/jquery-ui widgets/datetextbox-unobtrusive.js
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

Purpose:
Extension for datetextbox to support unobtrusive setup.


Establishing this ui widget
==============================
1. Add an input field of type="text". Assign the id and name properties to the same value.

   <input type="text" id="id" name="name" />

2. Add this attribute to the input field:

   data-jtac-datatype - Specifies TypeManager class to use. 
      Its value must be a class name or alias to a TypeManager class.
      Here are the recommended values:
         "Date" - Uses TypeManagers.Date in its default settings.
         "Date.Short" - Uses TypeManagers.Date in Short date format
         "Date.Abbrev" - Uses TypeManagers.Date in Abbreviated date format (dateFormat = 10)
         "Date.Long" - Uses TypeManagers.Date in Long date format (dateFormat = 20)

      You can create other names and register them with jTAC.define() or jTAC.defineAlias(), 
      so long as their TypeManager.getDataTypeName() == "date".

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev" />

3. Consider using a more powerful parser.
   The default parser handles only the short date pattern and is not very flexible with 
   the variety of user inputs that come to it.
   Use the TypeManagers.PowerDateParser class to have a much richer data entry 
   experience just by adding <script> tags to its script file:
   <script type='javascript/text' src='../jTAC/TypeManagers/PowerDateParser.js' ></script>


4. A TypeManager object has numerous properties to customize it. For example,
   TypeManagers.Date has a DateFormat property to adjust the format between short, abbrev and full.
   If you need to set any of these properties, add this attribute to the input field:

   data-jtac-typeManager - Specifies an object (JSon format recommended)
      whose properties override the defaults on the TypeManager created by data-jtac-datatype.

   TypeManagers have many useful properties. Here are some of the most useful:
   * cultureName (string) - sets the culture for formatting and parsing.
   * minValue and maxValue - When \jTAC\jquery-ui widgets\command extensions.js are supported,
      these properties are available to define the limits of values commands can reach.
      When specified as strings, these must use the culture neutral format of "yyyy-MM-dd".
   See the \jTAC\TypeManagers\ folder for details on individual classes.

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev" 
      data-jtac-typeManager="{'cultureName' : 'en-US', 'minValue' : "2012-01-01"}" />

5. Add the script file \jTAC\jquery-ui widgets\datetextbox-unobtrusive.js in addition 
   to those listed below.

6. Add this attribute to the input field:
   
   data-jtac-datetextbox - Activates the datetextbox feature.
      This string specifies an object (JSon format recommended)
      with properties reflecting the options shown below. Only
      specify to override a default.
      If no options are needed, use the empty string.

   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datetextbox="{'datepicker': { 'gotoCurrent' : true } }" />
   <input type="text" id="id" name="name" data-jtac-datatype="Date.Abbrev"
      data-jtac-datatextbox="" />

Required libraries:
jquery.#.#.#.js
jquery-ui-#.#.#.js
jTAC.js
TypeManagers\Base.js and any TypeManager that you will use
Connections\Base.js
Connections\BaseElement.js
Connections\FormElement.js
jquery-ui widgets\datatypeeditor.js
jquery-ui widgets\datetextbox.js

------------------------------------------------------------*/

(function ($)
{
   function applyOne(idx, element) {
      element = $(element);
      var options = element.data("jtac-datetextbox");
      if (options != null) {
         element.data("datetextbox", null);
         try {
            if (options) {
               options = window.eval("(" + options + ");");
               element.dateTextBox(options);
            }
            else {
               element.dateTextBox();
            }
         }
         catch (e) {
            jTAC.error("Could not parse the data-jtac-datetextbox attribute of id [" + element.get()[0].id + "] Error info:" + e.toString());
         }
      }
   }

   function apply() {
      try
      {
         jTAC._internal.pushContext("datetextbox-unobtrusive.apply()");

         var elements = $("input[type=text]");
         elements.each(applyOne);
      }
      finally {
         jTAC._internal.popContext();
      }

   } // apply fnc

   if (jTAC.TypeManagers.BaseDate)
   {
      if (!window.jTAC_DataTypeEditorOptions)
         jTAC.error("Requires the datatypeeditor scripts.");

      $(document).ready(apply);
   }
})(jQuery);
