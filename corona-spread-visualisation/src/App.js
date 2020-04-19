import React from "react";
import ReactGA from "react-ga";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import WorldMap from "./Components/Map";
import "./App.css";

class App extends React.Component {
	componentDidMount() {
		ReactGA.initialize("UA-163912865-1");
		ReactGA.pageview("/");
	}

	render() {
		return (
			<div>
				<div className="container text-light">
					<Header />
					<WorldMap />
					<Footer />
				</div>
			</div>
		);
	}
}
export default App;
