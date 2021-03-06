﻿// jTAC/Conditions/[ClassName].js
/* -----------------------------------------------------------
Javascript Types and Conditions ("jTAC") 
Copyright (c) 2012 Peter L. Blum, www.peterblum.com.
Available under the MIT License model as shown here:

Available under the MIT License model as shown here:

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

-------------------------------------------------------------
Module: Condition objects
Class : Conditions.[ClassName]
Extends: Conditions.[BaseClass]

Purpose:

See \jTAC\Conditions\Base.js for an overview of Conditions.

Properties introduced by this class:

Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Conditions.Base
Connections.Base
Connections.BaseElement
Connections.FormElement
USUALLY LOAD \jTAC\TypeManagers\Base.js and other TypeManager classes

----------------------------------------------------------- */
jTAC._internal.temp._Conditions_[ClassName] = {
   extend: "Conditions.[BaseClass]",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   config: {
   },

   configrules: {
   },

   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

}
jTAC.define("Conditions.[ClassName]", jTAC._internal.temp._Conditions_[ClassName]);

