/* =========================================================
 * bootstrap-slider.js v2.0.0
 * http://www.eyecon.ro/bootstrap-slider
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */
 
!function( $ ) {

  var Slider = function(element, options) {
    this.element = $(element);
    this.picker = $('<div class="slider">'+
              '<div class="slider-track">'+
                '<div class="slider-selection"></div>'+
                '<div class="slider-handle"></div>'+
                '<div class="slider-handle"></div>'+
              '</div>'+
              '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'+
            '</div>')
              .insertBefore(this.element)
              .append(this.element);
    this.id = this.element.data('slider-id')||options.id;
    if (this.id) {
      this.picker[0].id = this.id;
    }

    if (typeof Modernizr !== 'undefined' && Modernizr.touch) {
      this.touchCapable = true;
    }

    var tooltip = this.element.data('slider-tooltip')||options.tooltip;

    this.tooltip = this.picker.find('.tooltip');
    this.tooltipInner = this.tooltip.find('div.tooltip-inner');

    this.orientation = this.element.data('slider-orientation')||options.orientation;
    switch(this.orientation) {
      case 'vertical':
        this.picker.addClass('slider-vertical');
        this.stylePos = 'top';
        this.mousePos = 'pageY';
        this.sizePos = 'offsetHeight';
        this.tooltip.addClass('right')[0].style.left = '100%';
        break;
      default:
        this.picker
          .addClass('slider-horizontal')
          .css('width', '100%');
          // .css('width', this.element.outerWidth());
        this.orientation = 'horizontal';
        this.stylePos = 'left';
        this.mousePos = 'pageX';
        this.sizePos = 'offsetWidth';
        this.tooltip.addClass('top')[0].style.top = -this.tooltip.outerHeight() - 14 + 'px';
        break;
    }

    this.min = this.element.data('slider-min')||options.min;
    this.max = this.element.data('slider-max')||options.max;
    this.step = this.element.data('slider-step')||options.step;
    this.value = this.element.data('slider-value')||options.value;
    if (this.value[1]) {
      this.range = true;
    }

    this.selection = this.element.data('slider-selection')||options.selection;
    this.selectionEl = this.picker.find('.slider-selection');
    if (this.selection === 'none') {
      this.selectionEl.addClass('hide');
    }
    this.selectionElStyle = this.selectionEl[0].style;


    this.handle1 = this.picker.find('.slider-handle:first');
    this.handle1Stype = this.handle1[0].style;
    this.handle2 = this.picker.find('.slider-handle:last');
    this.handle2Stype = this.handle2[0].style;

    var handle = this.element.data('slider-handle')||options.handle;
    switch(handle) {
      case 'round':
        this.handle1.addClass('round');
        this.handle2.addClass('round');
        break
      case 'triangle':
        this.handle1.addClass('triangle');
        this.handle2.addClass('triangle');
        break
    }

    if (this.range) {
      this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
      this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
    } else {
      this.value = [ Math.max(this.min, Math.min(this.max, this.value))];
      this.handle2.addClass('hide');
      if (this.selection == 'after') {
        this.value[1] = this.max;
      } else {
        this.value[1] = this.min;
      }
    }
    this.diff = this.max - this.min;
    this.percentage = [
      (this.value[0]-this.min)*100/this.diff,
      (this.value[1]-this.min)*100/this.diff,
      this.step*100/this.diff
    ];

    this.offset = this.picker.offset();
    this.size = this.picker[0][this.sizePos];

    this.formater = options.formater;

    this.layout();

    if (this.touchCapable) {
      // Touch: Bind touch events:
      this.picker.on({
        touchstart: $.proxy(this.mousedown, this)
      });
    } else {
      this.picker.on({
        mousedown: $.proxy(this.mousedown, this)
      });
    }

    if (tooltip === 'show') {
      this.picker.on({
        mouseenter: $.proxy(this.showTooltip, this),
        mouseleave: $.proxy(this.hideTooltip, this)
      });
    } else {
      this.tooltip.addClass('hide');
    }
  };

  Slider.prototype = {
    constructor: Slider,

    over: false,
    inDrag: false,
    
    showTooltip: function(){
      this.tooltip.addClass('in');
      //var left = Math.round(this.percent*this.width);
      //this.tooltip.css('left', left - this.tooltip.outerWidth()/2);
      this.over = true;
    },
    
    hideTooltip: function(){
      if (this.inDrag === false) {
        this.tooltip.removeClass('in');
      }
      this.over = false;
    },

    layout: function(){
      this.handle1Stype[this.stylePos] = this.percentage[0]+'%';
      this.handle2Stype[this.stylePos] = this.percentage[1]+'%';
      if (this.orientation == 'vertical') {
        this.selectionElStyle.top = Math.min(this.percentage[0], this.percentage[1]) +'%';
        this.selectionElStyle.height = Math.abs(this.percentage[0] - this.percentage[1]) +'%';
      } else {
        this.selectionElStyle.left = Math.min(this.percentage[0], this.percentage[1]) +'%';
        this.selectionElStyle.width = Math.abs(this.percentage[0] - this.percentage[1]) +'%';
      }
      if (this.range) {
        this.tooltipInner.text(
          this.formater(this.value[0]) + 
          ' : ' + 
          this.formater(this.value[1])
        );
        this.tooltip[0].style[this.stylePos] = this.size * (this.percentage[0] + (this.percentage[1] - this.percentage[0])/2)/100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight()/2 : this.tooltip.outerWidth()/2) +'px';
      } else {
        this.tooltipInner.text(
          this.formater(this.value[0])
        );
        this.tooltip[0].style[this.stylePos] = this.size * this.percentage[0]/100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight()/2 : this.tooltip.outerWidth()/2) +'px';
      }
    },

    mousedown: function(ev) {

      // Touch: Get the original event:
      if (this.touchCapable && ev.type === 'touchstart') {
        ev = ev.originalEvent;
      }

      this.offset = this.picker.offset();
      this.size = this.picker[0][this.sizePos];

      var percentage = this.getPercentage(ev);

      if (this.range) {
        var diff1 = Math.abs(this.percentage[0] - percentage);
        var diff2 = Math.abs(this.percentage[1] - percentage);
        this.dragged = (diff1 < diff2) ? 0 : 1;
      } else {
        this.dragged = 0;
      }

      this.percentage[this.dragged] = percentage;
      this.layout();

      if (this.touchCapable) {
        // Touch: Bind touch events:
        $(document).on({
          touchmove: $.proxy(this.mousemove, this),
          touchend: $.proxy(this.mouseup, this)
        });
      } else {
        $(document).on({
          mousemove: $.proxy(this.mousemove, this),
          mouseup: $.proxy(this.mouseup, this)
        });
      }

      this.inDrag = true;
      var val = this.calculateValue();
      this.element.trigger({
          type: 'slideStart',
          value: val
        }).trigger({
          type: 'slide',
          value: val
        });
      return false;
    },

    mousemove: function(ev) {
      // Touch: Get the original event:
      if (this.touchCapable && ev.type === 'touchmove') {
        ev = ev.originalEvent;
      }

      var percentage = this.getPercentage(ev);
      if (this.range) {
        if (this.dragged === 0 && this.percentage[1] < percentage) {
          this.percentage[0] = this.percentage[1];
          this.dragged = 1;
        } else if (this.dragged === 1 && this.percentage[0] > percentage) {
          this.percentage[1] = this.percentage[0];
          this.dragged = 0;
        }
      }
      this.percentage[this.dragged] = percentage;
      this.layout();
      var val = this.calculateValue();
      this.element
        .trigger({
          type: 'slide',
          value: val
        })
        .data('value', val)
        .prop('value', val);
      return false;
    },

    mouseup: function(ev) {
      if (this.touchCapable) {
        // Touch: Bind touch events:
        $(document).off({
          touchmove: this.mousemove,
          touchend: this.mouseup
        });
      } else {
        $(document).off({
          mousemove: this.mousemove,
          mouseup: this.mouseup
        });
      }

      this.inDrag = false;
      if (this.over == false) {
        this.hideTooltip();
      }
      this.element;
      var val = this.calculateValue();
      this.element
        .trigger({
          type: 'slideStop',
          value: val
        })
        .data('value', val)
        .prop('value', val);
      return false;
    },

    calculateValue: function() {
      var val;
      if (this.range) {
        val = [
          (this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step),
          (this.min + Math.round((this.diff * this.percentage[1]/100)/this.step)*this.step)
        ];
        this.value = val;
      } else {
        val = (this.min + Math.round((this.diff * this.percentage[0]/100)/this.step)*this.step);
        this.value = [val, this.value[1]];
      }
      return val;
    },

    getPercentage: function(ev) {
      if (this.touchCapable) {
        ev = ev.touches[0];
      }
      var percentage = (ev[this.mousePos] - this.offset[this.stylePos])*100/this.size;
      percentage = Math.round(percentage/this.percentage[2])*this.percentage[2];
      return Math.max(0, Math.min(100, percentage));
    },

    getValue: function() {
      if (this.range) {
        return this.value;
      }
      return this.value[0];
    },

    setValue: function(val) {
      this.value = val;

      if (this.range) {
        this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
        this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
      } else {
        this.value = [ Math.max(this.min, Math.min(this.max, this.value))];
        this.handle2.addClass('hide');
        if (this.selection == 'after') {
          this.value[1] = this.max;
        } else {
          this.value[1] = this.min;
        }
      }
      this.diff = this.max - this.min;
      this.percentage = [
        (this.value[0]-this.min)*100/this.diff,
        (this.value[1]-this.min)*100/this.diff,
        this.step*100/this.diff
      ];
      this.layout();
    }
  };

  $.fn.slider = function ( option, val ) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data('slider'),
        options = typeof option === 'object' && option;
      if (!data)  {
        $this.data('slider', (data = new Slider(this, $.extend({}, $.fn.slider.defaults,options))));
      }
      if (typeof option == 'string') {
        data[option](val);
      }
    })
  };

  $.fn.slider.defaults = {
    min: 0,
    max: 10,
    step: 1,
    orientation: 'horizontal',
    value: 5,
    selection: 'before',
    tooltip: 'show',
    handle: 'round',
    formater: function(value) {
      return value;
    }
  };

  $.fn.slider.Constructor = Slider;

}( window.jQuery );


/* =========================================================
 * vce.js v2.0.0
 * http://ideaoforder.github.io/jquery-values-clarification/
 * =========================================================
 * Copyright 2013 Mark Dickson
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

jQuery.noConflict();
jQuery(document).ready(function() {
  jQuery("table.vce-options").hide();
  jQuery("table.vce-factors").hide();

  // Turn factors table into sliders!
  var option_headings = Array();
  jQuery("table.vce-options thead tr th").each(function(i, v){
    var txt = jQuery(this).text().toLowerCase();
    option_headings[i] = txt;
  })

  var option_data = Array();
  var multipliers = Array();
  var mindex = 0;
  var num_options = 0;
  jQuery("table.vce-options tbody tr").each(function(i, v){
    num_options++;
    option_data[i] = Array();
    jQuery(this).children('td').each(function(ii, vv){
      option_data[i][option_headings[ii]] = jQuery(this).text();
      if (option_headings[ii] == 'label') {
        multipliers[mindex] = jQuery(this).text();
        mindex++;
      }
    }); 
  })

  var owidth = (num_options + 1) * 10;
  var fwidth = 100 - owidth - 5;

  var option_content = '<div id="option-side" style="margin-left: 5%; float: right; width: ' + owidth + '%;"><h3>what\'s best for me</h3><div id="options" class="boxcolor"><ul></ul><br clear="left" /></div></div>';
  jQuery("table.vce-options").after(option_content);   

  var factor_content = '<div id="factors" style="width: ' + fwidth + '%;"><h3>what matters to me</h3><div id="slider-endpoints"><div id="right-endpoint"><span class="label">matters a lot</span></div><div id="left-endpoint"><span class="label">doesn\'t matter at all</span></div></div><ul></ul></div>';
  jQuery("table.vce-factors").after(factor_content); 

  for (var i = 0; i < option_data.length; i++) { 

    var content = '<li id="' + option_data[i]['label'] + '">';
    content += '<div class="recommendation">best choice for you</div>';
    content += '<div class="box-container"><div class="box" style="background-color: ' + option_data[i]['color'] + ';">&nbsp</div></div>';
    content += '<div class="info"><h4>' + option_data[i]['name'] + '</h4></div>';
    content += '</li>';
    jQuery('#options ul').append(content);
  }

  // Turn factors table into sliders!
  var header = Array();
  jQuery("table.vce-factors thead tr th").each(function(i, v){
    var txt = jQuery(this).text().toLowerCase();
    header[i] = txt;
  })


  var data = Array();

  var constrained = (jQuery('table.vce-factors').hasClass('vce-constrained') && jQuery('table.vce-factors tbody tr').length == 2);
  var tooltip = jQuery('table.vce-factors').hasClass('vce-tooltip');

  jQuery("table.vce-factors tbody tr").each(function(i, v){
    data[i] = Array();
    jQuery(this).children('td').each(function(ii, vv){
      data[i][header[ii]] = jQuery(this).text();
    }); 
  })

  for (var i = 0; i < data.length; i++) { 
    var content = '<li>';
    var val;

    // Make sure values total 100 for constrained
    if (constrained && i > 0) {
      val = 100 - data[0]['value'];
    } else {
      val = data[i]['value'];
    }
    var w = Math.round(jQuery('div#factors').width() - 40);
    content += '<input style="width: ' + w + 'px;" id="factor-' + data[i]['label'] + '" type="text" class="span4 slider" value="' + val + '"';

    // Set multipliers
    for (var j = 0; j < multipliers.length; j++) { 
      content += 'data-multiplier-' + multipliers[j] + '="' + data[i][multipliers[j]] + '"';
    }

    // Check for constrained
    if (constrained) { content += ' data-constrained=true'; }

    // Check for tooltip
    // Options are show/hide
    if (tooltip) {
      content += ' data-slider-tooltip="show"';
    } else {
      content += ' data-slider-tooltip="hide"';
    }

    content += ' />';
    content+= '<div class="text well">' + data[i]['name'] + '</div>'
    content += '</li>';
    jQuery('#factors ul').append(content);
  }

  // initialize slider vals
  jQuery('input.slider').each(function(){
    jQuery(this).attr('data-slider-value', jQuery(this).val());
  });

  (function( $ ){
     $.fn.set_option_vals = function() {
      jQuery(this).find('ul li').each(function(){
        var tx_num = 0;
        var tx_name = jQuery(this).attr('id');
        jQuery('input.slider').each(function(){
          var out = Number(jQuery(this).data('multiplier-' + tx_name));
          var o_val = jQuery(this).data('slider').getValue();
          tx_num += (out * o_val);      
        });
        jQuery('#' + tx_name + ' div.box').height(tx_num);
      }); 
     }; 
  })( jQuery );



  jQuery('input.slider').slider({
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal', // vertical
    selection: 'before' // after, none
  }).on('slide', function(ev){
    // Set the input value
    var this_val = jQuery(ev.target).data('slider').getValue();
    jQuery(ev.target).attr('value', this_val);

    // If constrained, move the other slider too
    if (jQuery(ev.target).data('constrained') == 'true' || jQuery(ev.target).data('constrained') === true) {
      var this_id = jQuery(ev.target).attr('id');
      var other_slider = jQuery("input.slider:not(#" + this_id + ")");
      var other_val = 100 - this_val;
      other_slider.slider('setValue', other_val);
    }

    jQuery('#options').set_option_vals();

  }).on('slideStop', function(ev){
    // Do we need to do much on stop?
    var id = jQuery(ev.target).attr('id');
    if (typeof Qualtrics === 'undefined') {
        // variable is undefined
    } else {
      // Set associated embedded data
      var val = jQuery(ev.target).data('slider').getValue();
      Qualtrics.SurveyEngine.setEmbeddedData(id, val);

      // And set the data string
      var strdata = id.replace('factor', 'strdata');
      var ts = Math.round(new Date().getTime() / 1000);
      var cur_data = Qualtrics.SurveyEngine.getEmbeddedData(strdata);
      if (cur_data === undefined) {
        var data = val + ':' + ts;
      } else {
        var data = cur_data + ';' + val + ':' + ts;
      }
      Qualtrics.SurveyEngine.setEmbeddedData(strdata, data);
    }
  });

  jQuery('#options').set_option_vals();

});
