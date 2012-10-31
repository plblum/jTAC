(function(b){if(b.validator.replaceTokens){return}var a={formatAndAdd:function(e,g){var f=this.defaultMessage(e,g.method),d=/\$?\{(\d+)\}/g;if(typeof f==="function"){f=f.call(this,g.parameters,e)}var c=b.validator.replaceTokens[g.method];if(!c){c=b.validator.defaultTokenReplacer}f=c.call(b.validator,f,e,g.parameters,b(e).val());this.errorList.push({message:f,element:e});this.errorMap[e.name]=f;this.submitted[e.name]=f},defaultTokenReplacer:function(e,c,h,g){var d=/\$?\{(\d+)\}/g;if(d.test(e)){e=b.validator.format(e.replace(d,"{$1}"),h)}if(g==null){g=""}e=this.tokenReplacer(e,"VALUE",g.toString());var f=this.elementLabel(c)||"*** Add the data-msglabel attribute to id "+c.id+". ***";e=this.tokenReplacer(e,"LABEL",f);return e},tokenReplacer:function(f,d,c){var e=new RegExp("\\{"+d+"\\}","ig");return f.replace(e,c.toString())},minMaxReplacer:function(f,d,c,e){if(d!=null){f=this.tokenReplacer(f,"MIN",d)}if(c!=null){f=this.tokenReplacer(f,"MAX",c)}if(e!=null){f=this.tokenReplacer(f,"LENGTH",e);if(typeof d!=="number"){d=0}if(typeof c!=="number"){c=99999999}var g=Math.max(e-c,d-e);f=this.tokenReplacer(f,"DIFF",g)}return f},elementLabel:function(d){if(!d){return null}var c=d.getAttribute("data-msglabel");if(c==null){var e=b("label[for='"+d.id+"'][generated!='true']");if(e){c=e.html();if(c){c=c.replace(/\<(.|\n)+?\>/ig,"");c=c.replace(/[^\dA-Za-z]+$/,"");c=c.replace(/^[^\dA-Za-z]+/,"");d.setAttribute("data-msglabel",c)}}}return c},replaceTokens:{minlength:function(d,c,f,e){d=b.validator.minMaxReplacer(d,f,null,e.length);return b.validator.defaultTokenReplacer(d,c,f,e)},maxlength:function(d,c,f,e){d=b.validator.minMaxReplacer(d,null,f,e.length);return b.validator.defaultTokenReplacer(d,c,f,e)},rangelength:function(d,c,f,e){d=b.validator.minMaxReplacer(d,f[0],f[1],e.length);return b.validator.defaultTokenReplacer(d,c,f,e)},min:function(d,c,f,e){d=b.validator.minMaxReplacer(d,f,null,null);return b.validator.defaultTokenReplacer(d,c,f,e)},max:function(d,c,f,e){d=b.validator.minMaxReplacer(d,null,f,null);return b.validator.defaultTokenReplacer(d,c,f,e)},range:function(d,c,f,e){d=b.validator.minMaxReplacer(d,f[0],f[1],null);return b.validator.defaultTokenReplacer(d,c,f,e)}}};b.extend(b.validator.prototype,a);b.extend(b.validator,a)}(jQuery));