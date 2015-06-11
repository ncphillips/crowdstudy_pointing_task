var App = React.createClass({displayName: "App",
    callback: function (data) {
        var url = window.location.href + '&worker_id=' + data.worker.id;

        console.log(url);

        window.location.href = url;

    },
    render: function () {
            return (
                React.createElement("div", null, 
                    React.createElement(EthicalStatement, null), 
                    React.createElement(WorkerIDForm, {callback: this.callback})
                )
            );
    }
});

React.render(React.createElement(App, null), document.getElementById('app'));
