// jTAC/jquery-ui widgets/jqActions/Show.js
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
Module: jquery-ui widgets
Class : jqActions.Show
Extends: jqActions.Base

Purpose:
Action class to change the visibility of the elements.
It uses jquery's show() and hide() methods, offering properties
to optionally use these method's animation parameters.
It optionally can use alternative effect methods: slideDown()/slideUp()
or fadeIn()/fadeOut()

onsuccess: Shows a hidden element
onfailed: Hides a visible element
Set [reverse] to true to reverse these behaviors.

Use the [speed] and [callback] properties if you want to use
the animation capabilities built into $.show(speed, callback)
and $.hide(speed, callback).
Change the effect by setting the [effect] property to one of these:
* preserve" - changes the style attribute using visibility
  of "inherit" for show and "hidden" for hide.
  This retains the space consumed by the element
  whereas $.hide() uses style=display:none removing the element completely.
* "fade" - Uses $.fadeIn() and $.fadeOut().
* "slide" - Uses $.slideDown() and $.slideUp().
See http://docs.jquery.com/Effects for more.

Additional properties:
   effect (string) - 
      When "", it uses $.show()/$.hide() functions. This is the default.
      When "preserve", it changes the style attribute using visibility
         of "inherit" for show and "hidden" for hide.
         This retains the space consumed by the element
         whereas $.hide() uses style=display:none removing the element completely.
      When "fade", it uses $.fadeIn() and $.fadeOut().
      When "slide", it uses $.slideDown() and $.slideUp().
  
   speed ("slow", "fast" or integer) -
      When [effect] = "", passed to the speed parameter of the $.show() and $.hide() functions.
      Other effects require it as a parameter and if unassigned, it uses "slow".

   callback (function) - 
      Callback when any animation effect finishes. This is the callback parameter
      for any of the effect functions.
      Unlike the parameterless callback function offered by these jquery functions,
      you can have 1 parameter that will document the call to your callback.
      It is an object with these properties:
         * sender - the widget
         * elements - the jquery object defining all elements to which this function was applied.
         * success - when true, onsuccess() ran. When false, onfailed() ran.
  
Aliases:
"Show"
"Hide"
"FadeIn" - show using $.FadeIn()
"FadeOut" - show using $.FadeOut()
"SlideDown" - show using $.SlideDown()
"SlideUp" - show using $.SlideUp()

Required libraries:
ALWAYS LOAD jquery.#.#.#.js
ALWAYS LOAD jTAC.js BEFORE THIS FILE IS LOADED

------------------------------------------------------------*/

if (!window.jTAC)
   throw new Error("window.jTAC not created.");

jTAC._internal.temp.jqActions_Show = {
   extend: "jqActions.Base",

   constructor: function (propertyVals) {

   },

   config: {
      effect: "",
      speed: null,
      callback: null
   },

   configrules: {
      callback: jTAC.checkAsFunctionOrNull
   },

   /*
   Makes visible based on [effect] property rule.
   Uses _show(). Logic is separated out to allow subclasses
   to call _show() or _hide() from either onsuccess() or onfailed().
   */
   onsuccess: function (sender, elements) {
      this._show(sender, elements);
   },

   /*
   Makes visible based on [effect] property rule.
   */
   _show: function (sender, elements) {
      if (sender._inInit) {
         elements.show();
      }
      else {
         var cb = this.callback;
         var that = this;
         if (cb) {
            // creates a closure so the callback knows about sender, elements, 
            // success=false, and the action (represented by 'this')
            var success = false;
            cb = function () {
               that.callback.call(that, {sender: sender, elements: elements, success: true, action: that});
            }
         }

         switch (this.effect) {
            case "":
               if (this.speed == null)
                  elements.show();
               else
                  elements.show(this.speed, cb);
               break;
            case "preserve":
               elements.css("visibility", "inherit");
               if (cb) {
                  that.cb.call(that);
               }
               break;
            case "fade":
               elements.fadeIn(this._fixedSpeed(), cb);
               break;
            case "slide":
               elements.slideDown(this._fixedSpeed(), cb);
               break;
         }
      }
   },

   /*
   Makes invisible based on [effect] property rule.
   Uses _hide(). Logic is separated out to allow subclasses
   to call _show() or _hide() from either onsuccess() or onfailed().
   */
   onfailed: function (sender, elements) {
      this._hide(sender, elements);
   },


   /*
   Makes invisible based on [effect] property rule.
   */
   _hide: function (sender, elements) {
      if (sender._inInit) {
         elements.hide();
      }
      else {
         var cb = this.callback;
         var that = this;
         if (cb) {
            // creates a closure so the callback knows about sender, elements, 
            // success=false, and the action (represented by 'this')
            cb = function () {
               that.callback.call(that, {sender: sender, elements: elements, success: false, action: that});
            }
         }
         switch (this.effect) {
            case "":
               if (this.speed == null)
                  elements.hide();
               else
                  elements.hide(this.speed, cb);
               break;
            case "preserve":
               elements.css("visibility", "hidden");
               if (cb) {
                  that.cb.call(that);
               }
               break;
            case "fade":
               elements.fadeOut(this._fixedSpeed(), cb);
               break;
            case "slide":
               elements.slideUp(this._fixedSpeed(), cb);
               break;
         }
      }
   },



   /*
   Utility to determine the value of the speed property.
   If null, it returns "slow". Otherwise, it returns the speed property value.
   */
   _fixedSpeed: function () {
      return this.speed != null ? this.speed : "slow";
   },


   /* --- PROPERTY GETTER AND SETTER METHODS ---------------------------
   These members are GETTER and SETTER methods associated with properties
   of this class.
   Not all are defined here. Any that are defined in this.config
   can be setup by the autoGet and autoSet capability. If they are, they 
   will not appear here.
   ---------------------------------------------------------------------*/

   setSpeed: function (val) {
      if (typeof val == "string") {
         var allowed = ["", "slow", "fast"];
         if (allowed.indexOf(val) == -1)
            this._error("Illegal value [" + val + "].");
      }
      else if (typeof val != "number") {
         this._error("Illegal value [" + val + "].");
      }
      this._defaultSetter("speed", val);
   }
}
jTAC.define("jqActions.Show", jTAC._internal.temp.jqActions_Show);

jTAC.defineAlias("Show", "jqActions.Show");
jTAC.defineAlias("Hide", "jqActions.Show", { reverse: true });
jTAC.defineAlias("FadeIn", "jqActions.Show", { effect: "fade" });
jTAC.defineAlias("FadeOut", "jqActions.Show", { effect: "fade", reverse: true });
jTAC.defineAlias("SlideDown", "jqActions.Show", { effect: "slide" });
jTAC.defineAlias("SlideUp", "jqActions.Show", { effect: "Slide", reverse: true });
