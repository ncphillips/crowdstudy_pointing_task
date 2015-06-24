'use strict';

if (typeof require !== 'undefined'){
  var CrowdExperiment = require('CrowdEperiment');
}

var PointingTaskComponent = React.createClass({
  render: function () {
    var url = "/pointing_task/task?_id=" + this.props.worker._id;
    return (
      <iframe id="task-iframe" src={url} width={this.state.width} height={this.state.height}/>
    );
  },
  getInitialState: function () {
    return {
      height: window.innerHeight,
      width: window.innerWidth
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
    var _this = this;
    $('#task-iframe').load(function () {
      // Success when the survey is loaded.
      var href = $(this).get(0).contentWindow.location.href;
      var href_array = href.split('/');
      var endpoint = href_array[href_array.length -1 ];
      if (endpoint === 'end'){
        _this.props.exit();
      }
    });

  }
});

React.render(<CrowdExperiment experiment_name="pointing_task" experiment_app={PointingTaskComponent}/>, document.getElementById('app'));

if (typeof module !== 'undefined'){
  module.exports = PointingTaskComponent;
}