import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  View, 
  StyleSheet, 
  PanResponder, 
  ViewPropTypes, 
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';

// Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;
export default class PinchZoomView extends Component {
  static propTypes = {
    ...viewPropTypes,
    scalable: PropTypes.bool,
    minScale: PropTypes.number,
    maxScale: PropTypes.number
  };

  static defaultProps = {
    scalable: true,
    minScale: 1.0,
    maxScale: 4.0
  };

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    this.position = position;

    this.state = {
      lastMovePinch: false
    };
  }

  componentWillMount() {
    this.gestureHandlers = PanResponder.create({
      onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminationRequest: evt => true,
      onShouldBlockNativeResponder: evt => false
    });
  }

  componentDidMount() {
    this.props.updateScale(1);
  }

  componentDidUpdate() {
    if (this.props.state.scale < 1.25) {
      Animated.spring(this.position, {
        toValue: { 
          x: -this.props.state.offsetX, 
          y: -this.props.state.offsetY
        }
    }).start()
    }
  }


  _handleStartShouldSetPanResponder = (event, gesture) => {
    // don't respond to single touch to avoid shielding click on child components
    return false;
  };

  _handleMoveShouldSetPanResponder = (event, gesture) => {
    this.props.getPixelsPerInch();
    return (
      this.props.scalable &&
      (Math.abs(gesture.dx) > 2 ||
        Math.abs(gesture.dy) > 2 ||
        gesture.numberActiveTouches === 2)
    );
  };

  _handlePanResponderGrant = (event, gesture) => {
    if (gesture.numberActiveTouches === 2) {
      let dx = Math.abs(
        event.nativeEvent.touches[0].pageX - event.nativeEvent.touches[1].pageX
      );
      let dy = Math.abs(
        event.nativeEvent.touches[0].pageY - event.nativeEvent.touches[1].pageY
      );
      let distant = Math.sqrt(dx * dx + dy * dy);
      this.props.updateDistant(distant);
    }
  };

  _handlePanResponderEnd = (event, gesture) => {
    this.props.updateLast(
      this.props.state.offsetX,
      this.props.state.offsetY,
      this.props.state.scale
    );
  };

  _handlePanResponderMove = (event, gesture) => {
    // zoom
    if (gesture.numberActiveTouches === 2) {
      let dx = Math.abs(
        event.nativeEvent.touches[0].pageX - event.nativeEvent.touches[1].pageX
      );
      let dy = Math.abs(
        event.nativeEvent.touches[0].pageY - event.nativeEvent.touches[1].pageY
      );
      let distant = Math.sqrt(dx * dx + dy * dy);
      let scale = (distant / this.props.state.distant) * this.props.state.lastScale;
      //check scale min to max hello
      if (scale < this.props.maxScale && scale > this.props.minScale) {
        this.props.updateScale(scale);
        this.setState({ lastMovePinch: true });
      }
    }
    // translate
    else if (gesture.numberActiveTouches === 1 && this.props.state.scale > 1.25) {
      if (this.state.lastMovePinch) {
        gesture.dx = 0;
        gesture.dy = 0;
      }
      let offsetX = this.props.state.lastX + gesture.dx / this.props.state.scale;
      let offsetY = this.props.state.lastY + gesture.dy / this.props.state.scale;
      this.setState({ lastMovePinch: false });
      this.props.updateOffset(offsetX, offsetY);
    }
  };

  render() {
    return (
      <Animated.View
        {...this.gestureHandlers.panHandlers}
        style={[
          this.position.getLayout(),
          styles.container,
          this.props.style,
          {
            transform: [
              { scaleX: this.props.state.scale },
              { scaleY: this.props.state.scale },
              { translateX: this.props.state.offsetX },
              { translateY: this.props.state.offsetY }
            ]
          }
        ]}
      >
      <TouchableWithoutFeedback onPress={this.handleDoubleTap}>
        {this.props.children}
      </TouchableWithoutFeedback>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});