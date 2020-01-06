function make_slides(f) {
  var q_first = null;
  var slides = {};
  slides.i0 = slide({
    name : "i0",
    start: function() {
      exp.startT = Date.now();
    }
  });
   
  slides.rating = slide({
    name: "rating",
    present : _.shuffle(stimList),
    present_handle : function(stim) {
      // Set up scenario & instructions
      this.trial_start = Date.now();
      this.stim = stim;
      this.init_sliders();
      exp.sliderPost = {};
      console.log(stim);
      var contextsentence = "<strong>"+this.stim.text+"</strong>";
      var objimagehtml = '<center><img src="'+this.stim.object.contextURL+'" style="height:500px;"></center>';
      $("#contextsentence").html(contextsentence);
      $("#objectimage").html(objimagehtml);
      console.log(this);
      //$(".err1").hide();
    },

    init_sliders : function() {
      // Takes a callback for 'change' and a callback for 'mouseup'
      var that = this;
      utils.make_slider("#single_slider", function(event, ui) {
	exp.sliderPost = ui.value;
      }, function(event, ui) {
	if (exp.sliderPost > -1 && exp.sliderPost < 16) {
	  //$(".err").hide();
	  that.log_responses();
	  _stream.apply(that); //Use exp.go() if and only if there is no "present" data.
	} else {
	  //$(".err").show();
	}
      });
    },
    log_responses : function() {
      exp.data_trials.push({
        "label" : this.stim.text,
        "slideNumber": exp.phase,
        "response" : exp.sliderPost,
	"objectSet" : this.stim.objectSet,
	"referent" : this.stim.referent,
	"context" : this.stim.context,
	"rt" : Date.now() - _s.trial_start
      });
    },
  });
  
  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

jQuery.fn.shuffle = function () {
    var j;
    for (var i = 0; i < this.length; i++) {
        j = Math.floor(Math.random() * this.length);
        $(this[i]).before($(this[j]));
    }
    return this;
};  

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];
  exp.condition = {}; //can randomize between subject conditions here
  exp.system = {
    Browser : BrowserDetect.browser,
    OS : BrowserDetect.OS,
    screenH: screen.height,
    screenUH: exp.height,
    screenW: screen.width,
    screenUW: exp.width
  };
  
  //blocks of the experiment:
  // counterbalance 'questions first' vs. 'answers first'
  exp.structure=[ "i0", "rating", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
  //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {
	$("#mustaccept").show();
      });
      exp.go();
    }
  });

  exp.go(); //show first slide
}
