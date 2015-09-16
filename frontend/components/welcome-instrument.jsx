import React from 'react/addons';

export default class extends React.Component {

  static propTypes = {
    actx: React.PropTypes.object.isRequired
  }

  state = {
    step: 0
  }

  componentDidMount () {

    const maxSteps = 4;

    let next = () => {
      setTimeout(() => {
        this.setState({ step: ++this.state.step });
        if (this.state.step < maxSteps) next();
      }, 2000);
    }

    next();
  }

  onTonePress = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let { actx } = this.props;
    let oscillator = actx.createOscillator();
    let gain = actx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = 200;
    oscillator.connect(gain);
    gain.connect(actx.destination);
    gain.gain.exponentialRampToValueAtTime(0.00001, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1.0, actx.currentTime + 2);
    gain.gain.exponentialRampToValueAtTime(0.00001, actx.currentTime + 4);
    oscillator.start(0);
    setTimeout(() => {
      oscillator.stop(0);
    }, 6000)
  }

  render () {
    let { step } = this.state;
    return <div>
      <h1 className='ml2'>Welcome!</h1>
      <ul>
        {step > 0 && <li>Make sure your Silent Switch is not on</li>}
        {step > 1 && <li>Enable Do Not Disturb if your phone has it</li>}
        {step > 2 && <li>Turn up your volume</li>}
        {step > 3 && <li><button
          className='button button-big'
          onClick={this.onTonePress}
          onTouchEnd={this.onTonePress}>Press and Listen for a Tone</button></li>}
      </ul>
    </div>
  }
}