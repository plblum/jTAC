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

var jTAC_Temp; // used as a placeholder for creating member objects passed into addMembers() and define()