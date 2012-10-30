// jTAC/Connections/MockFormElement.js
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
Class : Connections.MockFormElement
Extends: Connections.FormElement

Purpose:
FOR TESTING PURPOSES ONLY.
This class mocks up a connection to an HTML form element. 
It never actually uses DOM. Instead it creates a JavaScript object
that has properties to mimic those needed by Connections.FormElement 
and its ancestor.

When created, it is initially an <input type='text'> element.
Call its getElement() method and modify any of the properties to make it conform to what you want.

var inst = jTAC.create("Connections.MockFormElement");
var el = inst.getElement();
el.tagName = "SELECT";
el.id = "ListBox1";


Requires: 
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED
Connections.Base
Connections.BaseElement
Connections.FormElement

----------------------------------------------------------- */
jTAC._internal.temp._Connections_MockFormElement = {
   extend: "Connections.FormElement",

   constructor: function ( propertyVals ) {
      this.callParent( [propertyVals] );

   },

   getElement:  function (noneAllowed) {
      if (!this._internal.element) {
         this._internal.element = this._createElement("INPUT", "text");
      }
      return this._internal.element;
   },

   _createElement: function(tagName, type) {
      return {
            signature: "MOCK",
            id: "",
            value: "",
            tagName: tagName,
            type: type,
            disabled: false,
            checked: false,
            style: {visibility: "", display: ""},
            selectedIndex: -1,
            getAttribute: function(key) {
               return this._attributes[key] || null;
            },
            setAttribute: function(key, value) {
               this._attributes[key] = value;
            },
            _attributes : {"data-jtac-connection": "Connections.MockFormElement"},
            options: [
               {text:"1", value: "1", selected:false},
               {text:"2", value: "2", selected:false},
               {text:"3", value: "3", selected:true},
               {text:"4", value: "4", selected:true},
            ]

         }
   },

   addEventListener : function (name, func, funcid) {
      return true;
   },
   addSupportEventListeners : function (name, func, funcid) {
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
                  var el = this._createElement("INPUT", "check");
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
         return [this._createElement("INPUT", "radio"), this.createElement("INPUT", "radio"), this.createElement("INPUT", "radio"), this.createElement("INPUT", "radio")];
      }
      return null;
   },

   testElement: function(id) {
      if (typeof id == "object") {
         return id.signature && id.singature == "MOCK";
      }
      return false;
   }


}
jTAC.define("Connections.MockFormElement", jTAC._internal.temp._Connections_MockFormElement);
jTAC.connectionResolver.register("Connections.MockFormElement");