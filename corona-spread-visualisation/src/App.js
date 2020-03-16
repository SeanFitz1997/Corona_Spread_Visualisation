import React from "react";

import Header from "./Header";
import Footer from "./Footer";
import WorldMap from "./Map";
import "./App.css";

class App extends React.Component {
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
