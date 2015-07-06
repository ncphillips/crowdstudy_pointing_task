'use strict';

if (typeof require !== 'undefined'){
  var CrowdExperiment = require('CrowdEperiment');
}

var BLOCKS = [
  { center_diameters: [40, 60], target_diameters: [3, 6] },
  { center_diameters: [40, 60], target_diameters: [3, 6] },
  { center_diameters: [40, 60], target_diameters: [3, 6] },
  { center_diameters: [40, 60], target_diameters: [3, 6] }
];

var NUM_BLOCKS = BLOCKS.length;

function getBlockUrl(id, i) {
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

var PointingTaskStats = React.createClass({
  render: function () {
    var num_blocks_label = '# Blocks';
    var num_target_label = '# Targets';
    var num_miss_label = '# Misses';
    if (this.state.stats) {
      return (
        <div>
          <h1>Feedback</h1>
          <table className="table">
            <thead>
              <tr>
                <td></td>
                <td>Total Time</td>
                <td>Time / Target</td>
                <td>{num_miss_label}</td>
                <td>Misses / Target</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>This Round</td>
                <td>{Math.round(this.state.stats.worker.last_block.time / 100)/10} sec.</td>
                <td>{Math.round(this.state.stats.worker.last_block.time_per_target)/1000 } sec.</td>
                <td>{Math.round(this.state.stats.worker.last_block.num_misses)}</td>
                <td>{Math.round(this.state.stats.worker.last_block.misses_per_target * 100)/100}</td>
              </tr>
              <tr>
                <td>Overall Avg.</td>
                <td>{Math.round(this.state.stats.worker.average.time / 100) / 10} sec.</td>
                <td>{Math.round(this.state.stats.worker.average.time_per_target)/1000 } sec.</td>
                <td>{Math.round(this.state.stats.worker.average.num_misses * 100)/100}</td>
                <td>{Math.round(this.state.stats.worker.average.misses_per_target * 100)/100}</td>
              </tr>
            </tbody>
          </table>
          <Questions {...this.props}/>
          <br/>
        </div>
      );
    }
    else {
      return <p>Loading feedback...</p>;
    }
  },
  getInitialState: function () {
    return {};
  },
  componentDidMount: function () {
    $.ajax({
      type: 'GET',
      url: '/pointing_task/' + this.props.worker._id + '/stats?block=' + this.props.block,
      dataType: 'json',
      success: this.setStats,
      error: function (a, b, c) {
        console.log(a, b, c);
      }
    });
  },
  setStats: function (stats) {
    this.setState({stats: stats})
  }
});

var PointingTaskComponent = React.createClass({
  render: function () {

    var url = getBlockUrl(this.props.worker._id, this.state.block);
    if (this.state.view === 'introduction') {
      return (
        <div>
          <div className="col-md-3"></div>
          <div className="col-md-6">
            <FullScreenButton />
            <h1>Pointing Task</h1>
            <p>Your goal is to click the green target with the cross in it as quickly and as accurately as possible.</p>
            <p>Please do your best to click each target as fast as possible, without making any errors.</p>
            <p>Before starting, please press the full-screen button above.</p>
            <input type="button" className="btn btn-primary btn-block" value="Begin" onClick={this._startTask}/>
          </div>
          <div className="col-md-3"></div>
        </div>
      );
    }
    else if (this.state.view === 'task') {
      return (
        <iframe id="task-iframe" src={url} width={this.state.width} height={this.state.height}/>
      );
    } else if (this.state.view === 'stats') {
      var percent_complete = ((this.state.block + 1) / this.props.num_blocks) * 100;
      var style = {width: percent_complete + "%"};

      return (
        <div>
          <div className="col-md-3"></div>
          <div className="col-md-6">
            <br/>
            <FullScreenButton />
            <br/>
            <div className="text-center">
              <p>You have completed {this.state.block + 1 } out of {this.props.num_blocks} rounds!</p>
            </div>
            <div className="progress">
              <div className="progress-bar" role="progressbar" style={style}>
              </div>
            </div>
            <PointingTaskStats worker={this.props.worker} callback={this._onClickStats} is_first_feedback={this.state.block==0}/>
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
  _onClickStats: function () {
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
        console.log("WHAT");
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