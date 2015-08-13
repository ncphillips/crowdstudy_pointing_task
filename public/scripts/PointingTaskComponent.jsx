if (typeof require !== 'undefined'){
  var CrowdExperiment = require('CrowdEperiment');
}

var BLOCKS = [
  { center_diameters: [40, ], target_diameters: [3, ] },
  { center_diameters: [40, ], target_diameters: [3, ] },
  { center_diameters: [40, ], target_diameters: [3, ] },
  { center_diameters: [40, ], target_diameters: [3, ] },
  { center_diameters: [40, ], target_diameters: [3, ] }
];

var NUM_BLOCKS = BLOCKS.length;

function getBlockUrl(id, i) {
  'use strict';
  if (i < NUM_BLOCKS) {
    var url = '/pointing_task/task?_id='+id+'&block=' + i;
    var block = BLOCKS[i];
    block.center_diameters.forEach(function (diameter, ci) {
      url += '&center_diameters[' + ci +']=' + diameter;
    });
    block.target_diameters.forEach(function (diameter, ti) {
      url += '&target_diameters[' + ti +']=' + diameter;
    });
    return url;
  }
  return '';
}

var PointingTaskComponent = React.createClass({
  render: function () {
    var style;
    var url = getBlockUrl(this.props.worker._id, this.state.block);
    if (this.state.view === 'introduction') {
      style = {width: 0 + "%"};
      return (
        <div>
          <div className="col-md-3"></div>
          <div className="col-md-6">
            <br/>
            <FullScreenButton fullscreen={this.state.fullscreen} />
            <br/>
            <div className="text-center">
              <p>You have completed 0 out of {this.props.num_blocks} rounds!</p>
            </div>
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={style}>
              </div>
            </div>
            <h1>Pointing Task</h1>
            <p>Your goal is to click the green target with the cross in it as quickly and as accurately as possible.</p>
            <p>Please do your best to click each target as fast as possible, without making any errors.</p>
            <p>Periodically you will receive feedback and be asked some questions. Please answer these accurately and truthfully as you can. Your answers will be verified before your bonus is awarded.</p>
            <p>Before starting, please press the full-screen button above.</p>
            <input type="button" className="btn btn-primary btn-block" value="Begin" onClick={this._startTask}/>
          </div>
          <div className="col-md-3"></div>
        </div>
      );
    }
    else if (this.state.view === 'task') {
      return (
        <div>
          <FullScreenButton fullscreen={this.state.fullscreen} callback={this.toggleFullScreen}></FullScreenButton>
          <iframe id="task-iframe" src={url} width={this.state.width} height={this.state.height}/>
        </div>
      );
    } else if (this.state.view === 'stats') {
      var percent_complete = ((this.state.block + 1) / this.props.num_blocks) * 100;
      style = {width: percent_complete + "%"};

      return (
        <div>
          <div className="col-md-3"></div>
          <div className="col-md-6">
            <br/>
            <FullScreenButton fullscreen={this.state.fullscreen}/>
            <br/>
            <div className="text-center">
              <p>You have completed {this.state.block + 1 } out of {this.props.num_blocks} rounds!</p>
            </div>
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={style}>
              </div>
            </div>
            <StatsView block={this.state.block} worker={this.props.worker} callback={this._onClickStats}/>
          </div>
          <div className="col-md-3"></div>
        </div>
      )
    }
  },
  getDefaultProps: function () {
    return {
      num_blocks: NUM_BLOCKS
    }
  },
  getInitialState: function () {
    return {
      fullscreen: false,
      height: window.innerHeight,
      width: window.innerWidth,
      block: 0,
      view: 'introduction'
    }
  },
  resetDimensions: function () {
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth
    });
  },
  componentDidMount: function () {
    window.onresize = this.resetDimensions;
    this.watchIframe();

    var screen_change_events = "webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange";
    var _this = this;
    $(document).on(screen_change_events, function () {
      _this.toggleFullScreen(!_this.state.fullscreen);
    });
  },
  componentDidUpdate: function () {
    this.watchIframe();
  },
  toggleFullScreen: function (f) {
    console.log("Fullscreen: ", f);
    this.setState({fullscreen: f});
  },
  _startTask: function () {
    if (this.state.fullscreen) {
      this.setState({
        view: 'task'
      });
    } else {
      alert("Please enter full-screen mode before starting.");
    }
  },
  _onClickStats: function (sq) {
    var worker = WorkerStore.get();
    var experiment = ExperimentStore.get();
    if (!experiment.stats_questions) {
      experiment.stats_questions = [];
    }
    experiment.stats_questions[this.state.block] = sq;
    ExperimentActions.update(worker._id, 'pointing_task', experiment);
    var next_block = this.state.block + 1;
    if (next_block < this.props.num_blocks) {
      this.setState({block: next_block, view: 'task' });
      this.watchIframe();
    } else {
      this.props.exit();
    }
  },
  watchIframe: function () {
    var _this = this;
    $('#task-iframe').load(function () {
      // Success when the survey is loaded.
      var href = $("#task-iframe").get(0).contentWindow.location.href;
      var href_array = href.split('/');
      var endpoint = href_array[href_array.length -1 ];
      if (endpoint === 'end'){
        _this.setState({view: 'stats'}, function () {
        });
      }
    });
  }
});

React.render(<CrowdExperiment experiment_name="pointing_task" experiment_app={PointingTaskComponent}/>, document.getElementById('app'));

if (typeof module !== 'undefined'){
  module.exports = PointingTaskComponent;
}
