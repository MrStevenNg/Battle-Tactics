import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Dimensions,
    Animated,
    PanResponder
} from "react-native";

let Window = Dimensions.get("window");
const SCREEN_WIDTH = Window.width;
const ONE_INCH = SCREEN_WIDTH / 48;

// In Warhammer 1 inch represents 60 inches (1:60 scale)
// AKA 1 inch is 5ft.

export default class Building extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            onPress: false,
            longPress: false,
            terrainLocked: false
        }

        // Convert props passed in as feet into proper scale for map.
        const WIDTH =  ONE_INCH * this.props.feetWidth;
        const HEIGHT = ONE_INCH * this.props.feetHeight;
        this.width = WIDTH;
        this.height = HEIGHT;
        
        const terrain = this.props.terrain;
        const position = new Animated.ValueXY({ x: terrain.x, y: terrain.y });
        
        this.val = { x: terrain.x, y: terrain.y };
        position.addListener(value => (this.val = value));
        
        this.terrain = terrain;
        this.position = position;
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderRelease: this._handlePanResponderEnd,
            onShouldBlockNativeResponder: (event, gesture) => false,
            onPanResponderTerminationRequest: (event, gesture) => false
        });
    }

    _handleStartShouldSetPanResponder = (event, gesture) => {
        if (this.props.lockStatus === false) {
            this.setState({
                onPress: true
            }, () => {
                // console.log(`onPress: ${this.state.onPress}`) // use this to check state.
            })
            this.longPress(event);
            return true;
        } else {
            return false;
        }
    };

    _handlePanResponderGrant = (event, gesture) => {            
            this.position.setOffset({
                x: this.val.x,
                y: this.val.y
            });
    };

    _handlePanResponderMove = (event, gesture) => {
        if (this.state.longPress === false && this.state.terrainLocked === false) {
            this.position.setValue({
                x: gesture.dx,
                y: gesture.dy
            });
        } // END_IF
    };

    _handlePanResponderEnd =  (event, gesture) => {
        this.cancelLongPress()
        this.setState({
            onPress: false
        }, () => {
            // console.log(`onPress: ${this.state.onPress}`)
        })
        this.updateTerrainLocation(gesture);
    }

// HELPER FUNCTIONS ////

// Function to update Model XY Data in model json.
updateTerrainLocation (gesture) {
    const oldData = [...this.props.terrainData];
    const updatedTerrainData = oldData.map(data => {
        if (data.id === this.props.id) {
            const newData = {...data};
            newData.x = data.x + gesture.dx;
            newData.y = data.y + gesture.dy;
            return newData;
        } else {
            return data;
        } // END-IF
    });
    this.props.updateTerrain(updatedTerrainData);
}

// Function to update lock status.
updateLockStatus () {
    const oldData = [...this.props.terrainData];
    const updatedLockData = oldData.map(data => {
        if (data.id === this.props.id) {
            const newData = {...data};
            newData.locked = this.state.terrainLocked;
            return newData;
        } else {
            return data;
        } // END-IF
    });
    this.props.updateLock(updatedLockData);
}


// TOUCH FUNCTIONS ////
// Personal note to decouple these functions into their own components to improve reusability.
// Un-comment console logs to see how the longPress functions.

//----------------------------------------------------------------------------
    // Function to determine if press is longer than 2 sec.
    longPress = (event) => {
        // Insert any needed conditional logic.
        if (true === true) {
            // console.log("longPressTimer started");
            this.longPressTimer = setTimeout(() => {
                this.setState({
                    longPress: true,
                }, () => {
                    // console.log(`longPress: ${this.state.longPress}`);
                    // Place function you want to fire-off after longPress here.
                    // console.log("Function should be called")
                    this.toggleTerrainLock();
                })
                this.longPressTimer = "end";
                // console.log("longPressTimer complete")
            }, 2000);
        }   
    }

    cancelLongPress = () => {
        if (this.longPressTimer != "end") {
            clearTimeout(this.longPressTimer);
            // console.log("Timeout process cancelled.")
            this.setState({
                longPress: false,
            }, () => {
                // console.log(`longPress: ${this.state.longPress}`);
            })
        }
    }
    //----------------------------------------------------------------------------

// TOGGLE FUNCTIONS ////

// Toggle function that works in conjunction with 'handleDoubleTap' to change the styling of our pop-up modal and make it invisible/visible.
toggleTerrainLock = () => {
    this.setState(
        previousState => ({ 
            terrainLocked: !previousState.terrainLocked }), 
            () => {
                // console.log(`terrainLocked: ${this.state.terrainLocked}`)
                // console.log("calling this.props.updateLockStatus")
                this.updateLockStatus();
            });
}

// STYLE FUNCTIONS ////

terrainStyle () {
    return this.props.terrainStyle;
}

offLockStyle () {
    if (this.props.lockStatus === false) {
        // console.log("this.props.lockStatus")
        // console.log(this.props.lockStatus)
        return styles.offLockStyle;
    } else {

    }
}

// RENDER FUNCTIONS ////

    renderBuildings() {
        return (
            <Animated.View
                    style={[this.position.getLayout()]}
                    {...this.panResponder.panHandlers}
                    
                >
                    <View 
                        style={[
                            this.terrainStyle(),
                            styles.buildingStyle,
                            this.offLockStyle(),
                            {
                                width: this.width,
                                height: this.height, 
                            },
                            ]}
                    />
            </Animated.View>
        )
    }


    render() {
        return (
            <View style={[styles.mainContainer]}>
                {this.renderBuildings()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        height: Window.height,
        width: Window.width,
        top: 0,
        left: 0
    },
    buildingStyle: {
        borderRadius: 12,
        borderWidth: 4,
        opacity: 0.80
    },
    offLockStyle: {
        borderColor: '#ddd',
        borderWidth: 5.5,
        opacity: 0.40
    }
});
