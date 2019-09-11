import React, { Fragment } from 'react';
import './App.css';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import { StylesProvider } from '@material-ui/styles';
import AppBar from '@material-ui/core/AppBar';
import FA from 'react-fontawesome';
import flowchart from './flowchart.png';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

class App extends React.Component {
	constructor() {
		super(); 
		this.state = {
			circleClickedOn: null,
			active: false, 
			xOffset: 0, 
			yOffset: 0,
			zoomScale: 1,
			positionDict: {1: [50, 250]},
			squareSetIDs: new Set([]),
			helpClickedOn: false, 
			layoutClickedOn: false,
			layoutType: "default",
			gettingStartedClickedOn: false
		}
	this.setClickID = this.setClickID.bind(this)
	this.dragStart = this.dragStart.bind(this)
	this.dragMove = this.dragMove.bind(this)
	this.dragEnd = this.dragEnd.bind(this)
	this.handleZoomIn = this.handleZoomIn.bind(this)
	this.handleZoomOut = this.handleZoomOut.bind(this)
	this.adjacencyDict = {1: [null, null]}
	this.addQuestionNodes = this.addQuestionNodes.bind(this)
	this.addStatementNode = this.addStatementNode.bind(this)
	this.handleClickHelp = this.handleClickHelp.bind(this)
	this.handleClickClose = this.handleClickClose.bind(this)
	this.handleToggle = this.handleToggle.bind(this)
	this.handleLayoutToggle = this.handleLayoutToggle.bind(this)
	this.handleClickGettingStarted = this.handleClickGettingStarted.bind(this)
	this.handleClickShut = this.handleClickShut.bind(this)
	}

	setClickID(e) {
		this.setState({circleClickedOn: e.target.id})
	}

	dragStart(e) {
		this.initialX = (e.clientX - this.state.xOffset)  
		this.initialY = (e.clientY - this.state.yOffset) 
		this.setState({active: true})
	}

	dragMove(e) {
		if(this.state.active) {
			var currentX = (e.clientX - this.initialX) 
			var currentY = (e.clientY - this.initialY) 
			this.setState({xOffset: currentX, yOffset: currentY})
		}
	}

	dragEnd() {
		this.setState({active: false})
	}

	handleZoomIn() {
		var currentZoom = this.state.zoomScale
		var newZoom = currentZoom + 0.1
		this.setState({zoomScale: newZoom})
	}

	handleZoomOut() {
		var currentZoom = this.state.zoomScale
		var newZoom = currentZoom - 0.1
		console.log(newZoom)
		if(newZoom > 0.05) {
			this.setState({zoomScale: newZoom})
		}
	}

	addQuestionNodes() {
		if(this.state.circleClickedOn != null) {
			var currentSet = this.state.squareSetIDs 
			currentSet.add(this.state.circleClickedOn) 
			var IDs = this.generateNewIDs("question")
			console.log(IDs)
			this.adjacencyDict[this.state.circleClickedOn] = IDs
			this.adjacencyDict[IDs[0]] = [null, null]
			this.adjacencyDict[IDs[1]] = [null, null]
			if(this.state.layoutType == "default") {
				var posDict = this.defaultDrawingLayout() 
			}
			else if(this.state.layoutType == "knuth") {	
				var posDict = this.knuthLayoutFunction() 
			}
			this.setState({ positionDict: posDict, squareSetIDs: currentSet }) 
		}
	}

	addStatementNode() {
		if(this.state.circleClickedOn != null) {
			var currentSet = this.state.squareSetIDs 
			currentSet.add(this.state.circleClickedOn)
			var ID = this.generateNewIDs("statement")
			this.adjacencyDict[this.state.circleClickedOn] = ID
			this.adjacencyDict[ID[0]] = [null, null]
 			if(this.state.layoutType == "default") {
				var posDict = this.defaultDrawingLayout() 
			}
			else if(this.state.layoutType == "knuth") {	
				var posDict = this.knuthLayoutFunction() 
			}
			this.setState({ positionDict: posDict, squareSetIDs: currentSet})
		}
	}
	
	generateNewIDs(nodeType) {
		var maxKey = 0
		for(var key in this.adjacencyDict) {
			if(this.adjacencyDict.hasOwnProperty(key)) {
				if(parseInt(key) > maxKey) {
					maxKey = parseInt(key) 
				} 
			}
		}
		if(nodeType == "question") {
			var ID1 = parseInt(maxKey) + 1
			var ID2 = parseInt(maxKey) + 2
			return [ID1, ID2]
		}
		else if(nodeType == "statement") {
			var ID1 = parseInt(maxKey) + 1
			return [ID1, null] 
		}
	}

	defaultDrawingLayout() {
		var positionDict = {}
		var adjacencyDict = this.adjacencyDict
		function innerDrawingLayout(nodeID, questionCount, layerNum) {
			if(adjacencyDict[nodeID][0] != null && adjacencyDict[nodeID][1] != null) {
				questionCount = innerDrawingLayout(adjacencyDict[nodeID][1], questionCount, layerNum + 1)
				questionCount += 1
				questionCount = innerDrawingLayout(adjacencyDict[nodeID][0], questionCount, layerNum + 1)
			}
			else if(adjacencyDict[nodeID][0] != null) {
				questionCount = innerDrawingLayout(adjacencyDict[nodeID][0], questionCount, layerNum + 1)
			}
			positionDict[nodeID] = [layerNum * 150 + 150, questionCount * 150 + 150]
			return questionCount
		}
		innerDrawingLayout(1, 0, 0)
		return positionDict
	}

	knuthLayoutFunction() { 
		var positionDict = {}
		var i = 0
		var adjacencyDict = this.adjacencyDict
		function knuthLayout(nodeID, depth) {
			if(adjacencyDict[nodeID][0] != null) {
				knuthLayout(adjacencyDict[nodeID][0], depth + 1)
			}
			positionDict[nodeID] = [(depth * 150) + 150, (i * 150) + 150]
			i += 1
			if(adjacencyDict[nodeID][1] != null) {
				knuthLayout(adjacencyDict[nodeID][1], depth + 1)
			}
		}
		knuthLayout(1, 0);
		return positionDict  
	}

	handleClickGettingStarted() {
		this.setState({ gettingStartedClickedOn: true })
	}

	handleClickShut() {
		this.setState({ gettingStartedClickedOn: false })
	}

	handleClickHelp() {
		this.setState({ helpClickedOn: true })
	}

	handleClickClose() {
		this.setState({ helpClickedOn: false})
	}

	handleToggle() {
		if(!this.state.layoutClickedOn) {
			this.setState({ layoutClickedOn: true })
		}
		else {
			this.setState({ layoutClickedOn: false })
		}
	}

	handleLayoutToggle(e) {
		this.handleToggle()
		if(e.target.getAttribute("value") == "default") {
			this.setState({ layoutType: "default", positionDict: this.defaultDrawingLayout()})
		}
		else if(e.target.getAttribute("value") == "knuth") {
			this.setState({ layoutType: "knuth", positionDict: this.knuthLayoutFunction()})
		}
	}

	render() {
	var circleArray = []
	var squareArray = []
	var counter = 0
	var lineArray = []
	for(var key in this.state.positionDict) {
		if(this.state.positionDict.hasOwnProperty(key)) {
			counter += 1
			if(this.state.squareSetIDs.has(key)) {
				var position = this.state.positionDict[key]
				squareArray.push(<Square x={position[0]} y={position[1]} key={counter}/>)
			}
			else {
				var position = this.state.positionDict[key]
				circleArray.push(<Circle cx={position[0]} cy={position[1]} id={key} clickstate={this.setClickID} key={counter}/>)
			}
		}
	}
	for(var key in this.adjacencyDict) {
		var firstChild = this.adjacencyDict[key][0]
		var secondChild = this.adjacencyDict[key][1]
		var parentPosition = this.state.positionDict[key]
		var firstChildPosition = this.state.positionDict[firstChild]
		var secondChildPosition = this.state.positionDict[secondChild]
		if(firstChild == null && secondChild == null ) {
			continue;
		}
		else if(firstChild == null || secondChild == null) {
			lineArray.push(<Line 
				x1={parentPosition[0]} 
				y1={parentPosition[1]} 
				x2={firstChildPosition[0]} 
				y2={firstChildPosition[1]}/>)
		}
		else if(firstChild != null && secondChild != null) {
			lineArray.push(<Line
				x1={parentPosition[0]}
				y1={parentPosition[1]}
				x2={firstChildPosition[0]}
				y2={firstChildPosition[1]}/>)
			lineArray.push(<Line
				x1={parentPosition[0]}
				y1={parentPosition[1]}
				x2={secondChildPosition[0]}
				y2={secondChildPosition[1]}/>)
		}
	}
  		return (
    		<div className="App">
    			<div className="flowchartImage"><img src={flowchart}/></div>
    			<svg className="canvas" onMouseDown={this.dragStart} onMouseMove={this.dragMove} onMouseUp={this.dragEnd}>
    				<g className="drawings" transform={"translate(" + this.state.xOffset + " " + this.state.yOffset + ")"}>
    					<g transform={"scale(" + this.state.zoomScale + ")"}>
    						{lineArray}
    						{circleArray}
    						{squareArray}
    					</g>
    				</g>
    			</svg>
    			<StylesProvider injectFirst>
    				<AppBar className="topbar">
    					<h3 className="heading1" align="left">Flow Chart Builder</h3>
    					<div className="gettingStartedButton" onClick={this.handleClickGettingStarted}>
    						<h3 className="gettingStarted">Getting Started</h3>
    					</div>
    					<div className="selectionMenu" onClick={this.handleToggle}>
    						<h3 className="layout">Layout</h3>
    						<Popper className="layoutpopup"
							open={this.state.layoutClickedOn}>
							<Paper>
								<ClickAwayListener onClickAway={this.handleToggle}>
									<MenuList>
										<MenuItem value="default" onClick={this.handleLayoutToggle}>Default Layout</MenuItem>
										<MenuItem value="knuth" onClick={this.handleLayoutToggle}>Knuth Layout</MenuItem>
									</MenuList>
								</ClickAwayListener>
							</Paper>
						</Popper>
    					</div>
    					<span className="questionIcon" onClick={this.handleClickHelp}>
    						<h3 className="heading2">Help</h3>
    						<FA name="question-circle"/>
    					</span>
    				</AppBar>
      				<Drawer className="drawer" variant="permanent" anchor="left">
      					<ToolBoard  
      						circleID={this.state.circleClickedOn} 
      						addNewCircles={this.addNewCircles} 
      						addQuestionNodes={this.addQuestionNodes} 
      						addStatementNode={this.addStatementNode}
      					/>
	      				<div className="buttonZoom" onClick={this.handleZoomIn}>
							<div className="buttonIcon"><FA name="search-plus"/></div>
						</div>
						<div className="buttonZoom" onClick={this.handleZoomOut}>
							<div className="buttonIcon"><FA name="search-minus"/></div>
						</div> 
	    			</Drawer>
	    			<Dialog
						open={this.state.helpClickedOn}
						onClose={this.handleClickClose}>
						<DialogTitle>{"Help"}</DialogTitle>
						<DialogContent>
							<DialogContentText>Let Google help apps determine location. This means sending anonymous location data to
            					Google, even when no apps are running.
            				</DialogContentText>
            			</DialogContent>
            			<DialogActions>
            				<Button onClick={this.handleClickClose} color="primary" variant="contained">
            				Close
            				</Button>
            			</DialogActions>	
					 </Dialog>
					 <Dialog
						open={this.state.gettingStartedClickedOn}
						onClose={this.handleClickShut}>
						<DialogTitle>{"Getting Started"}</DialogTitle>
						<DialogContent>
							<DialogContentText>Let Google help apps determine location. This means sending anonymous location data to
            					Google, even when no apps are running.
            				</DialogContentText>
            			</DialogContent>
            			<DialogActions>
            				<Button onClick={this.handleClickShut} color="primary" variant="contained">
            				Close
            				</Button>
            			</DialogActions>	
					 </Dialog>
    			</StylesProvider>
    		</div>
  		);
	}
} 

class Line extends React.Component {
	render() {
		return (
			<Fragment>
				 <defs>
    				<marker 
    					id="arrow" 
    					markerWidth="10" 
    					markerHeight="10" 
    					refX="0" 
    					refY="3" 
    					orient="auto" 
    					markerUnits="strokeWidth">
      					<path d="M0,0 L0,6 L9,3 z" fill="#f00" />
    				</marker>
  				</defs>
				<line 
					className="line"
					x1={this.props.x1}
					x2={this.props.x2}
					y1={this.props.y1}
					y2={this.props.y2} 
					marker-mid="url(#arrow)"
				/>
			</Fragment>
		)
	}
}

class Square extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: ''
		}
	this.handleChange = this.handleChange.bind(this)
	}

	handleChange(e) {
		this.setState({value: e.target.value})
	}

	render() {
		return(
		<Fragment>
		<rect 
			x={this.props.x - 50} 
			y={this.props.y - 50} 
			width="100" 
			height="100" 
			fill="#a1a8d1" 
			stroke="#adbed9" 
			stroke-width="3"
		/>
		<foreignObject x={this.props.x - 45} y={this.props.y - 45} width="90" height="90">
			<textarea rows="6" cols="11" className="textfield" type="text" placeholder="Type here!" onChange={this.handleChange}>
				{this.state.value}
			</textarea>
		</foreignObject>
		</Fragment>	
		)
	}
}

class Circle extends React.Component {
	constructor() {
		super();
		this.handleClickCircle = this.handleClickCircle.bind(this)
	}

	handleClickCircle(e) {
		this.props.clickstate(e) 
	}
	render() {
		return(
		<Fragment>
			<defs>
    			<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      				<stop offset="4%" style={{ stopColor : "rgba(106,114,165,1)"}}/>
      				<stop offset="59%" style={{ stopColor : "rgba(167,89,103,1)"}}/>
    			</linearGradient>
  			</defs>
			<circle 
				cx={this.props.cx} 
				cy={this.props.cy} 
				r="40" 
				stroke="#adbed9" 
				stroke-width="2" 
				className="dot" 
				id={this.props.id} 
				onClick={this.handleClickCircle}>
			</circle>
			<rect 
				x={this.props.cx - 1.5}
				y={this.props.cy - 15}
				width="3"
				height="30"
				fill="#c9d8f0"
			/>
			<rect 
				x={this.props.cx - 15}
				y={this.props.cy - 1.5}
				width="30"
				height="3"
				fill="#c9d8f0"
			/>
		</Fragment>
		)
	}
}

class ToolBoard extends React.Component {
	constructor() {
		super();
	this.handleClickQuestion = this.handleClickQuestion.bind(this)
	this.handleClickStatement = this.handleClickStatement.bind(this)	
	}

	handleClickQuestion() {
		this.props.addQuestionNodes() 
	}

	handleClickStatement() {
		this.props.addStatementNode()
	} 
	render() { 
		return(
			<Fragment>
				<div className="buttonQuestionDot" onClick={this.handleClickQuestion}>
					<div className="buttonText">Q</div>
				</div>
				<div className="buttonDot" onClick={this.handleClickStatement}>
					<div className="buttonText">S</div>
				</div> 
			</Fragment>
		)
	}
}

export default App;
