jQuery.noConflict();
jQuery(document).ready(function() {
  jQuery("table.vce-options").hide();
  jQuery("table.vce-factors").hide();

  jQuery.ajax({
      url: 'https://raw.github.com/ideaoforder/jquery-values-clarification/master/vce.js',
      crossDomain: true,
      dataType: "script",
      success: function () {

        var factor_content = '<div id="factors"><h3>what matters to me</h3><div id="slider-endpoints"><div id="left-endpoint">doesn\'t matter at all</div><div id="right-endpoint">matters a lot</div></div><ul></ul></div>';
        jQuery("table.vce-factors").after(factor_content);

        var option_content = '<div id="treatment-side"><h3>what\'s best for me</h3><div id="treatments" class="boxcolor"><ul></ul><br clear="left" /></div></div>';
        jQuery("table.vce-options").after(option_content);

        // Turn factors table into sliders!
        var option_headings = Array();
        jQuery("table.vce-options thead tr th").each(function(i, v){
          var txt = jQuery(this).text().toLowerCase();
          option_headings[i] = txt;
        })

        var option_data = Array();
        var multipliers = Array();
        var mindex = 0;
        jQuery("table.vce-options tbody tr").each(function(i, v){
          option_data[i] = Array();
          jQuery(this).children('td').each(function(ii, vv){
            option_data[i][option_headings[ii]] = jQuery(this).text();
            if (option_headings[ii] == 'label') {
              multipliers[mindex] = jQuery(this).text();
              mindex++;
            }
          }); 
        })

        for (var i = 0; i < option_data.length; i++) { 

          var content = '<li id="' + option_data[i]['label'] + '">';
          content += '<div class="recommendation">best choice for you</div>';
          content += '<div class="box-container"><div class="box" style="background-color: ' + option_data[i]['color'] + ';">&nbsp</div></div>';
          content += '<div class="info"><h4>' + option_data[i]['name'] + '</h4></div>';
          content += '</li>';
          jQuery('#treatments ul').append(content);
        }

        // Turn factors table into sliders!
        var header = Array();
        jQuery("table.vce-factors thead tr th").each(function(i, v){
          var txt = jQuery(this).text().toLowerCase();
          header[i] = txt;
        })


        var data = Array();

        jQuery("table.vce-factors tbody tr").each(function(i, v){
          data[i] = Array();
          jQuery(this).children('td').each(function(ii, vv){
            data[i][header[ii]] = jQuery(this).text();
          }); 
        })

        for (var i = 0; i < data.length; i++) { 
          var content = '<li>';
          content += '<input id="factor-' + data[i]['label'] + '" type="text" class="span4 slider" value="' + data[i]['value'] + '"';

          for (var j = 0; j < multipliers.length; j++) { 
            content += 'data-multiplier-' + multipliers[j] + '="' + data[i][multipliers[j]] + '"';
          }
          content += '/>';
          content+= '<div class="text well">' + data[i]['name'] + '</div>'
          content += '</li>';
          jQuery('#factors ul').append(content);
        }

        // jQuery("table.vce-options").hide();
        // jQuery("table.vce-factors").hide();


        // initialize slider vals
        jQuery('input.slider').each(function(){
          jQuery(this).attr('data-slider-value', jQuery(this).val());
        });

        function update_treatments(){
          jQuery('#treatments ul li').each(function(){
            var tx_num = 0;
            var tx_name = jQuery(this).attr('id');
            jQuery('input.slider').each(function(){
              var out = Number(jQuery(this).data('multiplier-' + tx_name));
              tx_num += (out * jQuery(this).val());
            });
            jQuery('#' + tx_name + ' div.box').height(tx_num);
          });  
        }

        update_treatments();

        jQuery('input.slider').slider({
          min: 0,
          max: 100,
          step: 1,
          tooltip: 'hide', // show
          orientation: 'horizontal', // vertical
          selection: 'before' // after, none
        }).on('slide', function(ev){
           // Set the input value
          jQuery(ev.target).attr('value', jQuery(this).val());
          update_treatments();       
        }).on('slideStop', function(ev){
          // Do we need to do much on stop?
          var id = jQuery(ev.target).attr('id');
          if (typeof Qualtrics === 'undefined') {
              // variable is undefined
          } else {
            // Set associated embedded data
            var val = jQuery(this).val();
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


    },
    error: function () {
        
    }
  });

});
