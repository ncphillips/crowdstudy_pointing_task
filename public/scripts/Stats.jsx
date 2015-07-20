'use strict';

//var React = require('react');
var TOOLTIPS = {
  row: {
    worker_last_block: "Last Round",
    worker_average_block: "Avg. Round",
    population_average_block: "Avg. Worker's Round",
    population_elite_block: "Top Worker's Round"
  },
  col: {
    time: "Time",
    time_per_target: "Time/Target",
    num_misses: "# Misses",
    misses_per_target: "Misses/Target"
  }
};

var LABELS = {
  row: {
    worker_last_block: "Last Round",
    worker_average_block: "Avg. Round",
    population_average_block: "Avg. Worker's Round",
    population_elite_block: "Top Worker's Round"
  },
  col: {
    time: "Time",
    time_per_target: "Time/Target",
    num_misses: "# Misses",
    misses_per_target: "Misses/Target"
  }
};

if (typeof require !== 'undefined') {
  var Questions = require('./Questions');
}


var StatsRow = React.createClass({
  render: function () {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{Math.round(this.props.data.time / 100) / 10} sec.</td>
        <td>{Math.round(this.props.data.time_per_target)/1000 } sec.</td>
        <td>{Math.round(this.props.data.num_misses * 100)/100}</td>
        <td>{Math.round(this.props.data.misses_per_target * 100)/100}</td>
      </tr>
    );
  },
  getDefaultProps: function () {
    return {
      className: '',
      colorCells: false
    };
  }
});


var StatsView = React.createClass({
  render: function () {
    var rows = [];
    if (this.state.stats.worker.last_block) {
      rows.push(<StatsRow name={LABELS.row.worker_last_block} data={this.state.stats.worker.last_block}/>);
    }
    if (this.state.stats.worker.average) {
      rows.push(<StatsRow name={LABELS.row.worker_average_block} data={this.state.stats.worker.average}/>);
    }
    if (this.state.stats.population.average) {
      rows.push(<StatsRow name={LABELS.row.population_average_block} data={this.state.stats.population.average}/>);
    }
    if (this.state.stats.population.elite) {
      rows.push(<StatsRow name={LABELS.row.population_elite_block} data={this.state.stats.population.elite}/>);
    }
    return (
      <div>
        <h2>Feedback</h2>
        <table className="table">
          <thead>
            <tr>
              <td></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.time}>{LABELS.col.time}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.time_per_target}>{LABELS.col.time_per_target}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.num_misses}>{LABELS.col.num_misses}</span></td>
              <td><span data-toggle="tooltip" data-placement="top" title={TOOLTIPS.col.misses_per_target}>{LABELS.col.misses_per_target}</span></td>
            </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
          <tfoot>
          </tfoot>
        </table>
        <Questions callback={this.props.callback}/>
      </div>
    )
  },
  componentDidMount: function () {
    $.ajax({
      type: 'GET',
      url: '/pointing_task/' + this.props.worker._id + '/stats',
      dataType: 'json',
      success: this.setComparisonStats,
      error: function (a, b, c) {
        console.log(a, b, c);
      }
    });
    $('[data-toggle="tooltip"]').tooltip();
  },
  getInitialState: function () {
    return { stats: {worker: {}, population: {} } };
  },
  setComparisonStats: function (stats) {
    this.setState({stats: stats});
  }

});

if (typeof module !== 'undefined') {
  module.exports = StatsView;
}
