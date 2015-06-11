var App = React.createClass({
    callback: function (data) {
        var url = window.location.href + '&worker_id=' + data.worker.id;

        console.log(url);

        window.location.href = url;

    },
    render: function () {
            return (
                <div>
                    <EthicalStatement></EthicalStatement>
                    <WorkerIDForm callback={this.callback}></WorkerIDForm>
                </div>
            );
    }
});

React.render(<App/>, document.getElementById('app'));
