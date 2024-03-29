import 'bootstrap/dist/css/bootstrap.min.css';
import 'material-icons/iconfont/material-icons.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import * as auth from './auth';
import './index.css';
import * as location from './location';
import * as push from './push';
import registerServiceWorker from './registerServiceWorker';
import * as subscriptions from './subscriptions';
import * as user from './user';

// Initialise modules
auth.init();
user.init();
location.init();
subscriptions.init();
push.init();

auth.init()
.then(() => {
	// After initialisation, render the app
	ReactDOM.render(
		<App />,
		document.getElementById('root') as HTMLElement
	);
});

registerServiceWorker();
